"use client";

import Link from "next/link";
import { X, ExternalLink, Sparkles, MousePointer, Star, ChevronRight, ChevronLeft } from "lucide-react";
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
  collapsed,
  onCollapse,
  onExpand,
}: {
  tool: Tool | null;
  onClose: () => void;
  dropActive: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  collapsed: boolean;
  onCollapse: () => void;
  onExpand: () => void;
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
    <div className="flex flex-1 flex-col p-4 gap-3">
      {/* Tool identity */}
      <div className="flex items-start gap-2.5">
        <div
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold font-mono ${CATEGORIES[tool.category].color}`}
        >
          {tool.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground leading-tight">{tool.name}</p>
          <span className="inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
            {CATEGORIES[tool.category].label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {tool.description}
      </p>

      {/* What to expect */}
      {depth.expectedOutput && (
        <div className="rounded-lg bg-muted/50 border border-border px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Output</p>
          <p className="text-xs text-foreground leading-relaxed">{depth.expectedOutput}</p>
        </div>
      )}

      {/* Steps — up to 2 */}
      {depth.steps.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">How it works</p>
          <ol className="space-y-1">
            {depth.steps.slice(0, 2).map((step, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-muted-foreground leading-relaxed">
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
      <div className="mt-auto pt-1 flex flex-col gap-2">
        <Link
          href={publicHrefForToolSlug(tool.slug)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden />
          <span className="text-sm font-semibold text-foreground">Tool Preview</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCollapse}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Hide preview panel"
            title="Hide panel"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {tool && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Clear preview"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {tool && depth ? toolPanel : emptyState}

      {/* Apps strip */}
      <div className="border-t border-border px-3 py-2.5">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Also from DevBench</p>
        <div className="flex flex-wrap gap-1">
          {[
            { name: "Porthole", href: "https://porthole.devbench.co.in", featured: true },
            { name: "Bank", href: "https://bank.devbench.co.in" },
            { name: "Form 16", href: "https://form16.devbench.co.in" },
            { name: "ITR", href: "https://itr.devbench.co.in" },
            { name: "Resume", href: "https://resume.devbench.co.in" },
            { name: "Receipts", href: "https://receipts.devbench.co.in" },
            { name: "Q-Commerce", href: "https://quick-commerce-compare.devbench.co.in" },
          ].map((app) => (
            <a
              key={app.href}
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              title={app.name}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-medium transition-colors ${
                app.featured
                  ? "border-accent/40 bg-accent/5 text-accent hover:bg-accent/10"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <img src={`${app.href}/favicon.ico`} alt="" width={12} height={12} className="rounded-sm" />
              {app.name}
            </a>
          ))}
        </div>
      </div>
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

      {/* Desktop: sticky sidebar — collapsed strip or full panel */}
      {collapsed ? (
        <aside
          aria-label="Tool preview (hidden)"
          className="sticky top-24 hidden xl:flex xl:flex-col items-center shrink-0 w-9 pt-2"
        >
          <button
            type="button"
            onClick={onExpand}
            className="rounded-lg p-1.5 border border-dashed border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Show Tool Preview panel"
            aria-label="Show Tool Preview panel"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </aside>
      ) : (
        <aside
          aria-label="Tool preview"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`sticky top-24 self-start hidden xl:flex xl:flex-col w-full max-w-xs shrink-0 rounded-2xl border transition-all ${
            dropActive
              ? "border-accent bg-accent/10 ring-2 ring-accent/30"
              : tool
                ? "border-border bg-card shadow-sm"
                : "border-dashed border-border/60 bg-card/50"
          }`}
        >
          {panelBody}
        </aside>
      )}
    </>
  );
}
