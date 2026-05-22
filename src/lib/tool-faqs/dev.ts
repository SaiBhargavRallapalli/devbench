import type { Faq } from "./_types";

export const faqsDev: Record<string, Faq[]> = {
  "regex-tester": [
    { q: "What regex flavour does this tool use?", a: "The tester uses JavaScript's built-in RegExp engine (ECMAScript 2022+), which supports named capturing groups, lookbehind assertions, Unicode property escapes (\\p{L}), the dotAll (s) flag, and the sticky (y) flag. It does not support PCRE-only features like \\K or recursive patterns." },
    { q: "What does the g (global) flag do?", a: "Without the g flag, a regex stops after the first match. With g, it finds all non-overlapping matches in the string. Most operations in this tester (match count, highlighting, substitution) implicitly behave as if g is set regardless of the flag selection." },
    { q: "How do I match a literal dot or other special character?", a: "Escape it with a backslash: \\. matches a literal dot (without the backslash, . matches any character except newline). Other characters that need escaping: \\ ^ $ . | ? * + ( ) [ ] { }." },
    { q: "What is a capturing group and how do I use it?", a: "Parentheses create a capturing group: (\\d{4}) captures four digits. In the substitution field, reference it as $1 (first group), $2 (second), etc. Use (?:...) for a non-capturing group when you need grouping for repetition but not the captured value." },
    { q: "What is the difference between \\d and [0-9]?", a: "In JavaScript without the u or v flag, they are equivalent for ASCII digits. With the Unicode (u) flag and Unicode property escapes, \\d still matches only ASCII 0–9, whereas \\p{Decimal_Number} matches decimal digits from all scripts. For most use cases they are interchangeable." },
  ],

  "jwt-debugger": [
    { q: "What is a JWT (JSON Web Token)?", a: "A JSON Web Token (JWT) is a compact, URL-safe token format defined in RFC 7519. It consists of three Base64url-encoded sections: header, payload, and signature. JWTs are most commonly used as bearer tokens in HTTP Authorization headers." },
    { q: "Is it safe to paste my JWT here?", a: "Yes. The DevBench JWT Debugger runs entirely in your browser using JavaScript. Your token is never sent to a server, stored, or logged." },
    { q: "What is the difference between HS256 and RS256?", a: "HS256 uses a shared symmetric secret key known by both issuer and verifier. RS256 uses an RSA key pair: the token is signed with a private key and anyone with the public key can verify it. RS256 is more common in OAuth 2.0 and OpenID Connect identity providers." },
    { q: "What does 'signature verification failed' mean?", a: "It means the secret or public key you entered does not match the key used to sign the token. The token may have been signed with a different secret, or the token has been tampered with." },
    { q: "What is the exp claim and what happens when a JWT expires?", a: "The exp (expiration time) claim is a Unix timestamp after which the token must not be accepted. When a JWT expires, the server should reject it and return a 401 Unauthorized response. The client must then obtain a new token." },
  ],

  "hash-generator": [
    { q: "What is the difference between MD5, SHA-1, and SHA-256?", a: "MD5 produces a 128-bit (32 hex character) digest and is cryptographically broken — do not use it for security. SHA-1 produces 160 bits (40 hex chars) and is also deprecated for digital signatures. SHA-256 is part of SHA-2 and remains secure — it is the standard for file integrity checks, TLS certificates, and HMAC signing in JWTs." },
    { q: "Can I use this to hash passwords?", a: "No. MD5, SHA-1, SHA-256, and SHA-512 are fast by design, which makes them easy to brute-force as password hashes. For password storage, use a slow key-derivation function designed for the purpose: bcrypt, Argon2, or scrypt. These add configurable computational cost and a built-in salt." },
    { q: "What is a hash used for in practice?", a: "Common uses: verifying file download integrity (comparing the SHA-256 hash of a downloaded file against the publisher's stated checksum), Subresource Integrity (SRI) hashes in HTML script/link tags, cache-busting by hashing file content, generating unique fingerprints for objects, and signing API requests with HMAC-SHA256." },
    { q: "How do I verify a file checksum?", a: "Click 'Upload file' in the Hash Generator, select your file, and copy the resulting hash. Compare it character-by-character (or paste it into the Compare field) against the hash the software publisher provides on their download page. If they match, the file is intact and unmodified." },
    { q: "Is my data safe to paste here?", a: "Yes. All hashing is computed using the browser's Web Crypto API (SubtleCrypto) — your text or file never leaves your device and is not sent to any server. You can confirm this by checking the Network tab in browser DevTools — no requests are made when you hash." },
  ],

  "password-generator": [
    { q: "How strong is a randomly generated password?", a: "Strength depends on length and character variety. A 16-character password drawn from uppercase, lowercase, digits, and symbols has ~98 bits of entropy — at one trillion guesses per second it would take billions of years to brute-force. The entropy bar in the generator shows this estimate live as you adjust settings." },
    { q: "Is it safe to use passwords generated here?", a: "Yes. This generator uses crypto.getRandomValues() — the browser's cryptographically secure random number generator (CSPRNG). Passwords are generated entirely in your browser and are never sent to, stored on, or logged by any server. You can verify by checking the Network tab in DevTools." },
    { q: "What is the minimum recommended password length?", a: "NIST SP 800-63B recommends at least 8 characters, but modern security guidance suggests 16+ characters for accounts that matter, and 24+ for high-value accounts. Length is the single biggest factor in password strength — a 20-character all-lowercase password is stronger than a 10-character mixed-case password." },
    { q: "Should I include symbols in my password?", a: "Yes, if the target system allows them. Adding symbols increases the character pool from 62 (alphanumeric) to 72–94 characters, adding about 0.5–0.9 extra bits of entropy per character. However, many legacy systems restrict symbols — use the character set toggles to match what the target site accepts." },
    { q: "What should I do with the generated password?", a: "Store it in a password manager (1Password, Bitwarden, Dashlane). Never store passwords in plaintext files, spreadsheets, or browser autofill beyond the password manager. Enable two-factor authentication on the account as an additional layer." },
  ],

  "curl-to-fetch": [
    { q: "How do I copy a cURL command from the browser?", a: "In Chrome, Firefox, or Edge: open DevTools → Network tab, click any request, right-click it, and choose 'Copy → Copy as cURL' (Chrome) or 'Copy as cURL (bash)' (Firefox). Paste that directly into this converter." },
    { q: "What cURL flags are supported?", a: "The converter handles the most common flags: -X (method), -H (headers), -d / --data / --data-raw (body), -u (basic auth), --json (sets Content-Type and Accept to application/json), and --compressed. Uncommon flags like --limit-rate, --retry, or --cacert are noted as unsupported comments in the output." },
    { q: "Does it handle JSON request bodies correctly?", a: "Yes. If the body is valid JSON, it is formatted as JSON.stringify(data) in the fetch call. If the Content-Type is application/x-www-form-urlencoded, the body is converted to a URLSearchParams object." },
    { q: "Can I convert to Node.js fetch or just browser fetch?", a: "The output uses the standard Fetch API which works identically in modern browsers and in Node.js 18+ (which ships with the native fetch API). For older Node.js versions, you can swap fetch() for node-fetch with no other changes." },
  ],

  "uuid-generator": [
    { q: "What is a UUID?", a: "A Universally Unique Identifier (UUID) is a 128-bit label standardised in RFC 4122. It is displayed as 32 hexadecimal digits grouped in the format 8-4-4-4-12 (e.g. 550e8400-e29b-41d4-a716-446655440000). UUIDs are used as primary keys in databases, correlation IDs in distributed systems, and anywhere a collision-resistant ID is needed." },
    { q: "What is UUID v4 and why is it the most common?", a: "UUID v4 is randomly generated — 122 bits of randomness with 6 bits reserved for the version and variant fields. It requires no coordination between generators and has a collision probability of roughly 1 in 5.3 × 10^36 per pair, making it safe to generate without a central registry." },
    { q: "Are UUIDs truly unique?", a: "For practical purposes, yes. UUID v4 has 2^122 ≈ 5.3 × 10^36 possible values. If you generated one billion UUIDs per second for 100 years, the probability of a single collision would still be less than 0.000000006%. For sequential IDs with guaranteed uniqueness, use a database auto-increment or UUID v7 (time-ordered)." },
    { q: "Is a UUID the same as a GUID?", a: "Yes. GUID (Globally Unique Identifier) is Microsoft's term for the same concept, used in COM, .NET, and Windows APIs. The format and algorithm are identical to RFC 4122 UUIDs — the names are interchangeable in practice." },
    { q: "How do I generate a UUID in JavaScript or Python?", a: "JavaScript (modern browsers and Node.js 19+): crypto.randomUUID(). Node.js (older): import { v4 as uuidv4 } from 'uuid'. Python: import uuid; uuid.uuid4(). Go: github.com/google/uuid. All these produce RFC 4122-compliant v4 UUIDs." },
  ],

  "semver-compare": [
    { q: "What is semantic versioning (SemVer)?", a: "Semantic versioning labels releases as MAJOR.MINOR.PATCH (for example 2.4.1). A MAJOR bump signals breaking changes, MINOR adds backward-compatible features, and PATCH is for backward-compatible fixes. Optional prerelease segments such as -alpha.1 or -rc.2 sort before the final release with the same MAJOR.MINOR.PATCH." },
    { q: "Does this comparator match npm and Node.js semver?", a: "Yes. The tool uses the same semver rules as the npm ecosystem: versions may use a leading v, prerelease and build metadata follow the SemVer 2.0.0 ordering rules, and loose inputs can be coerced when they clearly resemble a version (for example package tags copied from a registry)." },
    { q: "Why does 1.0.0-beta.1 sort before 1.0.0?", a: "Prerelease identifiers have lower precedence than the normal release with the same MAJOR.MINOR.PATCH. So 1.0.0-beta.1 is considered older than 1.0.0 — you should ship the stable 1.0.0 after beta testing." },
    { q: "What does semver.diff tell me?", a: "When version A is less than version B, semver.diff describes the kind of bump between them: major, minor, patch, or prerelease. If the versions are equal, there is no diff. It is useful when scanning changelog-worthy jumps between two tags or package versions." },
    { q: "Is my version string sent to a server?", a: "No. Comparison runs entirely in your browser. Paste version numbers from package.json, Git tags, or CI logs without uploading them anywhere." },
  ],

  "chmod-calculator": [
    { q: "What does chmod 755 mean?", a: "Octal chmod uses three digits for owner, group, and others. Each digit is the sum of read (4), write (2), and execute (1). 755 means the owner has read, write, and execute (4+2+1=7), while group and others have read and execute only (4+1=5). It is typical for directories and executable files on Unix servers." },
    { q: "What is the difference between 644 and 755?", a: "644 is rw-r--r--: the owner can read and write; everyone else can only read. It is standard for non-executable files. 755 is rwxr-xr-x: the owner can read, write, and execute; others can read and execute — common for scripts and directories that must be entered." },
    { q: "Can I paste ls -l permission characters?", a: "Yes. You can paste the nine permission characters (rwxr-xr-x), optionally with the leading file-type letter from ls -l (for example -rwxr-xr-x). The tool converts them to the numeric octal mode for the basic permission bits." },
    { q: "What are the fourth octal digit and special bits?", a: "A leading 4, 2, or 1 in a four-digit octal mode sets setuid, setgid, or the sticky bit on top of the usual three digits for rwx triplets. For example 4755 includes setuid. The calculator calls out those bits when you enter a four-digit octal value." },
    { q: "Does this change files on my machine?", a: "No. It only converts between representations for planning Dockerfiles, Ansible, Terraform, or shell scripts. Run chmod on your actual system or container when you are ready to apply permissions." },
  ],

  "dotenv-parser": [
    { q: "What is a .env file?", a: "A .env file lists environment variables as KEY=value lines (often one per line). Runtimes and tools such as Docker Compose, Node dotenv, or framework CLIs can load these into the process environment at startup. Keep real secrets out of version control — commit a .env.example with dummy values instead." },
    { q: "Which value wins if the same key appears twice?", a: "Typical dotenv loaders apply lines in order and later assignments override earlier ones. This parser warns about duplicate keys and keeps the last value in the JSON output to match that behaviour." },
    { q: "Are quotes and export supported?", a: "Lines may use optional export before the key. Values can be wrapped in single or double quotes; basic escape sequences inside quoted strings are unescaped in the parsed result." },
    { q: "Does this validate variable names?", a: "Assignments must look like shell-style identifiers: letters, digits, and underscores, starting with a letter or underscore. Lines that do not match KEY=value form are reported as warnings rather than silently dropped." },
    { q: "Is my .env sent to DevBench servers?", a: "No. Parsing happens entirely in your browser. Treat every online paste as sensitive anyway — avoid sharing production secrets in screenshots or chat." },
  ],

  "code-playground": [
    { q: "Where does my code run?", a: "JavaScript, TypeScript, and Node-style samples run in a sandboxed iframe in your browser with no filesystem or network access from user code. Python and notebook cells run in Pyodide (WebAssembly) in the tab. Go is sent to the official Go Playground compile API over HTTPS — the same remote sandbox used by go.dev/play — not executed on DevBench servers." },
    { q: "What is the Stdin tab for?", a: "For Python and notebooks, each line you type in Stdin is delivered to sys.stdin in order, similar to piping a file into a local interpreter. For JavaScript modes, the preamble exposes readStdinLine() for simple prompts, and the Node tab includes a small readline shim for basic patterns. Remote Go compile does not accept arbitrary stdin through this playground, so the Go Stdin tab is disabled with an explanation." },
    { q: "Can I install npm packages in the Node tab?", a: "No. The Node tab is a browser sandbox with a minimal readline-style shim for demos. There is no package manager or native Node runtime in your tab. Use a local project or CI when you need real dependencies." },
    { q: "Is Pyodide the same as my laptop Python?", a: "Pyodide bundles CPython and many wheels built for WebAssembly. Most pure-Python code and common scientific stacks work, but anything that expects native extensions not shipped with Pyodide may fail. Treat it as a faithful but not identical environment." },
    { q: "Does DevBench store my snippets?", a: "The playground does not upload your JavaScript, TypeScript, or Python source to DevBench for execution. Go compile requests go to Google's playground endpoint with the usual upstream policies. Do not paste secrets into any online editor — use local tools for credentials." },
  ],

  "html-preview": [
    { q: "Is JavaScript execution sandboxed?", a: "Yes. The HTML preview renders inside a sandboxed iframe with the sandbox attribute. JavaScript can be toggled on or off. When enabled, the sandbox allows scripts but restricts access to top-level navigation, popups, form submission, and clipboard access. Your browser's same-origin policy also prevents the iframe from accessing the parent page." },
    { q: "Can I preview HTML with external CSS or JavaScript?", a: "Yes. Include <link> or <script src> tags with absolute URLs in your HTML and they will load inside the preview iframe (subject to CORS and CSP policies). For external stylesheets, use the full https:// URL." },
    { q: "Why does my HTML preview look different from a real browser?", a: "The preview iframe inherits some base styles from the DevBench page. To get an accurate representation, include your own CSS reset or base styles inside the HTML you preview." },
    { q: "Is my HTML safe here?", a: "Yes. The preview renders inside a sandboxed iframe in your browser. Nothing is sent to a server." },
  ],

  "color-converter": [
    { q: "What is the difference between HEX, RGB, and HSL?", a: "HEX (#4f46e5) is a compact hexadecimal notation used in CSS and design tools. RGB (79, 70, 229) specifies red, green, and blue channel values (0–255). HSL (243°, 75%, 59%) specifies hue (angle on colour wheel), saturation (vibrance), and lightness — more intuitive for human colour adjustment." },
    { q: "What is HSV and how does it differ from HSL?", a: "HSV (Hue, Saturation, Value) and HSL (Hue, Saturation, Lightness) represent the same colours differently. In HSV, Value is the brightness of the colour (0 = black, 100 = pure colour). In HSL, Lightness 50% is the pure colour, 100% is white. HSV is used in many image editors; HSL is used in CSS." },
    { q: "How do I find the HEX code for a colour from a design file?", a: "In Figma: select the shape/text, click the colour in the Fill panel, and copy the hex value. In Sketch: click the colour swatch and copy from the colour picker. In Photoshop: double-click the foreground/background colour swatch." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "css-minifier": [
    { q: "What does CSS minification remove?", a: "Minification removes whitespace (spaces, tabs, newlines), comments (/* ... */), and unnecessary semicolons before closing braces. It may also perform minor optimisations like converting colour names to shorter hex equivalents and removing redundant units from zero values (0px → 0)." },
    { q: "Will minified CSS work exactly the same as the original?", a: "Yes. Whitespace and comments are not part of the CSS specification's parsed values. Removing them produces semantically identical CSS. However, if you rely on source maps for browser DevTools debugging, add them before deploying minified CSS." },
    { q: "How much size reduction can I expect?", a: "Typical reduction is 20–40% depending on how much whitespace and comments are in the source. Production frameworks (webpack, Vite, esbuild) apply more aggressive optimisations including dead code elimination, which can achieve higher reductions." },
    { q: "Should I minify CSS for every project?", a: "For production websites, yes. Minified CSS reduces payload size, which improves page load time and Core Web Vitals scores. For development, use the readable source file and let your build tool handle minification." },
    { q: "Is my CSS safe here?", a: "Yes. Minification runs in your browser. Nothing is sent to a server." },
  ],

  "html-minifier": [
    { q: "What does HTML minification remove?", a: "Whitespace between tags, HTML comments, optional closing tags (e.g. </li>), default attribute values (type='text' on inputs), and quote marks around attribute values where they are not required by the spec." },
    { q: "Can minifying HTML break my page?", a: "Aggressive minification can break pages in rare cases: whitespace between inline elements (spaces between words in <span> siblings) may collapse; pre-formatted content inside <pre> tags may be affected. Use the conservative settings unless you have tested the output." },
    { q: "Does HTML minification improve SEO?", a: "Indirectly. Smaller HTML reduces Time to First Byte (TTFB) and page load time, which are ranking factors. Google's PageSpeed Insights recommends minifying HTML as a 'Reduce unused code' improvement." },
    { q: "Is my HTML safe here?", a: "Yes. Minification runs in your browser. Nothing is sent to a server." },
  ],

  "sql-formatter": [
    { q: "What SQL dialects are supported?", a: "The formatter handles standard SQL syntax including SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, ALTER TABLE, DROP, and subqueries. It works with most dialects (PostgreSQL, MySQL, SQLite, SQL Server, Oracle) because it formats based on keyword recognition rather than dialect-specific parsing." },
    { q: "Why does my formatted SQL look different from what I expected?", a: "The formatter applies consistent conventions: keywords in uppercase, each clause on a new line, JOIN conditions on separate lines. If your SQL uses non-standard syntax or vendor-specific extensions, some clauses may not be recognised and will be left as-is." },
    { q: "Should I use the formatted SQL in production?", a: "Yes — formatted SQL is functionally identical to its minified form. The whitespace is ignored by the database engine. Use formatted SQL for readability in source code, code reviews, and documentation." },
    { q: "Is my SQL safe here?", a: "Yes. Formatting runs in your browser. Nothing is sent to a server." },
  ],

  "toml-to-json": [
    { q: "What is TOML used for?", a: "TOML (Tom's Obvious Minimal Language) is a configuration file format used in Rust projects (Cargo.toml), Python packaging (pyproject.toml), Hugo static sites, and several other ecosystems. It is designed to be unambiguous and easy to parse into a hash table." },
    { q: "How does TOML handle dates and times?", a: "TOML has first-class date/time types: full datetime (2024-05-07T09:00:00Z), local datetime (without timezone), local date (2024-05-07), and local time (09:00:00). When converting to JSON, these are serialised as ISO 8601 strings since JSON has no native datetime type." },
    { q: "What is an array of tables in TOML?", a: "[[table]] syntax creates an array of tables — equivalent to a JSON array of objects. [[products]] followed by name = 'Widget' and [[products]] followed by name = 'Gadget' converts to {products: [{name:'Widget'}, {name:'Gadget'}]}." },
    { q: "Is my TOML data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "curl-formatter": [
    { q: "When do cURL commands become messy?", a: "cURL commands copied from browser DevTools ('Copy as cURL') are often single-line with inconsistent quoting, unordered headers, and shell-specific escaping. After passing through Slack, email, or documentation they accumulate extra characters. The formatter normalises all of this." },
    { q: "What does the formatter change?", a: "It standardises: single quotes around header and data values, alphabetical header ordering, multi-line output with \\ continuation for readability, consistent use of --header instead of -H, and consistent --data instead of -d. No semantic changes are made." },
    { q: "Can I use the output directly in a script?", a: "Yes. The formatted cURL uses standard bash escaping and long-form flags (--header, --request) which are more readable in scripts. Copy the output and paste into a shell script or documentation." },
    { q: "Is my cURL data safe here?", a: "Yes. Formatting runs in your browser. Nothing is sent to a server." },
  ],

  "string-escape": [
    { q: "When do I need to escape a string for JSON?", a: "Any time you embed a string value in JSON that contains double quotes, backslashes, or control characters (newline \\n, tab \\t, carriage return \\r). Forgetting to escape these causes invalid JSON. JSON.stringify(value) in JavaScript handles this automatically." },
    { q: "What characters need escaping in SQL?", a: "Single quotes in SQL string literals must be escaped by doubling them ('O''Brien') or using the escape character. Backslashes need escaping in MySQL (\\\\). Parameterised queries (prepared statements) handle escaping automatically and are the correct approach — manual string escaping is error-prone and risks SQL injection." },
    { q: "Why does escaping for regex differ from JSON?", a: "Regex metacharacters (. * + ? ^ $ | ( ) [ ] { } \\) must be escaped with a backslash when you want a literal match. This is independent of the string escaping of the surrounding language — in JavaScript you may need double-escaping: var re = /\\d+/ vs new RegExp('\\\\d+')." },
    { q: "Is my data safe here?", a: "Yes. Processing runs in your browser. Nothing is sent to a server." },
  ],

  "html-to-jsx": [
    { q: "What HTML attributes are renamed in JSX?", a: "class becomes className, for becomes htmlFor, tabindex becomes tabIndex, and all event handlers use camelCase: onclick becomes onClick, onchange becomes onChange. Aria attributes remain hyphenated: aria-label, aria-hidden." },
    { q: "How are inline styles converted?", a: "HTML inline style strings (style='color: red; font-size: 14px') are converted to JSX style objects ({color: 'red', fontSize: '14px'}). CSS property names become camelCase and string values are quoted." },
    { q: "What are void elements and how are they handled?", a: "HTML void elements (br, hr, img, input, meta, link) do not have closing tags in HTML but must be self-closed in JSX: <br /> instead of <br>. The converter adds the self-closing slash automatically." },
    { q: "Are HTML comments supported in JSX?", a: "HTML comments (<!-- -->) are not valid JSX. The converter wraps them in JSX comment syntax: {/* comment */}. React strips these from the DOM output." },
    { q: "Is my HTML safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "qr-code": [
    { q: "What content can I encode in a QR code?", a: "Any text string: URLs (most common), plain text, contact cards (vCard), Wi-Fi credentials (WIFI:T:WPA;S:ssid;P:password;;), email addresses (mailto:), phone numbers (tel:), and SMS links (smsto:). The QR standard supports up to 4296 alphanumeric characters." },
    { q: "What is error correction level?", a: "QR codes include redundancy data so damaged or partially obscured codes can still be scanned. Level L corrects up to 7% damage (smallest QR size), M corrects 15%, Q corrects 25%, and H corrects 30% (largest QR, recommended if printing on a textured surface or adding a logo overlay)." },
    { q: "What size should I use when printing a QR code?", a: "Minimum reliable print size is about 2 cm × 2 cm (about 0.8 in × 0.8 in) for a standard code at level L. Larger codes with high error correction level can be printed larger. For outdoor signage, use at least 10 cm × 10 cm. Download as SVG for print — it scales without pixelation." },
    { q: "Is my QR code data safe here?", a: "Yes. QR code generation runs in your browser. Nothing is sent to a server." },
  ],

  "url-parser": [
    { q: "What parts is a URL broken into?", a: "A URL has: scheme (https), authority (user:password@host:port), path (/api/v1/users), query string (?id=5&format=json), and fragment (#section). The parser labels each component and decodes query parameters into individual key-value pairs." },
    { q: "Why are query parameters percent-encoded?", a: "URL query parameters can only contain a limited set of ASCII characters. Special characters (spaces, &, =, +, non-ASCII) must be percent-encoded to avoid ambiguity. Spaces become %20 (or + in form data), & becomes %26." },
    { q: "What is the fragment (#) used for?", a: "The fragment identifies a secondary resource within the page — typically a scroll-to-anchor target in HTML or a client-side route in single-page apps. The fragment is never sent to the server; it is processed entirely by the browser." },
    { q: "Is my URL safe here?", a: "Yes. Parsing runs in your browser. Nothing is sent to a server." },
  ],

  "base-converter": [
    { q: "What is the difference between binary, octal, decimal, and hexadecimal?", a: "These are number bases (radixes). Decimal (base 10) uses digits 0–9. Binary (base 2) uses 0 and 1 — each digit is a bit. Octal (base 8) uses 0–7. Hexadecimal (base 16) uses 0–9 and A–F. The number 255 in decimal is 11111111 in binary, 377 in octal, and FF in hexadecimal." },
    { q: "Why is hexadecimal used in programming?", a: "Hex maps cleanly onto binary — one hex digit represents exactly 4 bits (a nibble), and two hex digits represent one byte (8 bits). This makes memory addresses, colour codes (RGB), file headers, and bitwise masks much easier to read than their binary equivalents." },
    { q: "What does chmod 755 mean in binary?", a: "In octal, 755 = 111 101 101 in binary, which maps to rwxr-xr-x permissions (owner: read+write+execute, group: read+execute, others: read+execute). The chmod Calculator on DevBench converts between octal, binary, and symbolic representations." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "log-parser": [
    { q: "What log formats are recognised?", a: "The parser detects common timestamp formats (ISO 8601 like 2024-05-07T09:00:00Z, Apache/Nginx-style [07/May/2024:09:00:00 +0000], and Unix epoch timestamps), severity levels (ERROR, WARN, WARNING, INFO, DEBUG, TRACE), and the remaining text as the message field." },
    { q: "What is the output JSON structure?", a: "Each line becomes a JSON object with fields: line (line number), timestamp (if detected, as ISO string), level (severity level if present), and message (the remaining text). Lines without detectable timestamps or levels still produce a JSON object with just line and message." },
    { q: "Can I use this with structured JSON logs?", a: "If your logs are already NDJSON (one JSON object per line), they do not need parsing — use the JSON Formatter or jq directly. This tool is designed for unstructured plain-text logs." },
    { q: "Is my log data safe here?", a: "Yes. Parsing runs in your browser. Nothing is sent to a server." },
  ],

  "mermaid-editor": [
    { q: "What diagram types does Mermaid support?", a: "Flowcharts, sequence diagrams, class diagrams, entity-relationship diagrams, Gantt charts, state diagrams, pie charts, user journey diagrams, git graphs, and more. See the Mermaid.js documentation for the full list and syntax for each type." },
    { q: "How do I start a flowchart in Mermaid?", a: "Start with flowchart TD (top-down) or flowchart LR (left-right). Add nodes and edges: A[Start] --> B{Decision} --> C[Result]. The editor renders the diagram in real time as you type." },
    { q: "Can I use the SVG output in a presentation or document?", a: "Yes. SVG is a vector format that scales to any size without pixelation. Export as SVG and insert it into Google Slides, PowerPoint (Insert → Picture), Notion, Confluence, or any tool that accepts SVG or image files." },
    { q: "Is my diagram data safe here?", a: "Yes. Rendering runs in your browser. Nothing is sent to a server." },
  ],

  "websocket-tester": [
    { q: "What is a WebSocket?", a: "A WebSocket is a full-duplex communication protocol over a persistent TCP connection. Unlike HTTP (request-response), WebSockets allow the server to push data to the client at any time. They are used in chat apps, live dashboards, collaborative tools, gaming, and financial data feeds." },
    { q: "How do I connect to a WebSocket server?", a: "Enter the WebSocket URL (ws:// for unencrypted, wss:// for TLS-encrypted) in the URL field and click Connect. Once the connection is established, type a message in the input and click Send. Incoming messages appear in the log panel." },
    { q: "What is the difference between ws:// and wss://?", a: "wss:// (WebSocket Secure) uses TLS encryption, the same as HTTPS. ws:// is unencrypted. Use wss:// for any production endpoint. Browsers block ws:// connections on HTTPS pages due to mixed-content restrictions — use wss:// for endpoints used from the DevBench tester." },
    { q: "Is my WebSocket data safe here?", a: "Messages you send and receive are displayed in the browser and not logged by DevBench. Your WebSocket traffic flows directly from your browser to the target server — DevBench does not proxy WebSocket connections." },
  ],

  "api-tester": [
    { q: "Why do some API requests fail with a CORS error?", a: "Browsers block cross-origin requests when the server does not include the correct Access-Control-Allow-Origin header. The DevBench API Tester routes requests through a server-side proxy, so CORS errors are bypassed — the proxy makes the request server-to-server and returns the result to your browser." },
    { q: "How do I add authentication to a request?", a: "Select the Auth tab and choose Bearer Token (paste your JWT or API token), Basic Auth (username and password), or API Key (header name and value). The tool adds the correct Authorization or custom header automatically." },
    { q: "What HTTP methods are supported?", a: "GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS. Select the method from the dropdown before the URL field. GET and HEAD requests ignore any request body." },
    { q: "Can I send a JSON request body?", a: "Yes. Select 'Body' → 'JSON' in the request tab, paste your JSON, and the tool sets the Content-Type: application/json header automatically. You can also send form data (application/x-www-form-urlencoded), multipart form data for file uploads, or raw text." },
    { q: "Is it safe to test production APIs here?", a: "Treat any browser-based tool like a shared computer — avoid testing endpoints with production secrets or PII. For sensitive requests, use curl or Postman locally. The DevBench API Tester does not store your requests or responses, but your browser network traffic passes through the proxy server." },
  ],

  "xml-suite": [
    { q: "What is XPath and how do I use it?", a: "XPath (XML Path Language) is a query language for selecting nodes in an XML document. Basic examples: /root/child selects all <child> elements inside <root>; //item selects all <item> elements anywhere in the document; /books/book[@category='fiction'] selects books with a category attribute equal to 'fiction'. Enter an XPath expression in the query field and the matching nodes are highlighted and listed." },
    { q: "What makes XML invalid?", a: "Common causes: missing closing tags, mismatched tag names (case-sensitive: <Item> ≠ <item>), unclosed attribute quotes, & not encoded as &amp;, < not encoded as &lt; in text content, multiple root elements (XML requires exactly one), and invalid characters in element names." },
    { q: "What is the difference between well-formed and valid XML?", a: "Well-formed XML follows basic XML syntax rules (properly nested tags, quoted attributes, one root). Valid XML additionally conforms to a specific schema (DTD or XSD) that defines which elements and attributes are allowed. The validator checks well-formedness; schema validation requires a separate schema file." },
    { q: "Is my XML data safe here?", a: "Yes. Processing runs in your browser. Nothing is sent to a server." },
  ],

  "http-status-reference": [
    { q: "What is the difference between 301 and 302 redirects?", a: "301 (Moved Permanently) tells the browser and search engines that the resource has moved to the new URL permanently. Search engines transfer link equity to the new URL. 302 (Found/Temporary Redirect) signals a temporary move — search engines keep the original URL indexed and do not transfer link equity." },
    { q: "What does a 429 status code mean?", a: "429 Too Many Requests means the client has sent too many requests in a given time period and has been rate-limited. The server may include a Retry-After header indicating when the client can try again. This is commonly seen in API rate limiting." },
    { q: "When should an API return 400 vs 422?", a: "400 Bad Request is for malformed request syntax — the server cannot parse the request at all (invalid JSON, missing required field without knowing what it means). 422 Unprocessable Entity (WebDAV, now used in REST APIs) is for requests that are syntactically valid but semantically incorrect — the server understood the request but cannot process it (invalid enum value, business rule violation)." },
    { q: "What does 503 mean?", a: "503 Service Unavailable means the server is temporarily unable to handle the request — typically because it is overloaded or down for maintenance. The Retry-After header may indicate when the service is expected to recover. It is different from 500 (Internal Server Error), which indicates an unexpected server-side failure." },
    { q: "Is my data safe here?", a: "This is a reference tool — no data is entered or transmitted." },
  ],

  "css-box-shadow": [
    { q: "What do the box-shadow parameters mean?", a: "The box-shadow property takes: offset-x (horizontal shift, positive = right), offset-y (vertical shift, positive = down), blur-radius (0 = hard edge, higher = softer), spread-radius (expands or contracts the shadow size), and colour (with optional opacity). Example: box-shadow: 4px 8px 12px 0px rgba(0,0,0,0.15)." },
    { q: "How do I create an inset (inner) shadow?", a: "Add the inset keyword before the offsets: box-shadow: inset 0 2px 4px rgba(0,0,0,0.1). Inset shadows appear inside the element rather than behind it — useful for pressed button effects and input focus rings." },
    { q: "Can I stack multiple shadows?", a: "Yes. Add multiple comma-separated shadow definitions: box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.15). The first shadow in the list renders on top. Stacking shadows creates more realistic depth effects." },
    { q: "Is my data safe here?", a: "Yes. Generation runs in your browser. Nothing is sent to a server." },
  ],

  "mime-lookup": [
    { q: "What is a MIME type?", a: "A MIME type (Multipurpose Internet Mail Extensions type) is a label that identifies the nature and format of a file. It follows the format type/subtype — for example, text/html for web pages, application/json for JSON data, image/png for PNG images. Web servers include the Content-Type header with the MIME type so browsers know how to handle the response." },
    { q: "What MIME type should I use for JSON API responses?", a: "Use application/json. Some older APIs used text/plain or application/x-json, but application/json is the IANA-registered standard since RFC 4627 (2006). Set it as Content-Type: application/json in your HTTP response header." },
    { q: "What is the MIME type for a PDF file?", a: "application/pdf. This is the correct Content-Type when serving a PDF file over HTTP. If you also want the browser to prompt a download instead of displaying the PDF, add Content-Disposition: attachment; filename=\"file.pdf\"." },
    { q: "What MIME type should I use for SVG images?", a: "image/svg+xml. This is the correct Content-Type for SVG files. Using image/svg without the +xml is incorrect and may cause browsers to not render the SVG correctly. Also set the charset: Content-Type: image/svg+xml; charset=utf-8." },
  ],

  "code-beautify": [
    { q: "Which languages does the formatter support?", a: "The Code Beautify workspace formats: HTML, CSS, JavaScript, TypeScript, TSX/JSX, JSON, Markdown, YAML, GraphQL, XML, and SQL (using sql-formatter). Python indentation cleanup is also supported. Most formatters use Prettier under the hood, so results match what you would get from running Prettier in your project." },
    { q: "Does this use the same rules as Prettier?", a: "Yes for most languages — JavaScript, TypeScript, HTML, CSS, JSON, YAML, GraphQL, and Markdown are formatted with Prettier running in a Web Worker in your browser. The default options (2-space indent, single quotes, 80-char line width) match Prettier defaults. SQL uses sql-formatter with a separate rule set." },
    { q: "Will formatting change how my code behaves?", a: "No. Code formatters only change whitespace, indentation, and line breaks — they never alter the semantics or logic of your code. The formatted output is functionally identical to the input." },
    { q: "Is my code kept private?", a: "Yes. All formatting runs in your browser using Web Workers. Your code is never uploaded to a server. This means you can safely format proprietary source code, internal configuration files, or sensitive data." },
  ],

  "webhook-simulator": [
    { q: "What is a webhook signature and why does it matter?", a: "A webhook signature is an HMAC hash of the request body, included in a request header (e.g. X-Hub-Signature-256 for GitHub, Stripe-Signature for Stripe). The receiver recomputes the HMAC using its shared secret and compares it to the header value. If they match, the payload is authentic and unmodified. This prevents attackers from sending forged webhook payloads to your endpoint." },
    { q: "Which platforms does this simulator support?", a: "GitHub (X-Hub-Signature-256, HMAC-SHA256), Stripe (Stripe-Signature with timestamp replay protection), Slack (X-Slack-Signature, HMAC-SHA256), Shopify (X-Shopify-Hmac-SHA256), and a generic HMAC-SHA256 option for any custom webhook system." },
    { q: "Is my webhook secret safe?", a: "Yes. HMAC signing runs entirely in your browser using the Web Crypto API. Your secret key is never sent to any server. You can safely test with real webhook secrets." },
    { q: "How do I verify a webhook signature in Node.js?", a: "Compute HMAC-SHA256 of the raw request body using your secret key, then compare to the signature header in constant time (to prevent timing attacks): const sig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex'); then use crypto.timingSafeEqual() to compare. The exact header name and format differ by platform." },
  ],

  "linux-cheatsheet": [
    { q: "How do I find a file by name on Linux?", a: "Use find: find /path -name 'filename.txt' searches by exact name; find /path -name '*.log' uses a wildcard. Add -type f to match only files, -type d for directories. For faster searches on an indexed system, use locate filename (requires the locate database to be updated with sudo updatedb)." },
    { q: "How do I search inside files for a string?", a: "grep 'search term' filename searches one file. grep -r 'search term' /path searches recursively. grep -rn shows line numbers. grep -rl lists only matching filenames. For case-insensitive search add -i. For regex patterns use -E (extended regex). Example: grep -rn 'TODO' ./src" },
    { q: "How do I check disk usage?", a: "df -h shows free and used space on all mounted filesystems in human-readable units. du -sh /path shows the total size of a directory. du -sh * lists sizes of all items in the current directory. To find the largest directories: du -h /path | sort -rh | head -20." },
    { q: "How do I check what is running on a port?", a: "Use ss -tlnp | grep :PORT or lsof -i :PORT. For example, ss -tlnp | grep :8080 shows what process is listening on port 8080. On older systems, netstat -tlnp | grep :PORT serves the same purpose." },
    { q: "How do I kill a process by name or port?", a: "By name: pkill process-name or killall process-name. For a specific PID: kill PID. By port: kill $(lsof -t -i:8080) kills the process on port 8080. Use kill -9 PID for a force kill when the process ignores SIGTERM." },
    { q: "What is journalctl and how do I use it?", a: "journalctl reads logs from the systemd journal. Common uses: journalctl -u nginx (logs for the nginx service), journalctl -f (follow live logs, like tail -f), journalctl --since '1 hour ago' (recent logs), journalctl -p err (errors only). Add -n 100 to limit output to the last 100 lines." },
    { q: "How do I give a file executable permissions?", a: "chmod +x filename makes a file executable for all users. chmod 755 filename sets owner read/write/execute and group/other read/execute. To make a script executable and run it: chmod +x script.sh && ./script.sh." },
  ],

  "lambda-sandbox": [
    { q: "What Node.js version does the sandbox use?", a: "The sandbox emulates a Node.js Lambda runtime environment in a Web Worker. It supports modern JavaScript/TypeScript syntax. AWS Lambda supports Node.js 18.x and 20.x in production — test against the version matching your deployed runtime." },
    { q: "What event payloads are available?", a: "Pre-built event templates include: API Gateway (REST and HTTP), ALB, SQS, SNS, S3, DynamoDB Streams, EventBridge, Cognito, CloudFront, and a generic custom event. Each template contains a realistic sample payload structure matching the AWS documentation." },
    { q: "Can I import npm packages in the sandbox?", a: "The sandbox runs in a Web Worker and does not have access to a node_modules directory. Standard AWS SDK methods and built-in Node.js modules are available. For testing logic that depends on npm packages, mock the dependencies in your handler or test the package locally." },
    { q: "Is my Lambda code sent to a server?", a: "No. The sandbox executes your handler code in a browser Web Worker using a sandboxed JavaScript runtime. Your code and the event payload never leave your browser." },
    { q: "What is the difference between API Gateway REST and HTTP event formats?", a: "API Gateway REST API (v1) events use requestContext.resourceId and multiValueQueryStringParameters. API Gateway HTTP API (v2) events use requestContext.http.method and rawQueryString. Lambda functions deployed behind HTTP APIs receive the v2 format by default. Select the correct template for your actual API Gateway type." },
  ],

  "graph-calculator": [
    { q: "How do I plot a function?", a: "Type the function expression using x as the variable — for example, sin(x), x^2 - 3*x + 2, or sqrt(x). Add multiple functions to plot them simultaneously. Use pi for π and e for Euler's number. Scroll to zoom, drag to pan, and hover over the graph to read values at any x." },
    { q: "Can I graph multiple functions at once?", a: "Yes. Add additional function inputs using the '+' button — each gets a distinct colour. This lets you compare functions visually, find intersections, and observe how parameter changes affect the curve. There is no hard limit on the number of functions plotted simultaneously." },
    { q: "What functions are supported in the expression evaluator?", a: "Trigonometry: sin, cos, tan, asin, acos, atan, atan2. Hyperbolic: sinh, cosh, tanh. Exponential and logarithm: exp, log (natural), log2, log10. Roots: sqrt, cbrt. Rounding: floor, ceil, round, abs, sign. Constants: pi, e, phi (golden ratio). Power: pow(base, exp) or use the ^ operator." },
    { q: "How do I find where two functions intersect?", a: "Plot both functions on the graph. The calculator automatically detects intersections and marks them on the graph with a point. Hover over an intersection marker to read the exact (x, y) coordinates." },
    { q: "How do I calculate a matrix determinant or inverse?", a: "Switch to the Matrix tab. Enter the size (N×N) and fill in the values. The calculator computes the determinant, inverse (if it exists), transpose, and matrix product instantly. Non-square matrices cannot be inverted — the inverse option is disabled for those." },
    { q: "Is my data safe here?", a: "Yes. All graphing and calculation runs in your browser using JavaScript. Nothing is sent to a server." },
  ],

  "dns-lookup": [
    { q: "Which DNS record types can I query?", a: "The tool supports A (IPv4 address), AAAA (IPv6 address), MX (mail exchange), TXT (text records, including SPF/DKIM/DMARC), CNAME (canonical name alias), NS (authoritative nameservers), and SOA (start of authority). Select the record type from the dropdown before running the lookup." },
    { q: "Which DNS resolver does the tool use?", a: "Queries go through Cloudflare's DNS over HTTPS (DoH) resolver at 1.1.1.1. DoH encrypts DNS queries so your ISP cannot see which domains you look up. Results reflect the global authoritative answer rather than a cached local resolver." },
    { q: "Why is a DNS record not showing up?", a: "Common reasons: the record does not exist for that domain, propagation is still in progress (DNS changes can take up to 48 hours to propagate globally), or you queried the wrong record type. Try querying all record types one by one to confirm what is published." },
    { q: "What does TTL mean in DNS records?", a: "TTL (Time To Live) is the number of seconds a resolver may cache the record before re-querying the authoritative nameserver. A TTL of 300 means caches keep the record for 5 minutes. Lower TTL allows faster propagation after a DNS change; higher TTL reduces query load on your nameserver." },
    { q: "Can I look up DNS records for private or internal domains?", a: "No. The lookup uses Cloudflare's public DNS resolver, which only resolves publicly visible domain names. Internal hostnames (e.g. .corp, .local, or intranet names) that are only resolvable on your private network will not return results." },
  ],

  "env-validator": [
    { q: "What does the .env validator check?", a: "The validator checks for: duplicate keys (same variable declared more than once), empty values (KEY= with no value), invalid key names (must be ASCII letters, digits, or underscores, starting with a letter or underscore), weak secrets (short or low-entropy values assigned to keys that look like passwords or tokens), and missing quotes around values containing spaces or special characters." },
    { q: "How do I use the output in my project?", a: "The validator shows a parsed table of all key-value pairs with inline warnings. You can copy the cleaned output as a formatted .env file. It does not modify your original file — paste or upload, review the results, then apply fixes manually." },
    { q: "Is it safe to paste my .env file here?", a: "All validation runs in your browser. The contents of your .env file are never sent to a server. You can safely paste files containing real secrets and API keys." },
    { q: "What is a weak secret warning?", a: "The validator flags values assigned to keys with names like SECRET, KEY, TOKEN, PASSWORD, or PASS that are fewer than 16 characters or appear to be placeholder strings (e.g. 'changeme', 'xxxx', 'test'). These are likely unsafe for production. The warning is advisory — it does not block export." },
    { q: "Does it support multiline values and comments?", a: "Yes. Multiline values must be wrapped in double quotes with \\n escape sequences or use actual newlines inside quotes. Lines starting with # are treated as comments and excluded from the parsed output. Both formats follow the dotenv specification." },
  ],

  "gitignore-generator": [
    { q: "Which languages and frameworks are supported?", a: "The generator covers 20+ templates including Node.js, Python, Java, Go, Rust, Ruby, PHP, Swift, Kotlin, C/C++, .NET/C#, Unity, Android, macOS, Windows, Linux, Visual Studio Code, JetBrains IDEs, Vim, and more. Combine multiple templates to get a merged .gitignore in one click." },
    { q: "Can I combine multiple templates?", a: "Yes. Select as many templates as you need — for example, Node.js + macOS + VS Code. The generator merges all selected templates, deduplicates entries, and produces a single .gitignore file you can copy or download." },
    { q: "What goes in a .gitignore file?", a: "A .gitignore file tells Git which files and directories to exclude from version control. Common entries include build output directories (dist/, build/), dependency folders (node_modules/, vendor/), IDE configuration files (.idea/, .vscode/), OS metadata (.DS_Store, Thumbs.db), and environment files (.env, *.local)." },
    { q: "Should I commit the .gitignore file itself?", a: "Yes. The .gitignore file should be committed to the repository so all contributors share the same exclusion rules. For personal IDE or OS-specific ignores that should not affect other contributors, add those patterns to your global gitignore at ~/.gitignore_global instead." },
    { q: "Why is a file still being tracked after I added it to .gitignore?", a: "Git only ignores untracked files. If a file was already committed, adding it to .gitignore does not automatically untrack it. Run git rm --cached <filename> (or git rm -r --cached <dir>) to stop tracking it, then commit the change. The file will remain on disk but Git will no longer include it." },
  ],

  "npm-compare": [
    { q: "What metrics does the comparison show?", a: "For each package the comparison shows: weekly download count (npm registry), minified + gzip bundle size (from Bundlephobia), number of direct dependencies, license type, last publish date, GitHub stars, and open issues. This gives a quick signal for popularity, maintenance health, and bundle cost." },
    { q: "How many packages can I compare at once?", a: "You can compare up to 3 npm packages side by side. Enter exact package names (e.g. lodash, date-fns, dayjs) and the tool fetches data for all of them in parallel." },
    { q: "What does bundle size mean and why does it matter?", a: "Bundle size is the amount of JavaScript added to your browser bundle when you import the package — shown as minified size and gzip-compressed size. Smaller bundles mean faster page loads, especially on mobile. The gzip size is the most relevant figure because HTTP compression is nearly universal." },
    { q: "Where does the download data come from?", a: "Download counts are fetched from the official npm registry API (api.npmjs.org/downloads). They reflect the last 7 days of downloads, which is a standard proxy for library popularity and ecosystem adoption." },
    { q: "Why would I choose a less popular package?", a: "Download count measures popularity, not quality. A less downloaded package might be more focused, have zero dependencies, a smaller bundle, or a more permissive license. Use the comparison as one input alongside GitHub activity, documentation quality, and fit to your specific use case." },
  ],
};
