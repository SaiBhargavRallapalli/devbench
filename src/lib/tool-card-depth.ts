// Copyright (c) 2026 DevBench contributors. MIT License.
import type { Tool, ToolCategory } from "@/lib/tools-registry";

export type ToolCardDepth = {
  steps: string[];
  pitfalls: string[];
  expectedOutput: string;
  examplePayload?: string;
  exportLabel?: string;
  comparisonSnippet: string;
};

const CATEGORY_COMPARISONS: Record<ToolCategory, string> = {
  json: "Prefer this over generic text tools when input must be valid JSON — structural validation and tree view avoid false positives from line diffs.",
  encoding: "Stays in-browser unlike CLI one-liners — no shell history risk for secrets you paste once and copy out.",
  text: "Line-oriented and prose-friendly; use JSON or dev tools when the format is structured data or tokens.",
  dev: "Focused on developer workflows (tokens, HTTP, cron) rather than general calculators or converters.",
  image: "Processes pixels locally — no cloud upload queue compared to desktop apps that sync to a server.",
  pdf: "Runs entirely in-tab — unlike desktop suites that may phone home for licensing or cloud conversion.",
  conversion: "Single-purpose conversion without account walls; pair with JSON or encoding tools for chained workflows.",
  finance: "Transparent formulas in-browser; spreadsheets often leak data to cloud sync — here nothing leaves the tab.",
  health: "Instant what-if calculations with no health data stored; use for estimates, not medical records.",
  math: "Quick numeric answers without installing a CAS; use dev tools when you need programmatic formats.",
  datetime: "Timezone math in one place instead of guessing OS clock settings; pair with cron tools for schedules.",
};

const TOOL_CARD_DEPTH_OVERRIDES: Record<string, ToolCardDepth> = {
  "json-formatter": {
    steps: [
      "Paste minified or invalid JSON into the editor.",
      "Fix syntax errors using line/column hints.",
      "Click Format for 2-space indent or Minify for production.",
      "Copy output or switch to tree view on /json for large objects.",
    ],
    pitfalls: [
      "Trailing commas are invalid in strict JSON — remove them before formatting.",
      "Very large files (>5 MB) may slow the tab; collapse sections in tree view.",
    ],
    expectedOutput: "Valid, indented JSON with matching brackets and quoted keys.",
    examplePayload: '{"id":1,"tags":["api","json"],"active":true}',
    exportLabel: "Copy formatted JSON",
    comparisonSnippet:
      "Excels over Text Diff for JSON because it validates structure and ignores insignificant whitespace when diffing on /json.",
  },
  "jwt-debugger": {
    steps: [
      "Paste the full JWT (header.payload.signature).",
      "Review decoded header (alg, typ) and payload claims.",
      "Optionally enter the HMAC secret to verify signature locally.",
      "Note expiry status — red badge means the token is no longer valid.",
    ],
    pitfalls: [
      "Never paste production secrets into shared screens — verification is local but visible.",
      "Unsigned or alg:none tokens should be rejected in production APIs even if they decode.",
    ],
    expectedOutput: "Pretty-printed header and payload JSON plus signature verification status.",
    examplePayload:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYiLCJleHAiOjk5OTk5OTk5OTl9.x",
    exportLabel: "Copy claim JSON",
    comparisonSnippet:
      "Unlike Base64 Decode, JWT Debugger splits segments, parses JSON claims, and checks exp — purpose-built for OAuth and session tokens.",
  },
  "merge-pdf": {
    steps: [
      "Open PDF Merge or /pdf hub → Merge.",
      "Add PDFs in desired page order (drag to reorder).",
      "Run merge and wait for in-browser assembly.",
      "Download merged.pdf and confirm page count.",
    ],
    pitfalls: [
      "Encrypted PDFs may need unlocking in a desktop viewer first.",
      "Hundreds of pages can exhaust mobile RAM — merge in batches on phones.",
    ],
    expectedOutput: "Single downloadable PDF containing all input pages in order.",
    examplePayload: "chapter-1.pdf + chapter-2.pdf",
    exportLabel: "Download merged PDF",
    comparisonSnippet:
      "Faster than re-printing to PDF from a word processor — no upload, and order is explicit before download.",
  },
  "compress-pdf": {
    steps: [
      "Drop the source PDF onto the compress tool.",
      "Pick a quality preset if available.",
      "Start compression and watch the size estimate.",
      "Download and open to confirm text remains readable.",
    ],
    pitfalls: [
      "Scanned pages may not shrink much without OCR — image-heavy PDFs dominate size.",
      "Extreme compression blurs small fonts; keep the original for archival.",
    ],
    expectedOutput: "Smaller PDF file ready to download (typical 20–60% reduction on image-heavy docs).",
    exportLabel: "Download compressed PDF",
    comparisonSnippet:
      "Beats emailing zips of multiple tools — one pass, client-side, no cloud queue.",
  },
  "split-pdf": {
    steps: [
      "Upload the PDF to split.",
      "Choose page ranges or every-N-pages mode.",
      "Generate parts — each becomes its own download.",
      "Verify first and last page of each part in a viewer.",
    ],
    pitfalls: [
      "Page numbers in the UI are 1-based; double-check range endpoints.",
      "Splitting password-protected files is not supported in-browser.",
    ],
    expectedOutput: "One or more PDF files per selected range.",
    exportLabel: "Download split PDFs",
    comparisonSnippet:
      "More precise than printing page ranges to a new PDF — metadata and links are preserved when the engine supports it.",
  },
  "base64-encode": {
    steps: [
      "Paste UTF-8 text in the input panel.",
      "Copy the Base64 line from the output (updates live).",
      "For images, use Base64 Image instead of this text tool.",
    ],
    pitfalls: [
      "Do not manually wrap lines unless the target API expects MIME chunks.",
      "Binary files should use the image or file-specific encoder, not plain text paste.",
    ],
    expectedOutput: "ASCII-safe Base64 string representing your input bytes.",
    examplePayload: "Hello, DevBench!",
    exportLabel: "Copy Base64",
    comparisonSnippet:
      "Clearer than shell `base64` for one-off UTF-8 strings — no terminal history retention.",
  },
  "base64-decode": {
    steps: [
      "Paste a Base64 string (padding optional on most inputs).",
      "Read decoded UTF-8 text in the output.",
      "If output looks garbled, confirm the source used UTF-8 not Latin-1.",
    ],
    pitfalls: [
      "Whitespace in pasted strings is usually stripped — remove stray headers like 'data:...,' manually.",
      "Invalid padding shows an error instead of silent garbage — fix the string length.",
    ],
    expectedOutput: "Human-readable text recovered from the encoding.",
    examplePayload: "SGVsbG8sIERldkJlbmNoIQ==",
    exportLabel: "Copy decoded text",
    comparisonSnippet:
      "Safer than piping unknown Base64 through shell scripts — nothing is logged to disk.",
  },
  "text-diff": {
    steps: [
      "Paste original text in the left (or A) panel.",
      "Paste revised text in the right (or B) panel.",
      "Scan green/red highlights for additions and removals.",
      "Copy unified diff or share screenshots for reviews.",
    ],
    pitfalls: [
      "JSON with reordered keys shows many false changes — use JSON Diff instead.",
      "Line ending differences (CRLF vs LF) can flood the diff — normalize first.",
    ],
    expectedOutput: "Side-by-side or unified diff with highlighted changed lines.",
    exportLabel: "Copy diff",
    comparisonSnippet:
      "Best for prose and configs; switch to JSON Diff when both sides are valid JSON objects.",
  },
  "json-diff": {
    steps: [
      "Paste JSON A and JSON B in the two editors.",
      "Ensure both parse — fix syntax errors first.",
      "Review structural changes (added/removed keys and values).",
      "Copy summary or drill into nested paths in the tree.",
    ],
    pitfalls: [
      "Arrays compared by index — reordering items shows as changes.",
      "Floating-point noise from APIs may mark numbers as different — round before diffing.",
    ],
    expectedOutput: "Structural diff ignoring key order and insignificant whitespace.",
    exportLabel: "Copy diff report",
    comparisonSnippet:
      "Excels over Text Diff for API payloads — key order changes do not look like rewrites.",
  },
  "image-format-converter": {
    steps: [
      "Drop a HEIC, SVG, PNG, JPEG, or WebP file (or add several on /image batch).",
      "Pick output format — PNG, JPEG, WebP, or SVG trace.",
      "Adjust quality or trace detail if not exporting PNG.",
      "Convert and download — ZIP when batching multiple files.",
    ],
    pitfalls: [
      "SVG trace on photos produces huge files — use raster formats for photos.",
      "Very large images may hit browser memory limits — resize first if needed.",
    ],
    expectedOutput: "Converted image file (or ZIP of files) at chosen format and quality.",
    exportLabel: "Download converted image",
    comparisonSnippet:
      "Handles HEIC and SVG in-browser — no desktop app or cloud upload queue.",
  },
  "background-remover": {
    steps: [
      "Upload a PNG, JPEG, or WebP photo with a clear subject.",
      "Wait for the in-browser model to segment the foreground.",
      "Preview the transparent PNG result.",
      "Download and optionally compress or resize on DevBench.",
    ],
    pitfalls: [
      "Hair, fur, and busy backgrounds reduce edge quality.",
      "First run downloads the ML model — requires network once.",
    ],
    expectedOutput: "PNG with transparent background (alpha channel).",
    exportLabel: "Download cutout PNG",
    comparisonSnippet:
      "No upload to a server — segmentation runs locally after the model loads.",
  },
  "dns-lookup": {
    steps: [
      "Enter a domain name (e.g. example.com).",
      "Select record types or query all common types.",
      "Review A, AAAA, MX, TXT, CNAME, NS, and SOA answers.",
      "Copy values for DNS migration or mail setup checks.",
    ],
    pitfalls: [
      "Cached TTLs may lag recent DNS changes — wait for propagation.",
      "Private or split-horizon DNS won't appear in public resolvers.",
    ],
    expectedOutput: "Structured DNS answers with TTL per record type.",
    exportLabel: "Copy record values",
    comparisonSnippet:
      "Faster than dig for quick MX/TXT checks — no terminal required.",
  },
  "gitignore-generator": {
    steps: [
      "Select templates for your stack (Node, Python, macOS, etc.).",
      "Combine multiple templates if needed.",
      "Generate and review the merged .gitignore.",
      "Copy or download into your repo root.",
    ],
    pitfalls: [
      "Already-tracked files stay tracked — use git rm --cached after updating .gitignore.",
      "Global ignores belong in ~/.gitignore_global, not always in the repo.",
    ],
    expectedOutput: "Single .gitignore file with deduplicated patterns.",
    exportLabel: "Copy .gitignore",
    comparisonSnippet:
      "Covers 20+ stacks in one click — faster than stitching GitHub templates manually.",
  },
  "pdf-compare": {
    steps: [
      "Upload two PDF files (digital text, not scans).",
      "Run compare to extract text from each.",
      "Review unified diff of page text.",
      "Use PDF Merge or Split if you need structural changes instead.",
    ],
    pitfalls: [
      "Scanned PDFs without OCR produce empty or poor diffs.",
      "Layout changes with identical text may not appear as differences.",
    ],
    expectedOutput: "Unified text diff between extracted page content.",
    exportLabel: "Copy diff",
    comparisonSnippet:
      "Text-level compare — use Text Diff for plain exports, not binary PDF bytes.",
  },
  "notepad-plus-plus": {
    steps: [
      "Open /notepad (full workspace) or /tools/notepad-plus-plus from Text tools.",
      "Create tabs with New or Open — syntax auto-detects from extension.",
      "Edit with Find (Ctrl+F), Replace (Ctrl+H), and Go to line (Ctrl+G).",
      "Download, save to vault, or share a link when done.",
    ],
    pitfalls: [
      "Very large files (>5 MB) can slow Monaco — split or trim when possible.",
      "Session restore is per-browser — clear site data removes saved tabs.",
    ],
    expectedOutput: "Edited text files with optional syntax highlighting and status bar stats.",
    exportLabel: "Download file",
    comparisonSnippet:
      "Multi-tab Notepad++ layout in-browser — no install, with vault and diff integration.",
  },
};

function fallbackDepth(tool: Tool): ToolCardDepth {
  const input = tool.inputLabel ?? "your input";
  const output = tool.outputLabel ?? "the result";

  return {
    steps: [
      `Open ${tool.name} from the grid or search.`,
      `Paste or type ${input.toLowerCase()}.`,
      `Review ${output.toLowerCase()} in the output panel — most tools update as you type.`,
      `Copy or download the result before closing the tab (nothing is saved server-side).`,
    ],
    pitfalls: [
      "Large inputs can slow older devices — split files or payloads when possible.",
      "Browser refresh clears unsaved work; copy output before navigating away.",
    ],
    expectedOutput: `${output} derived from your ${input.toLowerCase()} — format depends on tool options.`,
    comparisonSnippet: CATEGORY_COMPARISONS[tool.category],
  };
}

export function getToolCardDepth(tool: Tool): ToolCardDepth {
  const override = TOOL_CARD_DEPTH_OVERRIDES[tool.slug];
  if (override) return override;

  const base = fallbackDepth(tool);

  if (tool.category === "encoding" && !base.examplePayload) {
    return {
      ...base,
      examplePayload: "Hello, DevBench!",
      exportLabel: "Copy output",
    };
  }

  if (tool.category === "pdf") {
    return {
      ...base,
      exportLabel: "Download result",
      examplePayload: "sample-document.pdf",
    };
  }

  if (tool.outputLabel) {
    return { ...base, exportLabel: `Copy ${tool.outputLabel.toLowerCase()}` };
  }

  return base;
}
