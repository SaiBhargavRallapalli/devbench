import Link from "next/link";
import { getRelatedTools, relatedToolLinkLabel } from "@/lib/related-tools";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";

/** Inline related-tool links for cards and descriptions (3–4 links). */
export default function ToolContextualLinks({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const related = getRelatedTools(slug, 4);
  if (related.length === 0) return null;

  return (
    <p className={`text-xs text-muted-foreground leading-relaxed ${className}`.trim()}>
      <span className="font-medium text-foreground/80">Related: </span>
      {related.map((tool, index) => (
        <span key={tool.slug}>
          {index > 0 && (
            <span aria-hidden className="mx-1 text-border">
              ·
            </span>
          )}
          <Link
            href={publicHrefForToolSlug(tool.slug)}
            className="text-accent hover:underline"
          >
            {relatedToolLinkLabel(tool)}
          </Link>
        </span>
      ))}
    </p>
  );
}
