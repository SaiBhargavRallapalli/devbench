"use client";

// Copyright (c) 2026 DevBench contributors. MIT License.
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ExternalLink,
  Wrench,
  Play,
  Link2,
  RotateCcw,
} from "lucide-react";
import {
  countRoadmapNodes,
  roadmapProgressPercent,
  type Roadmap,
  type RoadmapNode,
} from "@/lib/roadmaps";
import {
  getDoneNodeIds,
  resetRoadmapProgress,
  toggleNodeDone,
} from "@/lib/roadmap-progress";
import { encodePlaygroundShare } from "@/lib/playground-share";
import { getToolBySlug } from "@/lib/tools-registry";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";

function NodeCard({
  roadmapSlug,
  node,
  done,
  onToggleDone,
}: {
  roadmapSlug: string;
  node: RoadmapNode;
  done: boolean;
  onToggleDone: (nodeId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `roadmap-node-${roadmapSlug}-${node.id}`;

  const playgroundHref = useMemo(() => {
    if (!node.playground) return null;
    try {
      return `/playground${encodePlaygroundShare({
        v: 1,
        lang: node.playground.lang,
        code: node.playground.code,
      })}`;
    } catch {
      return "/playground";
    }
  }, [node.playground]);

  return (
    <li
      className={`rounded-xl border transition-colors ${
        done
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-start gap-2 p-3">
        <button
          type="button"
          onClick={() => onToggleDone(node.id)}
          aria-pressed={done}
          aria-label={done ? `Mark "${node.title}" as not done` : `Mark "${node.title}" as done`}
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-emerald-500 transition-colors"
        >
          {done ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />
          ) : (
            <Circle className="h-5 w-5" aria-hidden />
          )}
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex flex-1 items-start justify-between gap-2 text-left"
        >
          <span
            className={`text-sm font-medium ${
              done ? "text-muted-foreground line-through decoration-emerald-500/60" : "text-foreground"
            }`}
          >
            {node.title}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>

      {open && (
        <div id={panelId} className="border-t border-border/60 px-4 py-3 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{node.summary}</p>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Free resources
            </p>
            <ul className="space-y-1">
              {node.resources.map((res) => {
                const internal = res.url.startsWith("/");
                return (
                  <li key={res.url}>
                    <Link
                      href={res.url}
                      {...(internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                      className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline underline-offset-2"
                    >
                      {res.label}
                      {!internal && <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {(node.tools?.length || node.internalLinks?.length) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                Practice with DevBench
              </p>
              <div className="flex flex-wrap gap-2">
                {(node.tools ?? []).map((slug) => {
                  const tool = getToolBySlug(slug);
                  if (!tool) return null;
                  return (
                    <Link
                      key={slug}
                      href={publicHrefForToolSlug(slug)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground hover:border-accent/50 hover:text-accent transition-colors"
                    >
                      <Wrench className="h-3 w-3" aria-hidden />
                      {tool.shortName}
                    </Link>
                  );
                })}
                {(node.internalLinks ?? []).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground hover:border-accent/50 hover:text-accent transition-colors"
                  >
                    <Link2 className="h-3 w-3" aria-hidden />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {playgroundHref && (
            <div>
              <Link
                href={playgroundHref}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
              >
                <Play className="h-3.5 w-3.5" aria-hidden />
                Try it in the Playground
              </Link>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default function RoadmapExplorer({ roadmap }: { roadmap: Roadmap }) {
  const total = useMemo(() => countRoadmapNodes(roadmap), [roadmap]);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function sync() {
      setDoneIds(new Set(getDoneNodeIds(roadmap.slug)));
      setHydrated(true);
    }
    sync();
  }, [roadmap.slug]);

  const onToggleDone = useCallback(
    (nodeId: string) => {
      const nowDone = toggleNodeDone(roadmap.slug, nodeId);
      setDoneIds((prev) => {
        const next = new Set(prev);
        if (nowDone) next.add(nodeId);
        else next.delete(nodeId);
        return next;
      });
    },
    [roadmap.slug],
  );

  const onReset = useCallback(() => {
    resetRoadmapProgress(roadmap.slug);
    setDoneIds(new Set());
  }, [roadmap.slug]);

  const doneCount = hydrated ? doneIds.size : 0;
  const percent = roadmapProgressPercent(doneCount, total);

  return (
    <div>
      <div className="sticky top-16 z-10 mb-6 rounded-xl border border-border bg-card/95 backdrop-blur px-4 py-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-foreground">
            {hydrated ? `${doneCount} of ${total} topics done` : `${total} topics`}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground tabular-nums">{percent}%</span>
            {doneCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="h-3 w-3" aria-hidden />
                Reset
              </button>
            )}
          </div>
        </div>
        <div
          className="mt-2 h-2 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${roadmap.title} progress`}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Progress is saved in this browser only — no account needed.
        </p>
      </div>

      <ol className="space-y-8">
        {roadmap.sections.map((section, sectionIndex) => {
          const sectionDone = section.nodes.filter((n) => doneIds.has(n.id)).length;
          return (
            <li key={section.id}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h2 className="text-lg font-semibold text-foreground">
                  <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent text-sm font-bold align-middle">
                    {sectionIndex + 1}
                  </span>
                  {section.title}
                </h2>
                {hydrated && (
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {sectionDone}/{section.nodes.length}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3 ml-9">{section.intro}</p>
              <ul className="space-y-2 ml-0 sm:ml-9">
                {section.nodes.map((node) => (
                  <NodeCard
                    key={node.id}
                    roadmapSlug={roadmap.slug}
                    node={node}
                    done={doneIds.has(node.id)}
                    onToggleDone={onToggleDone}
                  />
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
