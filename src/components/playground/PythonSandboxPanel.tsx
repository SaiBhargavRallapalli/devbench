"use client";

import { useCallback, useEffect, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import { Loader2, Play, Trash2, Keyboard } from "lucide-react";
import { PLAYGROUND_MONACO_VS_CDN } from "@/lib/playground/constants";
import { ensurePyodide } from "@/lib/playground/pyodide-loader";
import { installPyodideStdin } from "@/lib/playground/pyodide-stdin";
import PlaygroundEditorFrame from "@/components/playground/PlaygroundEditorFrame";

let monacoCdnConfigured = false;
function ensureMonacoCdn(): void {
  if (monacoCdnConfigured) return;
  monacoCdnConfigured = true;
  loader.config({ paths: { vs: PLAYGROUND_MONACO_VS_CDN } });
}

const DEFAULT_PY = `import sys
name = sys.stdin.readline().strip()
print("Hello " + name)
`;

const STDIN_HINT_PY =
  "Stdin tab: each line is fed to sys.stdin in order. Try Ada then Bob on separate lines.";

export default function PythonSandboxPanel({ dark }: { dark: boolean }) {
  const [code, setCode] = useState(DEFAULT_PY);
  const [stdin, setStdin] = useState("Ada\n");
  const [out, setOut] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pyReady, setPyReady] = useState(false);

  useEffect(() => {
    ensureMonacoCdn();
  }, []);

  const run = useCallback(async () => {
    setLoading(true);
    const lines: string[] = [];
    try {
      const py = await ensurePyodide();
      installPyodideStdin(py, stdin);
      py.setStdout({ batched: (s) => lines.push(s) });
      py.setStderr({ batched: (s) => lines.push(`[stderr] ${s}`) });
      await py.runPythonAsync(code, { filename: "<playground>" });
      setPyReady(true);
      setOut(lines.length ? lines : ["(no stdout - finished)"]);
    } catch (e) {
      setOut([String(e instanceof Error ? e.message : e)]);
    } finally {
      setLoading(false);
    }
  }, [code, stdin]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey) || e.key !== "Enter") return;
      if (loading) return;
      e.preventDefault();
      void run();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run, loading]);

  const theme = dark ? "vs-dark" : "vs";

  return (
    <PlaygroundEditorFrame
      toolbar={
        <>
          <button
            type="button"
            onClick={() => void run()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
            Run Python
          </button>
          <button
            type="button"
            onClick={() => setOut([])}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Clear output
          </button>
          <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-[11px] text-muted-foreground">
            <Keyboard className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Ctrl+Enter
          </span>
          <span className="text-xs text-muted-foreground">
            {pyReady ? "Pyodide ready." : "First run downloads Pyodide (~10-20 MB)."}
          </span>
        </>
      }
      stdin={stdin}
      onStdinChange={setStdin}
      stdinPlaceholder={"Ada\n"}
      stdinHint={STDIN_HINT_PY}
      stdinDisabled={false}
      editor={
        <Editor
          height="100%"
          language="python"
          theme={theme}
          value={code}
          onChange={(v) => setCode(v ?? "")}
          loading={
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading editor…
            </div>
          }
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12 },
          }}
        />
      }
      output={
        <pre
          className="p-3 font-mono text-[13px] leading-relaxed text-foreground whitespace-pre-wrap break-words"
          aria-live="polite"
        >
          {out.length ? out.join("\n") : "Output tab: Run or Ctrl+Enter. Stdin tab: lines for sys.stdin."}
        </pre>
      }
    />
  );
}
