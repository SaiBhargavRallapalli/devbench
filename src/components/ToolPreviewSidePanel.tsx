"use client";

import Link from "next/link";
import { X, ExternalLink, GripVertical } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import { CATEGORIES } from "@/lib/tools-registry";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";
import { getToolCardDepth } from "@/lib/tool-card-depth";
import ShareToolButton from "@/components/ShareToolButton";

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
  const benefit =
    depth?.steps[0] ??
    (tool ? tool.description.split(".")[0] : "Drag a tool card here to preview");

  const panelBody = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <GripVertical className="h-4 w-4" aria-hidden />
          Quick preview
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

      <div className="flex flex-1 flex-col p-4 min-h-[14rem]">
        {!tool ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {dropActive
              ? "Drop to preview this tool"
              : "Hover a card, click Preview, or drag a tool here to see details and Try now."}
          </p>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div
                className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold font-mono ${CATEGORIES[tool.category].color}`}
              >
                {tool.icon}
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-foreground">{tool.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{CATEGORIES[tool.category].label}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {benefit}
            </p>
            {depth?.expectedOutput && (
              <p className="mt-3 text-xs text-muted-foreground border-l-2 border-accent/40 pl-3">
                {depth.expectedOutput}
              </p>
            )}
            <div className="mt-auto pt-6 flex flex-col gap-2">
              <Link
                href={publicHrefForToolSlug(tool.slug)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Try now
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
              <ShareToolButton tool={tool} />
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {tool && (
        <div
          className="fixed bottom-16 left-0 right-0 z-30 border-t border-border bg-card/95 p-4 shadow-lg backdrop-blur-md xl:hidden"
          role="region"
          aria-label="Tool quick preview"
        >
          {panelBody}
        </div>
      )}
      <aside
        aria-label="Tool quick preview"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`sticky top-24 hidden xl:flex xl:flex-col w-full max-w-sm shrink-0 rounded-2xl border transition-colors ${
          dropActive
            ? "border-accent bg-accent/10 ring-2 ring-accent/30"
            : "border-border bg-card"
        }`}
      >
        {panelBody}
      </aside>
    </>
  );
}
