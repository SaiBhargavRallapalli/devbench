export type ToolComparison = {
  slug: string;
  title: string;
  deck: string;
  a: { slug: string; name: string };
  b: { slug: string; name: string };
  whenA: string;
  whenB: string;
  summary: string;
};

/** Short guides for overlapping utilities — SEO + user clarity. */
export const TOOL_COMPARISONS: ToolComparison[] = [
  {
    slug: "csv-vs-tsv",
    title: "CSV vs TSV — when to use each",
    deck:
      "Both represent tables as plain text. Commas are universal; tabs avoid quoting headaches when cells contain commas.",
    a: { slug: "csv-to-json", name: "CSV → JSON" },
    b: { slug: "tsv-to-json", name: "TSV → JSON" },
    whenA:
      "Exports from spreadsheets and databases, RFC-style CSV, APIs that return comma-separated rows.",
    whenB:
      "Unix-friendly paste, analytics TSV dumps, wide cells with commas or localized numbers.",
    summary:
      "DevBench converts both formats in your browser — nothing is uploaded. Pair with JSON → CSV or JSON → TSV when you need the reverse.",
  },
  {
    slug: "text-diff-vs-json-diff",
    title: "Text diff vs JSON diff",
    deck:
      "Line-oriented diff is fastest for prose and configs; structural JSON diff ignores key order and focuses on data changes.",
    a: { slug: "text-diff", name: "Text Diff" },
    b: { slug: "json-diff", name: "JSON Diff" },
    whenA:
      "README edits, .env blocks, logs, code snippets — anything where line breaks and spelling matter.",
    whenB:
      "API payloads and config JSON where whitespace and key ordering should not create false positives.",
    summary:
      "Use Text Diff on /tools/text-diff and JSON Diff when both sides are valid JSON objects or arrays.",
  },
  {
    slug: "yaml-to-json-vs-json-workspace",
    title: "YAML ↔ JSON standalone vs full JSON workspace",
    deck:
      "Quick converters are perfect for one-off files; the JSON workspace adds validation, tree view, and batch transforms.",
    a: { slug: "yaml-to-json", name: "YAML → JSON" },
    b: { slug: "json-formatter", name: "JSON Formatter" },
    whenA:
      "Paste a chunk of YAML and get JSON — ideal for CI snippets, Kubernetes fragments, and README examples.",
    whenB:
      "Large documents, schema validation, table mode, NDJSON, encryption helpers — open /json for the full toolkit.",
    summary:
      "Both paths stay client-side; choose based on whether you need a single conversion or an extended editor.",
  },
];
