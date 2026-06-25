// Copyright (c) 2026 DevBench contributors. MIT License.
import { CATEGORIES, type Tool, type ToolCategory } from "@/lib/tools-registry";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";
import { SITE_URL } from "@/lib/social-metadata";
import { getRelatedTools, relatedToolLinkLabel } from "@/lib/related-tools";
import { categorySectionId } from "@/lib/category-navigation";

function toolKeywords(tool: Tool): string[] {
  const cat = CATEGORIES[tool.category];
  return [
    tool.shortName,
    tool.name,
    cat.label,
    "online tool",
    "free developer tools",
    "browser-based",
    "DevBench",
  ];
}

function relatedToolNodes(slug: string) {
  return getRelatedTools(slug, 5).map((related) => ({
    "@type": "SoftwareApplication",
    name: relatedToolLinkLabel(related),
    url: `${SITE_URL}${publicHrefForToolSlug(related.slug)}`,
    applicationCategory: "DeveloperApplication",
  }));
}

/** Schema.org ItemList representing a category tool group on the homepage. */
export function toolGroupSchema(category: ToolCategory, tools: Tool[]): object {
  const label = CATEGORIES[category].label;
  const groupId = `${SITE_URL}/#${categorySectionId(category)}`;
  return {
    "@type": "ItemList",
    "@id": groupId,
    name: `${label} tools`,
    description: `Free ${label.toLowerCase()} utilities on DevBench — runs in your browser.`,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: toolItemSchema(tool, { includeIsPartOf: true, groupId }),
    })),
  };
}

type ToolSchemaOptions = {
  includeIsPartOf?: boolean;
  groupId?: string;
  relatedSlug?: string;
};

/** Individual tool node — SoftwareApplication with keywords, isPartOf, and relatedTool. */
export function toolItemSchema(
  tool: Tool,
  options: ToolSchemaOptions = {},
): object {
  const url = `${SITE_URL}${publicHrefForToolSlug(tool.slug)}`;
  const cat = CATEGORIES[tool.category];
  const related = relatedToolNodes(options.relatedSlug ?? tool.slug);

  const node: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    "@id": `${url}#tool`,
    name: tool.name,
    alternateName: tool.shortName,
    url,
    description: tool.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    isAccessibleForFree: true,
    keywords: toolKeywords(tool).join(", "),
  };

  if (options.includeIsPartOf && options.groupId) {
    node.isPartOf = {
      "@type": "ItemList",
      "@id": options.groupId,
      name: `${cat.label} tools`,
    };
  } else {
    node.isPartOf = {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#${categorySectionId(tool.category)}`,
      name: `${cat.label} tools`,
    };
  }

  if (related.length > 0) {
    node.isRelatedTo = related;
    node.relatedTool = related;
  }

  return node;
}

/** @graph payload for a standalone tool page. */
export function toolPageStructuredGraph(
  tool: Tool,
  slug: string,
): object[] {
  const groupId = `${SITE_URL}/#${categorySectionId(tool.category)}`;
  return [
    toolItemSchema(tool, { relatedSlug: slug, groupId }),
    {
      "@type": "ItemList",
      "@id": groupId,
      name: `${CATEGORIES[tool.category].label} tools`,
    },
  ];
}
