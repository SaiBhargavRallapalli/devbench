"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Play, Sparkles } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import { friendlyError } from "@/lib/friendly-error";
import { trackToolError, trackToolSuccess } from "@/lib/analytics-events";
import {
  EXAMPLE_SNIPPETS,
  FALLBACK_RUNTIMES,
  sanitizeRuntimeEntries,
  type NormalizedRunResult,
  type RuntimeEntry,
} from "@/lib/code-runner";

const RUN_SLUG = "code-runner";

const POPULAR_LANGUAGES = [
  "python",
  "javascript",
  "typescript",
  "java",
  "c",
  "cpp",
  "go",
  "rust",
  "ruby",
  "php",
  "bash",
  "swift",
  "lua",
];

const PLACEHOLDERS: Record<string, string> = {
  python: 'print("Hello from Python!")',
  javascript: 'console.log("Hello from JavaScript!");',
  typescript: 'const greeting: string = "Hello from TypeScript!";\nconsole.log(greeting);',
  java: 'class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello!");\n    }\n}',
  c: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello from C!\\n");\n    return 0;\n}',
  "cpp": '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go!")\n}',
  rust: 'fn main() {\n    println!("Hello from Rust!");\n}',
  ruby: 'puts "Hello from Ruby!"',
  php: '<?php\necho "Hello from PHP!\\n";',
  bash: 'echo "Hello from Bash!"',
  swift: 'print("Hello from Swift!")',
  lua: 'print("Hello from Lua!")',
};

const DEFAULT_PLACEHOLDER = "// Paste your code here, pick a language, then Run.";

function placeholderFor(language: string): string {
  return PLACEHOLDERS[language.toLowerCase()] ?? DEFAULT_PLACEHOLDER;
}

export default function CodeRunnerTool({ tool }: { tool: Tool }) {
  const [runtimes, setRuntimes] = useState<RuntimeEntry[]>([]);
  const [runtimesLoading, setRuntimesLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [language, setLanguage] = useState("");
  const [version, setVersion] = useState("");
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<NormalizedRunResult | null>(null);
  const [runError, setRunError] = useState("");
  const codeRef = useRef<HTMLTextAreaElement | null>(null);

  // Load the runtime catalog (language + version list) on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/code-run");
        if (!res.ok) throw new Error(`Runtimes request failed (${res.status})`);
        const parsed = sanitizeRuntimeEntries(await res.json());
        if (parsed.length === 0) throw new Error("Empty runtimes list");
        if (!cancelled) setRuntimes(parsed);
      } catch {
        if (!cancelled) {
          setRuntimes(FALLBACK_RUNTIMES);
          setUsingFallback(true);
        }
      } finally {
        if (!cancelled) setRuntimesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Default to Python (or whatever loads first). Derived during render —
  // the select falls back to this until the user picks a language.
  const defaultLanguage = useMemo(() => {
    if (runtimes.length === 0) return "";
    return (runtimes.find((r) => r.language === "python") ?? runtimes[0]).language;
  }, [runtimes]);

  const selectedLanguage = language || defaultLanguage;

  const versionOptions = useMemo(() => {
    const versions = runtimes
      .filter((r) => r.language === selectedLanguage)
      .map((r) => r.version);
    return [...new Set(versions)].sort((a, b) =>
      b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" }),
    );
  }, [runtimes, selectedLanguage]);

  // Fall back to the newest version whenever the language (or fetch) changes.
  const selectedVersion = versionOptions.includes(version)
    ? version
    : (versionOptions[0] ?? "");

  const languageGroups = useMemo(() => {
    const available = new Set(runtimes.map((r) => r.language));
    const popular = POPULAR_LANGUAGES.filter((l) => available.has(l));
    const popularSet = new Set(popular);
    const rest = [...available]
      .filter((l) => !popularSet.has(l))
      .sort((a, b) => a.localeCompare(b));
    return [
      { label: "Popular", languages: popular },
      { label: "All languages", languages: rest },
    ].filter((g) => g.languages.length > 0);
  }, [runtimes]);

  const selectedRuntime = useMemo(
    () =>
      runtimes.find(
        (r) => r.language === selectedLanguage && r.version === selectedVersion,
      ) ?? null,
    [runtimes, selectedLanguage, selectedVersion],
  );

  const example = EXAMPLE_SNIPPETS[selectedLanguage.toLowerCase()] ?? null;

  const run = useCallback(async () => {
    const trimmed = code.trim();
    if (!trimmed || running || !selectedLanguage || !selectedVersion) return;
    setRunning(true);
    setResult(null);
    setRunError("");
    try {
      const res = await fetch("/api/code-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLanguage,
          version: selectedVersion,
          code,
          ...(stdin ? { stdin } : {}),
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | ({ error?: string } & Partial<NormalizedRunResult>)
        | null;

      if (!res.ok || !json || typeof json.output !== "string") {
        const raw = json?.error || `The runner service returned an error (${res.status}).`;
        trackToolError(RUN_SLUG, "run", raw);
        setRunError(
          res.status === 429
            ? "You're running code too quickly — wait about a minute and try again."
            : raw,
        );
        return;
      }

      setResult(json as NormalizedRunResult);
      trackToolSuccess(RUN_SLUG, "run");
    } catch (e) {
      trackToolError(RUN_SLUG, "run", e instanceof Error ? e.message : String(e));
      setRunError(
        friendlyError(e, "Couldn't run the code. Check your connection and try again."),
      );
    } finally {
      setRunning(false);
    }
  }, [code, selectedLanguage, selectedVersion, stdin, running]);

  const handleCodeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        void run();
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const el = e.currentTarget;
        const { selectionStart, selectionEnd, value } = el;
        const next = value.slice(0, selectionStart) + "  " + value.slice(selectionEnd);
        setCode(next);
        requestAnimationFrame(() => {
          el.focus();
          el.selectionStart = el.selectionEnd = selectionStart + 2;
        });
      }
    },
    [run],
  );

  const outputLabel = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";
  const preBox =
    "max-h-80 overflow-auto rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm whitespace-pre-wrap break-words";

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Pick a language and version, write some code, and run it — compiled
          languages show compile errors separately from program output.
        </p>

        {usingFallback && (
          <p className="text-xs text-amber-700 dark:text-amber-400" role="status">
            Couldn&apos;t load the full language list — showing a built-in
            selection. Runs may fail until the list is reachable again.
          </p>
        )}

        {/* Language + version pickers */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="code-runner-language"
              className="block text-sm font-medium"
            >
              Language
            </label>
            {runtimesLoading ? (
              <div
                className="h-10 w-full animate-pulse rounded-xl bg-border"
                aria-hidden="true"
              />
            ) : (
              <select
                id="code-runner-language"
                value={selectedLanguage}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                {languageGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="code-runner-version" className="block text-sm font-medium">
              Compiler
            </label>
            {runtimesLoading ? (
              <div
                className="h-10 w-full animate-pulse rounded-xl bg-border"
                aria-hidden="true"
              />
            ) : (
              <select
                id="code-runner-version"
                value={selectedVersion}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                {versionOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
            {selectedRuntime?.aliases && selectedRuntime.aliases.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Build: {selectedRuntime.aliases.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Code editor */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="code-runner-code" className="block text-sm font-medium">
              Code
            </label>
            {example && (
              <button
                type="button"
                onClick={() => {
                  setCode(example);
                  setResult(null);
                  setRunError("");
                  codeRef.current?.focus();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Load example
              </button>
            )}
          </div>
          <textarea
            id="code-runner-code"
            ref={codeRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleCodeKeyDown}
            spellCheck={false}
            wrap="off"
            placeholder={placeholderFor(selectedLanguage)}
            className="min-h-[20rem] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm"
          />
        </div>

        {/* Optional stdin */}
        <details className="rounded-xl border border-border px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium">
            Standard input (stdin) — optional
          </summary>
          <textarea
            id="code-runner-stdin"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            spellCheck={false}
            placeholder="Lines piped into your program…"
            className="mt-3 min-h-[6rem] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm"
          />
        </details>

        {/* Run */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void run()}
            disabled={running || runtimesLoading || !code.trim() || !selectedVersion}
            aria-busy={running}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-40"
          >
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {running ? "Running…" : "Run code"}
          </button>
          <p className="text-xs text-muted-foreground">
            Shortcut: Ctrl/Cmd + Enter. Tab inserts two spaces.
          </p>
        </div>

        {runError && (
          <p className="text-sm text-destructive" role="alert">
            {runError}
          </p>
        )}

        {/* Output */}
        <div role="status" aria-live="polite" className="space-y-4">
          {result?.compileError ? (
            <div className="space-y-1.5">
              <h3 className={outputLabel}>Compile error</h3>
              <pre role="alert" className={`${preBox} text-destructive`}>
                {result.compileError}
              </pre>
            </div>
          ) : (
            <div className="space-y-1.5">
              <h3 className={outputLabel}>Output</h3>
              <pre className={preBox}>
                {result
                  ? result.output || "(no output)"
                  : "Nothing here yet — write some code and press Run (or Ctrl/Cmd + Enter)."}
              </pre>
            </div>
          )}

          {result?.stderr ? (
            <div className="space-y-1.5">
              <h3 className={outputLabel}>Errors (stderr)</h3>
              <pre role="alert" className={`${preBox} text-destructive`}>
                {result.stderr}
              </pre>
            </div>
          ) : null}

          {result && !result.compileError ? (
            <div>
              <span
                className={`inline-block rounded-full px-2 py-0.5 font-mono text-xs font-medium ${
                  result.exitCode === 0
                    ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                exit {result.exitCode}
              </span>
            </div>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          Code runs on the Wandbox public compiler cloud — don&apos;t enter
          secrets. Runs are rate-limited to keep the shared engine healthy.
        </p>
      </div>
    </main>
  );
}
