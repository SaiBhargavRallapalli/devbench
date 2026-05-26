import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import { CATEGORIES } from "@/lib/tools-registry";
import { TOOL_PAGE_CONTENT } from "@/lib/tool-page-content";
import { categoryBrowseHref } from "@/lib/category-navigation";
import { getToolConnectivity } from "@/lib/tool-connectivity";
import ToolConnectivityBadge from "@/components/ToolConnectivityBadge";
import ToolPageActions from "@/components/ToolPageActions";
import Breadcrumbs from "@/components/Breadcrumbs";
import ToolPageNav from "@/components/ToolPageNav";
import ToolContextualLinks from "@/components/ToolContextualLinks";

export default function ToolPageHero({ tool }: { tool: Tool }) {
  const category = CATEGORIES[tool.category];
  const extraContent = TOOL_PAGE_CONTENT[tool.slug];
  const connectivity = getToolConnectivity(tool.slug);
  return (
    <div className="mb-6 animate-fade-in">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: category.label, href: categoryBrowseHref(tool.category) },
          { label: tool.name },
        ]}
      />
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Link
          href={categoryBrowseHref(tool.category)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {category.label}
        </Link>
        <Link
          href="/#tools"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          All tools
        </Link>
      </div>
      <ToolPageNav className="mb-4" />
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold font-mono ${category.color}`}
        >
          {tool.icon}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{tool.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Link
              href={categoryBrowseHref(tool.category)}
              className={`rounded-full px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 ${category.color}`}
            >
              {category.label}
            </Link>
            <ToolConnectivityBadge slug={tool.slug} />
            <ToolPageActions slug={tool.slug} />
          </div>
          {extraContent ? (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {extraContent.openingParagraph}
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground max-w-prose">
              {tool.description}
            </p>
          )}
          <ToolContextualLinks slug={tool.slug} className="mt-3 max-w-2xl" />
          {connectivity.mode === "offline" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Your files and inputs stay in your browser — nothing is uploaded or stored.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
