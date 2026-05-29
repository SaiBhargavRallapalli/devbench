// Copyright (c) 2026 DevBench contributors. MIT License.
import {
  getToolBySlug,
  getToolsByCategory,
  type Tool,
} from "@/lib/tools-registry";

/**
 * Curated strongly-related tools (3–5 each). Falls back to siblings in the same category.
 */
const CURATED_RELATED: Partial<Record<string, readonly string[]>> = {
  "json-formatter": ["json-diff", "json-to-yaml", "json-to-csv", "yaml-formatter", "csv-to-json"],
  "json-diff": ["json-formatter", "text-diff", "json-to-yaml", "yaml-formatter"],
  "json-to-yaml": ["yaml-to-json", "json-formatter", "yaml-formatter", "json-to-csv"],
  "yaml-to-json": ["json-to-yaml", "yaml-formatter", "json-formatter", "json-to-typescript"],
  "yaml-formatter": ["json-to-yaml", "yaml-to-json", "json-formatter", "json-diff"],
  "json-to-csv": ["csv-to-json", "json-formatter", "json-to-tsv", "json-to-typescript"],
  "csv-to-json": ["json-to-csv", "json-formatter", "json-to-tsv", "tsv-to-json"],
  "json-to-tsv": ["tsv-to-json", "json-to-csv", "csv-to-json"],
  "tsv-to-json": ["json-to-tsv", "json-to-csv", "csv-to-json"],
  "json-to-typescript": ["json-formatter", "json-to-csv", "json-to-xml", "xml-to-json"],
  "json-to-xml": ["xml-to-json", "json-formatter", "json-to-typescript"],
  "xml-to-json": ["json-to-xml", "json-formatter", "xml-formatter"],

  "base64-encode": ["base64-decode", "url-encode", "text-to-hex", "base64-image"],
  "base64-decode": ["base64-encode", "url-decode", "hex-to-text", "base64-image"],
  "url-encode": ["url-decode", "base64-encode", "html-entity-encode"],
  "url-decode": ["url-encode", "base64-decode", "html-entity-decode"],
  "html-entity-encode": ["html-entity-decode", "url-encode", "base64-encode"],
  "html-entity-decode": ["html-entity-encode", "url-decode", "base64-decode"],
  "text-to-hex": ["hex-to-text", "text-to-binary", "base64-encode"],
  "hex-to-text": ["text-to-hex", "binary-to-text", "base64-decode"],
  "text-to-binary": ["binary-to-text", "text-to-hex", "base64-encode"],
  "binary-to-text": ["text-to-binary", "hex-to-text", "base64-decode"],
  "base64-image": ["base64-encode", "base64-decode", "image-compressor"],
  rot13: ["morse-code", "base64-encode", "text-to-hex"],
  "morse-code": ["rot13", "text-to-hex", "base64-encode"],

  "regex-tester": ["text-diff", "find-replace", "string-inspector", "markdown-preview"],
  "text-diff": ["json-diff", "regex-tester", "find-replace", "xml-suite"],
  "markdown-preview": ["html-to-pdf", "regex-tester", "word-counter", "slug-generator"],
  "case-converter": ["slug-generator", "find-replace", "word-counter"],
  "word-counter": ["case-converter", "markdown-preview", "lorem-ipsum"],
  "slug-generator": ["case-converter", "url-encode", "word-counter"],
  "find-replace": ["regex-tester", "text-diff", "case-converter"],
  "string-inspector": ["regex-tester", "text-to-hex", "word-counter"],
  "line-sorter": ["find-replace", "whitespace-normalizer", "text-diff"],
  "whitespace-normalizer": ["line-sorter", "find-replace", "text-diff"],
  "lorem-ipsum": ["word-counter", "markdown-preview", "case-converter"],

  "hash-generator": ["password-generator", "uuid-generator", "aes-encrypt-decrypt", "jwt-debugger"],
  "uuid-generator": ["hash-generator", "password-generator", "semver-compare"],
  "password-generator": ["hash-generator", "uuid-generator", "aes-encrypt-decrypt"],
  "jwt-debugger": ["hash-generator", "base64-decode", "json-formatter"],
  "aes-encrypt-decrypt": ["hash-generator", "password-generator", "base64-encode"],
  "cron-parser": ["unix-timestamp", "timezone-converter", "epoch", "date-calculator"],
  "unix-timestamp": ["timezone-converter", "days-between-dates", "cron-parser"],
  "timezone-converter": ["unix-timestamp", "days-between-dates", "date-calculator"],
  "semver-compare": ["hash-generator", "uuid-generator", "json-diff"],
  "curl-formatter": ["curl-to-fetch", "json-formatter", "url-parser", "dotenv-parser"],
  "sql-formatter": ["json-formatter", "dotenv-parser", "toml-to-json"],
  "dotenv-parser": ["toml-to-json", "yaml-formatter", "json-formatter"],
  "toml-to-json": ["yaml-to-json", "json-formatter", "dotenv-parser"],
  "chmod-calculator": ["hash-generator", "regex-tester", "uuid-generator"],
  "url-parser": ["url-encode", "url-decode", "curl-formatter"],

  "merge-pdf": ["split-pdf", "compress-pdf", "pdf-to-jpg", "rotate-pdf"],
  "split-pdf": ["merge-pdf", "compress-pdf", "organize-pdf"],
  "compress-pdf": ["merge-pdf", "split-pdf", "pdf-to-jpg"],
  "pdf-to-jpg": ["image-to-pdf", "image-format-converter", "compress-pdf"],
  "image-to-pdf": ["jpg-to-pdf", "html-to-pdf", "text-to-pdf"],
  "html-to-pdf": ["markdown-preview", "text-to-pdf", "image-to-pdf"],
  "text-to-pdf": ["html-to-pdf", "markdown-preview", "merge-pdf"],
  "watermark-pdf": ["merge-pdf", "compress-pdf", "organize-pdf"],
  "organize-pdf": ["merge-pdf", "split-pdf", "rotate-pdf"],
  "rotate-pdf": ["organize-pdf", "merge-pdf", "split-pdf"],

  "image-compressor": ["image-resizer", "svg-optimizer", "base64-image"],
  "image-resizer": ["image-compressor", "aspect-ratio", "color-converter"],
  "image-format-converter": ["image-compressor", "image-resizer", "svg-optimizer", "image-to-pdf"],
  "svg-optimizer": ["image-format-converter", "image-compressor", "qr-code", "color-converter"],
  "color-converter": ["contrast-checker", "color-palette", "image-resizer"],
  "contrast-checker": ["color-converter", "color-palette", "markdown-preview"],
  "color-palette": ["color-converter", "contrast-checker", "qr-code"],
  "qr-code": ["slug-generator", "url-encode", "svg-optimizer"],

  "unit-converter": ["temperature-converter", "base-converter", "byte-converter"],
  "temperature-converter": ["unit-converter", "currency-converter", "base-converter"],
  "base-converter": ["unit-converter", "text-to-hex", "byte-converter"],
  "byte-converter": ["base-converter", "unit-converter", "text-to-hex"],
  "currency-converter": ["tip-calculator", "loan-emi", "gst-calculator"],

  "loan-emi-calculator": ["compound-interest", "gst-calculator", "percentage-calc"],
  "compound-interest": ["loan-emi-calculator", "percentage-calc", "gst-calculator"],
  "gst-calculator": ["loan-emi-calculator", "tip-calculator", "percentage-calc"],
  "tip-calculator": ["gst-calculator", "currency-converter", "percentage-calc"],
  "percentage-calc": ["loan-emi-calculator", "compound-interest", "tip-calculator"],

  "bmi-calculator": ["body-fat-calculator", "calorie-calculator", "water-intake-calculator"],
  "calorie-calculator": ["bmi-calculator", "water-intake-calculator", "bmr-calculator"],
  "body-fat-calculator": ["bmi-calculator", "calorie-calculator", "water-intake-calculator"],
  "water-intake-calculator": ["calorie-calculator", "bmi-calculator", "bmr-calculator"],

  "quadratic-solver": ["percentage-calc", "gcd-lcm-calculator", "pythagorean-theorem"],
  "gcd-lcm-calculator": ["quadratic-solver", "percentage-calc", "pythagorean-theorem"],
  "pythagorean-theorem": ["quadratic-solver", "aspect-ratio", "percentage-calc"],
  "aspect-ratio": ["image-resizer", "pythagorean-theorem", "percentage-calc"],
  "graph-calculator": ["quadratic-solver", "gcd-lcm-calculator", "percentage-calc"],

  "days-between-dates": ["unix-timestamp", "timezone-converter", "date-calculator"],
  "date-calculator": ["days-between-dates", "unix-timestamp", "timezone-converter"],
};

export function getRelatedToolSlugs(slug: string, max = 5): string[] {
  const curated = CURATED_RELATED[slug];
  if (curated?.length) {
    return curated
      .filter((s) => s !== slug && getToolBySlug(s))
      .slice(0, max);
  }

  const tool = getToolBySlug(slug);
  if (!tool) return [];

  return getToolsByCategory(tool.category)
    .filter((t) => t.slug !== slug)
    .slice(0, max)
    .map((t) => t.slug);
}

export function getRelatedTools(slug: string, max = 5): Tool[] {
  return getRelatedToolSlugs(slug, max)
    .map((s) => getToolBySlug(s))
    .filter((t): t is Tool => Boolean(t));
}

/** Descriptive link label — prefer shortName when it reads well as anchor text. */
export function relatedToolLinkLabel(tool: Tool): string {
  if (tool.shortName.length <= 24 && !tool.shortName.includes("→")) {
    return tool.name.includes(tool.shortName) ? tool.shortName : tool.name;
  }
  return tool.name;
}
