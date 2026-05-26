"use client";

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  memo,
  Suspense,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Star,
  Search,
  Braces,
  Code2,
  Type,
  Wrench,
  ArrowRightLeft,
  Sparkles,
  DollarSign,
  Heart,
  Sigma,
  CalendarDays,
  Clock,
  Pin,
  FileStack,
  ExternalLink,
  Eye,
  RotateCcw,
} from "lucide-react";
import { CATEGORIES, type Tool, type ToolCategory } from "@/lib/tools-registry";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";
import { isToolCategory } from "@/lib/category-navigation";
import {
  getFavoriteSlugs,
  toggleFavorite,
  getToolHistory,
} from "@/lib/devbench-preferences";
import { CATEGORY_CTA_LABELS, allToolsCategoryLabel } from "@/lib/category-cta-labels";
import CategoryContentDepthHub from "@/components/CategoryContentDepthHub";
import CategoryShareBar from "@/components/CategoryShareBar";
import ToolPreviewSidePanel from "@/components/ToolPreviewSidePanel";

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

function toolHref(slug: string): string {
  return publicHrefForToolSlug(slug);
}

function useFavoriteSlugs() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    function sync() {
      setSlugs(getFavoriteSlugs());
    }
    sync();
    window.addEventListener("devbench:prefs-changed", sync);
    return () => window.removeEventListener("devbench:prefs-changed", sync);
  }, []);

  const toggle = useCallback((slug: string) => {
    toggleFavorite(slug);
    setSlugs(getFavoriteSlugs());
  }, []);

  return { slugs, toggle };
}

function useRecentSlugs() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    function sync() {
      setSlugs(getToolHistory().map((h) => h.slug));
    }
    sync();
    window.addEventListener("devbench:prefs-changed", sync);
    return () => window.removeEventListener("devbench:prefs-changed", sync);
  }, []);

  return slugs;
}

const ExplorerToolCard = memo(function ExplorerToolCard({
  tool,
  isFavourite,
  onToggleFavourite,
  onPreview,
  isPreviewTarget,
}: {
  tool: Tool;
  isFavourite: boolean;
  onToggleFavourite: (slug: string) => void;
  onPreview: (tool: Tool) => void;
  isPreviewTarget: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/devbench-tool-slug", tool.slug);
        e.dataTransfer.effectAllowed = "copy";
      }}
      onMouseEnter={() => onPreview(tool)}
      onFocus={() => onPreview(tool)}
      className={`group flex flex-col rounded-xl border bg-card transition-all duration-200 ${
        isPreviewTarget
          ? "border-accent ring-2 ring-accent/25 shadow-md"
          : "border-border hover:border-accent/40"
      }`}
    >
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-start gap-2.5">
          <div
            className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${CATEGORIES[tool.category].color}`}
          >
            {tool.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1">
              <p className="text-sm font-semibold text-foreground leading-tight">{tool.name}</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleFavourite(tool.slug); }}
                aria-pressed={isFavourite}
                aria-label={isFavourite ? "Remove from saved" : "Save tool"}
                className={`shrink-0 rounded p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isFavourite
                    ? "text-amber-500"
                    : "text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-amber-500"
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${isFavourite ? "fill-amber-500" : ""}`} aria-hidden />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onPreview(tool)}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Eye className="h-3 w-3 shrink-0" aria-hidden />
            Preview
          </button>
          <Link
            href={toolHref(tool.slug)}
            className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Open
            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
});

function MiniSection({
  title,
  icon: Icon,
  tools,
  favouriteSet,
  onToggleFavourite,
  onPreview,
  previewSlug,
}: {
  title: string;
  icon: React.ElementType;
  tools: Tool[];
  favouriteSet: Set<string>;
  onToggleFavourite: (slug: string) => void;
  onPreview: (tool: Tool) => void;
  previewSlug: string | null;
}) {
  if (tools.length === 0) return null;
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tools.map((tool) => (
          <ExplorerToolCard
            key={tool.slug}
            tool={tool}
            isFavourite={favouriteSet.has(tool.slug)}
            onToggleFavourite={onToggleFavourite}
            onPreview={onPreview}
            isPreviewTarget={previewSlug === tool.slug}
          />
        ))}
      </div>
    </div>
  );
}

function ToolSearchInner({ tools }: { tools: Tool[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get("q") ?? "";
  const initialCat = searchParams.get("category");
  const initialCategory: ToolCategory | "all" =
    initialCat && isToolCategory(initialCat) ? initialCat : "all";

  const [search, setSearch] = useState(initialQ);
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">(initialCategory);
  const [previewTool, setPreviewTool] = useState<Tool | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const { slugs: favourites, toggle: toggleFavourite } = useFavoriteSlugs();
  const recent = useRecentSlugs();

  const favouriteSet = useMemo(() => new Set(favourites), [favourites]);

  const syncUrl = useCallback(
    (q: string, cat: ToolCategory | "all") => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (cat !== "all") params.set("category", cat);
      const qs = params.toString();
      router.replace(qs ? `/?${qs}#tools` : "/#tools", { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    const t = window.setTimeout(() => syncUrl(search, activeCategory), 280);
    return () => window.clearTimeout(t);
  }, [search, activeCategory, syncUrl]);

  useEffect(() => {
    function onPreviewEvent(e: Event) {
      const slug = (e as CustomEvent<{ slug: string }>).detail?.slug;
      if (!slug) return;
      const tool = tools.find((t) => t.slug === slug);
      if (tool) setPreviewTool(tool);
    }
    window.addEventListener("devbench:preview-tool", onPreviewEvent);
    return () => window.removeEventListener("devbench:preview-tool", onPreviewEvent);
  }, [tools]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setActiveCategory("all");
    setPreviewTool(null);
    router.replace("/#tools", { scroll: false });
  }, [router]);

  const hasActiveFilters = search.trim().length > 0 || activeCategory !== "all";

  const recentTools = useMemo(
    () =>
      recent
        .map((slug) => tools.find((t) => t.slug === slug))
        .filter((t): t is Tool => !!t),
    [recent, tools],
  );

  const pinnedTools = useMemo(
    () =>
      [...favouriteSet]
        .map((slug) => tools.find((t) => t.slug === slug))
        .filter((t): t is Tool => !!t),
    [favouriteSet, tools],
  );

  const filtered = useMemo(() => {
    let result = tools;
    if (activeCategory !== "all") result = result.filter((t) => t.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.shortName.toLowerCase().includes(q),
      );
    }
    return result;
  }, [tools, search, activeCategory]);

  const categoryCounts = useMemo(() => {
    const base = search.trim()
      ? tools.filter((t) => {
          const q = search.toLowerCase();
          return (
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.shortName.toLowerCase().includes(q)
          );
        })
      : tools;
    const counts = {} as Record<ToolCategory, number>;
    for (const cat of Object.keys(CATEGORIES) as ToolCategory[]) {
      counts[cat] = base.filter((t) => t.category === cat).length;
    }
    return { all: base.length, ...counts };
  }, [tools, search]);

  const grouped = useMemo(() => {
    if (activeCategory !== "all" || search.trim()) return null;
    const map = new Map<ToolCategory, Tool[]>();
    for (const tool of filtered) {
      const arr = map.get(tool.category) ?? [];
      arr.push(tool);
      map.set(tool.category, arr);
    }
    return map;
  }, [filtered, activeCategory, search]);

  const showPersonalised =
    activeCategory === "all" && !search.trim() && (pinnedTools.length > 0 || recentTools.length > 0);

  const liveSummary = useMemo(() => {
    const q = search.trim();
    if (q) {
      return filtered.length === 0
        ? `No tools match "${q}". Clear search or try another category.`
        : `${filtered.length} tool${filtered.length === 1 ? "" : "s"} match "${q}".`;
    }
    if (activeCategory !== "all") {
      const label = CATEGORIES[activeCategory].label;
      return `${filtered.length} ${label} tool${filtered.length === 1 ? "" : "s"} — ${CATEGORY_CTA_LABELS[activeCategory].benefit}.`;
    }
    return `Showing all ${filtered.length} tools. Browse by category or search above.`;
  }, [search, activeCategory, filtered.length]);

  const allLabel = allToolsCategoryLabel(tools.length);
  const previewSlug = previewTool?.slug ?? null;

  const handlePanelDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDropActive(true);
  }, []);

  const handlePanelDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDropActive(false);
      const slug = e.dataTransfer.getData("text/devbench-tool-slug");
      const tool = tools.find((t) => t.slug === slug);
      if (tool) setPreviewTool(tool);
    },
    [tools],
  );

  return (
    <section id="tools" className="max-w-6xl mx-auto px-4 py-12 pb-24 sm:pb-20 scroll-mt-20">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveSummary}
      </div>

      <header className="mb-8 max-w-2xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
              Tool explorer
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {filtered.length} tool{filtered.length === 1 ? "" : "s"} available
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Live filtering as you type. Drag cards to the preview panel or hover for quick-views.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset filters
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="max-w-xl mb-6">
            <label
              htmlFor="tool-search"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Search tools
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="tool-search"
                type="search"
                placeholder="Try PDF, JSON, loan, hex, timezone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-card py-3.5 pl-12 pr-4 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          </div>

          <div
            className="flex flex-wrap gap-2 mb-2"
            role="group"
            aria-label="Filter tools by category"
          >
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`flex flex-col items-start gap-0.5 px-4 py-2.5 rounded-lg text-left transition-colors min-w-[8.5rem] ${
                activeCategory === "all"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-foreground/70 hover:text-foreground"
              }`}
            >
              <span className="text-sm font-semibold leading-tight">
                {allLabel.headline}
                <span className="font-normal opacity-80"> ({categoryCounts.all})</span>
              </span>
              <span
                className={`text-[11px] leading-tight ${
                  activeCategory === "all" ? "text-accent-foreground/85" : "text-muted-foreground"
                }`}
              >
                {allLabel.benefit}
              </span>
            </button>
            {(Object.keys(CATEGORIES) as ToolCategory[]).map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              const count = categoryCounts[cat];
              const cta = CATEGORY_CTA_LABELS[cat];
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  disabled={count === 0 && search.trim().length > 0}
                  className={`flex items-start gap-2 px-4 py-2.5 rounded-lg text-left transition-colors min-w-[8.5rem] disabled:opacity-40 ${
                    active
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-foreground/70 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                  <span className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold leading-tight">
                      {cta.headline}
                      <span className="font-normal opacity-80"> ({count})</span>
                    </span>
                    <span
                      className={`text-[11px] leading-tight ${
                        active ? "text-accent-foreground/85" : "text-muted-foreground"
                      }`}
                    >
                      {cta.benefit}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mb-6 text-xs text-muted-foreground">{liveSummary}</p>

          {activeCategory !== "all" && !search.trim() && (
            <>
              <CategoryShareBar category={activeCategory} />
              <CategoryContentDepthHub category={activeCategory} />
            </>
          )}

          {showPersonalised && (
            <div className="mb-4">
              <MiniSection
                title="Your shortcuts"
                icon={Pin}
                tools={pinnedTools}
                favouriteSet={favouriteSet}
                onToggleFavourite={toggleFavourite}
                onPreview={setPreviewTool}
                previewSlug={previewSlug}
              />
              <MiniSection
                title="Pick up where you left off"
                icon={Clock}
                tools={recentTools}
                favouriteSet={favouriteSet}
                onToggleFavourite={toggleFavourite}
                onPreview={setPreviewTool}
                previewSlug={previewSlug}
              />
              <hr className="border-border mb-8" />
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-muted/30 px-6 py-16 text-center text-muted-foreground">
              <p className="text-lg font-medium text-foreground">Nothing matched that search</p>
              <p className="mt-2 text-sm">
                Try a shorter word, clear the box to see everything, or switch category above.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground"
              >
                <RotateCcw className="h-4 w-4" />
                Reset and explore all tools
              </button>
            </div>
          ) : grouped ? (
            <div className="space-y-12">
              {(Object.keys(CATEGORIES) as ToolCategory[])
                .filter((cat) => grouped.has(cat))
                .map((cat) => {
                  const catTools = grouped.get(cat)!;
                  const Icon = CATEGORY_ICONS[cat];
                  return (
                    <div key={cat} id={`category-${cat}`}>
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg ${CATEGORIES[cat].color}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <h3 className="text-base font-semibold">{CATEGORIES[cat].label}</h3>
                        <span className="text-xs text-muted-foreground">({catTools.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {catTools.map((tool) => (
                          <ExplorerToolCard
                            key={tool.slug}
                            tool={tool}
                            isFavourite={favouriteSet.has(tool.slug)}
                            onToggleFavourite={toggleFavourite}
                            onPreview={setPreviewTool}
                            isPreviewTarget={previewSlug === tool.slug}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((tool) => (
                <ExplorerToolCard
                  key={tool.slug}
                  tool={tool}
                  isFavourite={favouriteSet.has(tool.slug)}
                  onToggleFavourite={toggleFavourite}
                  onPreview={setPreviewTool}
                  isPreviewTarget={previewSlug === tool.slug}
                />
              ))}
            </div>
          )}
        </div>

        <ToolPreviewSidePanel
          tool={previewTool}
          onClose={() => setPreviewTool(null)}
          dropActive={dropActive}
          onDragOver={handlePanelDragOver}
          onDragLeave={() => setDropActive(false)}
          onDrop={handlePanelDrop}
          collapsed={panelCollapsed}
          onCollapse={() => setPanelCollapsed(true)}
          onExpand={() => setPanelCollapsed(false)}
        />
      </div>
    </section>
  );
}

function ToolSearchFallback() {
  return (
    <section id="tools" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-20">
      <div className="h-10 w-48 rounded-lg bg-muted animate-pulse mb-6" />
      <div className="h-12 max-w-xl rounded-xl bg-muted animate-pulse mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </section>
  );
}

export default function ToolSearch({ tools }: { tools: Tool[] }) {
  return (
    <Suspense fallback={<ToolSearchFallback />}>
      <ToolSearchInner tools={tools} />
    </Suspense>
  );
}
