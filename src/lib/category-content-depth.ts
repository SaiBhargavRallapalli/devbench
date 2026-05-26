// Copyright (c) 2026 DevBench contributors. MIT License.
import type { ToolCategory } from "@/lib/tools-registry";

export type FeaturedGuide = {
  slug: string;
  title: string;
  steps: string[];
};

export type CategoryUseCase = {
  title: string;
  when: string;
  toolSlugs: string[];
};

export type CategoryDepthHub = {
  useCases: CategoryUseCase[];
  quickStart: {
    checklist: string[];
    sampleInput: string;
    sampleOutput: string;
  };
  featuredGuides: FeaturedGuide[];
};

/** Shown on every filtered category view — platform capabilities and expectations. */
export const PLATFORM_CONTENT_DEPTH = {
  technical:
    "Every DevBench tool runs client-side in your browser using JavaScript. Inputs are parsed, transformed, and rendered locally — there is no upload queue, no worker farm, and no account-gated API for core utilities. JSON, PDF, encoding, and text tools load their logic with the page and execute on your device.",
  security:
    "Sensitive payloads (tokens, keys, documents, health or finance figures) never leave your machine unless you explicitly use a network feature such as the API Tester or Webhook Simulator. We do not store tool inputs on our servers. Third-party analytics may record page views and coarse device metadata only — not what you paste into a tool.",
  performance:
    "Small and medium inputs typically respond in under a second on a modern laptop. Large PDFs or multi-megabyte JSON may take several seconds because processing is single-threaded in the tab. Closing other heavy tabs frees memory. Results update as you type on most tools; very large files may require an explicit action button.",
  browsers:
    "DevBench targets current versions of Chrome, Firefox, Safari, and Edge. Chromium-based browsers generally offer the fastest PDF and crypto performance. Safari works well for JSON and text tools; some PDF features may be slower on older iOS versions. Enable JavaScript and avoid private-mode extensions that block localStorage if you want theme and shortcut preferences to persist.",
} as const;

export const CATEGORY_CONTENT_DEPTH: Partial<
  Record<ToolCategory, CategoryDepthHub>
> = {
  encoding: {
    useCases: [
      {
        title: "API debugging",
        when: "Inspect Base64 bodies, percent-encoded query strings, or hex dumps from logs.",
        toolSlugs: ["base64-decode", "url-decode", "hex-to-text"],
      },
      {
        title: "Data URIs for HTML/CSS",
        when: "Embed small icons or fonts without hosting a separate file.",
        toolSlugs: ["base64-image", "base64-encode"],
      },
      {
        title: "Cross-system text transport",
        when: "Move UTF-8 safely through systems that only accept ASCII-safe strings.",
        toolSlugs: ["base64-encode", "base64-decode", "url-encode"],
      },
    ],
    quickStart: {
      checklist: [
        "Pick encode vs decode (or URL / hex direction) from the category grid.",
        "Paste sample text or a known-good encoded string.",
        "Confirm charset — DevBench uses UTF-8 for text encoders.",
        "Copy the output; re-run with a fresh paste if the input changes.",
      ],
      sampleInput: "Hello, DevBench!",
      sampleOutput: "SGVsbG8sIERldkJlbmNoIQ==",
    },
    featuredGuides: [
      {
        slug: "base64-encode",
        title: "Base64 encode workflow",
        steps: [
          "Open Base64 Encode and paste plain text (UTF-8).",
          "The output updates live — no submit button on most encoders.",
          "Copy the single-line Base64 string for headers, config, or APIs.",
          "To reverse, use Base64 Decode with the same string.",
        ],
      },
    ],
  },
  text: {
    useCases: [
      {
        title: "Copy and content editing",
        when: "Normalize whitespace, change case, or count words before publishing.",
        toolSlugs: ["word-counter", "case-converter", "whitespace-normalizer"],
      },
      {
        title: "Config and log comparison",
        when: "Spot line-level changes between two versions of a file.",
        toolSlugs: ["text-diff", "line-sorter"],
      },
      {
        title: "Regex prototyping",
        when: "Test patterns against sample strings before adding them to code.",
        toolSlugs: ["regex-tester"],
      },
    ],
    quickStart: {
      checklist: [
        "Paste or type source text into the input area.",
        "Choose options (case mode, delimiter, flags) if the tool exposes them.",
        "Review the output panel — errors usually point to the offending line.",
        "Copy result or run a related tool (e.g. diff after normalizing whitespace).",
      ],
      sampleInput: "  hello   WORLD  ",
      sampleOutput: "hello world",
    },
    featuredGuides: [],
  },
  dev: {
    useCases: [
      {
        title: "Auth token inspection",
        when: "Decode JWT header and payload, check exp, and verify algorithm claims.",
        toolSlugs: ["jwt-debugger"],
      },
      {
        title: "HTTP integration checks",
        when: "Convert cURL to fetch, simulate signed webhooks, or test WebSocket frames.",
        toolSlugs: ["curl-to-fetch", "webhook-simulator", "websocket-tester"],
      },
      {
        title: "Scheduling and automation",
        when: "Build or explain cron expressions for deploy windows and jobs.",
        toolSlugs: ["cron-parser"],
      },
    ],
    quickStart: {
      checklist: [
        "Open the tool from Dev or search by keyword (JWT, API, cron).",
        "Paste credentials only in tools that stay local (JWT decode is client-side).",
        "For API Tester, confirm the target URL allows browser CORS or use the proxy.",
        "Export or copy results before closing the tab — nothing is saved server-side.",
      ],
      sampleInput:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
      sampleOutput: 'Header: {"alg":"HS256"} · Payload: {"sub":"1234567890"}',
    },
    featuredGuides: [
      {
        slug: "jwt-debugger",
        title: "JWT debugger step-by-step",
        steps: [
          "Paste a complete JWT (three dot-separated segments) into the input.",
          "Inspect decoded header and payload JSON — signing secret is optional for verify.",
          "Check the expiry badge; expired tokens are flagged automatically.",
          "Copy individual claims or the reformatted JSON for documentation.",
        ],
      },
    ],
  },
  json: {
    useCases: [
      {
        title: "API response cleanup",
        when: "Pretty-print noisy one-line JSON from logs or network tabs.",
        toolSlugs: ["json-formatter", "json-diff"],
      },
      {
        title: "Config format conversion",
        when: "Move between JSON, YAML, and CSV for CI or Kubernetes workflows.",
        toolSlugs: ["json-to-yaml", "yaml-to-json", "json-to-csv"],
      },
      {
        title: "Data validation",
        when: "Find syntax errors with line numbers before committing config.",
        toolSlugs: ["json-formatter", "yaml-formatter"],
      },
    ],
    quickStart: {
      checklist: [
        "Paste raw JSON — a single object, array, or NDJSON lines.",
        "Fix syntax errors highlighted in the editor first.",
        "Switch to tree or table view on /json for large documents.",
        "Minify or copy formatted output for commits or API calls.",
      ],
      sampleInput: '{"name":"DevBench","tools":3,"beta":true}',
      sampleOutput:
        '{\n  "name": "DevBench",\n  "tools": 3,\n  "beta": true\n}',
    },
    featuredGuides: [
      {
        slug: "json-formatter",
        title: "JSON Formatter workflow",
        steps: [
          "Open JSON Formatter (/json) and paste minified or messy JSON.",
          "Read the error underline if parsing fails — jump to the reported line.",
          "Use Format for readable indentation or Minify for production payloads.",
          "Optional: open tree view to collapse nested objects before copying.",
        ],
      },
    ],
  },
  pdf: {
    useCases: [
      {
        title: "Document assembly",
        when: "Combine scans or chapters into one file before sharing.",
        toolSlugs: ["merge-pdf", "split-pdf"],
      },
      {
        title: "Size and delivery",
        when: "Shrink PDFs for email or convert pages to images for slides.",
        toolSlugs: ["compress-pdf", "pdf-to-jpg"],
      },
      {
        title: "Review and markup",
        when: "Add page numbers, watermarks, or compare two versions visually.",
        toolSlugs: ["pdf-page-numbers", "watermark-pdf", "pdf-compare"],
      },
    ],
    quickStart: {
      checklist: [
        "Open the PDF hub (/pdf) or pick a single tool from the grid.",
        "Drag one or more PDF files into the drop zone (browser-only processing).",
        "Adjust tool-specific options (page range, quality, watermark text).",
        "Download the result — files are not retained after you leave the page.",
      ],
      sampleInput: "report-part1.pdf + report-part2.pdf",
      sampleOutput: "merged-report.pdf (download)",
    },
    featuredGuides: [
      {
        slug: "merge-pdf",
        title: "Merge PDFs workflow",
        steps: [
          "Go to PDF Merge or the /pdf hub and select Merge.",
          "Add files in the order you want pages to appear (drag to reorder).",
          "Click merge and wait for client-side assembly to finish.",
          "Download the combined PDF; verify page count in your viewer.",
        ],
      },
      {
        slug: "compress-pdf",
        title: "Compress PDF workflow",
        steps: [
          "Upload the source PDF — large files may take a few seconds.",
          "Choose a quality preset if offered (balance size vs readability).",
          "Run compress and compare file size in the result summary.",
          "Download the smaller PDF; keep the original if quality drops too far.",
        ],
      },
    ],
  },
};
