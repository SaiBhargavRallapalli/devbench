"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2, Lightbulb, Layers } from "lucide-react";
import {
  CATEGORY_CONTENT_DEPTH,
  PLATFORM_CONTENT_DEPTH,
  type CategoryDepthHub,
} from "@/lib/category-content-depth";
import { CATEGORIES, getToolBySlug, type ToolCategory } from "@/lib/tools-registry";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";

function PlatformDepthBlock() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-accent" aria-hidden />
        <h3 className="text-sm font-semibold text-foreground">
          How DevBench handles your data
        </h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 text-sm text-muted-foreground leading-relaxed">
        <div>
          <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">
            Technical capabilities
          </p>
          <p>{PLATFORM_CONTENT_DEPTH.technical}</p>
        </div>
        <div>
          <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">
            Security &amp; privacy
          </p>
          <p>{PLATFORM_CONTENT_DEPTH.security}</p>
        </div>
        <div>
          <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">
            Performance
          </p>
          <p>{PLATFORM_CONTENT_DEPTH.performance}</p>
        </div>
        <div>
          <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">
            Browser compatibility
          </p>
          <p>{PLATFORM_CONTENT_DEPTH.browsers}</p>
        </div>
      </div>
    </div>
  );
}

function HubContent({ hub, category }: { hub: CategoryDepthHub; category: ToolCategory }) {
  return (
    <div className="space-y-6">
      {hub.featuredGuides.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden />
            <h3 className="text-sm font-semibold">In-depth guides</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {hub.featuredGuides.map((guide) => (
              <article
                key={guide.slug}
                className="rounded-xl border border-border bg-card p-4"
              >
                <Link
                  href={publicHrefForToolSlug(guide.slug)}
                  className="text-sm font-semibold text-foreground hover:text-accent transition-colors"
                >
                  {guide.title}
                </Link>
                <ol className="mt-3 space-y-2 list-decimal list-inside text-xs text-muted-foreground leading-relaxed">
                  {guide.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h3 className="text-sm font-semibold">Use-case scenarios</h3>
        </div>
        <ul className="space-y-3">
          {hub.useCases.map((uc) => (
            <li
              key={uc.title}
              className="rounded-xl border border-border bg-muted/20 px-4 py-3"
            >
              <p className="text-sm font-medium text-foreground">{uc.title}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {uc.when}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Tools:{" "}
                {uc.toolSlugs.map((slug, i) => {
                  const t = getToolBySlug(slug);
                  return (
                    <span key={slug}>
                      {i > 0 && " · "}
                      <Link
                        href={publicHrefForToolSlug(slug)}
                        className="text-accent hover:underline"
                      >
                        {t?.shortName ?? slug}
                      </Link>
                    </span>
                  );
                })}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h3 className="text-sm font-semibold">
            Quick-start — {CATEGORIES[category].label}
          </h3>
        </div>
        <ul className="space-y-1.5 mb-4">
          {hub.quickStart.checklist.map((item, i) => (
            <li
              key={i}
              className="flex gap-2 text-xs text-muted-foreground leading-relaxed"
            >
              <span className="text-accent font-mono shrink-0">{i + 1}.</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide font-medium text-muted-foreground mb-1">
              Sample input
            </p>
            <pre className="text-xs font-mono bg-muted/50 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap break-all">
              {hub.quickStart.sampleInput}
            </pre>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide font-medium text-muted-foreground mb-1">
              Sample output
            </p>
            <pre className="text-xs font-mono bg-muted/50 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap break-all">
              {hub.quickStart.sampleOutput}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryContentDepthHub({
  category,
}: {
  category: ToolCategory;
}) {
  const hub = CATEGORY_CONTENT_DEPTH[category];

  return (
    <section
      aria-labelledby="content-depth-heading"
      className="mb-10 rounded-2xl border border-accent/20 bg-accent/5 p-5 sm:p-6"
    >
      <header className="mb-5">
        <h2
          id="content-depth-heading"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Content depth — {CATEGORIES[category].label}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Guides, scenarios, and quick-start samples to help you pick the right tool
          and get productive in one session.
        </p>
      </header>

      <div className="space-y-6">
        <PlatformDepthBlock />
        {hub ? (
          <HubContent hub={hub} category={category} />
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">
            Browse the tools below — each card includes a step-by-step tutorial,
            copyable sample payload, and comparison notes. All processing stays in
            your browser with no uploads for standard tools.
          </p>
        )}
      </div>
    </section>
  );
}
