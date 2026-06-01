#!/usr/bin/env node
/**
 * Copies the Next.js standalone output into packaging/desktop/resources/server
 * for electron-builder extraResources.
 *
 * Run from repo root after: DESKTOP_BUILD=1 npm run build
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const standaloneSrc = path.join(repoRoot, ".next/standalone");
const staticSrc = path.join(repoRoot, ".next/static");
const publicSrc = path.join(repoRoot, "public");
const dest = path.join(repoRoot, "packaging/desktop/resources/server");

function requirePath(label, target) {
  if (!existsSync(target)) {
    console.error(
      `Missing ${label}: ${target}\n` +
        "Run from repo root: DESKTOP_BUILD=1 npm run build",
    );
    process.exit(1);
  }
}

requirePath("standalone build", standaloneSrc);
requirePath(".next/static", staticSrc);
requirePath("public/", publicSrc);

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });

cpSync(standaloneSrc, dest, { recursive: true });
mkdirSync(path.join(dest, ".next"), { recursive: true });
cpSync(staticSrc, path.join(dest, ".next/static"), { recursive: true });
cpSync(publicSrc, path.join(dest, "public"), { recursive: true });

console.log(`Desktop server bundle ready at ${dest}`);
