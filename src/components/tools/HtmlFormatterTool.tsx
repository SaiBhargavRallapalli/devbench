"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Wand2, Minimize2 } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import { formatHtml } from "@/lib/html-format";
import { copyWithFeedback } from "@/lib/clipboard";

const inp =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

const SAMPLE = `<!DOCTYPE html><html><head><title>Demo</title></head><body><header><h1>Hello</h1></header><main><p>One</p><p>Two</p></main></body></html>`;

export default function HtmlFormatterTool({ tool }: { tool: Tool }) {
  const [src, setSrc] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!src.trim()) return "";
    if (mode === "minify") {
      // Collapse whitespace between tags only — keeps text/attribute spacing.
      return src.replace(/>\s+</g, "><").trim();
    }
    return formatHtml(src, { indent });
  }, [src, indent, mode]);

  const copy = () => {
    copyWithFeedback(output).then((ok) => {
      if (!ok) return;
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const stats = useMemo(
    () => ({ in: src.length, out: output.length }),
    [src, output],
  );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 space-y-5">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <p className="mb-1.5 text-sm font-medium">Mode</p>
            <div role="group" aria-label="Mode" className="flex gap-1.5">
              <button
                onClick={() => setMode("format")}
                aria-pressed={mode === "format"}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  mode === "format"
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wand2 className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                Beautify
              </button>
              <button
                onClick={() => setMode("minify")}
                aria-pressed={mode === "minify"}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  mode === "minify"
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Minimize2 className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                Minify
              </button>
            </div>
          </div>

          {mode === "format" && (
            <div>
              <p className="mb-1.5 text-sm font-medium">Indent</p>
              <div role="group" aria-label="Indent width" className="flex gap-1.5">
                {[2, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setIndent(n)}
                    aria-pressed={indent === n}
                    className={`h-9 w-16 rounded-lg text-xs font-medium transition-colors ${
                      indent === n
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {n} spaces
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setSrc("")}
              className="rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear
            </button>
            <button
              onClick={copy}
              disabled={!output}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
              {copied ? "Copied!" : "Copy output"}
            </button>
          </div>
        </div>

        {/* Editor + output */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label htmlFor="hf-in" className="mb-1.5 block text-sm font-medium">
              Paste HTML
            </label>
            <textarea
              id="hf-in"
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              rows={16}
              placeholder="<div><p>Hello</p></div>"
              spellCheck={false}
              className={`${inp} resize-y leading-relaxed`}
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-sm font-medium">
                {mode === "format" ? "Formatted" : "Minified"}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.in} → {stats.out} chars
              </p>
            </div>
            <textarea
              readOnly
              value={output}
              rows={16}
              aria-label="Output"
              spellCheck={false}
              className={`${inp} resize-y bg-muted/20 leading-relaxed`}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Content inside <code className="rounded bg-muted px-1">&lt;pre&gt;</code>,{" "}
          <code className="rounded bg-muted px-1">&lt;script&gt;</code>,{" "}
          <code className="rounded bg-muted px-1">&lt;style&gt;</code> and{" "}
          <code className="rounded bg-muted px-1">&lt;textarea&gt;</code> is left
          exactly as written, so formatted output never corrupts code or
          preformatted blocks.
        </p>
      </div>
    </main>
  );
}
