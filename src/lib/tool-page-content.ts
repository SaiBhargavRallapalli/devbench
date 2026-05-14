export interface ToolPageContent {
  /** 60 chars max — replaces generic title in generateMetadata */
  title: string;
  /** 150–160 chars — replaces generic meta description */
  metaDescription: string;
  /** 60–80 words — displayed in the hero below the short description */
  openingParagraph: string;
}

export const TOOL_PAGE_CONTENT: Record<string, ToolPageContent> = {
  "base64-encode": {
    title: "Base64 Encoder — Free Online Tool",
    metaDescription:
      "Free online Base64 encoder. Convert text or files to Base64 with full UTF-8 support. Decode Base64 back to text instantly. No signup. Runs 100% in your browser.",
    openingParagraph:
      "Base64 Encode converts any text or binary data to Base64 format entirely in your browser — nothing is uploaded to a server. Paste text or load a file, choose between standard Base64 or URL-safe Base64URL, and get the encoded string with the byte count and size ratio in real time. Supports full UTF-8 including emoji and non-Latin scripts. Decode Base64 back to readable text in one click.",
  },

  "base64-decode": {
    title: "Base64 Decoder — Free Online Tool",
    metaDescription:
      "Decode Base64 strings back to plain text or binary instantly. Full UTF-8 support, URL-safe Base64URL input accepted. No signup. Runs 100% in your browser.",
    openingParagraph:
      "Base64 Decode reverses Base64-encoded strings back to readable text or raw binary data entirely in your browser. Paste any Base64 or Base64URL string — including those with or without padding — and the decoded output appears instantly. Useful for decoding JWT payloads, API response tokens, email attachments, and data URIs. Nothing is sent to a server.",
  },

  "regex-tester": {
    title: "Regex Tester — Test Regular Expressions Online",
    metaDescription:
      "Test regex online with live match highlighting, group captures, and substitution preview. JavaScript RegExp with all flags. No signup, 100% in your browser.",
    openingParagraph:
      "Regex Tester tests JavaScript regular expressions against any input in real time. Type your pattern, pick the flags you need (g, i, m, s, u, v), and every match is highlighted instantly with colour-coded groups, named captures, and exact index positions. Use the Substitution tab to preview replace operations, the Code tab to export snippets for JavaScript, Python, PHP, or Go, and the Pattern Library to load 30 built-in example patterns.",
  },

  "uuid-generator": {
    title: "UUID / ULID / Nano ID Generator — Free Online Tool",
    metaDescription:
      "Generate UUID v4, ULID, and Nano ID online instantly. Bulk generation, multiple formats, copy to clipboard. No signup. Runs 100% in your browser.",
    openingParagraph:
      "UUID Generator creates RFC 4122-compliant UUID v4, time-sortable ULID, and URL-safe Nano ID values in one click. Generate a single identifier or up to 1 000 in bulk, toggle between hyphenated and uppercase formats, and copy everything to the clipboard at once. All values are created using the browser's cryptographically secure random number generator — no server call is made and the IDs are never logged.",
  },

  "hash-generator": {
    title: "Hash Generator — MD5, SHA-1, SHA-256 Online",
    metaDescription:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes online. Hash any text or file instantly, compare hashes, client-side only. No signup. Runs 100% in your browser.",
    openingParagraph:
      "Hash Generator computes MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes of any text or file entirely in your browser using the Web Crypto API. Paste a string or upload a file, select the algorithm, and the hash digest appears instantly in hex or Base64 format. Use the compare field to verify a hash matches an expected value — useful for checking download integrity or comparing password hashes.",
  },

  "password-generator": {
    title: "Secure Password Generator — Free Online Tool",
    metaDescription:
      "Generate strong, random passwords with custom length, character sets, and entropy. Copy instantly. No signup. Runs 100% in your browser — passwords are never sent anywhere.",
    openingParagraph:
      "Password Generator creates cryptographically strong random passwords using your browser's secure random number generator — nothing is ever transmitted or stored. Choose the length (8–128 characters), toggle uppercase, lowercase, digits, and symbols, and exclude ambiguous characters like O, 0, I, and l. The entropy meter shows how long a brute-force attack would take to crack the generated password.",
  },

  "url-encode": {
    title: "URL Encoder — Percent-Encode URLs Online",
    metaDescription:
      "Percent-encode URLs and query strings online. Encode special characters, decode percent-encoded strings, and parse URL components. No signup, 100% in your browser.",
    openingParagraph:
      "URL Encode percent-encodes any text for safe use in URLs and query strings, converting characters like spaces, &, =, and non-ASCII to their %XX equivalents. Paste a full URL or just a query parameter value, choose between full URL encoding or component encoding, and copy the safe output instantly. Decode percent-encoded strings back to readable text with one click. Runs entirely in your browser.",
  },

  "string-inspector": {
    title: "String Inspector — Analyse Text Online",
    metaDescription:
      "Inspect any string: character count, byte length, Unicode points, line count, entropy, and invisible characters. No signup. Runs 100% in your browser.",
    openingParagraph:
      "String Inspector analyses any text and reports character count, byte length (UTF-8 / UTF-16), word count, line count, unique character count, and Shannon entropy. It lists every Unicode code point with its name, category, and script — making it easy to spot invisible characters, zero-width spaces, or mixed-script homoglyphs that could cause subtle bugs in password or URL handling.",
  },

  "json-formatter": {
    title: "JSON Formatter & Validator — Free Online Tool",
    metaDescription:
      "Format, validate, and minify JSON online instantly. Syntax errors highlighted with line/column. Tree view, YAML/CSV conversion. No signup, 100% in your browser.",
    openingParagraph:
      "JSON Formatter validates and pretty-prints any JSON in real time — paste minified JSON and get a readable, indented structure with syntax errors highlighted at the exact line and column. Switch to the interactive tree view to expand and collapse nested objects and arrays, or use the toolbar to minify, convert to YAML, convert to CSV, generate TypeScript interfaces, or diff two JSON documents side by side. Nothing leaves your browser.",
  },

  "url-decode": {
    title: "URL Decoder — Percent-Decode Online",
    metaDescription:
      "Decode percent-encoded URLs and query strings online instantly. Handles %20, %26, UTF-8 multi-byte sequences, and form-encoded + signs. No signup, 100% in your browser.",
    openingParagraph:
      "URL Decode converts percent-encoded strings back to readable text instantly — %20 becomes a space, %2F becomes a slash, multi-byte UTF-8 sequences decode to their correct Unicode characters. Paste any encoded URL, query parameter, or API response value and get the human-readable version in one click. Optionally decode + as space for HTML form data. Runs entirely in your browser with no server calls.",
  },

  "text-diff": {
    title: "Text Diff Checker — Compare Text Online",
    metaDescription:
      "Compare two text blocks side by side online. Added and deleted lines highlighted instantly using the Myers diff algorithm. No signup, 100% in your browser.",
    openingParagraph:
      "Text Diff compares two blocks of text and highlights every addition and deletion using the Myers diff algorithm — the same algorithm Git uses. Paste the original text on the left and the updated text on the right, and changes appear instantly with added lines in green and deleted lines in red. Toggle whitespace-only changes, switch between side-by-side and unified views, and copy the diff output as a standard patch.",
  },

  "html-to-jsx": {
    title: "HTML to JSX Converter — Free Online Tool",
    metaDescription:
      "Convert HTML to JSX online instantly. Handles class→className, for→htmlFor, inline styles, self-closing tags, and event attributes. No signup, 100% in your browser.",
    openingParagraph:
      "HTML to JSX converts raw HTML to React-compatible JSX automatically — renaming class to className, for to htmlFor, converting inline style strings to objects, self-closing void elements, camelCasing event attributes, and wrapping HTML comments in JSX syntax. Paste HTML from a Figma export, email template, or any web page and copy the ready-to-use JSX output directly into your React component.",
  },

  "aes-encrypt-decrypt": {
    title: "AES-256 Encrypt & Decrypt — Free Online Tool",
    metaDescription:
      "Encrypt and decrypt text with AES-256-GCM in your browser. PBKDF2 key derivation, authenticated encryption. No signup, no server — 100% client-side.",
    openingParagraph:
      "AES Encrypt encrypts and decrypts text using AES-256-GCM — the same algorithm used by TLS 1.3 and Signal — entirely in your browser via the Web Crypto API. Enter your plaintext and a password, and the tool derives a 256-bit key using PBKDF2 with 310,000 iterations and a random salt. GCM mode provides authenticated encryption, so any tampering with the ciphertext is detected on decryption. Nothing is ever sent to a server.",
  },

  "qr-code": {
    title: "QR Code Generator — Free Online Tool",
    metaDescription:
      "Generate QR codes from any text or URL online. Choose error correction level, size, and download as PNG or SVG. No signup, 100% in your browser.",
    openingParagraph:
      "QR Code Generator creates a scannable QR code from any text, URL, vCard, or Wi-Fi credentials instantly in your browser. Adjust the error correction level (L to H), output size, and foreground and background colours. Download the result as a high-resolution PNG for web use or a scalable SVG for print at any size. All processing is client-side — no data leaves your browser.",
  },

  "curl-to-fetch": {
    title: "cURL to JavaScript Fetch Converter",
    metaDescription:
      "Convert cURL commands to JavaScript fetch() calls online. Handles headers, body, auth, and common flags. No signup, 100% in your browser.",
    openingParagraph:
      "cURL to Fetch converts any cURL command — including those copied from browser DevTools — into the equivalent JavaScript fetch() call with all headers, HTTP method, request body, and authentication translated automatically. Handles -H, -d, -X, -u, and --json flags. The output works in both browser JavaScript and Node.js 18+ without any extra dependencies.",
  },

  "url-parser": {
    title: "URL Parser — Break Down URL Components Online",
    metaDescription:
      "Parse any URL into scheme, host, port, path, query parameters, and fragment. Decoded key-value table for query strings. No signup, 100% in your browser.",
    openingParagraph:
      "URL Parser breaks any URL into its labelled components — scheme, host, port, path, query string, and fragment — and displays each part in a structured table. Query parameters are listed as individual decoded key-value pairs. Useful for debugging OAuth redirect URLs, webhook endpoints, API base paths, and complex query strings that are hard to read as a single URL string.",
  },

  "base-converter": {
    title: "Number Base Converter — Decimal, Hex, Binary, Octal",
    metaDescription:
      "Convert numbers between decimal, hexadecimal, binary, and octal instantly. Two-way conversion, copy to clipboard. No signup, 100% in your browser.",
    openingParagraph:
      "Base Converter translates integers between decimal (base 10), hexadecimal (base 16), binary (base 2), and octal (base 8) with all representations updating simultaneously as you type in any field. Essential for working with memory addresses, Unix file permissions, bitwise operations, colour codes, and low-level hardware registers. Input accepts standard prefixes (0x for hex, 0b for binary) and ignores spaces between digit groups.",
  },

  "markdown-preview": {
    title: "Markdown Preview Editor — Live GFM Renderer",
    metaDescription:
      "Live side-by-side Markdown editor with GitHub Flavored Markdown rendering. Tables, task lists, code blocks, strikethrough. Copy HTML output. No signup.",
    openingParagraph:
      "Markdown Preview is a split-pane editor that renders GitHub Flavored Markdown (GFM) in real time alongside the source. Write on the left, see the rendered result on the right as you type. Supports all GFM extensions — tables, task lists, strikethrough, fenced code blocks with language tags, and auto-linked URLs. Copy the rendered HTML output for pasting into a CMS, or download the Markdown source as a .md file.",
  },

  "salary-hike-calculator": {
    title: "Salary Hike Calculator — Raise % and Monthly Difference",
    metaDescription:
      "Compare old and new salary: percent hike, total increase, and per-month difference. Annual or monthly input. Free, runs in your browser — no data stored.",
    openingParagraph:
      "Salary Hike Calculator shows the percentage change, absolute increase (or decrease), and monthly difference between your old and new package. Switch between annual and monthly figures to match how your offer letter is written. Handy for comparing counter-offers, promotion letters, and cost-of-living adjustments before you accept.",
  },

  "semver-compare": {
    title: "SemVer Comparator — Compare npm Semantic Versions Online",
    metaDescription:
      "Compare two semantic versions like npm: validate, prerelease-aware ordering, semver.diff major/minor/patch. Free browser tool — nothing uploaded.",
    openingParagraph:
      "SemVer Comparator evaluates two version strings with the same semantics as npm and Node’s semver package — including prereleases and v-prefix normalization. See whether A is older or newer than B, the numeric compare result, and whether the difference is a major, minor, or patch bump. Use it when triaging dependency upgrades, Git tags, or package.json ranges.",
  },

  "chmod-calculator": {
    title: "chmod Calculator — Octal ↔ Symbolic Permissions",
    metaDescription:
      "Convert Unix chmod octals (755, 0644) to rwx notation and back. Supports ls -l output and setuid/setgid/sticky. Runs in your browser.",
    openingParagraph:
      "chmod Calculator translates between numeric octal modes and symbolic rwx strings for user, group, and others. Paste a mode like 755 or rwxr-xr-x, or a full ls -l permission field; four-digit octals show setuid, setgid, and sticky bits. Handy for Dockerfiles, deployment scripts, and infra-as-code when you need to double-check permission masks.",
  },

  "dotenv-parser": {
    title: ".env Parser — Dotenv to JSON Online",
    metaDescription:
      "Parse .env files into JSON in the browser: KEY=value lines, export prefix, duplicate-key warnings. No upload — safe for secrets snippets.",
    openingParagraph:
      ".env Parser reads dotenv-style configuration from your clipboard: it skips comments and blank lines, strips quotes, flags duplicate keys (last wins), and emits compact JSON for all variables. Use it to validate env blocks before committing .env.example files, compare environments, or document required variables — all locally in the browser.",
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

  "log-parser": {
    title: "Log Line Parser — Plain Text to Structured JSON",
    metaDescription:
      "Parse application logs into JSON rows with timestamps and severity levels detected — ISO dates, bracket timestamps, ERROR/WARN/INFO. Browser-only.",
    openingParagraph:
      "Paste unstructured logs one line at a time; each row becomes JSON with line number, optional timestamp, optional level (ERROR, WARN, INFO, DEBUG, TRACE), and the remaining message. Useful for triage before attaching logs to tickets — nothing leaves your browser.",
  },

  "code-playground": {
    title: "Code playground — JavaScript, TypeScript, Python, Go & notebooks",
    metaDescription:
      "Free browser code playground: Monaco editor, Output and Stdin tabs, JS/TS/Node-style snippets in a sandboxed iframe, Python and notebooks via Pyodide, Go via the official Go Playground API. No signup.",
    openingParagraph:
      "The DevBench code playground is a multi-language workspace for quick experiments: switch tabs for JavaScript, TypeScript, Node-style readline samples, Python, Go, or a lightweight Jupyter-style notebook. Each mode pairs a syntax-highlighted editor with an Output tab and, where supported, a Stdin tab so you can feed line-oriented input the same way you would in a terminal. JavaScript and TypeScript execute inside a locked-down iframe with console output captured in the UI; Python and notebook code cells run through Pyodide (CPython compiled to WebAssembly) so typical stdlib and scientific packages work without a server round-trip. Go uses your browser only for editing — compile and run go through the official Go Playground HTTP API with the same network and filesystem restrictions as go.dev/play. Nothing you type is stored by DevBench for analytics beyond normal site telemetry.",
  },

  "image-to-pdf": {
    title: "Image to PDF — JPG, PNG, WebP to One PDF (Free, Browser-Only)",
    metaDescription:
      "Merge images into a single A4 PDF: reorder pages, PNG/JPEG/WebP/GIF supported. Runs entirely in your browser — nothing uploaded to DevBench.",
    openingParagraph:
      "Image to PDF turns any sequence of photos or screenshots into one print-ready document. Drop files or pick them from disk, drag to reorder pages, and download a PDF where each image fits an A4 page with margins. Raster formats decode locally; large bitmaps are scaled so embedding stays reliable — ideal for scans, invoices, and boards.",
  },

  // ── JSON tools ──────────────────────────────────────────────────────────────
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

  // ── Encoding tools ───────────────────────────────────────────────────────────
  "base64-image": {
    title: "Base64 Image Encoder/Decoder — Data URI Tool",
    metaDescription:
      "Encode images to Base64 data URIs or decode Base64 back to a viewable image. PNG, JPG, WebP, SVG supported. Instant preview. No signup, 100% client-side.",
    openingParagraph:
      "Base64 Image converts any image (PNG, JPEG, WebP, GIF, SVG) to a Base64 data URI for embedding directly in HTML, CSS, or JSON without a separate HTTP request. Paste a Base64 string to decode it back to a viewable image and download it. Useful for embedding icons in HTML emails, inlining images in CSS, and passing image data through APIs. Runs entirely in your browser — nothing is uploaded.",
  },

  "html-entity-encode": {
    title: "HTML Entity Encoder — Escape Special Characters Online",
    metaDescription:
      "Encode HTML special characters to entities — <, >, &, \", ' become &lt; &gt; &amp; &quot;. Prevents XSS. Named and numeric entities. No signup, browser-only.",
    openingParagraph:
      "HTML Entity Encode converts characters that have special meaning in HTML — <, >, &, \", and ' — to their safe entity equivalents. Use it to safely display user-generated content, prevent XSS injection, and prepare text for HTML templates. Supports both named entities (&amp;, &lt;) and numeric decimal/hex forms (&#60;, &#x3C;). Runs entirely in your browser.",
  },

  "html-entity-decode": {
    title: "HTML Entity Decoder — Decode HTML Entities Online",
    metaDescription:
      "Decode HTML entities back to plain text — &amp; &lt; &gt; &quot; &#39; and all numeric entities. For CMS content and email templates. No signup, browser-only.",
    openingParagraph:
      "HTML Entity Decode converts HTML entities — both named (&amp;, &lt;, &nbsp;) and numeric (&#60;, &#x3C;) — back to their original characters. Use it to read HTML-encoded strings from CMS databases, email templates, RSS feeds, and API responses that return HTML-escaped text. Paste encoded text and get the readable result instantly. Runs entirely in your browser.",
  },

  "text-to-hex": {
    title: "Text to Hex Converter — Free Online Tool",
    metaDescription:
      "Convert plain text to hexadecimal bytes online. Uppercase or lowercase, optional delimiters. Supports full Unicode. No signup, 100% in your browser.",
    openingParagraph:
      "Text to Hex converts any string to its hexadecimal byte representation — each character becomes its UTF-8 byte value in hex. Choose uppercase (4A) or lowercase (4a) output, add space or colon delimiters between bytes, and copy the result for network debugging, encoding analysis, or byte-level data inspection. Supports full Unicode including emoji. Runs entirely in your browser.",
  },

  "hex-to-text": {
    title: "Hex to Text Converter — Free Online Tool",
    metaDescription:
      "Convert hexadecimal bytes back to plain text online. Space-delimited and continuous hex accepted. UTF-8 decoding. No signup, 100% in your browser.",
    openingParagraph:
      "Hex to Text converts a sequence of hexadecimal bytes back to the original text string, handling both continuous (4865786f) and space-delimited (48 65 78) input formats. Paste hex output from a hex editor, network packet, or encoding tool and get the decoded UTF-8 text instantly. Useful for debugging binary protocols and reading hex dumps. Runs entirely in your browser.",
  },

  "text-to-binary": {
    title: "Text to Binary Converter — Free Online Tool",
    metaDescription:
      "Convert text to binary (0s and 1s) online. Each character becomes 8-bit UTF-8 binary. Grouped or continuous output. No signup, 100% in your browser.",
    openingParagraph:
      "Text to Binary converts any string to its binary representation — each character becomes an 8-bit binary number showing its UTF-8 byte value. Output shows space-separated groups for readability or continuous binary for compact form. Useful for understanding character encoding, visualising byte values, and CS education. Runs entirely in your browser.",
  },

  "binary-to-text": {
    title: "Binary to Text Converter — Free Online Tool",
    metaDescription:
      "Convert binary (0s and 1s) back to plain text online. Handles 8-bit groups with or without spaces. ASCII and UTF-8. No signup, 100% in your browser.",
    openingParagraph:
      "Binary to Text converts a binary string — groups of eight 0s and 1s — back to the original ASCII or UTF-8 text. Accepts binary with or without spaces between 8-bit groups. Enter binary code from a homework exercise, encoding problem, or protocol dump and see the decoded text in one click. Runs entirely in your browser with no server calls.",
  },

  "rot13": {
    title: "ROT13 Encoder/Decoder — Free Online Tool",
    metaDescription:
      "Encode or decode text with ROT13 cipher online. Letters shift 13 positions, numbers and symbols unchanged. Apply twice to decode. No signup, browser-only.",
    openingParagraph:
      "ROT13 applies the ROT13 substitution cipher — shifting every letter 13 positions in the alphabet (A→N, N→A) while leaving numbers, spaces, and punctuation unchanged. Since ROT13 is its own inverse, applying it twice returns the original text. Widely used on forums to hide spoilers, puzzle answers, and off-topic content. Type any text and the result appears instantly. Runs in your browser.",
  },

  "morse-code": {
    title: "Morse Code Translator — Text to Morse & Back",
    metaDescription:
      "Convert text to Morse code and decode Morse to text online. International Morse Code with word and letter separators. No signup, 100% in your browser.",
    openingParagraph:
      "Morse Code Translator converts any Latin text to International Morse Code (dots, dashes, and spaces) and decodes Morse back to text. Words are separated by slashes (/), letters by spaces. Paste SOS (... --- ...) or any Morse sequence to decode it, or type a message to get the Morse representation. Runs entirely in your browser with instant two-way conversion.",
  },

  // ── Text tools ───────────────────────────────────────────────────────────────
  "case-converter": {
    title: "Case Converter — camelCase, snake_case, PascalCase Online",
    metaDescription:
      "Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and Title Case instantly online. No signup, 100% in your browser.",
    openingParagraph:
      "Case Converter transforms any text between all common naming conventions — camelCase for JavaScript variables, PascalCase for class names, snake_case for Python and database columns, kebab-case for CSS and URLs, CONSTANT_CASE for environment variables, and Title Case for headings. Paste a phrase and toggle between all formats with one click. Runs entirely in your browser.",
  },

  "word-counter": {
    title: "Word Counter — Count Words, Characters & Reading Time",
    metaDescription:
      "Count words, characters, sentences, and paragraphs online. Shows reading time and speaking time estimate. Instant. No signup, 100% in your browser.",
    openingParagraph:
      "Word Counter analyses any text and reports word count, character count (with and without spaces), sentence count, paragraph count, and estimated reading time at an average 200 words per minute. Useful for checking essay length, social media character limits, SEO meta description length, and speech duration. Paste your text and all stats update in real time. Runs entirely in your browser.",
  },

  "slug-generator": {
    title: "Slug Generator — URL-Friendly Slugs Online",
    metaDescription:
      "Generate URL-friendly slugs from any text — lowercase, hyphens, accent removal, no special characters. For blog posts, product URLs, IDs. No signup, browser-only.",
    openingParagraph:
      "Slug Generator converts any text to a clean URL-friendly slug by lowercasing, replacing spaces with hyphens, removing special characters and accents, and collapsing multiple hyphens to one. Handles accented characters (é→e, ü→u) for multilingual inputs. Useful for blog post permalinks, product page URLs, database record IDs, and Git branch names. Runs entirely in your browser.",
  },

  "lorem-ipsum": {
    title: "Lorem Ipsum Generator — Placeholder Text Free",
    metaDescription:
      "Generate Lorem Ipsum placeholder text online — choose paragraphs, sentences, or words. Classic or randomised variant. Copy instantly. No signup, browser-only.",
    openingParagraph:
      "Lorem Ipsum Generator creates placeholder text for mockups, wireframes, and design prototypes in seconds. Choose how many paragraphs, sentences, or individual words you need and copy the classical Lorem Ipsum text or a randomised variant. Useful for filling UI layouts before real content is ready, testing typography, and seeding databases. Runs entirely in your browser.",
  },

  "line-sorter": {
    title: "Line Sorter — Sort, Deduplicate & Shuffle Lines Online",
    metaDescription:
      "Sort lines A–Z or Z–A, reverse order, remove duplicates, shuffle randomly, or number lines online. Instant. No signup, 100% in your browser.",
    openingParagraph:
      "Line Sorter processes any block of text line by line — sort alphabetically ascending or descending, reverse the current order, remove duplicate lines, shuffle randomly, or add sequential line numbers. Handles any plain-text list: file paths, names, keywords, CSV rows, or log lines. Paste your list and the result updates instantly. Runs entirely in your browser with no data sent anywhere.",
  },

  "find-replace": {
    title: "Find & Replace Text Online — Plain Text & Regex",
    metaDescription:
      "Find and replace text online with plain-text or regex patterns. Case-sensitive toggle, replace all or first match. Instant preview. No signup, 100% in your browser.",
    openingParagraph:
      "Find & Replace searches any text for a pattern — plain string or regular expression — and replaces matches with your substitution text. Toggle case-sensitivity, replace the first match or all occurrences, and preview the result before copying. Useful for bulk-editing config files, renaming variables in a pasted code block, and normalising text data. Runs entirely in your browser.",
  },

  "whitespace-normalizer": {
    title: "Whitespace Normalizer — Clean Up Text Online",
    metaDescription:
      "Trim trailing spaces, collapse multiple spaces, remove blank lines, and normalise line endings online. Clean up copied text instantly. No signup, browser-only.",
    openingParagraph:
      "Whitespace Normalizer cleans up messy text by trimming leading and trailing spaces from each line, collapsing multiple consecutive spaces to one, removing blank lines, and normalising Windows CRLF and mixed line endings to Unix LF. Paste text copied from PDFs, web pages, or legacy tools and get consistently formatted output in one click. Runs entirely in your browser.",
  },

  "string-reverse": {
    title: "String Reverse — Reverse Any Text Online",
    metaDescription:
      "Reverse any string online — character by character with full Unicode and emoji support. Optionally reverse line order. No signup, 100% in your browser.",
    openingParagraph:
      "String Reverse reverses any text character by character, preserving full Unicode including emoji and combined characters. Toggle between reversing characters within each line and reversing the order of lines. Useful for checking palindromes, manipulating encoded strings, and quick text experiments. Runs entirely in your browser — no data is sent to any server.",
  },

  "markdown-to-html": {
    title: "Markdown to HTML Converter — Free Online Tool",
    metaDescription:
      "Convert Markdown to HTML online with GitHub Flavored Markdown — tables, task lists, fenced code blocks. Copy the HTML output. No signup, 100% in your browser.",
    openingParagraph:
      "Markdown to HTML converts any Markdown document to HTML using GitHub Flavored Markdown (GFM) — supporting tables, task lists, fenced code blocks with language tags, strikethrough, and auto-linked URLs. Copy the raw HTML output for pasting into CMS platforms, email templates, or static site generators. Runs entirely in your browser.",
  },

  "html-to-markdown": {
    title: "HTML to Markdown Converter — Free Online Tool",
    metaDescription:
      "Convert HTML to Markdown online — headings, lists, links, bold, italic, code blocks preserved. Clean output. No signup, 100% in your browser.",
    openingParagraph:
      "HTML to Markdown converts any HTML document or fragment back to clean Markdown — preserving headings, bold, italic, inline code, fenced code blocks, ordered and unordered lists, links, images, and blockquotes. Useful for migrating content from HTML-based CMS platforms to Markdown-based documentation systems. Paste HTML and get ready-to-edit Markdown in seconds. Runs in your browser.",
  },

  "html-to-text": {
    title: "HTML to Plain Text — Strip HTML Tags Online",
    metaDescription:
      "Strip all HTML tags from any HTML document online and get clean readable plain text. Preserves paragraph breaks. No signup, 100% in your browser.",
    openingParagraph:
      "HTML to Plain Text removes all HTML tags, attributes, and comments from any HTML document, leaving only the readable text content. Block elements are converted to line breaks to preserve text flow. Useful for extracting readable content from emails, web scraping output, CMS exports, and email template HTML. Paste HTML and copy clean text in one click. Runs entirely in your browser.",
  },

  "strip-markdown": {
    title: "Strip Markdown — Remove Formatting, Get Plain Text",
    metaDescription:
      "Remove all Markdown formatting from text online — headers, bold, italic, links, code blocks, lists. Returns plain text. No signup, 100% in your browser.",
    openingParagraph:
      "Strip Markdown removes all Markdown syntax from any document — headings (#), bold (**), italic (*_), links, images, inline code, fenced code blocks, blockquotes, and list markers — leaving only the plain text content. Useful for extracting readable text from Markdown files for word count, search indexing, or tools that don't support Markdown. Runs entirely in your browser.",
  },

  "unicode-checker": {
    title: "Unicode Checker — Inspect Characters & Codepoints Online",
    metaDescription:
      "Inspect every character: Unicode codepoint, name, category, script, UTF-8 bytes, HTML entity. Detects invisible and dangerous characters. No signup, browser-only.",
    openingParagraph:
      "Unicode Checker breaks any string into individual characters and shows each one's Unicode codepoint (U+xxxx), official name, general category, script, UTF-8 byte sequence, and HTML entity. It highlights invisible characters (zero-width space, soft hyphen, directional marks), homoglyph lookalikes, and unexpected scripts — essential for security auditing and debugging encoding issues.",
  },

  // ── Dev tools ────────────────────────────────────────────────────────────────
  "html-preview": {
    title: "HTML Preview — Live Render HTML in Your Browser",
    metaDescription:
      "Render and preview HTML code live in a sandboxed iframe online. Toggle JavaScript execution. No signup, 100% in your browser — nothing uploaded.",
    openingParagraph:
      "HTML Preview renders any HTML markup in a sandboxed iframe in real time — type HTML on the left, see the rendered result on the right as you edit. Toggle JavaScript execution to test interactive scripts safely. Useful for trying out HTML snippets, previewing email templates, testing CSS, and sharing rendered output from static HTML strings. Runs entirely in your browser.",
  },

  "color-converter": {
    title: "Color Converter — HEX, RGB, HSL, HSV Online",
    metaDescription:
      "Convert colors between HEX, RGB, HSL, HSV, and CSS color names with a live preview swatch. Copy any format. No signup, 100% in your browser.",
    openingParagraph:
      "Color Converter translates any color between HEX (#4f46e5), RGB (79, 70, 229), HSL (243°, 75%, 59%), and HSV formats with a live color swatch that updates in real time. Copy the color code in whichever format your project needs — CSS custom property, Tailwind hex, or inline style value. Runs entirely in your browser with no server calls.",
  },

  "unix-timestamp": {
    title: "Unix Timestamp Converter — Epoch to Date Online",
    metaDescription:
      "Convert Unix timestamps to dates and dates to Unix timestamps online. Seconds and milliseconds. Shows local timezone. No signup, 100% in your browser.",
    openingParagraph:
      "Unix Timestamp Converter translates between Unix epoch timestamps (seconds since 1970-01-01) and human-readable dates in your local timezone. Supports both second-precision (10-digit) and millisecond-precision (13-digit) timestamps — paste a number and get the formatted date instantly, or pick a date to get its epoch value. Useful for reading database fields, log files, and API responses. Runs in your browser.",
  },

  "cron-parser": {
    title: "Cron Parser — Decode Cron Expressions Online",
    metaDescription:
      "Parse cron expressions online — plain-English description, next 10 run times, field-by-field breakdown. GitHub Actions, Kubernetes, crontab syntax. No signup.",
    openingParagraph:
      "Cron Parser decodes any 5-field cron expression into a plain-English description and shows the next 10 scheduled run times with relative timestamps. Paste a cron from a crontab, GitHub Actions schedule, or Kubernetes CronJob and understand when it runs next. Supports all standard operators: *, /, -, and comma-separated lists. Runs entirely in your browser.",
  },

  "css-minifier": {
    title: "CSS Minifier — Compress CSS Online Free",
    metaDescription:
      "Minify and compress CSS online — removes whitespace, comments, redundant semicolons. Shows size savings. Copy or download result. No signup, 100% in your browser.",
    openingParagraph:
      "CSS Minifier removes all whitespace, comments, and redundant semicolons from CSS code to produce the smallest valid stylesheet. Paste your development CSS — including media queries, custom properties, and selector chains — and copy the minified output for production. Shows the original vs minified byte size and percentage reduction. Runs entirely in your browser.",
  },

  "html-minifier": {
    title: "HTML Minifier — Compress HTML Online Free",
    metaDescription:
      "Minify HTML online — removes comments, whitespace between tags, optional attributes. Shows byte savings. Copy result. No signup, 100% in your browser.",
    openingParagraph:
      "HTML Minifier compresses HTML by removing comments, collapsing whitespace between tags, stripping optional closing tags, and removing attribute quotes where safe. Paste any HTML document and copy the minified version for faster page loads. Shows the size before and after so you can see the impact. Runs entirely in your browser — nothing is sent to a server.",
  },

  "sql-formatter": {
    title: "SQL Formatter — Pretty-Print SQL Queries Online",
    metaDescription:
      "Format and pretty-print SQL online — SELECT, INSERT, UPDATE, CREATE, and more. Consistent indentation and uppercase keywords. No signup, 100% in your browser.",
    openingParagraph:
      "SQL Formatter takes compact or hand-written SQL queries and outputs consistently indented, readable SQL with keywords in uppercase and proper line breaks after each clause. Supports SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, ALTER, and subqueries. Paste SQL from a log, ORM debug output, or migration file and get a clean, reviewable version. Runs entirely in your browser.",
  },

  "toml-to-json": {
    title: "TOML to JSON Converter — Free Online Tool",
    metaDescription:
      "Convert TOML to JSON online. Handles strings, integers, floats, booleans, datetime, arrays, tables. No signup, 100% in your browser.",
    openingParagraph:
      "TOML to JSON converts any TOML configuration file — including inline tables, array of tables, datetime values, and multi-line strings — to clean, valid JSON. Useful for transforming Cargo.toml, pyproject.toml, Hugo config, or any TOML-based configuration into JSON for tools and APIs that expect JSON input. Runs entirely in your browser.",
  },

  "curl-formatter": {
    title: "cURL Formatter — Clean Up cURL Commands Online",
    metaDescription:
      "Normalize and clean up messy cURL commands online. Proper quoting, consistent flags, multi-line output. Paste from DevTools or scripts. No signup, browser-only.",
    openingParagraph:
      "cURL Formatter takes a messy single-line cURL command — copied from browser DevTools, scripts, or documentation — and reformats it with consistent quoting, alphabetically sorted headers, and multi-line output for readability. Makes cURL commands easy to review, diff, and include in documentation. Paste any cURL and copy the clean version. Runs entirely in your browser.",
  },

  "string-escape": {
    title: "String Escape — Escape for JSON, JS, SQL & Regex Online",
    metaDescription:
      "Escape strings for JSON, JavaScript, SQL, and Regex online. Backslash, quote, control character handling. Unescape too. No signup, 100% in your browser.",
    openingParagraph:
      "String Escape converts any text to an escaped version safe for use in JSON strings, JavaScript literals, SQL queries, and regular expressions — adding backslashes before quotes, newlines, and control characters as required by each format. Toggle between escape and unescape mode. Paste a raw string and copy the escaped version ready for code. Runs in your browser.",
  },

  "mime-lookup": {
    title: "MIME Type Lookup — File Extension to Content-Type",
    metaDescription:
      "Look up MIME types by file extension — .png, .json, .pdf, .mp4 and hundreds more. Reverse lookup: enter MIME type to find extension. No signup, browser-only.",
    openingParagraph:
      "MIME Type Lookup maps file extensions to their correct Content-Type values — type .svg and get image/svg+xml, type .json and get application/json. Also supports reverse lookup: enter a MIME type to find the associated file extension. Essential for configuring web servers, setting response headers, and debugging file upload issues. Covers all IANA-registered MIME types. Runs in your browser.",
  },

  "mermaid-editor": {
    title: "Mermaid Diagram Editor — Live Preview Online",
    metaDescription:
      "Create flowcharts, sequence diagrams, ER diagrams, Gantt charts with Mermaid.js. Live preview, export SVG or PNG. No signup, 100% in your browser.",
    openingParagraph:
      "Mermaid Editor renders Mermaid.js diagrams in real time as you type — flowcharts, sequence diagrams, entity-relationship diagrams, Gantt charts, class diagrams, and state machines. Write diagram code on the left, see the rendered diagram on the right, and export as SVG (scalable) or PNG for documentation, README files, and presentations. No account needed. Runs entirely in your browser.",
  },

  "timezone-converter": {
    title: "Timezone Converter — Convert Time Across Time Zones",
    metaDescription:
      "Convert a time across 600+ IANA time zones online — DST-aware, shareable links. Schedule global meetings easily. No signup, 100% in your browser.",
    openingParagraph:
      "Timezone Converter shows what a given moment in time looks like in any combination of the world's 600+ IANA time zones, automatically accounting for Daylight Saving Time transitions. Pick a date and time, add as many zones as you need, and share the result via a URL that others can open to see the same conversion. Runs entirely in your browser.",
  },

  "websocket-tester": {
    title: "WebSocket Tester — Test ws:// and wss:// Online",
    metaDescription:
      "Open a WebSocket connection to any ws:// or wss:// endpoint online. Send messages, watch frames, export session logs. No signup, 100% in your browser.",
    openingParagraph:
      "WebSocket Tester connects to any WebSocket endpoint (ws:// or wss://) directly from your browser, letting you send text and binary messages, watch incoming frames in real time, and inspect connection events. Export the complete session log for debugging or documentation. Useful for testing WebSocket APIs, chat servers, and real-time data services. Runs in your browser.",
  },

  // ── Conversion tools ─────────────────────────────────────────────────────────
  "temperature-converter": {
    title: "Temperature Converter — Celsius, Fahrenheit, Kelvin",
    metaDescription:
      "Convert temperatures between Celsius, Fahrenheit, and Kelvin online. All three values update simultaneously as you type. No signup, 100% in your browser.",
    openingParagraph:
      "Temperature Converter translates between Celsius (°C), Fahrenheit (°F), and Kelvin (K) in all directions — type in any field and the other two update instantly. Includes a reference table of common temperatures: water boiling and freezing points, body temperature, oven settings, and absolute zero. Runs entirely in your browser.",
  },

  "byte-converter": {
    title: "Byte Converter — B, KB, MB, GB, TB, PB Online",
    metaDescription:
      "Convert between bytes, KB, MB, GB, TB, and PB online. SI (1000) and binary IEC (1024) modes. All units update simultaneously. No signup, browser-only.",
    openingParagraph:
      "Byte Converter converts data sizes between bytes (B), kilobytes (KB), megabytes (MB), gigabytes (GB), terabytes (TB), and petabytes (PB) — supporting both SI prefixes (1 KB = 1 000 bytes) and binary IEC prefixes (1 KiB = 1 024 bytes). Type in any unit and all others update simultaneously. Useful for storage planning, network bandwidth, and file size comparisons.",
  },

  "unit-converter": {
    title: "Unit Converter — Length, Weight, Area, Volume Online",
    metaDescription:
      "Convert length, weight, area, volume, and speed online. Metric and imperial, all values update simultaneously. No signup, 100% in your browser.",
    openingParagraph:
      "Unit Converter converts between metric and imperial measurements across five categories: length (mm to miles), weight (grams to pounds), area (square metres to acres), volume (litres to gallons), and speed (km/h to mph). All units in a category update simultaneously as you type in any field. Useful for cooking, construction, travel, and scientific work. Runs entirely in your browser.",
  },

  "number-to-words": {
    title: "Number to Words Converter — Free Online Tool",
    metaDescription:
      "Convert numbers to English words online — supports lakh/crore (Indian system), currency cheque format, ordinals. Up to trillions. No signup, browser-only.",
    openingParagraph:
      "Number to Words converts any number to its English word form — type 1234567 and get \"one million two hundred thirty-four thousand five hundred sixty-seven\" instantly. Supports the Indian numbering system (lakh and crore) for cheques and financial documents, currency mode for formal amounts, and ordinal output (first, second, third). Handles numbers up to the quadrillions. Runs entirely in your browser.",
  },

  "roman-numerals": {
    title: "Roman Numerals Converter — Decimal ↔ Roman Online",
    metaDescription:
      "Convert between Roman numerals and decimal numbers online. Two-way: enter 2024 or MMXXIV. Quick-reference table. No signup, 100% in your browser.",
    openingParagraph:
      "Roman Numerals Converter translates between standard decimal numbers and Roman numeral notation in both directions. Type a number (1–3999) to get the Roman numeral, or type a Roman numeral (I, V, X, L, C, D, M) to get the decimal value. Includes a quick-reference table of Roman numeral values. Runs entirely in your browser.",
  },

  "duration-converter": {
    title: "Duration Converter — Seconds to HH:MM:SS Online",
    metaDescription:
      "Convert seconds to HH:MM:SS and break durations into days, hours, minutes, seconds online. Reverse conversion too. No signup, 100% in your browser.",
    openingParagraph:
      "Duration Converter converts a number of seconds to a human-readable HH:MM:SS format and breaks it down into days, hours, minutes, and seconds. Convert in reverse — type HH:MM:SS to get total seconds. Useful for video editing, log analysis, performance profiling, and time span calculations. Runs entirely in your browser.",
  },

  "percentage-calc": {
    title: "Percentage Calculator — X% of Y & % Change Online",
    metaDescription:
      "Calculate percentages online — what is X% of Y, X is what % of Y, and % change from A to B. Instant results. No signup, 100% in your browser.",
    openingParagraph:
      "Percentage Calculator solves the three most common percentage problems: what is X% of Y (15% of 80 = 12), X is what percentage of Y, and percentage change from A to B. Useful for discounts, tax calculations, grade percentages, and financial planning. Results update in real time as you type. Runs entirely in your browser.",
  },

  "aspect-ratio": {
    title: "Aspect Ratio Calculator — Find Missing Dimensions",
    metaDescription:
      "Calculate missing width or height from an aspect ratio online. Common ratios: 16:9, 4:3, 1:1. Enter any two values. No signup, 100% in your browser.",
    openingParagraph:
      "Aspect Ratio Calculator finds the missing dimension when you know the ratio and one side. Enter a width and height to calculate the ratio, or lock a ratio (16:9, 4:3, 3:2, 1:1) and enter one dimension to get the other. Useful for video production, image resizing, CSS layout, and responsive design. Runs entirely in your browser.",
  },

  "world-clock": {
    title: "World Clock — Current Time in Major Cities Online",
    metaDescription:
      "See the current time in major cities worldwide — New York, London, Tokyo, Sydney, and more. DST-aware, live updates. No signup, 100% in your browser.",
    openingParagraph:
      "World Clock shows the current local time across major cities simultaneously — useful for scheduling international meetings, knowing when to reach colleagues in other countries, and checking service business hours. Times are DST-aware and update every second. Shows UTC offset and date for each city. Runs entirely in your browser.",
  },

  // ── Finance calculators ───────────────────────────────────────────────────────
  "simple-interest": {
    title: "Simple Interest Calculator — Free Online Tool",
    metaDescription:
      "Calculate simple interest online — enter principal, rate, and time to get interest earned and total amount. Months or years. No signup, browser-only.",
    openingParagraph:
      "Simple Interest Calculator computes interest using I = P × R × T, where P is the principal, R is the annual rate, and T is the time period. Enter values in years or months and see the interest amount and total maturity value instantly. Useful for loans, fixed deposits, bonds, and financial planning exercises. Runs entirely in your browser.",
  },

  "gst-calculator": {
    title: "GST / VAT Calculator — Add or Remove Tax Online",
    metaDescription:
      "Calculate GST or VAT online — add tax (exclusive) or extract tax from a price (inclusive). Supports Indian GST brackets 5%, 12%, 18%, 28%. No signup, browser-only.",
    openingParagraph:
      "GST/VAT Calculator computes tax amounts in both directions — add a tax rate to a base price to get the inclusive total, or extract the tax from an already-taxed price to find the original amount. Supports any rate including standard Indian GST brackets (5%, 12%, 18%, 28%). Shows the net amount, tax amount, and gross total. Runs entirely in your browser.",
  },

  "discount-calculator": {
    title: "Discount Calculator — Sale Price & Savings Online",
    metaDescription:
      "Calculate sale price from original price and discount percentage online. Shows amount saved and final price. No signup, 100% in your browser.",
    openingParagraph:
      "Discount Calculator shows the final price after applying a percentage discount and the amount saved. Enter the original price and the discount rate — useful for shopping, quoting sale prices, and quick financial estimates. Also works backwards: enter the sale price and discount to find the original price. Runs entirely in your browser.",
  },

  "tip-calculator": {
    title: "Tip Calculator — Split Bills & Calculate Tips Online",
    metaDescription:
      "Calculate tip amount and split a bill between multiple people online. Custom tip percentages, per-person total. No signup, 100% in your browser.",
    openingParagraph:
      "Tip Calculator computes the tip amount for any bill total and divides the full amount among any number of people. Enter the bill, choose a tip percentage or set a custom rate, and see the tip per person and total per person with tip included. Useful for restaurants, group dinners, and service billing. Runs entirely in your browser.",
  },

  "roi-calculator": {
    title: "ROI Calculator — Return on Investment Online",
    metaDescription:
      "Calculate ROI online — enter cost and gain to get return on investment percentage and net profit. Simple and annualised ROI. No signup, browser-only.",
    openingParagraph:
      "ROI Calculator computes the return on investment as a percentage using ROI = (Gain - Cost) / Cost × 100. Enter the initial cost and total gain to see the ROI percentage, net profit, and optionally the annualised return if you provide the investment period. Useful for comparing investments, marketing campaigns, and project valuations. Runs in your browser.",
  },

  "profit-loss-calculator": {
    title: "Profit & Loss Calculator — Margin & Markup Online",
    metaDescription:
      "Calculate profit, loss, gross margin, and markup online — enter revenue and cost to see P&L analysis. No signup, 100% in your browser.",
    openingParagraph:
      "Profit & Loss Calculator computes net profit or loss from revenue and cost inputs, and shows gross profit margin (profit as % of revenue) and markup (profit as % of cost). Useful for business planning, pricing decisions, and quick financial analysis. Enter your revenue and total costs and see the full P&L breakdown instantly. Runs entirely in your browser.",
  },

  "compound-interest": {
    title: "Compound Interest Calculator — Future Value Online",
    metaDescription:
      "Calculate compound interest online — future value with monthly, quarterly, or annual compounding. Additional contributions supported. No signup, browser-only.",
    openingParagraph:
      "Compound Interest Calculator shows the future value of an investment with compounding — accounting for principal, annual rate, compounding frequency (monthly, quarterly, semi-annual, or annual), and time period in years. See total interest earned separately from principal. Useful for savings accounts, SIPs, bonds, and loan repayment planning. Runs entirely in your browser.",
  },

  "loan-emi-calculator": {
    title: "Loan EMI Calculator — Monthly Payment & Interest",
    metaDescription:
      "Calculate loan EMI online — monthly installment, total interest payable, and amortization summary. Home, car, personal loans. No signup, browser-only.",
    openingParagraph:
      "Loan EMI Calculator computes the monthly equated installment using the standard EMI formula, then shows total interest payable over the tenure and the total amount paid. Enter principal, annual rate, and tenure in months or years. Works for home loans, car loans, personal loans, and education loans. Runs entirely in your browser.",
  },

  // ── Health tools ─────────────────────────────────────────────────────────────
  "bmi-calculator": {
    title: "BMI Calculator — Body Mass Index Online",
    metaDescription:
      "Calculate BMI from height and weight online — metric or imperial. Shows WHO category from underweight to obese. No signup, 100% in your browser.",
    openingParagraph:
      "BMI Calculator computes your Body Mass Index using BMI = weight(kg) / height²(m²) and displays the WHO category: underweight (<18.5), normal weight (18.5–24.9), overweight (25–29.9), or obese (≥30). Switch between metric (kg/cm) and imperial (lbs/inches) units. Note that BMI is a screening tool, not a diagnostic measure. Runs entirely in your browser.",
  },

  "bmr-calculator": {
    title: "BMR Calculator — Basal Metabolic Rate Online",
    metaDescription:
      "Calculate Basal Metabolic Rate (BMR) online using Mifflin-St Jeor — enter weight, height, age, and sex. Multiply by activity to get TDEE. No signup, browser-only.",
    openingParagraph:
      "BMR Calculator computes your Basal Metabolic Rate — calories burned at complete rest — using the Mifflin-St Jeor equation, the most accurate formula for healthy adults. Enter weight, height, age, and biological sex to see your daily calorie burn at rest. Multiply by an activity factor to estimate your TDEE (Total Daily Energy Expenditure). Runs in your browser.",
  },

  "calorie-calculator": {
    title: "TDEE Calculator — Total Daily Energy Expenditure",
    metaDescription:
      "Calculate TDEE from BMR × activity level online. Useful for weight loss, maintenance, and muscle gain calorie targets. No signup, 100% in your browser.",
    openingParagraph:
      "TDEE Calculator estimates your Total Daily Energy Expenditure by multiplying your Basal Metabolic Rate (Mifflin-St Jeor) by an activity multiplier — sedentary, lightly active, moderately active, very active, or extra active. The result represents the calories needed to maintain your current weight, useful for setting deficit or surplus targets. Runs entirely in your browser.",
  },

  "water-intake-calculator": {
    title: "Water Intake Calculator — Daily Hydration Goal",
    metaDescription:
      "Calculate recommended daily water intake from body weight and exercise online. Shows in litres and glasses. No signup, 100% in your browser.",
    openingParagraph:
      "Water Intake Calculator estimates your recommended daily fluid intake based on body weight (35 ml/kg) and adds extra for exercise duration. Results shown in litres and equivalent 250 ml glasses. Useful as a daily hydration reference — actual needs vary with climate, health, and diet. Runs entirely in your browser.",
  },

  "body-fat-calculator": {
    title: "Body Fat Estimator — Calculate Body Fat % Online",
    metaDescription:
      "Estimate body fat percentage from BMI, age, and sex using the Deurenberg formula online. Note: estimate only. No signup, 100% in your browser.",
    openingParagraph:
      "Body Fat Estimator approximates body fat percentage using the Deurenberg formula from BMI, age, and biological sex. Enter height, weight, age, and sex to see the estimated body fat percentage and a general fitness category. This is a statistical estimate — DEXA scan or hydrostatic weighing is more accurate. Runs entirely in your browser.",
  },

  // ── Math solvers ─────────────────────────────────────────────────────────────
  "quadratic-solver": {
    title: "Quadratic Equation Solver — ax² + bx + c = 0 Online",
    metaDescription:
      "Solve quadratic equations online — find real and complex roots of ax² + bx + c = 0. Step-by-step discriminant shown. No signup, 100% in your browser.",
    openingParagraph:
      "Quadratic Solver finds the roots of ax² + bx + c = 0 using the quadratic formula. Enter the three coefficients and the calculator shows the discriminant (b² - 4ac), nature of the roots (two real, one repeated, or two complex conjugates), and the exact root values. Useful for algebra, engineering, and physics problems. Runs entirely in your browser.",
  },

  "pythagorean-theorem": {
    title: "Pythagorean Theorem Calculator — Find Missing Side",
    metaDescription:
      "Calculate the missing side of a right triangle using Pythagorean theorem online. Enter any two sides to find the third. Full working shown. No signup, browser-only.",
    openingParagraph:
      "Pythagorean Theorem Calculator finds the missing side of a right-angled triangle — enter any two sides (a, b, or hypotenuse c) and it calculates the third using a² + b² = c². Shows the full working including squared values and the square root step. Useful for geometry, construction, trigonometry, and physics. Runs entirely in your browser.",
  },

  "gcd-lcm-calculator": {
    title: "GCD & LCM Calculator — Greatest Common Divisor Online",
    metaDescription:
      "Calculate GCD and LCM of two numbers online. Shows Euclidean algorithm steps and prime factorisation. No signup, 100% in your browser.",
    openingParagraph:
      "GCD & LCM Calculator finds the Greatest Common Divisor and Least Common Multiple for any two integers using the Euclidean algorithm. Shows the prime factorisation of each number and step-by-step working. Useful for fraction simplification, scheduling problems, and number theory exercises. Runs entirely in your browser.",
  },

  // ── Date & time tools ────────────────────────────────────────────────────────
  "age-calculator": {
    title: "Age Calculator — Exact Age from Date of Birth Online",
    metaDescription:
      "Calculate your exact age in years, months, days, and hours from your birth date online. Calendar date picker. No signup, 100% in your browser.",
    openingParagraph:
      "Age Calculator computes the exact age from a date of birth to today or any target date, broken down into years, months, days, and optionally hours. Useful for birthday countdowns, form validation, retirement planning, and passport or visa age checks. Uses a calendar-accurate algorithm accounting for leap years and varying month lengths. Runs entirely in your browser.",
  },

  "days-between-dates": {
    title: "Days Between Dates — Date Difference Calculator",
    metaDescription:
      "Calculate the number of days between two dates online. Also shows weeks, months, and years. Leap-year accurate. No signup, 100% in your browser.",
    openingParagraph:
      "Days Between Dates calculates the exact number of calendar days between any two dates using a leap-year-accurate algorithm. Results are also shown in weeks, months, and total hours. Useful for counting project deadlines, contract durations, travel planning, and date arithmetic. Pick two dates and see the difference instantly. Runs entirely in your browser.",
  },

  "countdown-calculator": {
    title: "Countdown Calculator — Time Until a Date Online",
    metaDescription:
      "Calculate time remaining until any future date online — days, hours, minutes, seconds. Live countdown. No signup, 100% in your browser.",
    openingParagraph:
      "Countdown Calculator shows exactly how much time remains until any future date and time — displayed in years, months, days, hours, minutes, and seconds with a live-updating counter. Useful for event planning, deadline tracking, product launch countdowns, and any milestone you need to visualise. Enter a target date and the countdown starts immediately. Runs entirely in your browser.",
  },

  "week-number-calculator": {
    title: "ISO Week Number Calculator — Week of Year for Any Date",
    metaDescription:
      "Find the ISO 8601 week number for any date online. Shows ISO year, week boundaries, and total weeks in year. No signup, 100% in your browser.",
    openingParagraph:
      "ISO Week Number Calculator finds the ISO 8601 week number (1–53) for any calendar date — the standard used by European businesses, international supply chains, and date APIs. Shows the ISO year (which may differ near year-end), the first and last day of the given week, and the total number of weeks in that ISO year. Runs entirely in your browser.",
  },

  "due-date-calculator": {
    title: "Due Date Calculator — Pregnancy EDD from LMP",
    metaDescription:
      "Calculate pregnancy due date (EDD) from last menstrual period (LMP) online using Naegele's rule. Shows trimester dates. No signup, 100% in your browser.",
    openingParagraph:
      "Due Date Calculator estimates the expected delivery date (EDD) by adding 280 days (40 weeks) to the first day of the last menstrual period (LMP) using Naegele's rule — the standard method used by most healthcare providers. Shows the estimated due date, current gestational week, and trimester boundaries. This is an estimate; consult a healthcare provider for medical guidance. Runs in your browser.",
  },

  // ── Dev/Design extras ────────────────────────────────────────────────────────
  "contrast-checker": {
    title: "WCAG Contrast Checker — AA & AAA Ratio Online",
    metaDescription:
      "Check foreground/background color contrast for WCAG 2.2 AA and AAA compliance. Instant pass/fail for normal and large text. Free, client-side. No signup.",
    openingParagraph:
      "Contrast Checker calculates the luminance contrast ratio between any two colors and tests against WCAG 2.2 requirements: Level AA requires 4.5:1 for normal text and 3:1 for large text (18px+ or 14px+ bold); Level AAA requires 7:1. Enter hex codes or use the color pickers, and the ratio and pass/fail badges update in real time. Essential for accessible web design. Runs in your browser.",
  },

  "gradient-generator": {
    title: "CSS Gradient Generator — Linear Gradient Builder Online",
    metaDescription:
      "Build CSS linear gradients visually online. Adjust angle, color stops, and opacity. Copy the CSS code. Live preview. No signup, 100% in your browser.",
    openingParagraph:
      "CSS Gradient Generator creates linear-gradient CSS rules with a visual editor — drag color stops, adjust angle, and preview the gradient in real time. Copy the ready-to-use CSS background property value and paste it directly into your stylesheet or Tailwind class. Supports multiple color stops with full opacity control. Runs entirely in your browser.",
  },

  "currency-converter": {
    title: "Currency Converter — Live Exchange Rates Online",
    metaDescription:
      "Convert currencies online using live ECB reference rates — USD, EUR, GBP, INR, JPY, and 30+ more. Rates updated daily. No signup, browser-only.",
    openingParagraph:
      "Currency Converter shows live exchange rates sourced from the European Central Bank reference data for over 30 major currencies including USD, EUR, GBP, INR, JPY, AUD, CAD, CHF, and CNY. Enter an amount in any currency to see the converted value. Rates are updated daily. Runs in your browser.",
  },

  // ── Image tools ───────────────────────────────────────────────────────────────
  "background-remover": {
    title: "Background Remover — AI Remove Background Free Online",
    metaDescription:
      "Remove image backgrounds with AI — runs 100% in your browser, no uploads, no API key. Supports PNG, JPG, WebP. Instant transparent PNG output. No signup.",
    openingParagraph:
      "Background Remover uses a machine learning model running entirely in your browser to detect and remove backgrounds from any photo — no file is uploaded to a server and no API key is needed. Upload a PNG, JPEG, or WebP image and get a clean transparent-background PNG in seconds. Works best on product images, portraits, and subjects with clear background separation. Free, no account required.",
  },

  "image-resizer": {
    title: "Image Resizer — Resize JPG, PNG, WebP Online Free",
    metaDescription:
      "Resize images online — set exact width and height, lock aspect ratio. Supports JPG, PNG, WebP. Instant download. No upload to server, no signup.",
    openingParagraph:
      "Image Resizer lets you set exact pixel dimensions for any JPEG, PNG, or WebP image directly in your browser. Lock the aspect ratio to scale proportionally, or set width and height independently. The resized image downloads instantly at the same file format as the input. Useful for social media sizing, thumbnail generation, and profile photo resizing. Runs entirely in your browser — no file is uploaded.",
  },

  "image-compressor": {
    title: "Image Compressor — Reduce Image File Size Online",
    metaDescription:
      "Compress JPEG and WebP images online with quality slider. Before/after file size comparison shown. No upload, no signup, 100% in your browser.",
    openingParagraph:
      "Image Compressor reduces JPEG and WebP file sizes by re-encoding at a lower quality level — a slider lets you balance quality vs file size. Shows original and compressed sizes and the percentage reduction so you can find the right trade-off. Everything runs in your browser — no file is uploaded to a server. Download the compressed image with one click.",
  },

  // ── PDF tools ─────────────────────────────────────────────────────────────────
  "merge-pdf": {
    title: "Merge PDF — Combine PDF Files Online Free",
    metaDescription:
      "Merge multiple PDF files into one online — drag to reorder, combine any number of PDFs. No upload, no signup, 100% client-side in your browser.",
    openingParagraph:
      "Merge PDF combines any number of PDF files into a single document in the order you choose — drag files to reorder them before merging. Drop your PDFs, rearrange as needed, and download the merged file in seconds. All processing happens in your browser using pdf-lib — your files are never uploaded to a server. Free, no account needed.",
  },

  "split-pdf": {
    title: "Split PDF — Extract Pages Online Free",
    metaDescription:
      "Split a PDF into individual pages online — each page saved as a separate PDF in a ZIP. No upload, no signup, 100% client-side in your browser.",
    openingParagraph:
      "Split PDF breaks a multi-page PDF into individual one-page PDF files, each packaged in a downloadable ZIP archive. Useful for extracting specific pages from contracts, reports, or scanned documents. All processing happens in your browser — your PDF is never sent to a server. Drop a PDF and download the split pages in seconds. Free, no account required.",
  },

  "organize-pdf": {
    title: "Organize PDF — Reorder Pages Online Free",
    metaDescription:
      "Reorder PDF pages online — drag pages to new positions, then download the reorganised PDF. No upload, no signup, 100% client-side in your browser.",
    openingParagraph:
      "Organize PDF lets you drag and drop pages into any order and download the reorganised document. Load a PDF, see page thumbnails, drag to reorder, and export the new PDF. Useful for fixing scanned documents with out-of-order pages and reordering report sections. All processing runs in your browser with pdf-lib — nothing is ever uploaded.",
  },

  "rotate-pdf": {
    title: "Rotate PDF Pages — Fix Orientation Online Free",
    metaDescription:
      "Rotate all PDF pages by 90°, 180°, or 270° online. Fix portrait/landscape orientation on scanned PDFs. No upload, no signup, 100% client-side.",
    openingParagraph:
      "Rotate PDF corrects page orientation — rotate all pages by 90°, 180°, or 270° clockwise to fix scanned documents uploaded upside-down or sideways. The rotation is applied to PDF metadata, so text quality is preserved. Load a PDF, choose the rotation angle, and download the corrected file. Runs entirely in your browser — nothing is uploaded.",
  },

  "compress-pdf": {
    title: "Compress PDF — Reduce PDF File Size Online",
    metaDescription:
      "Reduce PDF file size online using object stream compression. Best for digital (non-scanned) PDFs. Shows before/after size. No upload, no signup, client-side.",
    openingParagraph:
      "Compress PDF reduces the file size of digital PDFs by applying PDF object stream compression — effective for PDFs with many objects, fonts, and embedded resources. Works best on digitally-created PDFs rather than scanned images. Shows before and after file size. All processing runs in your browser with pdf-lib — your PDF is never uploaded. Free, no account needed.",
  },

  "watermark-pdf": {
    title: "Watermark PDF — Add Text Watermark Online Free",
    metaDescription:
      "Add a diagonal text watermark to all PDF pages online. Adjustable text, font size, and opacity. No upload, no signup, 100% client-side in your browser.",
    openingParagraph:
      "Watermark PDF adds a diagonal text overlay across all pages — useful for marking drafts, confidential documents, and sample files. Enter the watermark text, adjust the font size and opacity, and download the watermarked PDF instantly. All processing happens in your browser using pdf-lib — your file is never uploaded to a server. Free, no account needed.",
  },

  "pdf-page-numbers": {
    title: "Add Page Numbers to PDF — Free Online Tool",
    metaDescription:
      "Add footer page numbers to a PDF online — centered, optional 'Page X of Y' format. No upload, no signup, 100% client-side in your browser.",
    openingParagraph:
      "PDF Page Numbers stamps a page number at the bottom center of every page — choose between a simple number or the 'Page X of Y' format. Useful for reports, proposals, and academic papers that need consistent page references. All processing runs in your browser with pdf-lib — your file is never uploaded to a server. Free, no account needed.",
  },

  "pdf-page-editor": {
    title: "PDF Page Editor — Remove or Extract Pages Online",
    metaDescription:
      "Remove specific pages from a PDF or extract selected pages into a new PDF online. No upload, no signup, 100% client-side in your browser.",
    openingParagraph:
      "PDF Page Editor lets you select individual pages to remove from a PDF or extract into a new document. Load a PDF, toggle which pages to keep or remove, and download the result. Useful for trimming cover pages, removing blank pages, and extracting specific sections from large reports. All processing happens in your browser using pdf-lib — nothing is ever uploaded.",
  },

  "text-to-pdf": {
    title: "Text to PDF — Convert Plain Text to PDF Online",
    metaDescription:
      "Convert plain text to a downloadable A4 PDF online — automatic line wrapping and page breaks. No upload, no signup, 100% in your browser.",
    openingParagraph:
      "Text to PDF converts plain text into a formatted A4 PDF with automatic line wrapping and page breaks. Paste any text — notes, logs, code output, or article content — and download a clean, printable PDF in one click. Useful when you need a PDF from clipboard content without opening a word processor. All processing happens in your browser. Free, no account needed.",
  },

  "html-to-pdf": {
    title: "HTML to PDF — Convert HTML via Browser Print",
    metaDescription:
      "Preview HTML in the browser and save as PDF using your browser's built-in print dialog. No server upload, no API key. No signup, 100% in your browser.",
    openingParagraph:
      "HTML to PDF renders any HTML document in a sandboxed preview and triggers the browser's native print-to-PDF dialog — using your browser's own rendering engine for the highest fidelity. No file is uploaded to a server. Paste HTML markup, preview the result, click Generate PDF, and save from the print dialog. Works with styled HTML including CSS.",
  },

  "ipynb-to-pdf": {
    title: "Jupyter Notebook to PDF — Convert .ipynb Online Free",
    metaDescription:
      "Convert Jupyter .ipynb notebooks to PDF online — markdown, code cells, outputs, and figures preserved. No server, no LaTeX. 100% in your browser. No signup.",
    openingParagraph:
      "Jupyter Notebook to PDF converts .ipynb files to printable PDFs entirely in your browser — no server, no nbconvert, no LaTeX required. Markdown cells render as formatted HTML, code cells display with styled source boxes and output, and base64-encoded PNG figures are preserved. Preview the HTML output before printing, then click Generate PDF to save via the browser's print dialog.",
  },

  "pdf-to-jpg": {
    title: "PDF to JPG — Export PDF Pages as Images Online",
    metaDescription:
      "Export each PDF page as a JPEG image online — adjustable quality and scale, all pages in a ZIP. No signup, 100% client-side in your browser.",
    openingParagraph:
      "PDF to JPG renders each page of a PDF as a JPEG image using PDF.js and packages all images in a downloadable ZIP archive. Adjust output quality and scale factor before downloading. Useful for creating thumbnails, sharing PDF content as images, and extracting pages for presentations. All processing runs in your browser — your PDF is never uploaded.",
  },

  "pdf-compare": {
    title: "Compare PDF Files — PDF Text Diff Online",
    metaDescription:
      "Compare two PDF files online — extracts text and shows a unified diff of differences. Best for digital (non-scanned) PDFs. No upload, no signup, client-side.",
    openingParagraph:
      "PDF Compare extracts text from two PDF files and shows a colour-coded unified diff highlighting additions and deletions. Most useful for comparing contracts, policy documents, and reports that are digitally created rather than scanned. Drag in two PDFs and see the changes in seconds. All extraction and diffing happens in your browser — no files are uploaded.",
  },

  // ── XML / Image extras ───────────────────────────────────────────────────────
  "xml-suite": {
    title: "XML Tools — Validate, Format & XPath Query Online",
    metaDescription:
      "Validate XML, pretty-print, minify, and run XPath queries in one tool online. Line-numbered errors. No signup, 100% in your browser.",
    openingParagraph:
      "XML Tools Suite combines four operations in one workspace: validate well-formedness with line-numbered errors, pretty-print XML for readability, minify XML to remove whitespace, and execute XPath queries to extract specific nodes. Useful for SOAP APIs, RSS/Atom feeds, SVG files, and XML-based configuration. Runs entirely in your browser.",
  },

  "image-format-converter": {
    title: "Image Format Converter — SVG, PNG, JPG, WebP Online",
    metaDescription:
      "Convert images between SVG, PNG, JPEG, WebP, BMP, and GIF online. Quality slider, size comparison. No signup, 100% client-side in your browser.",
    openingParagraph:
      "Image Format Converter converts between SVG, PNG, JPEG, WebP, BMP, and GIF formats in your browser. Adjust JPEG/WebP quality with a slider and compare original vs converted file sizes before downloading. Useful for optimising images for the web, converting SVG exports to raster formats, and preparing images for platforms with specific format requirements. No files are uploaded.",
  },

  "svg-optimizer": {
    title: "SVG Optimizer — Clean & Minify SVG Online Free",
    metaDescription:
      "Optimize SVG files online — strip editor metadata, comments, and whitespace. Shows size reduction. Paste or upload SVG. No signup, 100% in your browser.",
    openingParagraph:
      "SVG Optimizer cleans up SVG files exported from Inkscape, Illustrator, Sketch, and Figma by removing editor metadata, comments, unused definitions, redundant attributes, and whitespace. Shows before and after byte sizes and the percentage reduction. Paste SVG code or upload an SVG file — smaller SVGs load faster and are easier to version-control. Runs entirely in your browser.",
  },

  "exif-viewer": {
    title: "EXIF Viewer — Read Camera Metadata from Photos Online",
    metaDescription:
      "Read EXIF metadata from JPEG and TIFF photos online — camera model, lens, aperture, shutter, ISO, GPS location. No upload, client-side only. No signup.",
    openingParagraph:
      "EXIF Viewer reads the embedded EXIF metadata from JPEG and TIFF photos — camera model, lens, focal length, aperture, shutter speed, ISO, exposure mode, GPS coordinates, and timestamp. Useful for checking photo provenance, reviewing geotag data, and understanding camera settings. Drop an image and all EXIF fields display instantly. Your photo stays on your device — nothing is uploaded.",
  },

  "http-status-reference": {
    title: "HTTP Status Codes Reference — Complete 1xx–5xx Guide",
    metaDescription:
      "Complete HTTP status code reference — all 1xx, 2xx, 3xx, 4xx, and 5xx codes with descriptions and when to use each. Searchable. No signup, browser-only.",
    openingParagraph:
      "HTTP Status Reference covers all standardised HTTP response codes from 100 Continue to 511 Network Authentication Required — with plain-English descriptions, common causes, and guidance on when each code should be returned. Filter by category or search by code number or keyword. Useful for API design, debugging, and documentation. Runs entirely in your browser.",
  },

  "css-box-shadow": {
    title: "CSS Box Shadow Builder — Visual Shadow Generator",
    metaDescription:
      "Build CSS box-shadow rules visually online — x/y offset, blur, spread, color sliders. Multi-layer shadows. Copy CSS. No signup, 100% in your browser.",
    openingParagraph:
      "CSS Box Shadow Builder generates box-shadow CSS rules with a visual editor — sliders for x and y offset, blur radius, spread radius, and color. Add multiple shadow layers and copy the complete box-shadow property value ready to paste into your CSS or Tailwind config. The live preview updates as you drag. Runs entirely in your browser.",
  },
};
