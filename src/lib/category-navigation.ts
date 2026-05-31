// Copyright (c) 2026 DevBench contributors. MIT License.
import {
  CATEGORIES,
  getToolsByCategory,
  type Tool,
  type ToolCategory,
} from "@/lib/tools-registry";

/** DOM id for homepage category sections — use with `/#tools` and this hash. */
export function categorySectionId(category: ToolCategory): string {
  return `category-${category}`;
}

/** Deep-link to browse a category on the homepage tool grid. */
export function categoryBrowseHref(category: ToolCategory): string {
  return `/?category=${category}#${categorySectionId(category)}`;
}

/** Curated entry points shown in each homepage category block. */
export const CATEGORY_BROWSE_HIGHLIGHTS: Record<ToolCategory, readonly string[]> = {
  json: [
    "json-formatter",
    "json-diff",
    "json-to-yaml",
    "json-to-csv",
    "yaml-formatter",
  ],
  encoding: [
    "base64-encode",
    "base64-decode",
    "url-encode",
    "url-decode",
    "hex-to-text",
  ],
  text: [
    "regex-tester",
    "markdown-preview",
    "text-diff",
    "word-counter",
    "case-converter",
  ],
  dev: [
    "hash-generator",
    "uuid-generator",
    "jwt-debugger",
    "password-generator",
    "cron-parser",
  ],
  image: [
    "image-format-converter",
    "image-compressor",
    "image-resizer",
    "background-remover",
    "svg-optimizer",
  ],
  pdf: [
    "merge-pdf",
    "split-pdf",
    "compress-pdf",
    "pdf-to-jpg",
    "html-to-pdf",
  ],
  conversion: [
    "unit-converter",
    "temperature-converter",
    "currency-converter",
    "byte-converter",
    "percentage-calc",
  ],
  finance: [
    "loan-emi-calculator",
    "compound-interest",
    "gst-calculator",
    "currency-converter",
    "tip-calculator",
  ],
  health: [
    "bmi-calculator",
    "calorie-calculator",
    "body-fat-calculator",
    "water-intake-calculator",
    "bmr-calculator",
  ],
  math: [
    "graph-calculator",
    "quadratic-solver",
    "gcd-lcm-calculator",
    "pythagorean-theorem",
    "percentage-calc",
  ],
  datetime: [
    "timezone-converter",
    "days-between-dates",
    "unix-timestamp",
    "date-calculator",
    "age-calculator",
  ],
};

export function getCategoryHighlightTools(
  category: ToolCategory,
  count = 5,
): Tool[] {
  const bySlug = new Map(
    getToolsByCategory(category).map((t) => [t.slug, t] as const),
  );
  const picked: Tool[] = [];
  for (const slug of CATEGORY_BROWSE_HIGHLIGHTS[category]) {
    const tool = bySlug.get(slug);
    if (tool) picked.push(tool);
    if (picked.length >= count) break;
  }
  if (picked.length < count) {
    for (const tool of getToolsByCategory(category)) {
      if (picked.some((p) => p.slug === tool.slug)) continue;
      picked.push(tool);
      if (picked.length >= count) break;
    }
  }
  return picked.slice(0, count);
}

/** Next tools in registry order after `afterSlug` (wraps), excluding `afterSlug`. */
export function getNextToolsInCategory(
  category: ToolCategory,
  afterSlug: string | undefined,
  count = 5,
): Tool[] {
  const inCategory = getToolsByCategory(category);
  if (inCategory.length === 0) return [];

  let start = 0;
  if (afterSlug) {
    const idx = inCategory.findIndex((t) => t.slug === afterSlug);
    start = idx >= 0 ? (idx + 1) % inCategory.length : 0;
  }

  const result: Tool[] = [];
  for (let i = 0; i < inCategory.length && result.length < count; i++) {
    const tool = inCategory[(start + i) % inCategory.length];
    if (tool.slug === afterSlug) continue;
    result.push(tool);
  }
  return result;
}

export function categoryLabel(category: ToolCategory): string {
  return CATEGORIES[category].label;
}

export function isToolCategory(value: string): value is ToolCategory {
  return value in CATEGORIES;
}
