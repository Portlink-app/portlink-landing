#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync, readdirSync, realpathSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const TRUSTED_RELEASE = Object.freeze({
  version: "v4.1.2",
  sourceRepository: "Portlink-app/portlink-landing",
  sourceRevision: "a77b3e9ffec74168b7f384fdc7e7547d58f3af90",
  treeSha256: "3a1c382405cc0ffbc58eb9b32a671d7403f4d57970c177ac7c57a29b4e5ce3ce",
});

function digestEntries(entries) {
  entries.sort(([first], [second]) => first < second ? -1 : first > second ? 1 : 0);
  return createHash("sha256").update(entries.map(([name, size, digest]) => name + "\0" + size + "\0" + digest + "\n").join("")).digest("hex");
}

function git(repository, args) {
  return execFileSync("git", ["-C", repository, ...args], {
    env: { ...process.env, GIT_NO_REPLACE_OBJECTS: "1", GIT_TERMINAL_PROMPT: "0" },
    maxBuffer: 16 * 1024 * 1024, timeout: 60000, stdio: ["ignore", "pipe", "pipe"],
  });
}

export function sourceArtifact(repository, revision) {
  function object(type, identity) {
    if (!/^[a-f0-9]{40}$/.test(identity)) throw new Error("Invalid source object identity");
    const bytes = git(repository, ["cat-file", type, identity]);
    const actual = createHash("sha1").update(type + " " + bytes.length + "\0").update(bytes).digest("hex");
    if (actual !== identity) throw new Error("Source object hash mismatch");
    return bytes;
  }
  function tree(identity) {
    const bytes = object("tree", identity);
    const entries = [];
    let offset = 0;
    while (offset < bytes.length) {
      const separator = bytes.indexOf(32, offset);
      const end = bytes.indexOf(0, separator);
      if (separator < offset || end < separator || end + 21 > bytes.length) throw new Error("Invalid source tree");
      entries.push({ mode: bytes.subarray(offset, separator).toString(), name: bytes.subarray(separator + 1, end).toString(), identity: bytes.subarray(end + 1, end + 21).toString("hex") });
      offset = end + 21;
    }
    return entries;
  }
  const commit = object("commit", revision).toString();
  const root = /^tree ([a-f0-9]{40})\n/.exec(commit)?.[1];
  if (!root) throw new Error("Source commit has no tree");
  let directory = root;
  for (const name of ["app", "_ds"]) {
    const entry = tree(directory).find((item) => item.name === name && item.mode === "40000");
    if (!entry) throw new Error("Source artifact directory missing");
    directory = entry.identity;
  }
  const entries = [];
  let version;
  function visit(identity, prefix) {
    for (const entry of tree(identity)) {
      if (/[\x00-\x1f\x7f/]/.test(entry.name) || [".", ".."].includes(entry.name)) throw new Error("Invalid source filename");
      const name = prefix + entry.name;
      if (entry.mode === "40000") {
        entries.push([name + "/", 0, "directory"]);
        visit(entry.identity, name + "/");
      } else {
        if (!["100644", "100755"].includes(entry.mode)) throw new Error("Unsupported source entry");
        const bytes = object("blob", entry.identity);
        entries.push([name, bytes.length, createHash("sha256").update(bytes).digest("hex")]);
        if (name === "VERSION") version = bytes.toString().trim();
      }
    }
  }
  visit(directory, "");
  return { treeSha256: digestEntries(entries), version };
}

function obtainSource(repository, revision) {
  try {
    return sourceArtifact(repository, revision);
  } catch {
    const temporary = mkdtempSync(path.join(os.tmpdir(), "landing-ds-source-"));
    try {
      git(temporary, ["init", "--bare"]);
      git(temporary, ["fetch", "--depth=1", "https://github.com/Portlink-app/portlink-landing.git", revision]);
      return sourceArtifact(temporary, revision);
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  }
}

export function fingerprintVendor(directory) {
  const entries = [];
  function visit(relative) {
    const absolute = path.join(directory, relative);
    const stat = lstatSync(absolute);
    if (stat.isSymbolicLink()) throw new Error("Symlink in vendor tree: " + (relative || "."));
    if (stat.isDirectory()) {
      if (relative) entries.push([relative + "/", 0, "directory"]);
      for (const name of readdirSync(absolute).sort()) {
        if (/[\x00-\x1f\x7f]/.test(name)) throw new Error("Invalid vendor filename");
        visit(relative ? relative + "/" + name : name);
      }
    } else if (stat.isFile()) {
      const bytes = readFileSync(absolute);
      entries.push([relative, bytes.length, createHash("sha256").update(bytes).digest("hex")]);
    } else {
      throw new Error("Unsupported vendor entry: " + relative);
    }
  }
  visit("");
  return digestEntries(entries);
}

export function verifyVendor(directory, trustedRelease = TRUSTED_RELEASE) {
  if (!/^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(trustedRelease.version)
    || !/^[a-f0-9]{40}$/.test(trustedRelease.sourceRevision)
    || !/^[a-f0-9]{64}$/.test(trustedRelease.treeSha256)
    || trustedRelease.sourceRepository !== "Portlink-app/portlink-landing") {
    throw new Error("Invalid trusted release anchor");
  }
  const treeSha256 = fingerprintVendor(directory);
  if (treeSha256 !== trustedRelease.treeSha256) {
    throw new Error("Vendor file-set/bytes differ from trusted " + trustedRelease.sourceRepository
      + "@" + trustedRelease.sourceRevision + "; expected " + trustedRelease.treeSha256 + ", got " + treeSha256);
  }
  const version = readFileSync(path.join(directory, "VERSION"), "utf8").trim();
  if (version !== trustedRelease.version) throw new Error("Vendor version does not match trusted release");
  const source = obtainSource(path.resolve(directory, "../.."), trustedRelease.sourceRevision);
  if (source.treeSha256 !== treeSha256 || source.version !== version) {
    throw new Error("Source artifact mismatch: candidate digest/version is not bound to declared revision");
  }
  return { version, treeSha256, sourceRevision: trustedRelease.sourceRevision };
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(scriptPath)) {
  try {
    const unknown = process.argv.slice(2).filter((argument) => !["--strict", "--quiet"].includes(argument));
    if (unknown.length) throw new Error("Unknown argument: " + unknown.join(" "));
    const result = verifyVendor(path.resolve(path.dirname(scriptPath), "../app/_ds"));
    if (!process.argv.includes("--quiet")) {
      console.log("[ds-guard] ok: " + result.version + " matches trusted file-set " + result.treeSha256);
    }
  } catch (error) {
    console.error("[ds-guard] FAIL: " + error.message);
    console.error("[ds-guard] Restore the pinned artifact. D14 intake requires the reviewed Portlink Platform Gate A release and consumer anchor; see docs/D14-CONSUMER-INTEGRATION.md.");
    process.exitCode = 1;
  }
}
