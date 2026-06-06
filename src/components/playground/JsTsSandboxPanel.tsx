"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Editor, { loader } from "@monaco-editor/react";
import { Play, Trash2, Loader2, Keyboard, Share2 } from "lucide-react";
import { encodePlaygroundShare, decodePlaygroundShare } from "@/lib/playground-share";
import { PLAYGROUND_MONACO_VS_CDN, SANDBOX_MAX_CODE_CHARS, SANDBOX_MAX_LOG_LINES } from "@/lib/playground/constants";
import { getSandboxJsSrcdoc } from "@/lib/playground/sandbox-js-srcdoc";
import { isSandboxChildMessage } from "@/lib/playground/sandbox-js-messages";
import { transpileTsToJs } from "@/lib/playground/transpile-ts";
import { buildJsSandboxPreamble } from "@/lib/playground/js-sandbox-preamble";
import PlaygroundEditorFrame from "@/components/playground/PlaygroundEditorFrame";

let monacoCdnConfigured = false;
function ensureMonacoCdn(): void {
  if (monacoCdnConfigured) return;
  monacoCdnConfigured = true;
  loader.config({ paths: { vs: PLAYGROUND_MONACO_VS_CDN } });
}

export type WebPlayMode = "javascript" | "typescript" | "nodejs";

const DEFAULT_JS = `const name = readStdinLine();
console.log("Hello, " + (name || "guest"));
`;

const DEFAULT_TS = `type Name = string | null;
const name: Name = readStdinLine();
console.log("Hello, " + (name ?? "guest"));
`;

const DEFAULT_NODE = `var readline = require("readline");
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on("line", function (line) {
  console.log("Hello, " + line);
});
`;

const STDIN_HINT_JS =
  "Stdin tab: one line per readStdinLine() call. Node tab also supports require(\"readline\") with a small in-browser shim.";

const STDIN_PLACEHOLDER = "Ada\nBob\n";

export default function JsTsSandboxPanel({ mode, dark }: { mode: WebPlayMode; dark: boolean }) {
  const [code, setCode] = useState(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const payload = decodePlaygroundShare(hash);
    if (
      payload &&
      ((mode === "javascript" && payload.lang === "javascript") ||
        (mode === "typescript" && payload.lang === "typescript") ||
        (mode === "nodejs" && payload.lang === "nodejs"))
    ) {
      return payload.code;
    }
    return mode === "typescript" ? DEFAULT_TS : mode === "nodejs" ? DEFAULT_NODE : DEFAULT_JS;
  });
  const [stdin, setStdin] = useState(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const payload = decodePlaygroundShare(hash);
    if (
      payload &&
      ((mode === "javascript" && payload.lang === "javascript") ||
        (mode === "typescript" && payload.lang === "typescript") ||
        (mode === "nodejs" && payload.lang === "nodejs"))
    ) {
      return payload.stdin ?? "Ada\nBob\n";
    }
    return "Ada\nBob\n";
  });
  const [output, setOutput] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const runIdRef = useRef(0);
  const pendingRunRef = useRef<{
    id: number;
    lines: string[];
    sawDone: boolean;
    sawError: boolean;
  } | null>(null);

  const srcdoc = useMemo(() => getSandboxJsSrcdoc(), []);
  const monacoLanguage = mode === "typescript" ? "typescript" : "javascript";
  const nodeShim = mode === "nodejs";

  useEffect(() => {
    ensureMonacoCdn();
  }, []);


  function shareSnippet() {
    const lang =
      mode === "typescript" ? "typescript" : mode === "nodejs" ? "nodejs" : "javascript";
    const frag = encodePlaygroundShare({ v: 1, lang, code, stdin });
    const url = `${window.location.origin}${window.location.pathname}${frag}`;
    void navigator.clipboard.writeText(url);
  }

  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      const win = iframeRef.current?.contentWindow;
      if (!win || ev.source !== win) return;
      if (!isSandboxChildMessage(ev.data)) return;
      const d = ev.data;
      if (d.type === "READY") {
        setIframeReady(true);
        return;
      }
      const pending = pendingRunRef.current;
      if (!pending || d.id !== pending.id) return;
      if (d.type === "LOG") {
        const line = `[${d.level}] ${d.args.join(" ")}`;
        pending.lines.push(line);
        if (pending.lines.length > SANDBOX_MAX_LOG_LINES) {
          pending.lines.splice(0, pending.lines.length - SANDBOX_MAX_LOG_LINES);
          if (!pending.lines[0]?.startsWith("[info] Log truncated")) {
            pending.lines.unshift(
              `[info] Log truncated — showing last ${SANDBOX_MAX_LOG_LINES} lines`,
            );
          }
        }
        setOutput([...pending.lines]);
        return;
      }
      if (d.type === "UNCAUGHT" || d.type === "ERROR") {
        pending.sawError = true;
        pending.lines.push(d.type === "UNCAUGHT" ? `Uncaught: ${d.message}` : `Error: ${d.message}`);
        if (d.stack) pending.lines.push(d.stack);
        setOutput([...pending.lines]);
        setRunning(false);
        pendingRunRef.current = null;
        return;
      }
      if (d.type === "DONE") {
        pending.sawDone = true;
        if (!pending.sawError && pending.lines.length === 0) {
          pending.lines.push("(finished - no console output)");
          setOutput([...pending.lines]);
        }
        setRunning(false);
        pendingRunRef.current = null;
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const run = useCallback(async () => {
    if (running) return;
    let jsBody = code.trimEnd();

    if (mode === "typescript") {
      setRunning(true);
      setOutput(["Transpiling TypeScript…"]);
      const tr = await transpileTsToJs(code);
      if ("errors" in tr) {
        setOutput(tr.errors.split("\n").filter(Boolean));
        setRunning(false);
        return;
      }
      jsBody = tr.js;
    } else {
      setRunning(true);
    }

    if (!iframeReady || !iframeRef.current?.contentWindow) {
      setOutput(["Sandbox iframe is not ready yet. Try again in a moment."]);
      setRunning(false);
      return;
    }
    const preamble = buildJsSandboxPreamble(stdin, nodeShim);
    const finalCode = preamble + "\n" + jsBody;
    if (finalCode.length > SANDBOX_MAX_CODE_CHARS) {
      setOutput([
        `Code exceeds sandbox limit (${SANDBOX_MAX_CODE_CHARS.toLocaleString()} characters including stdin preamble).`,
      ]);
      setRunning(false);
      return;
    }
    const id = ++runIdRef.current;
    const lines: string[] = [];
    pendingRunRef.current = { id, lines, sawDone: false, sawError: false };
    setOutput([]);
    iframeRef.current.contentWindow.postMessage({ type: "RUN", id, code: finalCode }, "*");
  }, [code, iframeReady, mode, nodeShim, running, stdin]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey) || e.key !== "Enter") return;
      if (running) return;
      e.preventDefault();
      void run();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run, running]);

  const theme = dark ? "vs-dark" : "vs";

  const title =
    mode === "nodejs"
      ? "Node.js-style (browser sandbox)"
      : mode === "typescript"
        ? "TypeScript"
        : "JavaScript";

  return (
    <>
      <PlaygroundEditorFrame
        toolbar={
          <>
            <button
              type="button"
              onClick={() => void run()}
              disabled={running || !iframeReady}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
              Run
            </button>
            <button
              type="button"
              onClick={() => setOutput([])}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Clear output
            </button>
            <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-[11px] text-muted-foreground">
              <Keyboard className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Ctrl+Enter
            </span>
            <button
              type="button"
              onClick={shareSnippet}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
            >
              <Share2 className="h-3.5 w-3.5" />
              Copy share link
            </button>
            <span className="text-xs text-muted-foreground">
              {title}
              {mode === "nodejs"
                ? " — readline shim; use importEsm(\"pkg\") for esm.sh CDN."
                : " — importEsm(\"lodash-es\") loads from esm.sh."}
              {iframeReady ? "" : " - loading sandbox…"}
            </span>
          </>
        }
        stdin={stdin}
        onStdinChange={setStdin}
        stdinPlaceholder={STDIN_PLACEHOLDER}
        stdinHint={STDIN_HINT_JS}
        stdinDisabled={false}
        editor={
          <Editor
            height="100%"
            language={monacoLanguage}
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
              tabSize: 2,
              padding: { top: 12 },
            }}
          />
        }
        output={
          <pre
            className="p-3 font-mono text-[13px] leading-relaxed text-foreground whitespace-pre-wrap break-words"
            aria-live="polite"
          >
            {output.length ? output.join("\n") : "Output tab: Run or Ctrl+Enter. Stdin tab: program input."}
          </pre>
        }
      />
      <iframe
        ref={iframeRef}
        title="JavaScript sandbox"
        sandbox="allow-scripts"
        className="pointer-events-none fixed h-0 w-0 opacity-0"
        srcDoc={srcdoc}
      />
    </>
  );
}
