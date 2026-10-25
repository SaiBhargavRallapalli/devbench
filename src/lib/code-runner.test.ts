// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  EXAMPLE_SNIPPETS,
  FALLBACK_RUNTIMES,
  MAX_VERSIONS_PER_LANGUAGE,
  canonicalLanguageId,
  combineOutput,
  extensionForLanguage,
  normalizeWandboxResponse,
  parseRuntimes,
  stripAnsi,
} from "./code-runner";

describe("canonicalLanguageId", () => {
  it("canonicalizes Wandbox's display language names", () => {
    expect(canonicalLanguageId("C++")).toBe("cpp");
    expect(canonicalLanguageId("CPP")).toBe("cpp");
    expect(canonicalLanguageId("C#")).toBe("csharp");
    expect(canonicalLanguageId("Bash script")).toBe("bash");
    expect(canonicalLanguageId("Vim script")).toBe("vim");
    expect(canonicalLanguageId("Python")).toBe("python");
    expect(canonicalLanguageId("  Go  ")).toBe("go");
  });
});

describe("extensionForLanguage", () => {
  it("maps canonical language ids to conventional file names", () => {
    expect(extensionForLanguage("c")).toBe("main.c");
    expect(extensionForLanguage("cpp")).toBe("main.cpp");
    expect(extensionForLanguage("python")).toBe("main.py");
    expect(extensionForLanguage("javascript")).toBe("main.js");
    expect(extensionForLanguage("typescript")).toBe("main.ts");
    expect(extensionForLanguage("go")).toBe("main.go");
    expect(extensionForLanguage("rust")).toBe("main.rs");
    expect(extensionForLanguage("php")).toBe("main.php");
    expect(extensionForLanguage("ruby")).toBe("main.rb");
    expect(extensionForLanguage("swift")).toBe("main.swift");
    expect(extensionForLanguage("lua")).toBe("main.lua");
    expect(extensionForLanguage("perl")).toBe("main.pl");
    expect(extensionForLanguage("haskell")).toBe("main.hs");
    expect(extensionForLanguage("r")).toBe("main.r");
    expect(extensionForLanguage("julia")).toBe("main.jl");
    expect(extensionForLanguage("zig")).toBe("main.zig");
    expect(extensionForLanguage("bash")).toBe("main.sh");
    expect(extensionForLanguage("csharp")).toBe("Main.cs");
  });

  it("resolves aliases when the language itself is unknown", () => {
    expect(extensionForLanguage("pygmentize", ["python"])).toBe("main.py");
    expect(extensionForLanguage("ts-node", ["typescript"])).toBe("main.ts");
    expect(extensionForLanguage("node", ["javascript"])).toBe("main.js");
  });

  it("is case-insensitive", () => {
    expect(extensionForLanguage("Python")).toBe("main.py");
    expect(extensionForLanguage("CPP")).toBe("main.cpp");
  });

  it("falls back to main.txt for unknown languages", () => {
    expect(extensionForLanguage("befunge93")).toBe("main.txt");
    expect(extensionForLanguage("")).toBe("main.txt");
    expect(extensionForLanguage("brainfuck", ["bf"])).toBe("main.txt");
  });
});

describe("combineOutput", () => {
  it("joins non-empty parts and drops empty ones", () => {
    expect(combineOutput(["a\n", "", "b\n", "  \n", null, undefined])).toBe("a\n\nb");
  });

  it("returns an empty string when nothing is renderable", () => {
    expect(combineOutput([])).toBe("");
    expect(combineOutput(["", "   ", null])).toBe("");
  });

  it("normalizes CRLF", () => {
    expect(combineOutput(["a\r\nb\r\n"])).toBe("a\nb");
  });
});

describe("stripAnsi", () => {
  it("removes ANSI color codes from compiler diagnostics", () => {
    expect(stripAnsi("\u001b[1mprog.cc:2:27: \u001b[0m\u001b[0;1;31merror: \u001b[0mbad")).toBe(
      "prog.cc:2:27: error: bad",
    );
    expect(stripAnsi("plain text")).toBe("plain text");
  });
});

describe("normalizeWandboxResponse", () => {
  it("normalizes a successful run with stdin echoes (program_message deduped)", () => {
    const result = normalizeWandboxResponse(
      {
        status: "0",
        signal: "",
        compiler_output: "",
        compiler_error: "",
        compiler_message: "",
        program_output: "42\nstdin:hello\n",
        program_error: "",
        program_message: "42\nstdin:hello\n",
        permlink: "",
        url: "",
      },
      { language: "python", version: "cpython-3.13.8" },
    );
    expect(result).toEqual({
      output: "42\nstdin:hello",
      exitCode: 0,
      stderr: "",
      compileError: null,
      language: "python",
      version: "cpython-3.13.8",
    });
  });

  it("captures a compiled-language build failure (compiler_error, ANSI stripped)", () => {
    const result = normalizeWandboxResponse(
      {
        status: "1",
        signal: "",
        compiler_output: "",
        compiler_error:
          "\u001b[1mprog.cc:2:27: \u001b[0m\u001b[0;1;31merror: \u001b[0muse of undeclared identifier 'oops'\n1 error generated.\n",
        compiler_message:
          "\u001b[1mprog.cc:2:27: \u001b[0m\u001b[0;1;31merror: \u001b[0muse of undeclared identifier 'oops'\n1 error generated.\n",
        program_output: "",
        program_error: "",
        program_message: "",
      },
      { language: "cpp", version: "clang-15.0.7" },
    );
    expect(result.compileError).toContain(
      "use of undeclared identifier 'oops'",
    );
    expect(result.compileError).not.toContain("\u001b");
    expect(result.compileError).not.toContain("[1m");
    expect(result.output).toBe("");
    expect(result.exitCode).toBe(1);
    // compiler_message mirrors compiler_error — must not be duplicated.
    expect(result.stderr).toBe("");
  });

  it("captures a runtime error (status 1, program_error → stderr)", () => {
    const result = normalizeWandboxResponse(
      {
        status: "1",
        signal: "",
        compiler_output: "",
        compiler_error: "",
        compiler_message: "",
        program_output: "1\n",
        program_error: "Traceback (most recent call last):\nValueError: boom\n",
        program_message: "1\nTraceback (most recent call last):\nValueError: boom\n",
      },
      { language: "python", version: "cpython-3.13.8" },
    );
    expect(result.output).toBe("1");
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("ValueError: boom");
    expect(result.compileError).toBeNull();
    // program_message is output+error concatenated — no duplication in stderr.
    expect(result.stderr.match(/Traceback/g)?.length).toBe(1);
  });

  it("maps status \"1\" with no error text to exitCode 1", () => {
    const result = normalizeWandboxResponse({ status: "1", signal: "" });
    expect(result.exitCode).toBe(1);
    expect(result.output).toBe("");
    expect(result.compileError).toBeNull();
  });

  it("appends a termination signal to stderr", () => {
    const result = normalizeWandboxResponse({
      status: "1",
      signal: "SIGKILL",
      program_output: "start",
      program_error: "",
      program_message: "",
    });
    expect(result.output).toBe("start");
    expect(result.stderr).toContain("[terminated: SIGKILL]");
  });

  it("appends message content that carries extra notices (e.g. limits)", () => {
    const result = normalizeWandboxResponse({
      status: "1",
      signal: "",
      program_output: "",
      program_error: "",
      program_message: "time limit exceeded",
    });
    expect(result.stderr).toBe("time limit exceeded");
  });

  it("falls back to a defensive shape for garbage input", () => {
    expect(normalizeWandboxResponse(null)).toEqual({
      output: "",
      exitCode: 0,
      stderr: "",
      compileError: null,
      language: "",
      version: "",
    });
    const partial = normalizeWandboxResponse({ status: 42, program_output: 7 });
    expect(partial.output).toBe("");
    expect(partial.exitCode).toBe(0);
    expect(partial.stderr).toBe("");
  });
});

describe("parseRuntimes (Wandbox list.json)", () => {
  it("canonicalizes languages, sets compiler id + display-version alias", () => {
    const parsed = parseRuntimes([
      { name: "cpython-3.13.8", version: "3.13.8", language: "Python" },
      { name: "bash", version: "5.2.21(1)-release", language: "Bash script" },
      { name: "mono-6.12.0.199", version: "6.12.0.199", language: "C#" },
      { name: "clang-15.0.7", version: "15.0.7", language: "C++" },
      { name: "clang-15.0.7", version: "15.0.7", language: "CPP" }, // duplicate across groups
      { name: "clang-15.0.7-c", version: "15.0.7", language: "C" },
    ]);
    const byLang = Object.fromEntries(
      parsed.map((p) => [p.language, p.version]),
    );
    expect(parsed.map((p) => p.language).sort()).toEqual([
      "bash",
      "c",
      "cpp",
      "csharp",
      "python",
    ]);
    expect(byLang.python).toBe("cpython-3.13.8");
    expect(byLang.bash).toBe("bash");
    expect(byLang.csharp).toBe("mono-6.12.0.199");
    // CPP + C++ collapsed into one canonical group, deduped by compiler id.
    expect(parsed.filter((p) => p.language === "cpp")).toHaveLength(1);
    expect(parsed.find((p) => p.language === "python")?.aliases).toEqual([
      "3.13.8",
    ]);
  });

  it("drops unstable compilers, Lazy K, and malformed entries", () => {
    const parsed = parseRuntimes([
      { name: "gcc-head", version: "17.0.0 20261016 (experimental)", language: "C++" },
      { name: "cpython-head", version: "", language: "Python" },
      { name: "boost-1.0", version: "1.0", language: "C++" },
      { name: "snapshotty", version: "1.0", language: "Python" }, // name hits /snapshot/
      { name: "lazyk-1.0", version: "1.0", language: "Lazy K" },
      { name: "", version: "1.0", language: "Python" },
      { name: "python-ok", version: "1.0", language: "" },
      "junk",
      null,
      { name: "go-1.23.2", version: "1.23.2", language: "Go" },
    ]);
    expect(parsed.map((p) => p.version)).toEqual(["go-1.23.2"]);
  });

  it("sorts versions newest-first and caps at 6 per language", () => {
    const entries = [
      "cpython-3.9.20",
      "cpython-3.14.0",
      "cpython-3.10.15",
      "cpython-3.11.10",
      "cpython-3.13.8",
      "cpython-3.12.7",
      "cpython-3.8.20",
      "cpython-3.7.17",
      "pypy-3.10-v7.3.17", // pypy's internal 7.x must NOT outrank 3.x cpythons
    ].map((name) => ({ name, version: name, language: "Python" }));

    const python = parseRuntimes(entries).filter((p) => p.language === "python");
    expect(python).toHaveLength(MAX_VERSIONS_PER_LANGUAGE);
    expect(python.map((p) => p.version)).toEqual([
      "cpython-3.14.0",
      "cpython-3.13.8",
      "cpython-3.12.7",
      "cpython-3.11.10",
      "cpython-3.10.15",
      "pypy-3.10-v7.3.17",
    ]);
  });

  it("returns [] for non-array input", () => {
    expect(parseRuntimes(undefined)).toEqual([]);
    expect(parseRuntimes({ name: "bash" })).toEqual([]);
    expect(parseRuntimes([])).toEqual([]);
  });
});

describe("FALLBACK_RUNTIMES", () => {
  it("lists at least 10 real Wandbox compiler ids, unique", () => {
    expect(FALLBACK_RUNTIMES.length).toBeGreaterThanOrEqual(10);
    expect(FALLBACK_RUNTIMES.length).toBeLessThanOrEqual(12);
    const keys = FALLBACK_RUNTIMES.map((r) => `${r.language}@${r.version}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("uses valid canonical language ids and compiler-id-shaped versions", () => {
    for (const runtime of FALLBACK_RUNTIMES) {
      expect(runtime.language).toMatch(/^[a-z][a-z0-9+#-]*$/);
      // Wandbox compiler ids: letters/digits/dot/underscore/plus/dash.
      expect(runtime.version).toMatch(/^[\w.+-]{1,60}$/);
      expect(runtime.aliases?.length).toBeGreaterThan(0);
    }
    const langs = FALLBACK_RUNTIMES.map((r) => r.language);
    for (const lang of [
      "python",
      "javascript",
      "typescript",
      "cpp",
      "c",
      "java",
      "go",
      "rust",
      "ruby",
      "php",
      "bash",
      "lua",
    ]) {
      expect(langs).toContain(lang);
    }
    // Kotlin/Dart were dropped from the product; must not resurface here.
    expect(langs).not.toContain("kotlin");
    expect(langs).not.toContain("dart");
  });
});

describe("EXAMPLE_SNIPPETS", () => {
  it("provides snippets for the six advertised canonical ids", () => {
    for (const lang of ["python", "javascript", "cpp", "java", "go", "rust"]) {
      expect(EXAMPLE_SNIPPETS[lang]?.trim().length ?? 0).toBeGreaterThan(20);
    }
    expect(Object.keys(EXAMPLE_SNIPPETS).sort()).toEqual(
      ["cpp", "go", "java", "javascript", "python", "rust"].sort(),
    );
  });
});
