import type { ToolPageContent } from "./_types";

export const pageContentDev: Record<string, ToolPageContent> = {
  "code-runner": {
    title: "Multi-Language Code Runner — 30+ Languages",
    metaDescription:
      "Run C, C++, Java, Python, Rust, Go and 30+ more languages in your browser. Compile and execute code instantly with stdin support — no install.",
    openingParagraph:
      "Compile and run code in 30+ languages — C, C++, Java, Python, Rust, Go, PHP, Ruby, TypeScript and more — without installing anything. Pick a language and version, write your code, optionally feed it through standard input, and get stdout, stderr, compile errors and the exit code back instantly. Runs are rate-limited to keep the shared compiler cloud healthy.",
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

  "html-to-jsx": {
    title: "HTML to JSX Converter — Free Online Tool",
    metaDescription:
      "Convert HTML to JSX online instantly. Handles class→className, for→htmlFor, inline styles, self-closing tags, and event attributes. No signup, 100% in your browser.",
    openingParagraph:
      "HTML to JSX converts raw HTML to React-compatible JSX automatically — renaming class to className, for to htmlFor, converting inline style strings to objects, self-closing void elements, camelCasing event attributes, and wrapping HTML comments in JSX syntax. Paste HTML from a Figma export, email template, or any web page and copy the ready-to-use JSX output directly into your React component.",
  },

  "qr-code": {
    title: "QR Code Generator — Free Online Tool",
    metaDescription:
      "Generate QR codes from any text or URL online. Add a custom logo with position control, adjust size, and download as PNG. No signup, 100% in your browser.",
    openingParagraph:
      "QR Code Generator creates a scannable QR code from any text, URL, vCard, or Wi-Fi credentials instantly in your browser. Add your own logo anywhere in the code — the tool switches to high error correction and keeps the code scannable — then pick from nine logo positions and a size slider. Downloads come as a crisp 1024px PNG. All processing is client-side — no data leaves your browser.",
  },

  "speed-test": {
    title: "Internet Speed Test — Ping, Download & Upload Online",
    metaDescription:
      "Measure ping, jitter, download and upload speed against Cloudflare's nearest edge — live graph, honest ratings, no signup. Free, 100% in your browser.",
    openingParagraph:
      "Internet Speed Test measures latency, jitter, download and upload throughput against Cloudflare's public speed endpoints. Ten small pings establish latency, then six parallel download streams and three upload streams saturate the line for about ten seconds while a live graph plots throughput. The final result uses the best consecutive one-second window, so connection ramp-up never distorts the number. The nearest edge location is shown with your results, and nothing runs until you press Start.",
  },

  "down-detector": {
    title: "Down Detector — Is Jio, Swiggy, WhatsApp Down Right Now?",
    metaDescription:
      "Check if Jio, Swiggy, IRCTC, WhatsApp, Instagram, GitHub and 90+ popular sites are down. Live reachability, response time and HTTP codes — India and worldwide.",
    openingParagraph:
      "Down Detector checks whether 90+ of the most-watched services — Jio, Airtel, IRCTC, Swiggy, Zomato, Flipkart, WhatsApp, Instagram, YouTube, GitHub and the global giants — are reachable right now. Each check sends a HEAD request with a three-second timeout and reports up, degraded (5xx) or down, with the HTTP status code and response time. Filter by category or region, re-check in one click, and see results from a quick auto-check the moment the page opens. No signup, and only the status of well-known public sites is probed.",
  },

  "curl-to-fetch": {
    title: "cURL to JavaScript Fetch Converter",
    metaDescription:
      "Convert cURL commands to JavaScript fetch() calls online — headers, request body, auth and common flags handled. Free cURL to fetch converter, no signup.",
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

  "semver-compare": {
    title: "SemVer Comparator — Compare npm Semantic Versions Online",
    metaDescription:
      "Compare two semantic versions like npm: validate, prerelease-aware ordering, semver.diff major/minor/patch. Free browser tool — nothing uploaded.",
    openingParagraph:
      "SemVer Comparator evaluates two version strings with the same semantics as npm and Node's semver package — including prereleases and v-prefix normalization. See whether A is older or newer than B, the numeric compare result, and whether the difference is a major, minor, or patch bump. Use it when triaging dependency upgrades, Git tags, or package.json ranges.",
  },

  "chmod-calculator": {
    title: "chmod Calculator — Octal ↔ Symbolic Permissions",
    metaDescription:
      "Convert Unix chmod octal numbers (755, 0644) to rwx permission notation and back, with ls -l parsing plus setuid, setgid and sticky bits. Free, in-browser.",
    openingParagraph:
      "chmod Calculator translates between numeric octal modes and symbolic rwx strings for user, group, and others. Paste a mode like 755 or rwxr-xr-x, or a full ls -l permission field; four-digit octals show setuid, setgid, and sticky bits. Handy for Dockerfiles, deployment scripts, and infra-as-code when you need to double-check permission masks.",
  },

  "dotenv-parser": {
    title: ".env Parser — Dotenv to JSON Online",
    metaDescription:
      "Parse .env files into JSON in your browser — KEY=value lines, export prefixes and duplicate-key warnings. Free .env parser and validator, no upload of secrets.",
    openingParagraph:
      ".env Parser reads dotenv-style configuration from your clipboard: it skips comments and blank lines, strips quotes, flags duplicate keys (last wins), and emits compact JSON for all variables. Use it to validate env blocks before committing .env.example files, compare environments, or document required variables — all locally in the browser.",
  },

  "log-parser": {
    title: "Log Line Parser — Plain Text to Structured JSON",
    metaDescription:
      "Parse application logs into JSON rows with timestamps and severity levels detected — ISO dates, bracket timestamps, ERROR/WARN/INFO. Browser-only.",
    openingParagraph:
      "Paste unstructured logs one line at a time; each row becomes JSON with line number, optional timestamp, optional level (ERROR, WARN, INFO, DEBUG, TRACE), and the remaining message. Useful for triage before attaching logs to tickets — nothing leaves your browser.",
  },

  "code-playground": {
    title: "Code Playground — JavaScript, Python, Go & Notebooks Online",
    metaDescription:
      "Free browser code playground: Monaco editor, Output and Stdin tabs, JS/TS/Node-style snippets in a sandboxed iframe, Python and notebooks via Pyodide, Go via the official Go Playground API. No signup.",
    openingParagraph:
      "The DevBench code playground is a multi-language workspace for quick experiments: switch tabs for JavaScript, TypeScript, Node-style readline samples, Python, Go, or a lightweight Jupyter-style notebook. Each mode pairs a syntax-highlighted editor with an Output tab and, where supported, a Stdin tab so you can feed line-oriented input the same way you would in a terminal. JavaScript and TypeScript execute inside a locked-down iframe with console output captured in the UI; Python and notebook code cells run through Pyodide (CPython compiled to WebAssembly) so typical stdlib and scientific packages work without a server round-trip. Go uses your browser only for editing — compile and run go through the official Go Playground HTTP API with the same network and filesystem restrictions as go.dev/play. Nothing you type is stored by DevBench for analytics beyond normal site telemetry.",
  },

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
      "Convert TOML to JSON online — strings, integers, floats, booleans, datetimes, arrays and nested tables all handled. Free TOML to JSON converter, no signup.",
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

  "websocket-tester": {
    title: "WebSocket Tester — Test ws:// and wss:// Online",
    metaDescription:
      "Open a WebSocket connection to any ws:// or wss:// endpoint online — up to four at once. Send messages, watch frames, auto-reconnect, heartbeat, export logs. Free, in your browser.",
    openingParagraph:
      "WebSocket Tester connects to any WebSocket endpoint (ws:// or wss://) directly from your browser — up to four at once, each in its own tab with a separate frame log, composer and settings. Send text payloads (with one-click JSON format and minify), watch incoming frames arrive in real time with timestamps, directions and byte sizes, and narrow a busy stream with direction filters or a text search. Auto-reconnect retries unexpected drops with exponential backoff, an optional heartbeat keeps idle servers from timing the socket out, and the complete session log exports as plain text for bug reports. Nothing is proxied or stored — it all runs in your browser.",
  },

  "xml-suite": {
    title: "XML Tools — Validate, Format & XPath Query Online",
    metaDescription:
      "Validate XML, pretty-print and minify it, and run XPath queries in one online tool — with line-numbered error reporting. Free XML formatter, no signup.",
    openingParagraph:
      "XML Tools Suite combines four operations in one workspace: validate well-formedness with line-numbered errors, pretty-print XML for readability, minify XML to remove whitespace, and execute XPath queries to extract specific nodes. Useful for SOAP APIs, RSS/Atom feeds, SVG files, and XML-based configuration. Runs entirely in your browser.",
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

  "lambda-sandbox": {
    title: "AWS Lambda Sandbox — Test Handlers in Your Browser",
    metaDescription:
      "Run Node.js Lambda handlers against API Gateway, SQS, S3, and EventBridge events in a browser sandbox. No AWS account required for quick tests.",
    openingParagraph:
      "AWS Lambda Sandbox lets you paste a Node.js handler and invoke it against sample API Gateway, SQS, S3, or EventBridge payloads without deploying to AWS. Output and errors appear in the browser — useful for prototyping event shapes and debugging handler logic before CI. AWS SDK calls are stubbed; mock or patch them in your handler for local testing.",
  },

  "webhook-simulator": {
    title: "Webhook Payload Simulator — Sign & Verify HMAC",
    metaDescription:
      "Generate, sign and send webhook payloads to test GitHub, Stripe, Slack, Shopify or generic HMAC receivers — verify signatures locally. Free, no signup.",
    openingParagraph:
      "Webhook Payload Simulator builds realistic webhook JSON bodies with correct headers and HMAC signatures for GitHub, Stripe, Slack, Shopify, or a generic shared secret. Send test POSTs to your local endpoint or verify an incoming signature against your secret — essential for debugging webhook receivers before production traffic.",
  },

  "gitignore-generator": {
    title: "Gitignore Generator — .gitignore for 20+ Stacks",
    metaDescription:
      "Generate .gitignore files for Node, Python, Go, Rust, Java, macOS, VS Code, and more. Combine templates. Copy or download. Free, browser-only.",
    openingParagraph:
      "Gitignore Generator produces merged .gitignore files from 20+ language, framework, editor, and OS templates — Node.js, Python, Go, Rust, macOS, VS Code, JetBrains, and more. Select multiple templates, deduplicate entries, and copy or download a ready-to-commit .gitignore for your repository.",
  },

  "license-generator": {
    title: "Open Source License Generator — MIT, Apache, GPL & More",
    metaDescription:
      "Generate MIT, Apache 2.0, GPL 3.0, BSD, ISC, Unlicense and MPL 2.0 license files with your name and year — copy or download. Free online license generator.",
    openingParagraph:
      "License Generator creates standard open-source LICENSE files — MIT, Apache 2.0, GPL 3.0, BSD 2/3-Clause, ISC, Unlicense, and MPL 2.0 — with your name, organization, and copyright year filled in. Copy the text or download LICENSE for your repo. Not legal advice; review with counsel for commercial or dual-licensing needs.",
  },

  "env-validator": {
    title: ".env Validator — Catch Duplicates & Weak Secrets",
    metaDescription:
      "Validate .env files online — duplicate keys, empty values, invalid names and weak secrets, with parse-to-JSON output. Free .env checker, nothing uploaded.",
    openingParagraph:
      "Env Validator parses .env files and flags duplicate keys, empty values, invalid variable names, and weak secrets assigned to sensitive keys like PASSWORD or API_KEY. Export a clean JSON view for Docker Compose or CI. Your file stays in the browser — nothing is uploaded.",
  },

  "har-analyzer": {
    title: "HAR Performance Analyzer - Waterfall, Slow & Failed Requests",
    metaDescription:
      "Analyze a HAR file in your browser - request waterfall, slowest and failed requests, bytes by domain and type. Nothing is uploaded or replayed.",
    openingParagraph:
      "HAR Performance Analyzer reads a HAR capture exported from your browser's network panel and shows where time and bytes went: a request waterfall, the slowest and failed requests, and size by domain and type. The file is processed in your browser and is not uploaded or replayed. It does not sanitize the capture, so review it before sharing, because URLs can still contain sensitive IDs.",
  },

  "dns-lookup": {
    title: "DNS Lookup — Query A, MX, TXT, CNAME Records Online",
    metaDescription:
      "Free DNS lookup for any domain or website — query A, AAAA, MX, TXT, CNAME, NS and SOA records instantly via Cloudflare DoH. No signup needed.",
    openingParagraph:
      "DNS Lookup queries public DNS records for any domain — A, AAAA, MX, TXT, CNAME, NS, and SOA — using Cloudflare DNS-over-HTTPS. Useful for verifying mail setup, CDN cutovers, SPF/DKIM TXT records, and nameserver delegation. Results appear in a structured table with TTL values.",
  },

  "ip-info": {
    title: "IP Info Lookup — Geolocation, ISP & ASN Online",
    metaDescription:
      "Look up IP address details — geolocation, ISP, timezone, ASN and currency — or check your own public IP. Free online IP lookup and address lookup tool.",
    openingParagraph:
      "IP Info resolves any IPv4 or IPv6 address to country, region, city, ISP, timezone, ASN, and currency using ipapi.co. Click to check your own public IP or paste an address from server logs. Useful for fraud review, CDN debugging, and understanding where traffic originates.",
  },

  "npm-compare": {
    title: "npm Package Compare — Downloads, Size & License",
    metaDescription:
      "Compare up to 3 npm packages side by side — weekly downloads, bundle size, dependencies, license and last publish date from live registry data. Free to use.",
    openingParagraph:
      "npm Package Compare loads metadata from the npm registry for up to three packages — weekly download counts, approximate bundle size, dependency counts, license, and last publish date — in one table. Pick between similar libraries before adding a dependency to your project.",
  },

  "epoch": {
    title: "Unix Timestamp Converter — Epoch to Date & Live Clock",
    metaDescription:
      "Convert Unix timestamps (seconds or milliseconds) to readable dates, and back again, with timezone support and a live clock. Free online epoch converter.",
    openingParagraph:
      "Unix Timestamp Converter converts epoch seconds or milliseconds to local and UTC datetime strings, and converts dates back to epoch. A live clock shows the current Unix time. Supports millisecond precision and common timezone offsets — essential for debugging API timestamps and log lines.",
  },

  "jwt-debugger": {
    title: "JWT Debugger — Decode & Verify JSON Web Tokens",
    metaDescription:
      "Decode JWT header and payload, check expiry, and verify HMAC signatures locally — your token is never sent to a server. Free online JWT decoder and inspector.",
    openingParagraph:
      "JWT Debugger splits a JSON Web Token into header, payload, and signature — pretty-prints claims, highlights expiry, and optionally verifies HMAC signatures with your secret locally. Nothing is uploaded; ideal for OAuth, session tokens, and API debugging.",
  },

  "graph-calculator": {
    title: "Graph Calculator — Plot Functions & Matrix Math",
    metaDescription:
      "Plot and visualize math functions interactively — multi-function graphs, a scientific calculator and matrix operations, all in your browser. Free online.",
    openingParagraph:
      "Graph Calculator plots one or more functions y = f(x) with pan and zoom, evaluates expressions with a scientific calculator, and supports matrix arithmetic. Useful for homework checks, visualizing curves, and exploring how parameter changes affect a graph — all client-side.",
  },

  "linux-cheatsheet": {
    title: "Linux Cheatsheet — Searchable Command Reference",
    metaDescription:
      "Searchable Linux command reference — file operations, permissions, processes, networking, Git, Docker and Kubernetes snippets to copy. Free, works offline.",
    openingParagraph:
      "Linux Cheatsheet is a searchable reference for everyday shell commands — file operations, permissions, processes, networking, Git, Docker, and Kubernetes snippets. Filter by topic and copy commands to your terminal. Handy when you know what you need but not the exact flags.",
  },

  "date-calculator": {
    title: "Date Calculator — Add or Subtract Days, Months, Years",
    metaDescription:
      "Add or subtract years, months, weeks and days from any date with calendar-safe arithmetic. Free online date calculator with month-end edge cases handled.",
    openingParagraph:
      "Date Calculator performs calendar-safe addition and subtraction — add or subtract years, months, weeks, and days from any start date and get the resulting ISO date. Handles month-end edge cases (e.g. Jan 31 + 1 month). Pair with Days Between Dates for project planning and deadlines.",
  },

  "html-formatter": {
    title: "HTML Formatter — Beautify & Minify HTML Online",
    metaDescription:
      "Beautify and minify HTML online — pretty-print markup with 2 or 4 space indentation, collapse tags for production, side-by-side preview. Free, no signup.",
    openingParagraph:
      "HTML Formatter takes messy, single-line or minified markup and rewrites it with clean, consistent indentation you can actually read. Paste your HTML, pick 2 or 4 space indentation, and read input and output side by side with live character counts — then switch to Minify mode to collapse the whitespace back down for production. The formatter is conservative by design: content inside pre, script, style and textarea tags is passed through exactly as written, so formatting never corrupts your JavaScript, CSS or preformatted blocks. Everything runs locally in your browser.",
  },

  "meta-tag-generator": {
    title: "Meta Tag Generator — SEO Title, Description & OG Tags",
    metaDescription:
      "Generate SEO meta tags for any page — title, description, Open Graph, Twitter Card and canonical links with live length guidance. Copy-ready HTML.",
    openingParagraph:
      "Meta Tag Generator builds the complete block of HTML head tags a page needs for search engines and social sharing. Fill in your title, description, keywords, URL, share image, site name and og:type, and it emits the meta description, Open Graph tags, Twitter Card tags, canonical link and robots directive — all properly escaped and ready to paste inside your head element. Live length badges show the 60-character title and 160-character description limits Google typically displays, warning you before your snippet gets truncated in search results. Everything is generated in your browser.",
  },
};
