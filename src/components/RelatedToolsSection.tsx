import Link from "next/link";
import { CATEGORIES } from "@/lib/tools-registry";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";
import {
  getRelatedTools,
  relatedToolLinkLabel,
} from "@/lib/related-tools";
import { categoryBrowseHref } from "@/lib/category-navigation";

type Variant = "cards" | "compact";

export default function RelatedToolsSection({
  slug,
  variant = "cards",
  className = "",
  showCategoryLink = true,
}: {
  slug: string;
  variant?: Variant;
  className?: string;
  showCategoryLink?: boolean;
}) {
  const related = getRelatedTools(slug, 5);
  if (related.length === 0) return null;

  const category = related[0]!.category;
  const categoryMeta = CATEGORIES[category];

  if (variant === "compact") {
    return (
      <section
        id="related-tools"
        aria-labelledby="related-tools-heading"
        className={className}
      >
        <h2
          id="related-tools-heading"
          className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3"
        >
          Related tools
        </h2>
        <ul className="flex flex-wrap gap-2">
          {related.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={publicHrefForToolSlug(tool.slug)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-sm hover:bg-muted transition-colors"
              >
                <span className="font-mono text-xs opacity-70">{tool.icon}</span>
                {relatedToolLinkLabel(tool)}
              </Link>
            </li>
          ))}
        </ul>
        {showCategoryLink && (
          <p className="mt-3 text-xs text-muted-foreground">
            <Link
              href={categoryBrowseHref(category)}
              className="text-accent hover:underline"
            >
              Back to {categoryMeta.label} tools
            </Link>
          </p>
        )}
      </section>
    );
  }

  return (
    <section
      id="related-tools"
      aria-labelledby="related-tools-heading"
      className={className}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h2
          id="related-tools-heading"
          className="text-sm font-semibold text-muted-foreground uppercase tracking-wide"
        >
          Related tools
        </h2>
        {showCategoryLink && (
          <Link
            href={categoryBrowseHref(category)}
            className="text-xs font-medium text-accent hover:underline"
          >
            Back to {categoryMeta.label}
          </Link>
        )}
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0 m-0">
        {related.map((tool) => {
          const cat = CATEGORIES[tool.category];
          return (
            <li key={tool.slug}>
              <Link
                href={publicHrefForToolSlug(tool.slug)}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-accent/40 hover:bg-muted/30 transition-colors h-full"
              >
                <div
                  className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${cat.color}`}
                >
                  {tool.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {relatedToolLinkLabel(tool)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
