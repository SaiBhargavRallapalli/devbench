"use client";

import { useState, useCallback } from "react";
import { ChevronDown, Copy, Download, Check } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import { getToolCardDepth } from "@/lib/tool-card-depth";

export default function ToolCardDepthPanel({ tool }: { tool: Tool }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const depth = getToolCardDepth(tool);

  const copyPayload = useCallback(async () => {
    if (!depth.examplePayload) return;
    try {
      await navigator.clipboard.writeText(depth.examplePayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard denied */
    }
  }, [depth.examplePayload]);

  return (
    <div className="border-t border-border/80 mt-0">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
        aria-expanded={open}
      >
        <span>Tutorial &amp; tips</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          className="px-4 pb-4 space-y-3 text-xs text-muted-foreground leading-relaxed"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <p className="font-semibold text-foreground mb-1.5">Steps</p>
            <ol className="list-decimal list-inside space-y-1">
              {depth.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <div>
            <p className="font-semibold text-foreground mb-1.5">Common pitfalls</p>
            <ul className="list-disc list-inside space-y-1">
              {depth.pitfalls.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          <p>
            <span className="font-semibold text-foreground">Expected output: </span>
            {depth.expectedOutput}
          </p>

          {depth.examplePayload && (
            <div className="rounded-lg border border-border bg-muted/40 p-2.5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-semibold text-foreground">Example payload</span>
                <button
                  type="button"
                  onClick={copyPayload}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" aria-hidden />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" aria-hidden />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="font-mono text-[10px] whitespace-pre-wrap break-all max-h-24 overflow-y-auto">
                {depth.examplePayload}
              </pre>
            </div>
          )}

          {depth.exportLabel && (
            <p className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 text-accent px-2 py-1 font-medium">
              <Download className="h-3 w-3" aria-hidden />
              {depth.exportLabel} — available inside the tool
            </p>
          )}

          <p className="italic border-l-2 border-accent/40 pl-2.5">
            {depth.comparisonSnippet}
          </p>
        </div>
      )}
    </div>
  );
}
