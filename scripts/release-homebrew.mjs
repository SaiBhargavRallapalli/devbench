#!/usr/bin/env node
/**
 * Generate Homebrew Formula + Cask for a release from templates.
 *
 * Required env:
 *   RELEASE_VERSION     — e.g. 0.1.0 (no leading v)
 *   GITHUB_REPOSITORY   — e.g. SaiBhargavRallapalli/devbench
 *   SHA256_SOURCE       — source tarball from GitHub tag archive
 *   SHA256_DMG_ARM64    — arm64 .dmg
 *   SHA256_DMG_X64      — x64 .dmg
 *
 * Optional:
 *   OUTPUT_DIR          — default: dist/homebrew
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatesDir = path.join(repoRoot, "packaging/homebrew");

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return value;
}

const version = required("RELEASE_VERSION");
const repository = required("GITHUB_REPOSITORY");
const shaSource = required("SHA256_SOURCE");
const shaArm64 = required("SHA256_DMG_ARM64");
const shaX64 = required("SHA256_DMG_X64");
const outputDir = process.env.OUTPUT_DIR?.trim() || path.join(repoRoot, "dist/homebrew");
const [owner] = repository.split("/");

if (!owner || !repository.includes("/")) {
  console.error(`Invalid GITHUB_REPOSITORY: ${repository}`);
  process.exit(1);
}

const replacements = {
  VERSION: version,
  vVERSION: `v${version}`,
  REPLACE_WITH_RELEASE_TARBALL_SHA256: shaSource,
  REPLACE_ARM64_DMG_SHA256: shaArm64,
  REPLACE_X64_DMG_SHA256: shaX64,
  GITHUB_REPOSITORY: repository,
  GITHUB_REPOSITORY_OWNER: owner,
};

function applyTemplate(templatePath) {
  let content = readFileSync(templatePath, "utf8");
  // Longest keys first so GITHUB_REPOSITORY does not corrupt GITHUB_REPOSITORY_OWNER.
  const keys = Object.keys(replacements).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    content = content.replaceAll(key, replacements[key]);
  }
  return content;
}

mkdirSync(path.join(outputDir, "Formula"), { recursive: true });
mkdirSync(path.join(outputDir, "Casks"), { recursive: true });

const formula = applyTemplate(path.join(templatesDir, "devbench.rb.template"));
const cask = applyTemplate(path.join(templatesDir, "Casks/devbench.rb.template"));

writeFileSync(path.join(outputDir, "Formula/devbench.rb"), formula);
writeFileSync(path.join(outputDir, "Casks/devbench.rb"), cask);

console.log(`Wrote ${path.join(outputDir, "Formula/devbench.rb")}`);
console.log(`Wrote ${path.join(outputDir, "Casks/devbench.rb")}`);
