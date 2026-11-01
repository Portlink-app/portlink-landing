#!/usr/bin/env node
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { fingerprintVendor, TRUSTED_RELEASE, verifyVendor } from "./check-ds-version.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temporary = mkdtempSync(path.join(os.tmpdir(), "landing-ds-gate-"));
let checks = 0;

function fixture(name) {
  const directory = path.join(temporary, name, "app/_ds");
  cpSync(path.join(root, "app/_ds"), directory, { recursive: true });
  return directory;
}

function check(name, action) {
  action();
  checks++;
  console.log("PASS " + name);
}

function rewriteManifest(directory) {
  const manifestPath = path.join(directory, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const name of Object.keys(manifest.files)) {
    const bytes = readFileSync(path.join(directory, name));
    manifest.files[name] = { bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
  }
  writeFileSync(manifestPath, JSON.stringify(manifest));
}

try {
  check("pristine full vendor tree passes", () => {
    assert.equal(verifyVendor(fixture("pristine")).treeSha256, TRUSTED_RELEASE.treeSha256);
  });
  check("single-byte token mutation fails", () => {
    const directory = fixture("byte");
    const filename = path.join(directory, "portlink-tokens.dist.css");
    writeFileSync(filename, readFileSync(filename, "utf8") + " ");
    assert.throws(() => verifyVendor(directory), /file-set\/bytes differ/);
  });
  check("rewritten manifest and local contract cannot bless corruption", () => {
    const directory = fixture("manifest");
    writeFileSync(path.join(directory, "portlink-tokens.dist.css"), "this is not a stylesheet");
    rewriteManifest(directory);
    writeFileSync(path.join(directory, "release.json"), JSON.stringify({ ...TRUSTED_RELEASE, treeSha256: fingerprintVendor(directory) }));
    assert.throws(() => verifyVendor(directory), /file-set\/bytes differ/);
  });
  check("component alias mutation fails despite unchanged manifest entries", () => {
    const directory = fixture("alias");
    writeFileSync(path.join(directory, "ds-styles.css"), "body { color: red; }");
    assert.throws(() => verifyVendor(directory), /file-set\/bytes differ/);
  });
  check("missing file fails", () => {
    const directory = fixture("missing");
    rmSync(path.join(directory, "ds-styles.css"));
    assert.throws(() => verifyVendor(directory), /file-set\/bytes differ/);
  });
  check("extra file and empty directory fail", () => {
    const directory = fixture("extra");
    writeFileSync(path.join(directory, "extra.css"), "");
    assert.throws(() => verifyVendor(directory), /file-set\/bytes differ/);
    rmSync(path.join(directory, "extra.css"));
    mkdirSync(path.join(directory, "extra"));
    assert.throws(() => verifyVendor(directory), /file-set\/bytes differ/);
  });
  check("symlink cannot substitute a vendor file", () => {
    const directory = fixture("symlink");
    rmSync(path.join(directory, "ds-styles.css"));
    symlinkSync("ds-styles.bundle.css", path.join(directory, "ds-styles.css"));
    assert.throws(() => verifyVendor(directory), /Symlink/);
  });
  check("value-only change and rehash without version bump fails", () => {
    const directory = fixture("value");
    const filename = path.join(directory, "portlink-tokens.dist.css");
    const original = readFileSync(filename, "utf8");
    const changed = original.replace(/#[a-fA-F0-9]{6}/, "#010203");
    assert.notEqual(changed, original);
    writeFileSync(filename, changed);
    rewriteManifest(directory);
    assert.throws(() => verifyVendor(directory), /file-set\/bytes differ/);
  });
  check("bumped artifact requires a separately supplied trusted anchor", () => {
    const directory = fixture("bump");
    writeFileSync(path.join(directory, "VERSION"), "v4.1.3\n");
    const manifestPath = path.join(directory, "manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    writeFileSync(manifestPath, JSON.stringify({ ...manifest, version: "v4.1.3" }));
    assert.throws(() => verifyVendor(directory), /file-set\/bytes differ/);
    const reviewedFixture = { ...TRUSTED_RELEASE, version: "v4.1.3", sourceRevision: "1".repeat(40), treeSha256: fingerprintVendor(directory) };
    assert.equal(verifyVendor(directory, reviewedFixture).version, "v4.1.3");
  });
  check("real CLI rejects corrupt bytes without a sibling checkout", () => {
    const directory = fixture("cli");
    const scripts = path.resolve(directory, "../../scripts");
    mkdirSync(scripts);
    const script = path.join(scripts, "check-ds-version.mjs");
    cpSync(path.join(root, "scripts/check-ds-version.mjs"), script);
    assert.equal(spawnSync(process.execPath, [script, "--strict"], { encoding: "utf8" }).status, 0);
    writeFileSync(path.join(directory, "portlink-tokens.dist.css"), "this is not a stylesheet");
    rewriteManifest(directory);
    for (const flags of [[], ["--strict"], ["--quiet"]]) {
      const result = spawnSync(process.execPath, [script, ...flags], { encoding: "utf8" });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /Portlink Platform Gate A/);
    }
  });
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
console.log("DS integrity self-test: " + checks + " checks passed");
