// Copyright (c) 2026 DevBench contributors. MIT License.
//
// Pure, DOM-free helpers for the Multi-Language Code Runner.
// Backend: the public Wandbox compiler cloud (https://wandbox.org/api).
// Everything here is safe to import in route handlers and client components.

/** One entry exposed to the UI: `version` is the Wandbox compiler id. */
export interface RuntimeEntry {
  language: string;
  version: string;
  aliases?: string[];
  runtime?: string;
}

/** Normalized execution result shared by the API route and the tool UI. */
export interface NormalizedRunResult {
  output: string;
  exitCode: number;
  stderr: string;
  compileError: string | null;
  language: string;
  version: string;
}

/** Newest versions we surface per language in the runtimes list. */
export const MAX_VERSIONS_PER_LANGUAGE = 6;

/** Compiler ids that churn or are unusable (HEAD/experimental builds). */
const UNSTABLE_COMPILER_RE = /head|experimental|nightly|snapshot|trunk|boost/i;

/**
 * Conventional entry-file name per language. Compiled languages (Java, C#,
 * Kotlin, Scala) need PascalCase names so `public class X` matches the file.
 * Keys are canonical language ids (see `canonicalLanguageId`).
 */
const FILE_NAMES: Record<string, string> = {
  c: "main.c",
  "c++": "main.cpp",
  cpp: "main.cpp",
  python: "main.py",
  python2: "main.py",
  python3: "main.py",
  javascript: "main.js",
  node: "main.js",
  typescript: "main.ts",
  go: "main.go",
  rust: "main.rs",
  java: "Main.java",
  csharp: "Main.cs",
  php: "main.php",
  ruby: "main.rb",
  kotlin: "Main.kt",
  swift: "main.swift",
  lua: "main.lua",
  perl: "main.pl",
  haskell: "main.hs",
  scala: "Main.scala",
  r: "main.r",
  dart: "main.dart",
  julia: "main.jl",
  zig: "main.zig",
  bash: "main.sh",
  sh: "main.sh",
  d: "main.d",
  erlang: "main.erl",
  elixir: "main.exs",
  groovy: "main.groovy",
  nim: "main.nim",
  crystal: "main.cr",
  ocaml: "main.ml",
  pascal: "main.pas",
  lisp: "main.lisp",
  sql: "main.sql",
  pony: "main.pony",
  vim: "main.vim",
};

const DEFAULT_FILE_NAME = "main.txt";

/**
 * Canonical language id used across the app. Wandbox's `language` field is
 * display-oriented ("Bash script", "C++", "C#") — flatten it so the ids line
 * up with `FILE_NAMES`, snippet keys, and the UI selects.
 *   "C++" / "CPP" → "cpp", "C#" → "csharp", "Bash script" → "bash",
 *   everything else → lowercase slug.
 */
export function canonicalLanguageId(raw: string): string {
  const id = raw.trim().toLowerCase();
  if (id === "c++" || id === "cpp") return "cpp";
  if (id === "c#") return "csharp";
  return id.replace(/ script$/, "");
}

/**
 * Suggested file name for a language. `aliases` (e.g. the display version)
 * are checked too, so alias-style inputs resolve to the right name.
 */
export function extensionForLanguage(
  lang: string,
  aliases: readonly string[] = [],
): string {
  const candidates = [lang, ...aliases];
  for (const candidate of candidates) {
    const key = candidate.trim().toLowerCase();
    const hit = FILE_NAMES[key];
    if (hit) return hit;
  }
  return DEFAULT_FILE_NAME;
}

/**
 * Popular compilers used when the live list.json GET fails, so the tool
 * still works. `version` = Wandbox compiler id (verified against the live
 * list), `aliases[0]` = display version hint.
 */
export const FALLBACK_RUNTIMES: RuntimeEntry[] = [
  { language: "python", version: "cpython-3.13.8", aliases: ["3.13.8"] },
  { language: "javascript", version: "nodejs-20.17.0", aliases: ["20.17.0"] },
  { language: "typescript", version: "typescript-5.6.2", aliases: ["5.6.2"] },
  { language: "cpp", version: "clang-15.0.7", aliases: ["15.0.7"] },
  { language: "c", version: "clang-15.0.7-c", aliases: ["15.0.7"] },
  { language: "java", version: "openjdk-jdk-21+35", aliases: ["jdk-21+35"] },
  { language: "rust", version: "rust-1.65.0", aliases: ["1.65.0"] },
  { language: "go", version: "go-1.23.2", aliases: ["1.23.2"] },
  { language: "ruby", version: "ruby-3.4.9", aliases: ["3.4.9"] },
  { language: "php", version: "php-8.3.12", aliases: ["8.3.12"] },
  { language: "bash", version: "bash", aliases: ["5.2.21(1)-release"] },
  { language: "lua", version: "lua-5.4.7", aliases: ["5.4.7"] },
];

/** Short, correct, idiomatic starter snippets shown by the "Load example" button. */
export const EXAMPLE_SNIPPETS: Record<string, string> = {
  python: `import sys

name = sys.stdin.readline().strip() or "world"
print(f"Hello, {name}!")
print("Python", sys.version.split()[0])`,
  javascript: `const nums = [3, 1, 4, 1, 5];
const sorted = [...nums].sort((a, b) => a - b);

console.log("sorted:", sorted.join(", "));
console.log("sum:", sorted.reduce((a, b) => a + b, 0));`,
  cpp: `#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> nums = {3, 1, 4, 1, 5};
    std::cout << "sum: " << std::accumulate(nums.begin(), nums.end(), 0) << '\\n';
    std::cout << "C++ " << __cplusplus / 100 << '.' << (__cplusplus % 100) / 10 << '\\n';
    return 0;
}`,
  java: `class Main {
    public static void main(String[] args) {
        String[] words = {"fast", "portable", "verbose"};
        for (String w : words) {
            System.out.println("Java is " + w);
        }
    }
}`,
  go: `package main

import "fmt"

func main() {
    total := 0
    for i := 1; i <= 10; i++ {
        total += i
    }
    fmt.Println("sum 1..10 =", total)
}`,
  rust: `fn main() {
    let squares: Vec<i32> = (1..=5).map(|n| n * n).collect();
    println!("squares: {:?}", squares);

    let even: Vec<i32> = squares.iter().copied().filter(|n| n % 2 == 0).collect();
    println!("even squares: {:?}", even);
}`,
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.replace(/\r\n/g, "\n") : "";
}

/** Remove ANSI color codes (Wandbox's compiler diagnostics ship colored). */
export function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, "");
}

/**
 * Parse Wandbox's `list.json` into `RuntimeEntry[]`:
 *   - `language` = canonical id (C++/CPP → cpp, C# → csharp, …)
 *   - `version`  = compiler id (e.g. `cpython-3.13.8`) — what we POST back
 *   - `aliases`  = [display version] when present (UI hint, e.g. `3.13.8`)
 * Drops unstable compilers (head/nightly/…), the Lazy K esolang, and
 * duplicates; keeps the newest `MAX_VERSIONS_PER_LANGUAGE` per language.
 */
export function parseRuntimes(raw: unknown): RuntimeEntry[] {
  if (!Array.isArray(raw)) return [];

  const grouped = new Map<string, RuntimeEntry[]>();
  const seen = new Set<string>();

  for (const item of raw) {
    const rec = asRecord(item);
    if (!rec) continue;
    const name = asText(rec.name).trim();
    const rawLanguage = asText(rec.language).trim();
    if (!name || !rawLanguage) continue;
    if (UNSTABLE_COMPILER_RE.test(name)) continue;
    if (/lazy\s*k/i.test(rawLanguage)) continue;

    const language = canonicalLanguageId(rawLanguage);
    if (!language) continue;

    const key = `${language}@${name}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const displayVersion = asText(rec.version).trim();
    const entry: RuntimeEntry = {
      language,
      version: name,
      aliases: displayVersion ? [displayVersion] : [],
    };
    const group = grouped.get(language);
    if (group) group.push(entry);
    else grouped.set(language, [entry]);
  }

  const out: RuntimeEntry[] = [];
  for (const [, group] of grouped) {
    group.sort(compareNewestFirst);
    out.push(...group.slice(0, MAX_VERSIONS_PER_LANGUAGE));
  }
  out.sort((a, b) => a.language.localeCompare(b.language));
  return out;
}

/** First semantic-version-ish number run in a string, as a tuple. */
function versionTuple(s: string): number[] {
  const match = s.match(/\d+(?:\.\d+)*/);
  return match ? match[0].split(".").map(Number) : [];
}

/** Newest-first ordering; prefers the compiler id (avoids pypy's 7.x skew). */
function compareNewestFirst(a: RuntimeEntry, b: RuntimeEntry): number {
  const av = versionTuple(a.version);
  const bv = versionTuple(b.version);
  const aKey = av.length > 0 ? av : versionTuple(a.aliases?.[0] ?? "");
  const bKey = bv.length > 0 ? bv : versionTuple(b.aliases?.[0] ?? "");
  const len = Math.max(aKey.length, bKey.length);
  for (let i = 0; i < len; i++) {
    const diff = (bKey[i] ?? 0) - (aKey[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return a.version.localeCompare(b.version);
}

/**
 * Join non-empty output parts. Each part gets CRLF normalized; parts that are
 * empty (or whitespace-only) are dropped so we never render blank "blocks".
 */
export function combineOutput(
  parts: ReadonlyArray<string | null | undefined>,
): string {
  return parts
    .map((p) => (typeof p === "string" ? p.replace(/\r\n/g, "\n") : ""))
    .filter((p) => p.trim().length > 0)
    .join("\n")
    .trimEnd();
}

/**
 * Defensively normalize a Wandbox `/api/compile.json` response into the
 * stable shape the UI renders. Real shape (HTTP 200 even on failure):
 *   { status: "0"|"1", signal,
 *     compiler_output, compiler_error, compiler_message,
 *     program_output, program_error, program_message, permlink, url }
 *
 * Mapping (verified live 2026-10):
 *   output      = program_output
 *   compileError = compiler_error (build failure; ANSI colors stripped)
 *   stderr      = program_error + [terminated: signal] + extra notices
 *   exitCode    = status "0"→0, "1"→1. Wandbox exposes NO real process exit
 *                 codes, so non-zero here means "reported failure", not the
 *                 program's actual `exit(n)` value.
 *
 * `*_message` fields normally mirror output+error; they are appended to
 * stderr only when they carry extra content (time/memory-limit notices).
 */
export function normalizeWandboxResponse(
  raw: unknown,
  context?: { language?: string; version?: string },
): NormalizedRunResult {
  const root = asRecord(raw) ?? {};
  const status = asText(root.status).trim();
  const signal = asText(root.signal).trim();

  const compileError = stripAnsi(asText(root.compiler_error)).trim() || null;
  const output = stripAnsi(asText(root.program_output)).replace(/\s+$/, "");
  const programError = stripAnsi(asText(root.program_error)).replace(/\s+$/, "");
  const programMessage = stripAnsi(asText(root.program_message)).replace(/\s+$/, "");
  const compilerOutput = stripAnsi(asText(root.compiler_output)).replace(/\s+$/, "");
  const compilerMessage = stripAnsi(asText(root.compiler_message)).replace(/\s+$/, "");

  const stderrParts: string[] = [];
  if (programError) stderrParts.push(programError);
  if (signal) stderrParts.push(`[terminated: ${signal}]`);
  const programCombined = [output, programError].filter(Boolean).join("\n");
  if (
    programMessage &&
    programMessage !== output &&
    programMessage !== programError &&
    programMessage !== programCombined
  ) {
    stderrParts.push(programMessage);
  }
  const compilerCombined = [compilerOutput, compileError ?? ""]
    .filter(Boolean)
    .join("\n");
  if (
    compilerMessage &&
    compilerMessage !== (compileError ?? "") &&
    compilerMessage !== compilerOutput &&
    compilerMessage !== compilerCombined
  ) {
    stderrParts.push(compilerMessage);
  }

  let exitCode: number;
  if (status === "0") exitCode = 0;
  else if (status === "1") exitCode = 1;
  else {
    const parsedStatus = Number.parseInt(status, 10);
    exitCode = Number.isFinite(parsedStatus) ? parsedStatus : 0;
  }

  return {
    output,
    exitCode,
    stderr: combineOutput(stderrParts),
    compileError,
    language: context?.language ?? "",
    version: context?.version ?? "",
  };
}
