"use client";

import Link from "next/link";
import { X, ExternalLink, Sparkles, MousePointer, Star } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import { CATEGORIES } from "@/lib/tools-registry";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";
import { getToolCardDepth } from "@/lib/tool-card-depth";
import ShareToolButton from "@/components/ShareToolButton";
import { toggleFavorite, getFavoriteSlugs } from "@/lib/devbench-preferences";
import { useState, useEffect } from "react";

function SaveButton({ tool }: { tool: Tool }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const sync = () => setSaved(getFavoriteSlugs().includes(tool.slug));
    sync();
    window.addEventListener("devbench:prefs-changed", sync);
    return () => window.removeEventListener("devbench:prefs-changed", sync);
  }, [tool.slug]);

  return (
    <button
      type="button"
      onClick={() => { toggleFavorite(tool.slug); setSaved(getFavoriteSlugs().includes(tool.slug)); }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        saved
          ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
          : "border-border bg-card text-foreground hover:bg-muted"
      }`}
      aria-pressed={saved}
    >
      <Star className={`h-4 w-4 shrink-0 ${saved ? "fill-amber-500 text-amber-500" : ""}`} aria-hidden />
      {saved ? "Saved" : "Save"}
    </button>
  );
}

export default function ToolPreviewSidePanel({
  tool,
  onClose,
  dropActive,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  tool: Tool | null;
  onClose: () => void;
  dropActive: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const depth = tool ? getToolCardDepth(tool) : null;

  const emptyState = (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-10 text-center">
      {dropActive ? (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-accent bg-accent/10">
            <Sparkles className="h-6 w-6 text-accent" aria-hidden />
          </div>
          <p className="text-sm font-medium text-foreground">Drop to preview this tool</p>
        </>
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <MousePointer className="h-6 w-6 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Hover a tool card</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Details and a quick-open button appear here — no clicking around needed.
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground/70">
            You can also drag any card here, or click&nbsp;
            <span className="font-medium text-muted-foreground">Preview</span> on a card.
          </p>
        </>
      )}
    </div>
  );

  const toolPanel = tool && depth && (
    <div className="flex flex-1 flex-col p-5 gap-4">
      {/* Tool identity */}
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold font-mono ${CATEGORIES[tool.category].color}`}
        >
          {tool.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-foreground leading-tight">{tool.name}</p>
          <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {CATEGORIES[tool.category].label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {tool.description}
      </p>

      {/* What to expect */}
      {depth.expectedOutput && (
        <div className="rounded-lg bg-muted/50 border border-border px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Output</p>
          <p className="text-xs text-foreground leading-relaxed">{depth.expectedOutput}</p>
        </div>
      )}

      {/* Steps — up to 3 */}
      {depth.steps.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">How it works</p>
          <ol className="space-y-1.5">
            {depth.steps.slice(0, 3).map((step, i) => (
              <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                <span className="shrink-0 flex h-4 w-4 mt-0.5 items-center justify-center rounded-full bg-accent/15 text-accent text-[10px] font-bold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-2 flex flex-col gap-2">
        <Link
          href={publicHrefForToolSlug(tool.slug)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Open tool
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
        <div className="flex gap-2">
          <SaveButton tool={tool} />
          <div className="flex-1">
            <ShareToolButton tool={tool} />
          </div>
        </div>
      </div>
    </div>
  );

  const panelBody = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden />
          <span className="text-sm font-semibold text-foreground">Tool Preview</span>
        </div>
        {tool && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {tool && depth ? toolPanel : emptyState}
    </>
  );

  return (
    <>
      {/* Mobile: slide-up bar when a tool is selected */}
      {tool && (
        <div
          className="fixed bottom-16 left-0 right-0 z-30 border-t border-border bg-card/97 shadow-xl backdrop-blur-md xl:hidden"
          role="region"
          aria-label="Tool preview"
        >
          <div className="max-h-72 overflow-y-auto">
            {panelBody}
          </div>
        </div>
      )}

      {/* Desktop: sticky sidebar */}
      <aside
        aria-label="Tool preview"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`sticky top-24 hidden xl:flex xl:flex-col w-full max-w-xs shrink-0 rounded-2xl border transition-all ${
          dropActive
            ? "border-accent bg-accent/10 ring-2 ring-accent/30"
            : tool
              ? "border-border bg-card shadow-sm"
              : "border-dashed border-border/60 bg-card/50"
        }`}
        style={{ minHeight: "28rem" }}
      >
        {panelBody}
      </aside>
    </>
  );
}
