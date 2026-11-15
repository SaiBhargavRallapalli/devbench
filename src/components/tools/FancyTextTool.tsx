"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Type } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import {
  FANCY_STYLE_LIST,
  fancyLabel,
  toFancy,
  type FancyStyle,
} from "@/lib/fancy-text";
import { copyWithFeedback } from "@/lib/clipboard";

const inp =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

const SAMPLE = "DevBench makes every tool free, private and instant.";

export default function FancyTextTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState(SAMPLE);
  const [active, setActive] = useState<FancyStyle>("bold");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => toFancy(text, active), [text, active]);

  const copy = () => {
    copyWithFeedback(output).then((ok) => {
      if (!ok) return;
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 space-y-5">
        {/* Input */}
        <div>
          <label htmlFor="ft-input" className="mb-1.5 block text-sm font-medium">
            Your text
          </label>
          <textarea
            id="ft-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Type or paste anything…"
            className={inp}
          />
        </div>

        {/* Style picker */}
        <section aria-label="Choose a style" className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Style
          </p>
          <div className="flex flex-wrap gap-1.5">
            {FANCY_STYLE_LIST.map((style) => (
              <button
                key={style}
                onClick={() => setActive(style)}
                aria-pressed={active === style}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  active === style
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {fancyLabel(style)}
              </button>
            ))}
          </div>
        </section>

        {/* Live previews of every style */}
        <section aria-label="Live previews" className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Preview every style
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {FANCY_STYLE_LIST.map((style) => (
              <button
                key={style}
                onClick={() => setActive(style)}
                aria-label={`Use ${fancyLabel(style)} style`}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  active === style
                    ? "border-accent/60 bg-accent/5"
                    : "border-border bg-muted/20 hover:border-accent/30"
                }`}
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {fancyLabel(style)}
                </p>
                <p className="mt-1 truncate text-sm text-foreground">
                  {toFancy(text.slice(0, 40) || "Hello", style)}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Output */}
        <section aria-label="Result" className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {fancyLabel(active)} output
            </p>
            <button
              onClick={copy}
              disabled={!output}
              className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-40"
            >
              {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div
            aria-live="polite"
            className="min-h-20 whitespace-pre-wrap break-words rounded-xl border border-border bg-muted/20 p-4 text-base text-foreground"
          >
            {output || (
              <span className="text-muted-foreground">
                Type something above to see it transformed.
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Characters the style can&apos;t map (emoji, CJK, other scripts) pass
            through unchanged, so nothing is ever lost.
          </p>
        </section>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Type className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Every transform runs locally in your browser — your text is never sent
          anywhere.
        </p>
      </div>
    </main>
  );
}
