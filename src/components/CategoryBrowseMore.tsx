import Link from "next/link";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";
import {
  categoryBrowseHref,
  categoryLabel,
  getCategoryHighlightTools,
  getNextToolsInCategory,
} from "@/lib/category-navigation";
import { relatedToolLinkLabel } from "@/lib/related-tools";
import type { Tool, ToolCategory } from "@/lib/tools-registry";

type Mode = "highlights" | "next";

function resolveTools(
  category: ToolCategory,
  mode: Mode,
  afterSlug: string | undefined,
  count: number,
): Tool[] {
  if (mode === "next" && afterSlug) {
    return getNextToolsInCategory(category, afterSlug, count);
  }
  return getCategoryHighlightTools(category, count);
}

export default function CategoryBrowseMore({
  category,
  mode = "highlights",
  afterSlug,
  count = 5,
  className = "",
}: {
  category: ToolCategory;
  mode?: Mode;
  afterSlug?: string;
  count?: number;
  className?: string;
}) {
  const tools = resolveTools(category, mode, afterSlug, count);
  if (tools.length === 0) return null;

  const label = categoryLabel(category);

  return (
    <aside
      className={`rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5 ${className}`.trim()}
      aria-label={`Browse more in ${label}`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2">
        Browse more in {label}
      </p>
      <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm">
        {tools.map((tool) => (
          <li key={tool.slug}>
            <Link
              href={publicHrefForToolSlug(tool.slug)}
              className="text-accent hover:underline font-medium"
            >
              {relatedToolLinkLabel(tool)}
            </Link>
          </li>
        ))}
        <li className="text-muted-foreground">
          <Link
            href={categoryBrowseHref(category)}
            className="hover:text-foreground transition-colors"
          >
            All {label} tools →
          </Link>
        </li>
      </ul>
    </aside>
  );
}
