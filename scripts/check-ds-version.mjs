#!/usr/bin/env node
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const TRUSTED_RELEASE = Object.freeze({
  version: "v4.1.2",
  sourceRepository: "Portlink-app/portlink-landing",
  sourceRevision: "a77b3e9ffec74168b7f384fdc7e7547d58f3af90",
  treeSha256: "3a1c382405cc0ffbc58eb9b32a671d7403f4d57970c177ac7c57a29b4e5ce3ce",
});

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
  entries.sort(([first], [second]) => first < second ? -1 : first > second ? 1 : 0);
  const canonical = entries.map(([name, size, digest]) => name + "\0" + size + "\0" + digest + "\n").join("");
  return createHash("sha256").update(canonical).digest("hex");
}

export function verifyVendor(directory, trustedRelease = TRUSTED_RELEASE) {
  if (!/^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(trustedRelease.version)
    || !/^[a-f0-9]{40}$/.test(trustedRelease.sourceRevision)
    || !/^[a-f0-9]{64}$/.test(trustedRelease.treeSha256)
    || !trustedRelease.sourceRepository) {
    throw new Error("Invalid trusted release anchor");
  }
  const treeSha256 = fingerprintVendor(directory);
  if (treeSha256 !== trustedRelease.treeSha256) {
    throw new Error("Vendor file-set/bytes differ from trusted " + trustedRelease.sourceRepository
      + "@" + trustedRelease.sourceRevision + "; expected " + trustedRelease.treeSha256 + ", got " + treeSha256);
  }
  const version = readFileSync(path.join(directory, "VERSION"), "utf8").trim();
  if (version !== trustedRelease.version) throw new Error("Vendor version does not match trusted release");
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
