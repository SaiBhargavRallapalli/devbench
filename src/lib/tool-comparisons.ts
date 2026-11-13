export type ComparisonFaq = { q: string; a: string };

export type ToolComparison = {
  slug: string;
  title: string;
  deck: string;
  a: { slug: string; name: string };
  b: { slug: string; name: string };
  whenA: string;
  whenB: string;
  summary: string;
  /** Opening paragraphs — rendered above the comparison table. */
  intro: string[];
  /** Side-by-side feature table. */
  table: {
    caption: string;
    headers: [string, string, string];
    rows: [string, string, string][];
  };
  /** Deep-dive sections rendered below the table. */
  sections: { h2: string; p: string[] }[];
  /** Article FAQ — also emitted as FAQPage structured data. */
  faq: ComparisonFaq[];
};

/** Comparison guides for overlapping utilities — SEO + user clarity. */
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
    intro: [
      "CSV (Comma-Separated Values) and TSV (Tab-Separated Values) solve the same problem — flattening a two-dimensional table into a single text stream — but they disagree on one crucial detail: which character separates the fields. That single choice changes how quoting works, which tools speak the format natively, and how often you will fight broken imports.",
      "Neither format is objectively better. CSV wins on ubiquity: every spreadsheet, database export, and web API on the planet emits it. TSV wins on robustness: tabs almost never appear naturally in cell values, so the escaping rules you need to memorize for CSV largely disappear.",
    ],
    table: {
      caption: "CSV and TSV compared side by side",
      headers: ["Aspect", "CSV", "TSV"],
      rows: [
        ["Field delimiter", "Comma (,)", "Tab character"],
        ["Quoting rules", 'Fields with commas, quotes, or newlines must be wrapped in double quotes; inner quotes are doubled ("")', "Rarely needed — tabs almost never occur inside cells"],
        ["File extension", ".csv", ".tsv, .tab, sometimes .txt"],
        ["Native Excel support", "Yes — double-click opens directly", "Yes, via File → Import or paste"],
        ["Typical sources", "Database exports, web APIs, CRMs, government data portals", "Unix pipelines (cut, awk), analytics dumps, R/Python data frames"],
        ["Common failure mode", "Unquoted commas shift columns", "Cells that literally contain tab characters"],
      ],
    },
    sections: [
      {
        h2: "How quoting works in CSV (and why TSV skips it)",
        p: [
          "RFC 4180 defines CSV's escaping model: if a value contains a comma, a double quote, or a line break, the entire value must be wrapped in double quotes, and any literal quote inside is escaped by doubling it. A value like Austin, Texas therefore appears as \"Austin, Texas\" in the file. Get this wrong and every column after the comma silently shifts — the classic broken-import bug.",
          "TSV sidesteps the whole mechanism. Because a tab character is vanishingly rare inside real cell values (product descriptions, names, addresses), the separator can be dropped in without quoting in almost every case. That is why data teams default to TSV for quick exports: fewer rules means fewer ways to be wrong.",
        ],
      },
      {
        h2: "When to choose CSV",
        p: [
          "Choose CSV whenever the data is leaving your immediate environment. Public datasets, bank statements, form exports, CRM downloads, and REST API responses overwhelmingly use comma separation, so accepting CSV means no conversion step at the source. If a tool only supports one plain-text table format, it supports CSV.",
          "When you do write CSV yourself, quote defensively: wrap any field containing a comma, quote, or newline, even if you think it is unnecessary. Consistent quoting costs nothing and eliminates an entire class of import bugs.",
        ],
      },
      {
        h2: "When to choose TSV",
        p: [
          "Choose TSV for internal, machine-to-machine data flows — especially anything built on Unix pipes. cut -f1-3, awk, and sort all treat tabs as the default separator, and analytics tools (pandas, R read.delim) parse tab-separated files without extra arguments.",
          "TSV is also the pragmatic choice when cells contain commas: European numbers (1.234,56), addresses, and prose all survive a tab-separated round trip untouched, while CSV demands careful quoting for exactly the same data.",
        ],
      },
      {
        h2: "Converting between them with DevBench",
        p: [
          "Paste either format into CSV → JSON or TSV → JSON and DevBench parses it entirely in your browser — no upload, no server round trip, safe for spreadsheets with personal or financial data. From JSON, use JSON → CSV or JSON → TSV to produce the reverse. Both converters handle quoted fields, embedded newlines, and header-row detection automatically.",
        ],
      },
    ],
    faq: [
      {
        q: "Is TSV just CSV with a different separator?",
        a: "Structurally yes — both are delimited text tables — but the separator choice changes escaping. CSV needs full RFC 4180 quoting for commas, quotes, and newlines inside values. TSV relies on tabs being rare inside cells, so quoting is almost never required. Swapping the delimiter without adjusting quoting rules is the most common cause of corrupted conversions.",
      },
      {
        q: "Which format should I export from my database?",
        a: "Export CSV if the file will be opened by other people or tools (Excel, government portals, CRMs) — it is the universal default. Export TSV if the file stays within a Unix/Python/R pipeline where tab separation avoids quoting bugs entirely. When unsure, CSV is the safer interoperability choice.",
      },
      {
        q: "Can DevBench convert CSV with embedded commas and quotes?",
        a: "Yes. Both CSV → JSON and TSV → JSON implement the standard quoting rules: quoted fields keep their commas, doubled quotes (\"\") become single quotes, and line breaks inside quoted cells are preserved as part of the value. Conversion runs locally in your browser.",
      },
      {
        q: "Does Excel open TSV files?",
        a: "Excel opens .tsv files correctly when you use File → Import (choosing Tab as the delimiter) or drag the file into a blank sheet with the Text Import Wizard. Double-clicking works on most modern versions, but CSV remains the format with zero friction.",
      },
    ],
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
    intro: [
      "Both tools answer the same question — what changed between two versions? — but they define \"changed\" differently. A text diff compares characters and lines exactly as they appear; a structural JSON diff parses both sides into a data model and compares the meaning, ignoring formatting entirely.",
      "That difference decides which tool gives you a signal and which gives you noise. Point a text diff at re-indented JSON and it reports every line as changed. Point a JSON diff at two files where one is not valid JSON and it cannot run at all.",
    ],
    table: {
      caption: "Text diff and JSON diff compared",
      headers: ["Aspect", "Text Diff", "JSON Diff"],
      rows: [
        ["Input", "Any text — code, prose, logs, configs", "Valid JSON objects or arrays on both sides"],
        ["Comparison model", "Exact character and line matching", "Parsed structure: keys, values, array order"],
        ["Whitespace sensitivity", "Fully sensitive — re-indentation shows as changes", "Insensitive — formatting never appears as a change"],
        ["Key order", "Order changes show as moved lines", "Order changes are ignored; only value edits count"],
        ["Output", "Classic unified diff (+ / − lines)", "Tree or path view: which key changed, added, removed"],
        ["Failure mode", "Noisy output on reformatted files", "Errors out if either side is not valid JSON"],
      ],
    },
    sections: [
      {
        h2: "What a text diff actually compares",
        p: [
          "Text diff splits both inputs into lines, finds the longest common subsequence, and marks everything else as inserted or deleted. It knows nothing about the content's meaning — a trailing space, a changed indentation width, or a reordered paragraph all count as edits. That exactness is a feature for code and prose: whitespace and line breaks are part of what you are reviewing.",
          "Use it for README edits, .env blocks, log excerpts, SQL scripts, YAML, or any file where the byte-level difference is the thing you care about. It is also the only option when one side is empty, malformed, or not text-based at all.",
        ],
      },
      {
        h2: "What a JSON diff actually compares",
        p: [
          "JSON diff parses both inputs into objects and arrays, then walks them together. A value under the same key that differs is a modification; a key present on one side only is an addition or removal; array elements are matched positionally. Re-indenting, adding a newline after a comma, or reordering object keys produces zero changes — because the data is identical.",
          "That makes it the right tool for API payloads and configuration files. When a colleague re-formats a 400-line JSON config and you need to know whether anything substantive moved, a text diff drowns you in noise while a JSON diff shows the one key that actually changed.",
        ],
      },
      {
        h2: "Choosing between the two",
        p: [
          "Ask one question: is both sides guaranteed to be valid JSON? If no, use Text Diff — it always works. If yes, decide whether formatting changes should count. Reviewing a re-serialized payload or a config edit? JSON Diff. Reviewing code, prose, or anything where whitespace is meaningful? Text Diff.",
          "A practical habit: run Text Diff first to see the raw edit, then run JSON Diff to confirm whether the data model actually changed. A large text diff that produces an empty JSON diff means someone only re-formatted the file.",
        ],
      },
      {
        h2: "Running both in DevBench",
        p: [
          "Text Diff on /tools/text-diff accepts any two text inputs and renders a unified diff with per-line highlighting. JSON Diff on /tools/json-diff parses both sides, reports added, removed, and modified paths, and flags invalid JSON before comparing. Both run entirely in your browser, so payloads with tokens or customer data never leave your machine.",
        ],
      },
    ],
    faq: [
      {
        q: "Why does my text diff show every line as changed?",
        a: "The file was probably re-formatted — different indentation, line endings (CRLF vs LF), or a trailing newline. A text diff is exact by design, so whitespace differences appear as real edits. Run a JSON diff instead if both sides are valid JSON: it ignores formatting and shows only data changes.",
      },
      {
        q: "Which diff should I use for code review?",
        a: "Text Diff. In code, indentation and line breaks are semantically meaningful (Python, Go, YAML) and reviewers need to see the exact bytes that changed. Reserve JSON Diff for comparing API responses, configuration payloads, and structured data where formatting is incidental.",
      },
      {
        q: "Can JSON Diff handle arrays?",
        a: "Yes. Arrays are compared element by element in order, so a modified element shows as a change at that index, and length differences show as added or removed items. For large arrays this is usually clearer than reading moved lines in a text diff.",
      },
      {
        q: "What happens if one input is not valid JSON?",
        a: "JSON Diff stops and reports the parse error with the position, because comparing unparsed text would produce misleading results. Switch to Text Diff for that case — it never requires valid input and will still show you what changed.",
      },
    ],
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
    intro: [
      "DevBench offers two ways to work with JSON when YAML is also in the picture: a focused converter that turns YAML into JSON in one step, and a full workspace that treats JSON as a document to inspect, validate, and transform. They share the same engine — the difference is how much ceremony you need.",
      "The standalone converter is deliberately narrow: paste, convert, copy. The workspace is a mini IDE: syntax tree, validation, formatting options, batch mode, and interop with other formats. Picking the right one is mostly a question of whether the task ends with a conversion or begins with one.",
    ],
    table: {
      caption: "Standalone converter and JSON workspace compared",
      headers: ["Aspect", "YAML → JSON converter", "JSON Formatter workspace"],
      rows: [
        ["Primary job", "One-shot YAML-to-JSON conversion", "Inspect, validate, format, and transform JSON"],
        ["Input", "YAML (also JSON → YAML in the reverse tool)", "JSON only (format, minify, validate)"],
        ["Validation", "Parse errors reported on convert", "Live JSON Schema validation with error paths"],
        ["Navigation", "Copy the result and leave", "Collapsible tree view, search, table mode"],
        ["Extra formats", "Pairs with JSON → YAML for the reverse", "NDJSON, JSON→CSV/XML/TypeScript transforms"],
        ["Best for", "CI snippets, k8s manifests, README examples", "Large documents, API payloads, repeated edits"],
      ],
    },
    sections: [
      {
        h2: "What the standalone YAML → JSON converter does",
        p: [
          "The converter takes a YAML fragment — a Kubernetes manifest, a GitHub Actions step, a docker-compose service — and produces equivalent JSON instantly. It handles nested maps, lists, multi-line strings, and the usual YAML pitfalls (anchors, document markers) with clear parse errors when the input is malformed.",
          "It is the right tool when the output is the deliverable: you need JSON for an API call, a config file, or a code snippet, and you want it without opening an editor or thinking about indentation rules. The reverse tool, JSON → YAML, handles the opposite direction with the same one-step workflow.",
        ],
      },
      {
        h2: "What the full JSON workspace adds",
        p: [
          "The JSON Formatter at /json wraps the same parser in a workspace designed for documents you live in. Beyond formatting and minifying, it offers a collapsible syntax tree for navigating thousand-line payloads, a table mode that renders arrays of objects as sortable columns, and live validation that reports the exact JSON Path where a document violates its schema.",
          "It also connects to the rest of the toolkit: batch transforms, NDJSON for line-delimited streams, conversions to CSV, XML, and TypeScript types, plus encryption helpers for JWE and encrypted tokens. If your workflow involves JSON repeatedly through the day, this is the home base.",
        ],
      },
      {
        h2: "How to choose in practice",
        p: [
          "Use the standalone converter when you have YAML in hand and want JSON out — the task is complete when you copy the result. Use the workspace when JSON is the starting point and you need to understand, verify, or reshape it before it goes anywhere.",
          "A common combined workflow: convert a YAML manifest to JSON in the converter, paste it into the workspace to validate against a schema and inspect the tree, then export the pieces you need as CSV or TypeScript. Both run client-side, so neither step ever uploads your configuration.",
        ],
      },
      {
        h2: "Client-side by design",
        p: [
          "Both tools parse and render entirely in your browser. CI tokens, internal endpoints, and customer records in a config file never touch a server — a meaningful difference from hosted converters when the YAML contains secrets. Clearing the editor or closing the tab removes the data; nothing is cached upstream.",
        ],
      },
    ],
    faq: [
      {
        q: "Is the YAML → JSON converter the same engine as the JSON workspace?",
        a: "Yes — both parse in your browser with the same standards-compliant libraries, so a document that converts cleanly will format and validate cleanly too. The converter is the focused one-step interface; the workspace is the extended editor around the same parsing core.",
      },
      {
        q: "Which tool should I use for Kubernetes manifests?",
        a: "YAML → JSON for the quick conversion when a tool or API demands JSON. If you need to verify the resulting object, inspect deeply nested fields, or transform it further, convert first and continue in the JSON workspace. Both keep the manifest local — important since cluster configs often contain credentials.",
      },
      {
        q: "Does the converter handle multi-document YAML?",
        a: "Multi-document YAML (--- separated) is converted document by document; paste one document at a time for predictable output. For anything more complex, convert to JSON and continue in the workspace, where each document can be inspected separately in the tree view.",
      },
      {
        q: "Do either of these tools upload my data?",
        a: "No. Parsing, conversion, validation, and rendering all run in your browser. Nothing is sent to DevBench servers, which makes both tools safe for internal configs, tokens, and customer data — and there is no server-side history to worry about.",
      },
    ],
  },
];
