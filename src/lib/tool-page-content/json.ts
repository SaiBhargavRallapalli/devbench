import type { ToolPageContent } from "./_types";

export const pageContentJson: Record<string, ToolPageContent> = {
  "json-formatter": {
    title: "JSON Formatter & Validator — Free Online Tool",
    metaDescription:
      "Format, validate, and minify JSON online instantly. Syntax errors highlighted with line/column. Tree view, YAML/CSV conversion. No signup, 100% in your browser.",
    openingParagraph:
      "JSON Formatter validates and pretty-prints any JSON in real time — paste minified JSON and get a readable, indented structure with syntax errors highlighted at the exact line and column. Switch to the interactive tree view to expand and collapse nested objects and arrays, or use the toolbar to minify, convert to YAML, convert to CSV, generate TypeScript interfaces, or diff two JSON documents side by side. Nothing leaves your browser.",
  },

  "json-diff": {
    title: "JSON Diff — Compare Two JSON Objects Online",
    metaDescription:
      "Compare two JSON objects side by side with color-coded diff — added, removed, and changed keys highlighted instantly. No signup, 100% in your browser.",
    openingParagraph:
      "JSON Diff compares two JSON documents and highlights every difference — added keys in green, removed keys in red, changed values showing both old and new. Paste two JSON objects, arrays, or nested structures and see the full diff in milliseconds. Useful for comparing API responses, config versions, and database snapshots. Everything runs in your browser — no data leaves your device.",
  },

  "json-to-yaml": {
    title: "JSON to YAML Converter — Free Online Tool",
    metaDescription:
      "Convert JSON to YAML online instantly. Nested objects, arrays, and special values handled. Clean indented YAML output. No signup, 100% in your browser.",
    openingParagraph:
      "JSON to YAML converts any valid JSON — including deeply nested objects, arrays, null values, and numbers — to clean, properly indented YAML in real time. Useful for Kubernetes manifests, Docker Compose files, GitHub Actions workflows, and Ansible playbooks. Paste any JSON and the YAML output updates as you type. Runs entirely in your browser — nothing is uploaded.",
  },

  "yaml-to-json": {
    title: "YAML to JSON Converter — Free Online Tool",
    metaDescription:
      "Convert YAML to JSON online. Supports anchors, aliases, multi-document streams. Formatted or minified output. No signup, 100% in your browser.",
    openingParagraph:
      "YAML to JSON converts YAML configuration — including anchors (&), aliases (*), and multi-document streams separated by --- — to clean, valid JSON output. Choose between formatted (pretty-printed) or minified JSON. Useful for transforming Kubernetes configs, Helm values, GitHub Actions workflows, and Docker Compose files into JSON for APIs and tooling. Runs entirely in your browser.",
  },

  "yaml-formatter": {
    title: "YAML Formatter & Validator — Fix YAML Errors Online",
    metaDescription:
      "Format, validate, and auto-fix YAML online — detects tabs, bad indentation, duplicate keys, and syntax errors with exact line numbers. No signup, browser-only.",
    openingParagraph:
      "YAML Formatter validates and pretty-prints any YAML document, catching the errors that break deployments: tabs used instead of spaces, incorrect indentation levels, duplicate keys, and missing colons. Errors are reported with the exact line number and a plain-English explanation. Paste YAML from a Kubernetes manifest, CI pipeline, or Ansible playbook and get a clean, correctly formatted document in one click.",
  },

  "json-to-csv": {
    title: "JSON to CSV Converter — Free Online Tool",
    metaDescription:
      "Convert JSON arrays to CSV online with automatic header extraction. Nested objects flattened, exports for Excel and Google Sheets. No signup, 100% in your browser.",
    openingParagraph:
      "JSON to CSV converts an array of JSON objects to a comma-separated spreadsheet — column headers are extracted automatically from the object keys, and nested objects are flattened with dot-notation keys. Download the CSV for Excel, Google Sheets, or any data analysis tool, or copy it directly to the clipboard. Runs entirely in your browser — no data is uploaded.",
  },

  "csv-to-json": {
    title: "CSV to JSON Converter — Free Online Tool",
    metaDescription:
      "Convert CSV to JSON online with automatic header detection and type inference for numbers and booleans. Copy or download. No signup, 100% in your browser.",
    openingParagraph:
      "CSV to JSON reads a comma-separated file with a header row and outputs a JSON array of objects — one object per data row, with header fields as keys. Numbers and boolean values are automatically inferred. Paste CSV from Excel, Google Sheets, or a database export and get ready-to-use JSON instantly. Everything runs in your browser — nothing is uploaded.",
  },

  "json-to-typescript": {
    title: "JSON to TypeScript Interface Generator — Free Tool",
    metaDescription:
      "Generate TypeScript interfaces from JSON automatically. Handles nested objects, arrays, optional fields. Copy-ready types for React, Node.js. No signup, browser-only.",
    openingParagraph:
      "JSON to TypeScript generates type-safe interfaces from any JSON object — including nested objects, arrays, and mixed-type fields. Paste a JSON API response and get a ready-to-paste TypeScript interface matching its shape exactly. Useful when consuming REST APIs in TypeScript or React projects without writing types by hand. Runs entirely in your browser.",
  },

  "json-to-xml": {
    title: "JSON to XML Converter — Free Online Tool",
    metaDescription:
      "Convert JSON to XML online with configurable root element. Handles nested objects and arrays. Formatted output. No signup, 100% in your browser.",
    openingParagraph:
      "JSON to XML converts JSON objects and arrays to well-formed XML with configurable root element names and proper nesting. Useful for legacy system integration, SOAP service payloads, and any workflow requiring XML input from a JSON data source. Paste your JSON and copy the formatted XML output instantly. All processing happens in your browser.",
  },

  "xml-to-json": {
    title: "XML to JSON Converter — Free Online Tool",
    metaDescription:
      "Convert XML to JSON online. Parses attributes, nested elements, and CDATA sections. Formatted or minified output. No signup, 100% in your browser.",
    openingParagraph:
      "XML to JSON converts any valid XML document — including attributes, nested elements, namespaces, and CDATA sections — to clean, structured JSON. Useful for consuming legacy APIs, processing RSS/Atom feeds, and transforming SOAP responses into data modern JavaScript can work with. Paste XML and get formatted JSON in one click. Runs entirely in your browser.",
  },

  "json-to-tsv": {
    title: "JSON to TSV — Tab-Separated Spreadsheet Export",
    metaDescription:
      "Convert JSON arrays to TSV online for Excel and Sheets — tabs instead of commas. Runs in your browser with no upload.",
    openingParagraph:
      "JSON → TSV turns an array of flat JSON objects into tab-separated rows with a header line. Tabs reduce quoting friction when your cells often contain commas. Values with tabs or line breaks are quoted. Pair with TSV → JSON for round trips.",
  },

  "tsv-to-json": {
    title: "TSV to JSON — Parse Tab-Separated Values",
    metaDescription:
      "Parse TSV with header row into JSON arrays in your browser. Supports quoted cells. Free, no signup.",
    openingParagraph:
      "TSV → JSON reads a tab-separated table from your clipboard or paste buffer and emits a JSON array of objects using the first row as keys. Ideal for analytics exports and Unix-style dumps — processing stays on-device.",
  },
};
