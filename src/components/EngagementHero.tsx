"use client";

import Link from "next/link";
import {
  Braces,
  Code2,
  Type,
  Wrench,
  Sparkles,
  ArrowRightLeft,
  DollarSign,
  Heart,
  Sigma,
  CalendarDays,
  FileStack,
  Star,
  Eye,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import {
  CATEGORIES,
  getToolsByCategory,
  type Tool,
  type ToolCategory,
} from "@/lib/tools-registry";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";
import { getSpotlightTool } from "@/lib/engagement-spotlight";
import { categoryBrowseHref } from "@/lib/category-navigation";
import { toggleFavorite, getFavoriteSlugs } from "@/lib/devbench-preferences";
import { useState, useEffect } from "react";

const CATEGORY_ICONS: Record<ToolCategory, React.ElementType> = {
  json: Braces,
  encoding: Code2,
  text: Type,
  dev: Wrench,
  image: Sparkles,
  pdf: FileStack,
  conversion: ArrowRightLeft,
  finance: DollarSign,
  health: Heart,
  math: Sigma,
  datetime: CalendarDays,
};

function CategoryTile({
  category,
  count,
  onPreview,
}: {
  category: ToolCategory;
  count: number;
  onPreview: (tool: Tool) => void;
}) {
  const Icon = CATEGORY_ICONS[category];
  const meta = CATEGORIES[category];
  const sample = getToolsByCategory(category)[0];

  return (
    <div className="group relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5">
      <Link
        href={categoryBrowseHref(category)}
        className="block p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${meta.color} transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{meta.label}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{count} tools</p>
      </Link>

      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/92 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 px-4"
      >
        <p className="text-xs font-semibold text-foreground text-center">
          {count} tools — pick one below
        </p>
        <div className="flex flex-col w-full gap-1.5">
          <Link
            href={categoryBrowseHref(category)}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            Browse &amp; choose
          </Link>
          {sample && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onPreview(sample);
                document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden />
              Quick preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SaveQuickAction({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Use a named function so setState isn't called directly in the effect body
    // (react-hooks/set-state-in-effect).
    const sync = () => setSaved(getFavoriteSlugs().includes(slug));
    sync();
    window.addEventListener("devbench:prefs-changed", sync);
    return () => window.removeEventListener("devbench:prefs-changed", sync);
  }, [slug]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggleFavorite(slug);
        setSaved(getFavoriteSlugs().includes(slug));
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Star className={`h-3.5 w-3.5 ${saved ? "fill-amber-500 text-amber-500" : ""}`} aria-hidden />
      {saved ? "Saved" : "Save"}
    </button>
  );
}

export default function EngagementHero({
  onPreviewTool,
}: {
  onPreviewTool?: (tool: Tool) => void;
}) {
  const spotlight = getSpotlightTool();

  // No manual useCallback — the React Compiler handles memoization automatically.
  // Wrapping in useCallback here blocks compiler optimization
  // (react-hooks/preserve-manual-memoization).
  const handlePreview = (tool: Tool) => {
    onPreviewTool?.(tool);
    window.dispatchEvent(
      new CustomEvent("devbench:preview-tool", { detail: { slug: tool.slug } }),
    );
  };

  if (!spotlight) return null;

  return (
    <section
      aria-labelledby="explore-heading"
      className="border-b border-border bg-muted/20"
    >
      <div className="max-w-6xl mx-auto px-4 py-14 sm:py-16">
        <header className="mb-10 text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
            Explore
          </p>
          <h2
            id="explore-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
          >
            Pick a category or jump into a fan favorite
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Hover any category for quick actions. Our most-used tool is ready below.
          </p>
        </header>

        <article className="mb-12 relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-card p-6 sm:p-8 shadow-sm">
          <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-background/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent">
            <TrendingUp className="h-3 w-3" aria-hidden />
            Popular
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div
              className={`shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-bold font-mono ${CATEGORIES[spotlight.category].color}`}
            >
              {spotlight.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-foreground">{spotlight.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xl">
                {spotlight.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={publicHrefForToolSlug(spotlight.slug)}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Open tool
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={() => handlePreview(spotlight)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Eye className="h-4 w-4" aria-hidden />
                  Preview in explorer
                </button>
                <SaveQuickAction slug={spotlight.slug} />
              </div>
            </div>
          </div>
        </article>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          {(Object.keys(CATEGORIES) as ToolCategory[]).map((cat) => (
            <CategoryTile
              key={cat}
              category={cat}
              count={getToolsByCategory(cat).length}
              onPreview={handlePreview}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
