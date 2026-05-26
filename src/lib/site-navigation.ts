// Copyright (c) 2026 DevBench contributors. MIT License.
import {
  CATEGORIES,
  getToolBySlug,
  type Tool,
  type ToolCategory,
} from "@/lib/tools-registry";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";
import { categoryBrowseHref } from "@/lib/category-navigation";

/** Footer & sitewide popular tools — descriptive labels via registry names. */
export const POPULAR_TOOL_SLUGS = [
  "json-formatter",
  "json-diff",
  "base64-encode",
  "jwt-debugger",
  "merge-pdf",
  "regex-tester",
  "hash-generator",
] as const;

export function getPopularTools(): Tool[] {
  return POPULAR_TOOL_SLUGS.map((slug) => getToolBySlug(slug)).filter(
    (t): t is Tool => Boolean(t),
  );
}

export const FOOTER_CATEGORY_ORDER: ToolCategory[] = [
  "json",
  "encoding",
  "text",
  "dev",
  "pdf",
  "image",
  "conversion",
  "finance",
  "health",
  "math",
  "datetime",
];

export function footerCategoryLinks(): { href: string; label: string }[] {
  return FOOTER_CATEGORY_ORDER.map((cat) => ({
    href: categoryBrowseHref(cat),
    label: CATEGORIES[cat].label,
  }));
}

export function toolNavHref(slug: string): string {
  return publicHrefForToolSlug(slug);
}
