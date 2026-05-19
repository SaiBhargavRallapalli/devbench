#!/usr/bin/env node
/**
 * DevBench CLI v2 — transforms aligned with the web app (Node 20+).
 *
 * Usage:
 *   devbench-cli <command> [file]
 *   echo '{"a":1}' | devbench-cli json-format
 *   devbench-cli help
 */
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const yaml = require("js-yaml");

const cmds = {
  help: () => {
    console.log(`Commands: ${Object.keys(cmds).filter((k) => k !== "help").join(", ")}`);
    console.log("Pass a file path or pipe stdin.");
  },
  "base64-encode": (t) => Buffer.from(t, "utf8").toString("base64"),
  "base64-decode": (t) => Buffer.from(t.trim(), "base64").toString("utf8"),
  "url-encode": (t) => encodeURIComponent(t),
  "url-decode": (t) => decodeURIComponent(t),
  "json-format": (t) => JSON.stringify(JSON.parse(t), null, 2),
  "json-minify": (t) => JSON.stringify(JSON.parse(t)),
  "json-to-yaml": (t) => yaml.dump(JSON.parse(t), { indent: 2, lineWidth: 120 }),
  "yaml-to-json": (t) => JSON.stringify(yaml.load(t), null, 2),
  "sha-256": (t) => createHash("sha256").update(t, "utf8").digest("hex"),
  "sha-1": (t) => createHash("sha1").update(t, "utf8").digest("hex"),
  rot13: (t) =>
    t.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    }),
  "html-encode": (t) =>
    t
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;"),
  "html-decode": (t) =>
    t
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&amp;/g, "&"),
};

const [,, cmd, file] = process.argv;
if (!cmd || cmd === "help" || !cmds[cmd]) {
  cmds.help();
  process.exit(cmd && cmd !== "help" ? 1 : 0);
}

const input = file ? readFileSync(file, "utf8") : await readStdin();
try {
  process.stdout.write(cmds[cmd](input));
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let s = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (s += c));
    process.stdin.on("end", () => resolve(s));
    process.stdin.on("error", reject);
  });
}
