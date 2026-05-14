export interface Faq {
  q: string;
  a: string;
}

export const TOOL_FAQS: Record<string, Faq[]> = {
  "json-formatter": [
    {
      q: "What is a JSON formatter?",
      a: "A JSON formatter parses raw JSON text and outputs it with consistent indentation and line breaks, making nested objects and arrays easy to read. It also validates the syntax and reports errors with the exact line and column number.",
    },
    {
      q: "Why is my JSON invalid?",
      a: "The most common causes are: trailing commas after the last item in an object or array, single-quoted strings instead of double-quoted, unquoted property keys, or comments (JSON does not support comments). The formatter highlights the exact position of the error.",
    },
    {
      q: "Can I format minified or compressed JSON?",
      a: "Yes. Paste any minified JSON — even a single-line blob with no whitespace — and the formatter will expand it into a readable, properly indented structure. You can also go the other way and minify readable JSON to a single line.",
    },
    {
      q: "Is my JSON data safe to paste here?",
      a: "Completely. The JSON formatter runs entirely in your browser using JavaScript. No data is sent to any server, stored, or logged. You can verify this by checking the browser Network tab — no requests are made when you format.",
    },
    {
      q: "What is the difference between pretty-printing and minifying JSON?",
      a: "Pretty-printing adds whitespace (indentation and newlines) to make the JSON human-readable. Minifying removes all unnecessary whitespace to reduce file size — useful for API responses and production builds where every byte counts.",
    },
  ],

  json: [
    {
      q: "What is a JSON formatter?",
      a: "A JSON formatter takes compact, unindented JSON and adds whitespace, line breaks, and indentation to make it human-readable. It is the opposite of a JSON minifier, which removes all whitespace to reduce file size.",
    },
    {
      q: "Is my JSON data safe to paste here?",
      a: "Yes. All processing happens in your browser using JavaScript. Your JSON is never sent to a server, stored, or logged. The DevBench JSON toolkit is 100% client-side.",
    },
    {
      q: "What is the difference between format and minify?",
      a: "Format (beautify) adds indentation and newlines — ideal for debugging and reading. Minify removes all whitespace — ideal for production API responses and config files where smaller payload size matters.",
    },
    {
      q: 'What causes "unexpected token" errors in JSON?',
      a: "The most common causes are: trailing commas after the last property or array item, single quotes instead of double quotes, unquoted object keys, JavaScript-style comments (JSON does not support // or /* */), and undefined or NaN values which are not valid JSON.",
    },
  ],

  "base64-encode": [
    {
      q: "What is Base64 encoding?",
      a: "Base64 is an encoding scheme that converts binary data (or any text) into a string of 64 ASCII characters (A–Z, a–z, 0–9, +, /). It is used to safely transmit binary data over channels that only support text, such as email bodies or JSON payloads.",
    },
    {
      q: "Is Base64 the same as encryption?",
      a: "No. Base64 is encoding, not encryption — it is fully reversible without any key. Anyone who sees a Base64 string can decode it instantly. Never use Base64 to hide sensitive data; use a proper encryption algorithm like AES-256 instead.",
    },
    {
      q: "When is Base64 commonly used?",
      a: "Base64 is used for: embedding images in HTML/CSS as data URIs (data:image/png;base64,...), storing binary data in JSON, encoding email attachments (MIME), passing binary payloads in URLs, and storing cryptographic keys in PEM format.",
    },
    {
      q: "How do I decode a Base64 string in JavaScript?",
      a: "Use the built-in `atob()` function: `atob('SGVsbG8=')` returns 'Hello'. To encode, use `btoa('Hello')`. For binary files or non-ASCII text, use a Uint8Array and TextDecoder for correct Unicode handling.",
    },
    {
      q: "What is the difference between Base64 and Base64URL?",
      a: "Base64URL is a URL-safe variant that replaces + with - and / with _ and omits the = padding character. It is used in JWTs, OAuth tokens, and anywhere the standard + and / characters would need percent-encoding in a URL.",
    },
  ],

  "base64-decode": [
    {
      q: "Is Base64 a form of encryption?",
      a: "No. Base64 is an encoding scheme, not encryption. Anyone with the encoded string can decode it instantly without a key. For actual encryption, use the AES-256-GCM Encryptor tool on DevBench.",
    },
    {
      q: "Why does Base64 output end with == or =?",
      a: "Base64 encodes groups of 3 bytes into 4 characters. When the input length is not divisible by 3, one or two padding characters (=) are added to complete the final group to a multiple of 4.",
    },
    {
      q: "What is the difference between Base64 and Base64URL?",
      a: "Standard Base64 uses + and / characters which have special meaning in URLs. Base64URL replaces + with -, / with _, and removes padding (=). It is safe to use in URLs, query strings, and JWT tokens without percent-encoding.",
    },
  ],

  "regex-tester": [
    {
      q: "What regex flavour does this tool use?",
      a: "The tester uses JavaScript's built-in RegExp engine (ECMAScript 2022+), which supports named capturing groups, lookbehind assertions, Unicode property escapes (\\p{L}), the dotAll (s) flag, and the sticky (y) flag. It does not support PCRE-only features like \\K or recursive patterns.",
    },
    {
      q: "What does the g (global) flag do?",
      a: "Without the g flag, a regex stops after the first match. With g, it finds all non-overlapping matches in the string. Most operations in this tester (match count, highlighting, substitution) implicitly behave as if g is set regardless of the flag selection.",
    },
    {
      q: "How do I match a literal dot or other special character?",
      a: "Escape it with a backslash: \\. matches a literal dot (without the backslash, . matches any character except newline). Other characters that need escaping: \\ ^ $ . | ? * + ( ) [ ] { }.",
    },
    {
      q: "What is a capturing group and how do I use it?",
      a: "Parentheses create a capturing group: (\\d{4}) captures four digits. In the substitution field, reference it as $1 (first group), $2 (second), etc. Use (?:...) for a non-capturing group when you need grouping for repetition but not the captured value.",
    },
    {
      q: "What is the difference between \\d and [0-9]?",
      a: "In JavaScript without the u or v flag, they are equivalent for ASCII digits. With the Unicode (u) flag and Unicode property escapes, \\d still matches only ASCII 0–9, whereas \\p{Decimal_Number} matches decimal digits from all scripts. For most use cases they are interchangeable.",
    },
  ],

  "jwt-debugger": [
    {
      q: "What is a JWT (JSON Web Token)?",
      a: "A JSON Web Token (JWT) is a compact, URL-safe token format defined in RFC 7519. It consists of three Base64url-encoded sections: header, payload, and signature. JWTs are most commonly used as bearer tokens in HTTP Authorization headers.",
    },
    {
      q: "Is it safe to paste my JWT here?",
      a: "Yes. The DevBench JWT Debugger runs entirely in your browser using JavaScript. Your token is never sent to a server, stored, or logged.",
    },
    {
      q: "What is the difference between HS256 and RS256?",
      a: "HS256 uses a shared symmetric secret key known by both issuer and verifier. RS256 uses an RSA key pair: the token is signed with a private key and anyone with the public key can verify it. RS256 is more common in OAuth 2.0 and OpenID Connect identity providers.",
    },
    {
      q: "What does 'signature verification failed' mean?",
      a: "It means the secret or public key you entered does not match the key used to sign the token. The token may have been signed with a different secret, or the token has been tampered with.",
    },
    {
      q: "What is the exp claim and what happens when a JWT expires?",
      a: "The exp (expiration time) claim is a Unix timestamp after which the token must not be accepted. When a JWT expires, the server should reject it and return a 401 Unauthorized response. The client must then obtain a new token.",
    },
  ],

  "hash-generator": [
    {
      q: "What is the difference between MD5, SHA-1, and SHA-256?",
      a: "MD5 produces a 128-bit (32 hex character) digest and is cryptographically broken — do not use it for security. SHA-1 produces 160 bits (40 hex chars) and is also deprecated for digital signatures. SHA-256 is part of SHA-2 and remains secure — it is the standard for file integrity checks, TLS certificates, and HMAC signing in JWTs.",
    },
    {
      q: "Can I use this to hash passwords?",
      a: "No. MD5, SHA-1, SHA-256, and SHA-512 are fast by design, which makes them easy to brute-force as password hashes. For password storage, use a slow key-derivation function designed for the purpose: bcrypt, Argon2, or scrypt. These add configurable computational cost and a built-in salt.",
    },
    {
      q: "What is a hash used for in practice?",
      a: "Common uses: verifying file download integrity (comparing the SHA-256 hash of a downloaded file against the publisher's stated checksum), Subresource Integrity (SRI) hashes in HTML script/link tags, cache-busting by hashing file content, generating unique fingerprints for objects, and signing API requests with HMAC-SHA256.",
    },
    {
      q: "How do I verify a file checksum?",
      a: "Click 'Upload file' in the Hash Generator, select your file, and copy the resulting hash. Compare it character-by-character (or paste it into the Compare field) against the hash the software publisher provides on their download page. If they match, the file is intact and unmodified.",
    },
    {
      q: "Is my data safe to paste here?",
      a: "Yes. All hashing is computed using the browser's Web Crypto API (SubtleCrypto) — your text or file never leaves your device and is not sent to any server. You can confirm this by checking the Network tab in browser DevTools — no requests are made when you hash.",
    },
  ],

  "password-generator": [
    {
      q: "How strong is a randomly generated password?",
      a: "Strength depends on length and character variety. A 16-character password drawn from uppercase, lowercase, digits, and symbols has ~98 bits of entropy — at one trillion guesses per second it would take billions of years to brute-force. The entropy bar in the generator shows this estimate live as you adjust settings.",
    },
    {
      q: "Is it safe to use passwords generated here?",
      a: "Yes. This generator uses crypto.getRandomValues() — the browser's cryptographically secure random number generator (CSPRNG). Passwords are generated entirely in your browser and are never sent to, stored on, or logged by any server. You can verify by checking the Network tab in DevTools.",
    },
    {
      q: "What is the minimum recommended password length?",
      a: "NIST SP 800-63B recommends at least 8 characters, but modern security guidance suggests 16+ characters for accounts that matter, and 24+ for high-value accounts. Length is the single biggest factor in password strength — a 20-character all-lowercase password is stronger than a 10-character mixed-case password.",
    },
    {
      q: "Should I include symbols in my password?",
      a: "Yes, if the target system allows them. Adding symbols increases the character pool from 62 (alphanumeric) to 72–94 characters, adding about 0.5–0.9 extra bits of entropy per character. However, many legacy systems restrict symbols — use the character set toggles to match what the target site accepts.",
    },
    {
      q: "What should I do with the generated password?",
      a: "Store it in a password manager (1Password, Bitwarden, Dashlane). Never store passwords in plaintext files, spreadsheets, or browser autofill beyond the password manager. Enable two-factor authentication on the account as an additional layer.",
    },
  ],

  "url-encode": [
    {
      q: "What is URL encoding (percent-encoding)?",
      a: "URL encoding converts characters that are not allowed or have special meaning in a URL into a %XX format, where XX is the UTF-8 byte value in hexadecimal. For example, a space becomes %20, & becomes %26, and the euro sign becomes %E2%82%AC. This ensures the URL is valid and unambiguous for any HTTP parser.",
    },
    {
      q: "When do I need to URL-encode a string?",
      a: "Any time you're building a URL dynamically and embedding untrusted or user-supplied values. Examples: constructing a search query string (?q=user+input), embedding a redirect URL as a parameter (?next=/some/path?key=val), or passing OAuth state parameters. Forgetting to encode can break the URL or introduce security issues.",
    },
    {
      q: "What is the difference between encodeURIComponent and encodeURI?",
      a: "encodeURIComponent encodes everything except A-Z a-z 0-9 and - _ . ! ~ * ' ( ). Use it for individual query parameter values. encodeURI encodes everything except those characters plus the structural URL characters : / ? # [ ] @ ! $ & ' ( ) * + , ; =. Use it for a complete URL that may contain spaces but whose structure should be preserved.",
    },
    {
      q: "Does the + sign mean a space?",
      a: "In application/x-www-form-urlencoded encoding (HTML form data), + represents a space. In standard percent-encoding (RFC 3986), a space is %20 and + is a literal plus sign. This tool uses standard percent-encoding (%20 for space) unless you choose the form-encoded mode.",
    },
    {
      q: "How do I decode a percent-encoded string?",
      a: "Use the URL Decode tool (linked in the toolbar). In JavaScript, use decodeURIComponent() for component values or decodeURI() for a full URL. These are the exact inverses of their encode counterparts.",
    },
  ],

  "url-decode": [
    {
      q: "What does URL decoding do?",
      a: "URL decoding reverses percent-encoding — it converts %20 back to a space, %26 back to &, %2F back to /, and so on. It also optionally converts + signs back to spaces, which is needed for application/x-www-form-urlencoded data submitted by HTML forms.",
    },
    {
      q: "Why are URLs percent-encoded in the first place?",
      a: "URLs can only legally contain a limited ASCII subset. Characters outside that set — spaces, non-Latin letters, and some punctuation — must be encoded to avoid ambiguity. The browser encodes URLs automatically when you type them, but when you copy a URL from a database column or API response, you often get the raw encoded string.",
    },
    {
      q: "What is double-encoding and how do I fix it?",
      a: "Double-encoding happens when a URL is encoded twice — %20 becomes %2520 (the % is itself encoded to %25). To fix it, decode twice: first pass through decodes %2520 to %20, second pass decodes %20 to a space. The URL Decoder handles this automatically if you enable the 'Double-decode' option.",
    },
    {
      q: "Is there a difference between decodeURI and decodeURIComponent in JavaScript?",
      a: "Yes. decodeURI leaves structural characters (:, /, ?, #, etc.) encoded because they form the URL structure. decodeURIComponent decodes everything — use it for individual query parameter values. Calling decodeURIComponent on a full URL will decode structural separators and likely break the URL.",
    },
  ],

  "aes-encrypt": [
    {
      q: "What encryption algorithm is used?",
      a: "AES-256-GCM — the same algorithm used by TLS 1.3, Signal, and most modern secure systems. The 256 means a 256-bit key; GCM (Galois/Counter Mode) provides authenticated encryption, meaning any tampering with the ciphertext is detected on decryption. A 256-bit key derived from your password via PBKDF2 with 310,000 iterations is used.",
    },
    {
      q: "Is my data safe to encrypt here?",
      a: "Yes. All encryption and decryption runs in your browser using the Web Crypto API — your plaintext, password, and ciphertext never leave your device. You can verify this by checking the browser Network tab while encrypting.",
    },
    {
      q: "What should I use as a password?",
      a: "Use a long, random password (20+ characters). The tool uses PBKDF2 with 310,000 iterations to derive the encryption key — this slows down dictionary attacks on the password. But a weak password (common words, short strings) can still be brute-forced. Generate a strong password with the Password Generator tool.",
    },
    {
      q: "Can I decrypt a ciphertext from another AES tool?",
      a: "Only if the other tool uses the same algorithm (AES-256-GCM), key derivation method (PBKDF2-SHA-256 with the same iteration count), and the same output format for the salt and IV. The ciphertext format is not standardised across tools, so cross-tool decryption is generally not possible without knowing the exact implementation.",
    },
    {
      q: "What is GCM mode and why does it matter?",
      a: "GCM (Galois/Counter Mode) provides authenticated encryption — it produces a ciphertext plus an authentication tag. When decrypting, the tag is verified first. If even one byte of the ciphertext has been tampered with, decryption fails before any data is returned. This protects against ciphertext manipulation attacks that affect unauthenticated modes like AES-CBC.",
    },
  ],

  "curl-to-fetch": [
    {
      q: "How do I copy a cURL command from the browser?",
      a: "In Chrome, Firefox, or Edge: open DevTools → Network tab, click any request, right-click it, and choose 'Copy → Copy as cURL' (Chrome) or 'Copy as cURL (bash)' (Firefox). Paste that directly into this converter.",
    },
    {
      q: "What cURL flags are supported?",
      a: "The converter handles the most common flags: -X (method), -H (headers), -d / --data / --data-raw (body), -u (basic auth), --json (sets Content-Type and Accept to application/json), and --compressed. Uncommon flags like --limit-rate, --retry, or --cacert are noted as unsupported comments in the output.",
    },
    {
      q: "Does it handle JSON request bodies correctly?",
      a: "Yes. If the body is valid JSON, it is formatted as JSON.stringify(data) in the fetch call. If the Content-Type is application/x-www-form-urlencoded, the body is converted to a URLSearchParams object.",
    },
    {
      q: "Can I convert to Node.js fetch or just browser fetch?",
      a: "The output uses the standard Fetch API which works identically in modern browsers and in Node.js 18+ (which ships with the native fetch API). For older Node.js versions, you can swap fetch() for node-fetch with no other changes.",
    },
  ],

  "uuid-generator": [
    {
      q: "What is a UUID?",
      a: "A Universally Unique Identifier (UUID) is a 128-bit label standardised in RFC 4122. It is displayed as 32 hexadecimal digits grouped in the format 8-4-4-4-12 (e.g. 550e8400-e29b-41d4-a716-446655440000). UUIDs are used as primary keys in databases, correlation IDs in distributed systems, and anywhere a collision-resistant ID is needed.",
    },
    {
      q: "What is UUID v4 and why is it the most common?",
      a: "UUID v4 is randomly generated — 122 bits of randomness with 6 bits reserved for the version and variant fields. It requires no coordination between generators and has a collision probability of roughly 1 in 5.3 × 10^36 per pair, making it safe to generate without a central registry.",
    },
    {
      q: "Are UUIDs truly unique?",
      a: "For practical purposes, yes. UUID v4 has 2^122 ≈ 5.3 × 10^36 possible values. If you generated one billion UUIDs per second for 100 years, the probability of a single collision would still be less than 0.000000006%. For sequential IDs with guaranteed uniqueness, use a database auto-increment or UUID v7 (time-ordered).",
    },
    {
      q: "Is a UUID the same as a GUID?",
      a: "Yes. GUID (Globally Unique Identifier) is Microsoft's term for the same concept, used in COM, .NET, and Windows APIs. The format and algorithm are identical to RFC 4122 UUIDs — the names are interchangeable in practice.",
    },
    {
      q: "How do I generate a UUID in JavaScript or Python?",
      a: "JavaScript (modern browsers and Node.js 19+): crypto.randomUUID(). Node.js (older): import { v4 as uuidv4 } from 'uuid'. Python: import uuid; uuid.uuid4(). Go: github.com/google/uuid. All these produce RFC 4122-compliant v4 UUIDs.",
    },
  ],

  "semver-compare": [
    {
      q: "What is semantic versioning (SemVer)?",
      a: "Semantic versioning labels releases as MAJOR.MINOR.PATCH (for example 2.4.1). A MAJOR bump signals breaking changes, MINOR adds backward-compatible features, and PATCH is for backward-compatible fixes. Optional prerelease segments such as -alpha.1 or -rc.2 sort before the final release with the same MAJOR.MINOR.PATCH.",
    },
    {
      q: "Does this comparator match npm and Node.js semver?",
      a: "Yes. The tool uses the same semver rules as the npm ecosystem: versions may use a leading v, prerelease and build metadata follow the SemVer 2.0.0 ordering rules, and loose inputs can be coerced when they clearly resemble a version (for example package tags copied from a registry).",
    },
    {
      q: "Why does 1.0.0-beta.1 sort before 1.0.0?",
      a: "Prerelease identifiers have lower precedence than the normal release with the same MAJOR.MINOR.PATCH. So 1.0.0-beta.1 is considered older than 1.0.0 — you should ship the stable 1.0.0 after beta testing.",
    },
    {
      q: "What does semver.diff tell me?",
      a: "When version A is less than version B, semver.diff describes the kind of bump between them: major, minor, patch, or prerelease. If the versions are equal, there is no diff. It is useful when scanning changelog-worthy jumps between two tags or package versions.",
    },
    {
      q: "Is my version string sent to a server?",
      a: "No. Comparison runs entirely in your browser. Paste version numbers from package.json, Git tags, or CI logs without uploading them anywhere.",
    },
  ],

  "chmod-calculator": [
    {
      q: "What does chmod 755 mean?",
      a: "Octal chmod uses three digits for owner, group, and others. Each digit is the sum of read (4), write (2), and execute (1). 755 means the owner has read, write, and execute (4+2+1=7), while group and others have read and execute only (4+1=5). It is typical for directories and executable files on Unix servers.",
    },
    {
      q: "What is the difference between 644 and 755?",
      a: "644 is rw-r--r--: the owner can read and write; everyone else can only read. It is standard for non-executable files. 755 is rwxr-xr-x: the owner can read, write, and execute; others can read and execute — common for scripts and directories that must be entered.",
    },
    {
      q: "Can I paste ls -l permission characters?",
      a: "Yes. You can paste the nine permission characters (rwxr-xr-x), optionally with the leading file-type letter from ls -l (for example -rwxr-xr-x). The tool converts them to the numeric octal mode for the basic permission bits.",
    },
    {
      q: "What are the fourth octal digit and special bits?",
      a: "A leading 4, 2, or 1 in a four-digit octal mode sets setuid, setgid, or the sticky bit on top of the usual three digits for rwx triplets. For example 4755 includes setuid. The calculator calls out those bits when you enter a four-digit octal value.",
    },
    {
      q: "Does this change files on my machine?",
      a: "No. It only converts between representations for planning Dockerfiles, Ansible, Terraform, or shell scripts. Run chmod on your actual system or container when you are ready to apply permissions.",
    },
  ],

  "dotenv-parser": [
    {
      q: "What is a .env file?",
      a: "A .env file lists environment variables as KEY=value lines (often one per line). Runtimes and tools such as Docker Compose, Node dotenv, or framework CLIs can load these into the process environment at startup. Keep real secrets out of version control — commit a .env.example with dummy values instead.",
    },
    {
      q: "Which value wins if the same key appears twice?",
      a: "Typical dotenv loaders apply lines in order and later assignments override earlier ones. This parser warns about duplicate keys and keeps the last value in the JSON output to match that behaviour.",
    },
    {
      q: "Are quotes and export supported?",
      a: "Lines may use optional export before the key. Values can be wrapped in single or double quotes; basic escape sequences inside quoted strings are unescaped in the parsed result.",
    },
    {
      q: "Does this validate variable names?",
      a: "Assignments must look like shell-style identifiers: letters, digits, and underscores, starting with a letter or underscore. Lines that do not match KEY=value form are reported as warnings rather than silently dropped.",
    },
    {
      q: "Is my .env sent to DevBench servers?",
      a: "No. Parsing happens entirely in your browser. Treat every online paste as sensitive anyway — avoid sharing production secrets in screenshots or chat.",
    },
  ],

  "code-playground": [
    {
      q: "Where does my code run?",
      a: "JavaScript, TypeScript, and Node-style samples run in a sandboxed iframe in your browser with no filesystem or network access from user code. Python and notebook cells run in Pyodide (WebAssembly) in the tab. Go is sent to the official Go Playground compile API over HTTPS — the same remote sandbox used by go.dev/play — not executed on DevBench servers.",
    },
    {
      q: "What is the Stdin tab for?",
      a: "For Python and notebooks, each line you type in Stdin is delivered to sys.stdin in order, similar to piping a file into a local interpreter. For JavaScript modes, the preamble exposes readStdinLine() for simple prompts, and the Node tab includes a small readline shim for basic patterns. Remote Go compile does not accept arbitrary stdin through this playground, so the Go Stdin tab is disabled with an explanation.",
    },
    {
      q: "Can I install npm packages in the Node tab?",
      a: "No. The Node tab is a browser sandbox with a minimal readline-style shim for demos. There is no package manager or native Node runtime in your tab. Use a local project or CI when you need real dependencies.",
    },
    {
      q: "Is Pyodide the same as my laptop Python?",
      a: "Pyodide bundles CPython and many wheels built for WebAssembly. Most pure-Python code and common scientific stacks work, but anything that expects native extensions not shipped with Pyodide may fail. Treat it as a faithful but not identical environment.",
    },
    {
      q: "Does DevBench store my snippets?",
      a: "The playground does not upload your JavaScript, TypeScript, or Python source to DevBench for execution. Go compile requests go to Google's playground endpoint with the usual upstream policies. Do not paste secrets into any online editor — use local tools for credentials.",
    },
  ],

  // ── Workspace pages (epoch, cron-editor, api-tester) ──────────────────────
  "epoch": [
    {
      q: "What is a Unix epoch timestamp?",
      a: "A Unix epoch timestamp is the number of seconds (or milliseconds) elapsed since 00:00:00 UTC on 1 January 1970 — known as the Unix epoch. It is the standard time representation in most programming languages, databases, and APIs because it is timezone-independent, compact, and easy to compare and calculate with.",
    },
    {
      q: "How do I convert a Unix timestamp to a human-readable date?",
      a: "Paste the timestamp into the converter and the date and time appear instantly. In JavaScript: new Date(timestamp * 1000).toISOString() for seconds, or new Date(timestamp).toISOString() for milliseconds. In Python: datetime.utcfromtimestamp(ts). In shell: date -d @timestamp (Linux) or date -r timestamp (macOS).",
    },
    {
      q: "How do I tell if a timestamp is in seconds or milliseconds?",
      a: "A 10-digit number is almost certainly seconds (e.g. 1715000000 = May 2024). A 13-digit number is milliseconds (e.g. 1715000000000). The converter auto-detects the precision based on the digit count.",
    },
    {
      q: "What is the Year 2038 problem?",
      a: "Systems that store Unix timestamps as a signed 32-bit integer overflow on 19 January 2038 at 03:14:07 UTC. The maximum value of a signed 32-bit integer (2,147,483,647) corresponds to that moment. Modern 64-bit systems are not affected — they can represent times hundreds of billions of years into the future.",
    },
    {
      q: "What is the current Unix timestamp?",
      a: "The live clock at the top of the Epoch Converter page shows the current Unix timestamp in seconds and milliseconds, updated every second. In JavaScript: Math.floor(Date.now() / 1000) for seconds, or Date.now() for milliseconds. In Python: import time; int(time.time()).",
    },
  ],

  "cron-editor": [
    {
      q: "What is a cron expression?",
      a: "A cron expression is a five-field string that defines a recurring schedule for automated tasks. The fields, left to right, represent: minute (0–59), hour (0–23), day of month (1–31), month (1–12), and day of week (0–7, where 0 and 7 are Sunday). A star (*) means 'every value'. For example, '0 9 * * 1' means every Monday at 09:00.",
    },
    {
      q: "What do the special characters in a cron expression mean?",
      a: "* means 'every'. / means step: */5 in the minute field means every 5 minutes. - defines a range: 1-5 in day-of-week means Monday through Friday. , separates a list: 1,3,5 means Monday, Wednesday, Friday. ? is used in some implementations to mean 'no specific value' — the DevBench editor uses * for this purpose.",
    },
    {
      q: "How do I run a cron job every 5 minutes?",
      a: "Use */5 * * * * — this means 'at minute 0, 5, 10, 15 … of every hour, every day'. Enter it in the Cron Editor and the plain-English description and next 10 run times will confirm it.",
    },
    {
      q: "What is the difference between cron and GitHub Actions schedule syntax?",
      a: "GitHub Actions uses the same 5-field cron syntax with one difference: all times are in UTC. A cron of '0 9 * * 1' in GitHub Actions fires at 09:00 UTC on Mondays. On a server, the timezone depends on the system's locale. The Cron Editor shows run times in your local browser timezone.",
    },
    {
      q: "Why did my cron job not run at the expected time?",
      a: "Common reasons: the server clock is in UTC but you wrote the expression in local time; the cron daemon was not running; a syntax error prevented the expression from being parsed; or the job ran but exited silently. Paste the expression into the Cron Editor and verify the next run times match your intent.",
    },
  ],

  "api-tester": [
    {
      q: "Why do some API requests fail with a CORS error?",
      a: "Browsers block cross-origin requests when the server does not include the correct Access-Control-Allow-Origin header. The DevBench API Tester routes requests through a server-side proxy, so CORS errors are bypassed — the proxy makes the request server-to-server and returns the result to your browser.",
    },
    {
      q: "How do I add authentication to a request?",
      a: "Select the Auth tab and choose Bearer Token (paste your JWT or API token), Basic Auth (username and password), or API Key (header name and value). The tool adds the correct Authorization or custom header automatically.",
    },
    {
      q: "What HTTP methods are supported?",
      a: "GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS. Select the method from the dropdown before the URL field. GET and HEAD requests ignore any request body.",
    },
    {
      q: "Can I send a JSON request body?",
      a: "Yes. Select 'Body' → 'JSON' in the request tab, paste your JSON, and the tool sets the Content-Type: application/json header automatically. You can also send form data (application/x-www-form-urlencoded), multipart form data for file uploads, or raw text.",
    },
    {
      q: "Is it safe to test production APIs here?",
      a: "Treat any browser-based tool like a shared computer — avoid testing endpoints with production secrets or PII. For sensitive requests, use curl or Postman locally. The DevBench API Tester does not store your requests or responses, but your browser network traffic passes through the proxy server.",
    },
  ],

  // ── High-impression tool FAQs ─────────────────────────────────────────────
  "number-to-words": [
    {
      q: "How do I convert a number to words in English?",
      a: "Paste or type any number into the input field and the English word form appears instantly — for example, 1234567 becomes 'one million two hundred thirty-four thousand five hundred sixty-seven'. The converter handles integers up to the quadrillions and can also handle decimal fractions.",
    },
    {
      q: "How does the Indian numbering system (lakh/crore) work?",
      a: "In the Indian numbering system, 100,000 is written as 1 lakh (1,00,000) and 10,000,000 is written as 1 crore (1,00,00,000). Numbers are grouped differently from the international system: after the first three digits, groupings are in pairs of two — so 12,34,567 reads as 'twelve lakh thirty-four thousand five hundred sixty-seven'. Enable Indian mode in the converter for this output.",
    },
    {
      q: "Can I convert numbers to words for cheques or bank drafts?",
      a: "Yes. Enable currency mode to get the format used on cheques: 'Rupees One Million Two Hundred Thirty-Four Thousand Five Hundred Sixty-Seven Only' (or the equivalent in Indian lakh/crore notation). This is the standard format accepted by banks in India and internationally.",
    },
    {
      q: "What is the difference between cardinal and ordinal numbers?",
      a: "Cardinal numbers count quantity: one, two, three. Ordinal numbers indicate position: first, second, third. The converter supports both — toggle to ordinal mode to get 'first', 'second', 'twenty-first', etc. Ordinals are used for rankings, dates, and lists.",
    },
    {
      q: "What is the largest number this converter handles?",
      a: "The converter handles numbers up to the quadrillions (10^15). For scientific or engineering purposes requiring larger numbers, you may need a dedicated arbitrary-precision library. Numbers with decimal parts are supported — 3.14 converts to 'three point one four'.",
    },
  ],

  "contrast-checker": [
    {
      q: "What is the WCAG contrast ratio requirement?",
      a: "WCAG 2.2 Level AA requires a contrast ratio of at least 4.5:1 for normal text (below 18pt or 14pt bold) and 3:1 for large text (18pt+ or 14pt+ bold). Level AAA is stricter: 7:1 for normal text and 4.5:1 for large text. The contrast checker tests both levels and shows a clear pass/fail badge for each.",
    },
    {
      q: "How is the contrast ratio calculated?",
      a: "The contrast ratio is (L1 + 0.05) / (L2 + 0.05), where L1 is the lighter relative luminance and L2 is the darker one. Relative luminance uses linearised sRGB values and is defined by the WCAG. A ratio of 1:1 is no contrast (same colour); 21:1 is maximum contrast (black on white).",
    },
    {
      q: "Does this check apply to all text on my site?",
      a: "WCAG contrast requirements apply to text and images of text, but there are exceptions: large-scale text (≥18pt or ≥14pt bold), incidental text, logotypes, and text in inactive UI components are exempt. The checker tests the specific color pair you enter — you need to check every unique text/background combination on your site.",
    },
    {
      q: "What is the difference between WCAG AA and AAA compliance?",
      a: "Level AA is the standard target for most accessibility laws and guidelines (including the EU Web Accessibility Directive and Section 508 in the US). Level AAA provides enhanced accessibility and is recommended for high-importance content such as healthcare and legal documents. Achieving AAA for all text is often impractical due to design constraints.",
    },
    {
      q: "My text passes AA but still looks hard to read — why?",
      a: "Contrast ratio is not the only readability factor. Font size, weight, letter spacing, line height, and typeface legibility all affect readability independently of contrast. A 4.5:1 ratio with a thin 10px font can still be hard to read. WCAG also defines minimum font size guidelines separately from contrast requirements.",
    },
  ],

  "background-remover": [
    {
      q: "How does the AI background removal work?",
      a: "The tool uses a machine learning segmentation model (running in your browser via WebAssembly) to detect the subject in the image — typically a person, product, or object — and separate it from the background. The model outputs a mask that is applied to produce a transparent PNG. No image is sent to a server.",
    },
    {
      q: "What image formats are supported?",
      a: "PNG, JPEG, and WebP are supported as input. The output is always a PNG with a transparent background (alpha channel), regardless of the input format. If you need the result in a different format, convert it with the Image Format Converter on DevBench.",
    },
    {
      q: "Why does the background removal look rough around the edges?",
      a: "Edge quality depends on the contrast between the subject and background, image resolution, and the complexity of the subject's boundary (hair, fur, and fine details are harder). For best results, use a high-contrast, well-lit photo. If the edge is rough, try a photo editing tool like Photoshop or Remove.bg for more precise results.",
    },
    {
      q: "Is my photo uploaded to any server?",
      a: "No. The ML model runs entirely in your browser — your image is processed locally using WebAssembly and never leaves your device. DevBench does not store, log, or transmit any image you use with this tool.",
    },
    {
      q: "What types of images work best?",
      a: "Product photos on plain backgrounds, portrait photos with a clear subject, and images with strong contrast between the subject and background work best. Complex backgrounds, multiple similar-coloured objects, and highly detailed edges (curly hair, fur, foliage) are more challenging for automatic segmentation.",
    },
  ],

  "simple-interest": [
    {
      q: "What is the simple interest formula?",
      a: "Simple Interest = Principal × Rate × Time, or I = P × R × T. The principal (P) is the initial amount, the rate (R) is the annual interest rate as a decimal (e.g. 8% = 0.08), and time (T) is in years. The total amount at the end is A = P + I.",
    },
    {
      q: "What is the difference between simple interest and compound interest?",
      a: "Simple interest is calculated only on the principal amount — the interest does not accumulate on previously earned interest. Compound interest is calculated on the principal plus any interest already earned, causing the balance to grow faster over time. For the same principal, rate, and period, compound interest always results in a higher final amount than simple interest.",
    },
    {
      q: "When is simple interest used in practice?",
      a: "Simple interest is used for short-term personal loans, auto loans, some fixed deposits, US savings bonds, and invoice financing. It is also the basis of most consumer instalment loans where the daily balance determines the interest charge.",
    },
    {
      q: "How do I calculate interest for months instead of years?",
      a: "Divide the number of months by 12 to get the time in years. For example, 6 months = 0.5 years. Use the calculator's months input to do this automatically — it converts months to the fractional year value before applying the formula.",
    },
    {
      q: "What is the maturity value?",
      a: "The maturity value (also called the total amount or future value) is the principal plus the total interest earned at the end of the period: A = P + I. If you invested ₹10,000 at 8% per year for 2 years, the interest is ₹1,600 and the maturity value is ₹11,600.",
    },
  ],

  "line-sorter": [
    {
      q: "What is the difference between sort and deduplicate?",
      a: "Sort reorders all lines alphabetically (or reverse alphabetically) but keeps duplicates. Deduplicate removes repeated lines while preserving the order of first occurrence. You can combine both — sort first, then deduplicate — to get a sorted unique list.",
    },
    {
      q: "Is the sort case-sensitive?",
      a: "By default, sorting is case-insensitive so that 'apple', 'Apple', and 'APPLE' sort together. Enable case-sensitive mode if you need uppercase letters to sort before lowercase (ASCII order: A before a).",
    },
    {
      q: "What counts as a line?",
      a: "A line is any text separated by a newline character (\\n on Unix/macOS, \\r\\n on Windows). Blank lines are treated as empty lines and sorted or deduplicated accordingly. The sorter normalises line endings automatically.",
    },
    {
      q: "Can I sort numeric values correctly?",
      a: "Alphabetical sort treats numbers as strings: '10' would sort before '2' (because '1' < '2' as text). Enable numeric sort mode to sort numbers by their actual value so that 2 < 10 < 100.",
    },
  ],

  // ── Additional popular tools ───────────────────────────────────────────────
  "json-to-yaml": [
    {
      q: "What is the difference between JSON and YAML?",
      a: "JSON (JavaScript Object Notation) uses braces {}, brackets [], quotes for keys, and commas. YAML (YAML Ain't Markup Language) uses indentation, colons, and dashes — it is more human-readable and supports comments, which JSON does not. YAML is a superset of JSON: every valid JSON document is also valid YAML.",
    },
    {
      q: "Why is YAML used in DevOps tools?",
      a: "Kubernetes, Docker Compose, GitHub Actions, Ansible, and Helm all use YAML because it is readable without heavy syntax noise (no curly braces everywhere), supports multi-line strings naturally, and allows comments for documentation. These properties make it better for configuration files that humans write and maintain.",
    },
    {
      q: "Can YAML represent everything JSON can?",
      a: "Yes, plus more. YAML supports anchors (&) and aliases (*) for reusing values, multi-line strings, and comments. When converting JSON to YAML, nothing is lost — every JSON type (string, number, boolean, null, object, array) has a direct YAML equivalent.",
    },
    {
      q: "Is my JSON data safe to paste here?",
      a: "Yes. The JSON to YAML conversion runs entirely in your browser using JavaScript. No data is sent to any server, stored, or logged.",
    },
  ],

  "case-converter": [
    {
      q: "What is camelCase and when is it used?",
      a: "camelCase starts with a lowercase letter and capitalises the first letter of each subsequent word — for example, firstName or getUserById. It is the standard for JavaScript variable names, function names, and JSON property keys in most style guides.",
    },
    {
      q: "What is the difference between snake_case and kebab-case?",
      a: "snake_case uses underscores between words (user_first_name) and is standard in Python, Ruby, SQL column names, and environment variables. kebab-case uses hyphens (user-first-name) and is used in CSS class names, HTML attributes, URL slugs, and some CLI flags. Neither allows spaces — both are lowercase by convention.",
    },
    {
      q: "What is PascalCase used for?",
      a: "PascalCase capitalises the first letter of every word including the first — UserProfile, HttpRequest. It is the standard naming convention for class names in Java, C#, TypeScript, and Python; React component names; and .NET namespaces.",
    },
    {
      q: "What is SCREAMING_SNAKE_CASE?",
      a: "SCREAMING_SNAKE_CASE (also called CONSTANT_CASE or UPPER_SNAKE_CASE) is snake_case with all letters uppercase — MAX_RETRY_COUNT, DATABASE_URL. It is the standard for constants and environment variables in most languages.",
    },
  ],

  // ── JSON tools ────────────────────────────────────────────────────────────
  "json-diff": [
    { q: "How does JSON Diff work?", a: "JSON Diff parses both documents and performs a deep comparison of every key and value. Added keys appear in green, removed keys in red, and changed values show the old and new value side by side. Arrays are compared by index position." },
    { q: "Does the order of keys matter when diffing JSON?", a: "No. JSON objects are unordered by definition, so { a:1, b:2 } and { b:2, a:1 } are considered identical. Array order does matter — [1,2] and [2,1] are different." },
    { q: "Can I diff nested JSON objects?", a: "Yes. The diff is recursive — changes deep inside nested objects and arrays are shown at their exact path. Each change shows the full key path (e.g. user.address.city) so you know exactly where the difference is." },
    { q: "Is my JSON data safe to paste here?", a: "Yes. The diff runs entirely in your browser using JavaScript. No data is sent to any server, stored, or logged. You can confirm this by checking the Network tab in browser DevTools." },
    { q: "Why does my diff show differences when the values look the same?", a: "Common reasons: trailing whitespace in string values, type differences (the string \"1\" vs the number 1), or Unicode normalisation differences (e.g. composed vs decomposed accented characters). The diff treats types strictly — \"true\" (string) differs from true (boolean)." },
  ],

  "yaml-to-json": [
    { q: "What is YAML and why convert it to JSON?", a: "YAML is a human-readable data serialisation format used heavily in DevOps tooling (Kubernetes, Docker Compose, GitHub Actions, Ansible). Converting to JSON is useful when you need to process the data with JavaScript, pass it to a JSON-only API, or use jq for querying." },
    { q: "Does YAML support everything JSON does?", a: "Yes, and more. YAML supports comments, anchors & aliases (for reuse), multi-line strings, and additional scalar types. All JSON types map directly to YAML, so conversion is lossless in the JSON → YAML direction. YAML → JSON may strip comments and aliases." },
    { q: "What is a YAML anchor and alias?", a: "An anchor (&name) marks a value for reuse, and an alias (*name) references it. For example: defaults: &defaults timeout: 30 and then service: <<: *defaults. When converting to JSON the alias is expanded to the full value — there are no anchors in JSON." },
    { q: "What does '---' mean in a YAML file?", a: "Three dashes mark the start of a new YAML document within the same file. A file can contain multiple documents separated by ---. When converting to JSON, each document becomes a separate JSON object. The converter shows all documents as an array if more than one is present." },
    { q: "Is my YAML data safe to paste here?", a: "Yes. The conversion runs entirely in your browser. Nothing is sent to a server." },
  ],

  "yaml-formatter": [
    { q: "Why does my YAML fail with 'found a tab character'?", a: "YAML forbids tabs for indentation — only spaces are allowed. This is the most common YAML error. Your editor may have inserted a tab when you pressed the Tab key. The YAML Formatter detects tabs, reports the exact line, and can auto-fix them by replacing tabs with the correct number of spaces." },
    { q: "What causes 'mapping values are not allowed here'?", a: "This error usually means a colon : appears inside a value without being quoted. For example, url: http://example.com needs to be written as url: 'http://example.com' because the colon in the URL confuses the parser." },
    { q: "How do I write a multi-line string in YAML?", a: "Use a block scalar. The pipe | preserves newlines: description: | Line one. Line two. The folded style > folds newlines into spaces. Both are indented under the key." },
    { q: "What is the difference between single and double quotes in YAML?", a: "Single-quoted strings are literal — no escape sequences are processed. Double-quoted strings support escape sequences like \\n, \\t, and Unicode escapes (\\u0041). Use double quotes when you need special characters; use single quotes for strings that contain backslashes you want to be literal." },
    { q: "Can YAML have comments?", a: "Yes. A # character starts a comment and everything after it on that line is ignored. JSON does not support comments, so comments are lost if you convert YAML to JSON." },
  ],

  "json-to-csv": [
    { q: "What JSON structure can be converted to CSV?", a: "CSV represents a flat table, so the converter expects a JSON array of objects where each object has the same keys. Arrays of primitive values and deeply nested structures require flattening first. The converter flattens one level of nesting automatically using dot notation (e.g. user.name becomes a column header)." },
    { q: "What happens if objects in the array have different keys?", a: "Missing keys produce empty cells in that row. Extra keys not present in the first object are added as additional columns. The converter uses the union of all keys across all objects as the column headers." },
    { q: "How do I handle values that contain commas?", a: "The converter automatically wraps any value containing a comma, double quote, or newline in double quotes and escapes internal double quotes by doubling them (\"\"). This produces a valid RFC 4180 CSV that Excel, Google Sheets, and standard parsers handle correctly." },
    { q: "Can I open the output CSV directly in Excel?", a: "Yes. Download the CSV file and open it in Excel. If accented characters appear garbled, save the file as UTF-8 with BOM — the BOM tells Excel to use UTF-8 encoding. In the converter, enable the 'UTF-8 BOM' option before downloading." },
    { q: "Is my JSON data safe to paste here?", a: "Yes. All conversion runs in your browser. No data is sent to any server." },
  ],

  "csv-to-json": [
    { q: "Does the CSV need a header row?", a: "Yes, by default. The first row is used as the property names for each JSON object. If your CSV has no header row, enable 'No header' mode and the converter will use column indices (col0, col1, …) as keys." },
    { q: "What delimiters are supported besides comma?", a: "The converter auto-detects tabs (TSV), semicolons (common in European locales where comma is the decimal separator), and pipes. You can also override the delimiter manually." },
    { q: "How are quoted CSV fields handled?", a: "Fields enclosed in double quotes are unquoted, and doubled double quotes (\"\") inside a quoted field are unescaped to a single double quote. This follows RFC 4180 — the same parsing Excel uses." },
    { q: "Does it infer data types?", a: "Yes. Values that look like integers or floats are converted to JSON numbers, and 'true'/'false' (case-insensitive) become JSON booleans. Empty fields become null. Disable type inference if you want all values as strings." },
    { q: "Is my CSV data safe to paste here?", a: "Yes. All conversion runs in your browser. No data is sent to any server." },
  ],

  "json-to-typescript": [
    { q: "What TypeScript types are generated?", a: "The generator produces interface declarations matching the JSON structure. Strings become string, numbers become number, booleans become boolean, null becomes null, arrays become T[], and nested objects become nested interfaces. Fields that are null in the sample are typed as T | null." },
    { q: "How does the generator handle arrays with mixed types?", a: "If an array contains items of different types (e.g. [1, 'two', true]), the generated type is a union: (number | string | boolean)[]. For arrays with all-identical objects the element type is inferred from the first item." },
    { q: "Are fields marked as optional?", a: "Fields that are null in the sample JSON are generated as optional (?) or as T | null depending on the setting. If a key is missing from some objects in an array, it is also marked optional." },
    { q: "Should I use interface or type for the generated output?", a: "Both work for representing JSON shapes. interface is preferred for objects that may be extended (e.g. by intersection with other interfaces). type alias is preferred for unions and primitive aliases. The generator produces interface by default — you can rename it in your code." },
    { q: "Is my JSON data safe to paste here?", a: "Yes. Generation runs entirely in your browser. Nothing is sent to a server." },
  ],

  "json-to-xml": [
    { q: "How are JSON arrays represented in XML?", a: "Each array element becomes a child element with the same tag name as the array key. For example, {users: ['Alice', 'Bob']} becomes <users>Alice</users><users>Bob</users>. Nested objects inside arrays become elements with child tags." },
    { q: "What should the root element name be?", a: "XML requires a single root element. The converter defaults to <root> but you can change this in the Root Element field. Choose a name that describes your data — for example <response>, <users>, or <config>." },
    { q: "Can JSON null be represented in XML?", a: "XML has no native null type. Null values are represented as empty elements (e.g. <field />) or with an xsi:nil='true' attribute if you are using XML Schema. The converter produces empty elements for null values." },
    { q: "Does JSON to XML support attributes?", a: "Standard JSON does not have a concept of attributes — everything becomes child elements. If you need attribute output, transform your JSON to use a convention like @attribute keys before converting, or post-process the XML." },
    { q: "Is my data safe to paste here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "xml-to-json": [
    { q: "How are XML attributes handled?", a: "XML attributes are captured as properties with an @ prefix — for example, <item id='5'> becomes {item: {'@id': '5'}}. You can customise this behaviour in the options." },
    { q: "What happens with XML namespaces?", a: "Namespace prefixes are preserved as part of the key names (e.g. ns:element becomes 'ns:element'). Namespace declarations (xmlns:...) are included as attributes. Full namespace resolution is not performed." },
    { q: "Can I convert an RSS or Atom feed to JSON?", a: "Yes. RSS and Atom are XML formats. Paste the feed XML and the converter produces a JSON representation of the feed structure, which you can then query with JavaScript or process with jq." },
    { q: "Why do some values become arrays and others strings?", a: "When an XML element appears multiple times at the same level (e.g. multiple <item> tags), the converter makes them a JSON array. When it appears once it becomes a string or object. This is the standard XML-to-JSON convention — to force arrays, enable the 'always use arrays' option." },
    { q: "Is my data safe to paste here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "json-to-tsv": [
    { q: "What is the difference between CSV and TSV?", a: "TSV (Tab-Separated Values) uses tab characters as delimiters instead of commas. It is preferred when your data values often contain commas — with TSV you avoid the quoting complexity that CSV requires for comma-containing fields. Both formats are supported by Excel, Google Sheets, and most data tools." },
    { q: "When should I use TSV over CSV?", a: "Use TSV when your data contains commas (addresses, descriptions, notes), when pasting directly into spreadsheets (paste-as-tab-delimited preserves columns), or when piping to Unix tools like awk, cut, and sort which work naturally with tab-separated data." },
    { q: "Does TSV need quoted fields?", a: "Only if a field contains a tab or newline. Fields with commas do not need quoting in TSV (that is the advantage). The converter quotes and escapes fields that contain tabs or newlines." },
    { q: "Is my data safe to paste here?", a: "Yes. Conversion runs entirely in your browser. Nothing is sent to a server." },
  ],

  "tsv-to-json": [
    { q: "How do I paste TSV from Excel or Google Sheets?", a: "Select the cells in Excel or Google Sheets and copy (Ctrl+C / ⌘+C). When you paste into the TSV input, the tab characters between columns are preserved. The converter will detect them automatically and parse the rows into JSON objects." },
    { q: "What if my data has no header row?", a: "Enable 'No header' mode and the converter will use column indices (col0, col1, …) as JSON keys. You can rename the keys in the output afterwards." },
    { q: "Does it handle quoted fields in TSV?", a: "Yes. Fields containing tabs or newlines will be enclosed in double quotes in the TSV. The converter unquotes them correctly following standard TSV parsing rules." },
    { q: "Is my data safe to paste here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  // ── Encoding tools ─────────────────────────────────────────────────────────
  "base64-image": [
    { q: "What is a Base64 image data URI?", a: "A data URI embeds the image data directly in an HTML or CSS attribute using the format data:image/png;base64,<encoded-data>. The browser decodes it without making an HTTP request — useful for small icons, inline email images, and single-file HTML pages." },
    { q: "Should I use Base64 data URIs for all images?", a: "No. Base64 encoding increases file size by ~33%, and the browser cannot cache data URIs the way it caches external image URLs. Reserve them for very small images (icons, spacers <4 KB) and inline email images. For larger images, serve them as files." },
    { q: "What image formats are supported?", a: "PNG, JPEG, WebP, GIF, and SVG for encoding. For decoding, any valid Base64-encoded image data URI can be decoded back to a downloadable file." },
    { q: "How do I use a Base64 image in CSS?", a: "Set it as the background-image value: background-image: url('data:image/png;base64,iVBORw0...'); The same syntax works in HTML img src attributes and <source> elements." },
    { q: "Is my image safe to encode here?", a: "Yes. The encoding runs entirely in your browser using the FileReader API. Your image is never uploaded to a server." },
  ],

  "html-entity-encode": [
    { q: "Why do I need to encode HTML entities?", a: "Characters like < and > have special meaning in HTML — they open and close tags. If you want to display a literal < in a web page without the browser treating it as a tag, you must encode it as &lt;. This is also critical for security: failing to encode user input before inserting it into HTML can cause XSS (cross-site scripting) attacks." },
    { q: "Which characters must always be encoded?", a: "The five essential characters: & (encode first, as &amp;), < (as &lt;), > (as &gt;), \" (as &quot; in attributes), and ' (as &#39; or &apos; in attributes). Everything else is optional to encode but can be encoded for safety." },
    { q: "What is the difference between &amp; &lt; and their numeric equivalents?", a: "Named entities (&amp;, &lt;) and numeric entities (&#38;, &#60;) produce identical results in browsers. Named entities are more readable. Numeric entities are useful in contexts where named entities might not be recognised (some older XML parsers)." },
    { q: "Is this tool safe for preventing XSS?", a: "Encoding HTML entities is the correct technique for preventing XSS when displaying user content as text in HTML. However, it should be applied in code (your templating system or framework) at render time — not as a manual step. Always use your framework's built-in escaping (e.g. React auto-escapes JSX expressions, Django's template language auto-escapes by default)." },
    { q: "Is my data safe to encode here?", a: "Yes. Encoding runs in your browser. Nothing is sent to a server." },
  ],

  "html-entity-decode": [
    { q: "When would HTML entities appear in text I need to decode?", a: "Common sources: CMS databases that store HTML-escaped content, RSS/Atom feed descriptions (which are often HTML-escaped), email body text extracted from MIME, API responses from legacy systems, and clipboard content pasted from web pages." },
    { q: "What is &nbsp; and why does it appear so often?", a: "&nbsp; is the non-breaking space entity (Unicode U+00A0). It is used in HTML to prevent line breaks between words and to add extra spacing. When extracting text from HTML, &nbsp; appears wherever non-breaking spaces were used for layout." },
    { q: "Why doesn't decode work on my text?", a: "Check that the & is not itself encoded — double-encoded text like &amp;lt; needs to be decoded twice to get <. Also ensure the entity names are correct: HTML entities are case-sensitive (&Agrave; ≠ &agrave;)." },
    { q: "Is my data safe to decode here?", a: "Yes. Decoding runs in your browser. Nothing is sent to a server." },
  ],

  "text-to-hex": [
    { q: "Why would I convert text to hex?", a: "Hex is used in network protocols, binary file formats, cryptography (hash values, keys), colour codes in CSS, memory address debugging, and anywhere bytes need to be human-readable without ambiguity about encoding." },
    { q: "What encoding is used for the hex output?", a: "Each character is encoded to its UTF-8 byte sequence and each byte is represented as two hex digits. ASCII characters produce one byte each (e.g. 'A' → 41). Non-ASCII characters produce 2–4 bytes (e.g. '€' → E2 82 AC in UTF-8)." },
    { q: "How do I convert hex back to text?", a: "Use the Hex to Text converter on DevBench (linked in the toolbar). In JavaScript: Buffer.from('48656c6c6f', 'hex').toString('utf8') (Node.js) or new TextDecoder().decode(new Uint8Array(hex.match(/.{2}/g).map(b => parseInt(b, 16)))) in the browser." },
    { q: "Is my data safe to convert here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "hex-to-text": [
    { q: "What hex formats are accepted?", a: "Both continuous (48656c6c6f) and delimited formats (48 65 6c 6c 6f or 48:65:6c:6c:6f) are accepted. The converter strips whitespace and common delimiters automatically before decoding." },
    { q: "Why does my decoded text contain strange characters?", a: "The hex may represent bytes in a non-UTF-8 encoding (Latin-1, Windows-1252, etc.). Try selecting a different output encoding in the options. If the hex represents binary data rather than text, the output will appear garbled — that is expected." },
    { q: "How do I convert a hex colour code to its name?", a: "CSS hex colour codes (like #4f46e5) are not text hex — they are three RGB byte values. Use the Colour Converter on DevBench to look up colour names and convert between hex, RGB, and HSL formats." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "text-to-binary": [
    { q: "Is this the same binary used in computers?", a: "Yes. Each character is converted to its UTF-8 byte value and that byte is represented as an 8-bit binary number (e.g. 'A' = ASCII 65 = 01000001). This is the actual binary representation of the character in memory." },
    { q: "Why does 'A' convert to 01000001?", a: "'A' has ASCII (and Unicode) code point 65. 65 in binary is 1000001 — padded to 8 bits it becomes 01000001. You can verify: 64+1 = 65, and 64 = 2^6 = bit 7, 1 = 2^0 = bit 1." },
    { q: "How do I convert binary back to text?", a: "Use the Binary to Text converter on DevBench. In JavaScript: String.fromCharCode(parseInt('01000001', 2)) converts one byte. For a full string, split on spaces and map each 8-bit group." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "binary-to-text": [
    { q: "What format should the binary input be in?", a: "Groups of 8 bits (one byte) separated by spaces: 01001000 01100101 01101100 01101100 01101111. The converter also accepts continuous binary without spaces as long as the total length is a multiple of 8." },
    { q: "Why do I get garbage characters?", a: "If each binary group does not correspond to a valid UTF-8 byte sequence, the decoded characters will be replacement characters (?) or strange symbols. Ensure the binary was originally produced from UTF-8 text, not a different encoding." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "rot13": [
    { q: "Is ROT13 a cipher or just an encoding?", a: "ROT13 is a trivially simple substitution cipher — it provides no meaningful security because it is widely known and requires no key. It is used for obfuscation (spoilers, puzzle answers) rather than secrecy. Anyone who sees ROT13 text and knows it is ROT13 can decode it instantly." },
    { q: "How do I decode ROT13?", a: "Apply ROT13 again. Because the alphabet has 26 letters and ROT13 shifts by 13, applying it twice brings you back to the original. There is no separate decode step — encoding and decoding are the same operation." },
    { q: "Does ROT13 affect numbers and punctuation?", a: "No. Only the 26 Latin letters (A–Z, a–z) are shifted. Numbers, spaces, punctuation, and non-Latin characters are passed through unchanged." },
    { q: "Is my data safe here?", a: "Yes. ROT13 runs in your browser. Nothing is sent to a server." },
  ],

  "morse-code": [
    { q: "What is International Morse Code?", a: "International Morse Code is a system that encodes text as sequences of short signals (dots •) and long signals (dashes −). Originally designed for telegraph communication, it is still used in amateur radio, aviation, and accessibility contexts. Each letter and digit has a unique dot-dash sequence." },
    { q: "How are spaces and word boundaries represented?", a: "Letters within a word are separated by a short gap (shown as a single space in text representation). Words are separated by a longer gap (shown as / in text). For example, 'SOS' in Morse is ... --- ... and 'HELLO WORLD' is .... . .-.. .-.. --- / .-- --- .-. .-.. -.." },
    { q: "Does Morse Code support numbers and punctuation?", a: "Yes. All digits 0–9 have Morse representations (e.g. 1 = .---- and 0 = -----). Common punctuation marks are also defined in the International Morse Code standard, including period, comma, question mark, and slash." },
    { q: "Is my text safe here?", a: "Yes. Translation runs in your browser. Nothing is sent to a server." },
  ],

  // ── Text tools ─────────────────────────────────────────────────────────────
  "word-counter": [
    { q: "How is a word defined in the counter?", a: "A word is any sequence of non-whitespace characters separated by spaces, tabs, or newlines. Hyphenated words (state-of-the-art) count as one word. Contractions (don't) count as one word. Numbers and punctuation-only tokens count as words." },
    { q: "What is the reading time estimate based on?", a: "The estimate uses an average silent reading speed of 200 words per minute (wpm) for adults — the commonly cited figure for body text. Actual reading speed varies widely (150–350 wpm) based on text complexity and individual reading skill." },
    { q: "How is a sentence counted?", a: "Sentences are delimited by . ! ? followed by whitespace or end of input. Ellipses (…) count as one sentence end. Abbreviations (e.g., U.S.A.) may cause slight over-counting — the counter uses a heuristic that reduces false positives." },
    { q: "Does it count HTML or Markdown formatting?", a: "The counter counts raw characters including tags and markers. If you want to count only visible text, strip the HTML or Markdown first using the Strip Markdown or HTML to Plain Text tools on DevBench, then paste the plain text here." },
    { q: "Is my text safe here?", a: "Yes. Counting runs in your browser. Nothing is sent to a server." },
  ],

  "slug-generator": [
    { q: "What characters are removed from a slug?", a: "All characters except letters, numbers, and hyphens are removed. Spaces and underscores become hyphens, accented characters are transliterated (é→e, ü→u, ç→c), and consecutive hyphens are collapsed to one. The result is lowercase and safe for use in URLs without percent-encoding." },
    { q: "Should a slug end with a hyphen?", a: "No. Trailing and leading hyphens are stripped automatically. A slug like my-blog-post- would become my-blog-post. This is standard behaviour for SEO-friendly URL slugs." },
    { q: "What is the maximum recommended slug length?", a: "Keep slugs under 60–75 characters. Search engines truncate long URLs in their display. Google recommends short, descriptive URLs with 3–5 meaningful keywords. Avoid filler words (the, a, of, and) if the slug becomes too long." },
    { q: "Should I include a date in the slug?", a: "It depends on your content strategy. Date-based slugs (/2024/05/my-post) help with organisation but make evergreen content seem dated. Dateless slugs (/my-post) are cleaner for content you update over time. Most modern blogs and docs use dateless slugs." },
    { q: "Is my text safe here?", a: "Yes. Slug generation runs in your browser. Nothing is sent to a server." },
  ],

  "lorem-ipsum": [
    { q: "What does 'Lorem ipsum' mean?", a: "Lorem ipsum is derived from Cicero's 'de Finibus Bonorum et Malorum' (45 BC), scrambled to produce nonsense text. The phrase 'Lorem ipsum dolor sit amet…' has been used as placeholder text in typesetting since the 1500s. It looks like Latin but is not grammatically correct Latin." },
    { q: "Why use Lorem Ipsum instead of real text?", a: "Placeholder text lets designers evaluate a layout's typography and spacing without the distraction of readable content. Real text draws attention to its meaning; Lorem Ipsum keeps focus on the visual design. It also prevents stakeholders from fixating on unfinished copy." },
    { q: "Can I generate other languages' placeholder text?", a: "This generator produces classical Lorem Ipsum and a randomised Latin-like variant. For designs targeting specific scripts (Arabic, Devanagari, CJK), you should use placeholder text in the target script — classical Lorem Ipsum won't represent text length and line-break behaviour accurately for non-Latin scripts." },
    { q: "Is my generated text safe to use?", a: "Lorem Ipsum is public domain placeholder text and can be used in any project, commercial or otherwise." },
  ],

  "find-replace": [
    { q: "How do I use regex in Find & Replace?", a: "Enable Regex mode and enter a JavaScript regular expression in the Find field (without slashes). The Replace field supports backreferences: $1 for the first capture group, $2 for the second, and $& for the entire match. For example, find (\\w+) and replace with [$1] wraps every word in brackets." },
    { q: "How do I replace a newline character?", a: "In Regex mode, use \\n to match a newline. For Windows CRLF, use \\r\\n. In plain text mode, paste an actual newline into the find field (Shift+Enter in some browsers)." },
    { q: "Can I replace all occurrences at once?", a: "Yes. 'Replace All' replaces every match in the input. 'Replace First' replaces only the first match — useful when you need to verify the replacement looks right before applying it everywhere." },
    { q: "Is my text safe here?", a: "Yes. Find & Replace runs in your browser. Nothing is sent to a server." },
  ],

  "whitespace-normalizer": [
    { q: "What is CRLF and why does it cause problems?", a: "CRLF (Carriage Return + Line Feed, \\r\\n) is the Windows line ending standard. Unix/macOS use LF (\\n) only. Mixed line endings cause issues in git diffs, shell scripts, and tools that expect a single style. The normaliser converts all line endings to LF." },
    { q: "Why does pasted text from PDFs have extra spaces?", a: "PDF text extraction often inserts spaces between characters, words, or columns because it reconstructs text from glyph positions rather than character streams. The Whitespace Normaliser collapses multiple consecutive spaces to one, cleaning up these artefacts." },
    { q: "Will this remove intentional indentation?", a: "It depends on the mode. 'Trim trailing whitespace' removes spaces and tabs at the end of each line only. 'Collapse multiple spaces' collapses runs of spaces inside lines. Indentation at the start of a line is preserved unless you enable 'Trim leading whitespace'." },
    { q: "Is my text safe here?", a: "Yes. Normalisation runs in your browser. Nothing is sent to a server." },
  ],

  "string-reverse": [
    { q: "Does reversing preserve emoji?", a: "Yes. The reversal uses Unicode-aware character iteration, so emoji and multi-codepoint sequences (e.g. family emoji) are treated as single units and not split into individual bytes or code units. 🎉 reversed is still 🎉." },
    { q: "What does 'reverse line order' do?", a: "Instead of reversing characters within lines, it reverses the sequence of lines. If your input has 5 lines, line 5 becomes line 1, line 4 becomes line 2, and so on. Useful for reversing logs or numbered lists." },
    { q: "What is a palindrome?", a: "A palindrome is a word, phrase, or sequence that reads the same forwards and backwards — for example, 'racecar', 'level', and 'A man a plan a canal Panama' (ignoring spaces and capitalisation). Use the reverser to check if a string is a palindrome." },
    { q: "Is my text safe here?", a: "Yes. Reversal runs in your browser. Nothing is sent to a server." },
  ],

  "markdown-to-html": [
    { q: "What is GitHub Flavored Markdown (GFM)?", a: "GFM is GitHub's extension of the original Markdown specification. It adds tables (| col1 | col2 |), task lists (- [x] done), fenced code blocks with syntax highlighting hints (```js), strikethrough (~~text~~), and auto-linked URLs. Most modern Markdown tools support GFM." },
    { q: "Can I use the HTML output directly in a web page?", a: "Yes. Copy the HTML output and paste it inside a <body> or a container div. You will need to add your own CSS for styling — the raw HTML output has semantic tags (h1, p, ul, pre, code) but no inline styles." },
    { q: "How do I add a table in Markdown?", a: "Use pipe characters and dashes: | Header 1 | Header 2 | followed by | --- | --- | and then data rows. Alignment can be specified with colons: | :left | center: | :right: |." },
    { q: "Is my Markdown safe here?", a: "Yes. Rendering runs in your browser. Nothing is sent to a server." },
  ],

  "html-to-markdown": [
    { q: "Why does some HTML not convert cleanly to Markdown?", a: "Markdown is a simpler format than HTML and does not support everything HTML does. Tables with complex spanning, nested lists with mixed content, inline styles (colour, font size), and custom HTML5 elements have no Markdown equivalent and are either simplified or left as raw HTML in the output." },
    { q: "What HTML elements are preserved in Markdown?", a: "Headings (h1-h6), paragraphs, bold/strong, italic/em, inline code, fenced code blocks, links, images, unordered and ordered lists, blockquotes, and horizontal rules all convert cleanly. Tables convert to GFM pipe tables." },
    { q: "Will inline styles be preserved?", a: "No. Markdown has no syntax for text colour, font size, or other visual styles. The converter strips style attributes and keeps only the structural content." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "html-to-text": [
    { q: "What is the difference between 'strip tags' and 'render then extract'?", a: "Stripping tags removes angle-bracket HTML markup but leaves entities like &amp; encoded. Rendering first then extracting (what browsers do) also decodes entities and applies block-level spacing. This tool strips tags and decodes entities, giving clean readable text." },
    { q: "Are links preserved in the plain text output?", a: "Link text is preserved but the URL is discarded unless you enable the 'show URLs' option, which appends the href in parentheses like this: Link text (https://example.com). This matches the output of text-based browsers like Lynx." },
    { q: "Why do some emails look garbled after stripping HTML?", a: "HTML emails often have text in a hidden element alongside an HTML version. Email clients show the HTML; the plain text alternative is a separate MIME part. Copy the HTML source of the email (not the plain text fallback) and strip it here for clean output." },
    { q: "Is my data safe here?", a: "Yes. Processing runs in your browser. Nothing is sent to a server." },
  ],

  "strip-markdown": [
    { q: "What Markdown syntax is removed?", a: "All standard Markdown and GitHub Flavored Markdown syntax is removed: headings (#), bold (**), italic (*_), links ([]()), images (![]()), inline code (`), fenced code blocks (```), blockquotes (>), horizontal rules (---), and list markers (-, *, 1.). The link destination URLs are also discarded." },
    { q: "Is code inside code blocks removed?", a: "The code block syntax markers (backticks or tildes) are removed, but the code content itself is preserved in the plain text output. If you want to remove code entirely, filter the output manually." },
    { q: "Why would I strip Markdown?", a: "Common use cases: generating a word count of actual content, creating a plain-text search index, populating a meta description from Markdown body content, and feeding Markdown content to tools that do not understand Markdown syntax." },
    { q: "Is my data safe here?", a: "Yes. Processing runs in your browser. Nothing is sent to a server." },
  ],

  "unicode-checker": [
    { q: "What is a Unicode codepoint?", a: "A Unicode codepoint is a number assigned to each character in the Unicode standard — over 149,000 characters across 154 scripts. Codepoints are written as U+XXXX (e.g. U+0041 for 'A', U+1F600 for 😀). The checker shows the codepoint, official Unicode name, and category for every character in your input." },
    { q: "What are invisible characters and why are they dangerous?", a: "Invisible characters include zero-width space (U+200B), zero-width non-joiner (U+200C), soft hyphen (U+00AD), byte order mark (U+FEFF), and directional marks (U+200E, U+200F). They are invisible in most editors but present in the string. They can cause string comparison failures, security issues (domain homograph attacks), and unexpected word-boundary behaviour." },
    { q: "What is a homoglyph?", a: "A homoglyph is a character that looks visually similar to another — for example, the Cyrillic 'о' (U+043E) looks identical to the Latin 'o' (U+006F). Homoglyphs are used in phishing (substituting Cyrillic letters in domain names) and obfuscation attacks. The checker flags characters from unexpected scripts." },
    { q: "What does UTF-8 bytes show?", a: "For each character, the checker shows the UTF-8 byte sequence — the actual bytes stored on disk or transmitted over the network. 'A' is one byte (0x41). '€' is three bytes (0xE2 0x82 0xAC). Emoji are typically four bytes. This is useful for calculating byte lengths of strings for database varchar limits and HTTP Content-Length." },
    { q: "Is my text safe here?", a: "Yes. Analysis runs in your browser. Nothing is sent to a server." },
  ],

  "string-inspector": [
    { q: "What is the difference between character count and byte count?", a: "Character count counts Unicode codepoints (visible and invisible). Byte count counts the actual bytes in the string's encoding. For ASCII text they are equal, but for strings with accented characters (é = 2 bytes), emoji (😀 = 4 bytes), or CJK characters (Chinese/Japanese/Korean = 3 bytes) the byte count is higher. Database columns, HTTP headers, and file sizes are measured in bytes." },
    { q: "What is Shannon entropy?", a: "Shannon entropy measures the information density of a string — how unpredictable it is. A string of all the same character ('aaaaaaa') has entropy 0. A random password has high entropy. The inspector shows entropy in bits per character — useful for estimating password strength and detecting encoding anomalies." },
    { q: "Why would I need character frequency analysis?", a: "Frequency analysis is the basis of classical cryptography attacks. It is also useful for detecting which language a text is written in, finding unexpected character distributions in data pipelines, and debugging encoding issues where a specific byte appears more than expected." },
    { q: "Is my text safe here?", a: "Yes. Analysis runs in your browser. Nothing is sent to a server." },
  ],

  "markdown-preview": [
    { q: "What Markdown flavour does this preview use?", a: "The preview renders GitHub Flavored Markdown (GFM) — the same dialect used by GitHub READMEs, issues, and pull requests. This includes tables, task lists (- [x]), fenced code blocks with language tags, strikethrough, and auto-linked URLs." },
    { q: "How do I preview a table in Markdown?", a: "Use pipe characters to define columns: | Col 1 | Col 2 | on the header row, | --- | --- | on the separator row, and | data | data | for each data row. The preview renders it as an HTML table." },
    { q: "Can I export the HTML output?", a: "Yes. Click the 'Copy HTML' button to copy the rendered HTML to your clipboard. You can then paste it into a CMS, email template, or any tool that accepts HTML input." },
    { q: "Is my Markdown safe here?", a: "Yes. Rendering runs in your browser. Nothing is sent to a server." },
  ],

  "text-diff": [
    { q: "What algorithm does the text diff use?", a: "The Myers diff algorithm — the same algorithm used by Git for computing diffs. It finds the shortest edit script (minimum additions and deletions) between two texts. This produces minimal, clean diffs that highlight only genuine changes." },
    { q: "How does the diff handle whitespace-only changes?", a: "By default, whitespace-only changes (extra spaces, blank lines) are shown as additions and deletions. Enable 'Ignore whitespace' to suppress these and see only meaningful text changes." },
    { q: "What is a unified diff?", a: "A unified diff format (used by Git and patch) shows changed lines with context. Added lines are prefixed with +, removed lines with -. It is a compact, standard format readable by most diff tools and code review systems." },
    { q: "Is my data safe here?", a: "Yes. Diff computation runs in your browser. Nothing is sent to a server." },
  ],

  // ── Dev tools ────────────────────────────────────────────────────────────────
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

  "unix-timestamp": [
    { q: "What is the difference between a Unix timestamp and epoch time?", a: "They are the same thing. 'Unix timestamp', 'epoch timestamp', 'POSIX time', and 'Unix time' all refer to the number of seconds elapsed since the Unix epoch (00:00:00 UTC, 1 January 1970). The terms are interchangeable." },
    { q: "How do I get the current Unix timestamp in JavaScript?", a: "Math.floor(Date.now() / 1000) gives the current timestamp in seconds. Date.now() gives milliseconds. new Date().getTime() also gives milliseconds." },
    { q: "What is a 13-digit timestamp?", a: "A 13-digit timestamp is in milliseconds rather than seconds. JavaScript's Date.now() returns milliseconds. To convert to seconds divide by 1000. The converter auto-detects whether your input is seconds or milliseconds based on digit count." },
    { q: "What timezone is a Unix timestamp in?", a: "Unix timestamps are always in UTC (Coordinated Universal Time) — they have no timezone. When you display them as a date, you apply a timezone offset. The converter shows the time in your browser's local timezone and also in UTC." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "cron-parser": [
    { q: "What is a cron expression used for?", a: "Cron expressions schedule recurring tasks on Unix-based systems. They are used in crontab files, GitHub Actions workflow schedules, Kubernetes CronJobs, AWS EventBridge rules, Vercel cron jobs, and Node.js schedulers like node-cron and cron." },
    { q: "How do I run a job every weekday at 9am?", a: "Use 0 9 * * 1-5. This means: minute 0, hour 9, every day of month, every month, Monday through Friday (1–5). Enter it in the parser to confirm the plain-English description and next run times." },
    { q: "What is the difference between 0 0 * * 0 and @weekly?", a: "@weekly is a shorthand supported by many cron implementations and is equivalent to 0 0 * * 0 — midnight on Sunday. Other shorthands: @daily (0 0 * * *), @hourly (0 * * * *), @monthly (0 0 1 * *), @yearly (0 0 1 1 *)." },
    { q: "Is my cron expression data safe here?", a: "Yes. Parsing runs in your browser. Nothing is sent to a server." },
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

  "timezone-converter": [
    { q: "What time zones are available?", a: "All 600+ IANA time zones are available — from Pacific/Apia to Pacific/Auckland. Both canonical names (America/New_York) and common abbreviations (EST, IST, JST) can be searched. IANA zones automatically handle Daylight Saving Time transitions." },
    { q: "What is the difference between UTC and GMT?", a: "For practical purposes they are the same. UTC (Coordinated Universal Time) is the international standard time reference. GMT (Greenwich Mean Time) is the timezone of the UK in winter. Modern usage treats them interchangeably, though technically UTC is defined by atomic clocks and GMT by solar time." },
    { q: "How do I schedule a meeting across time zones?", a: "Enter the meeting date and time in your local zone, add the zones of all participants, and the converter shows the local time for each. Share the link — it encodes the zones and time so recipients can open it and see the conversion for their own context." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "websocket-tester": [
    { q: "What is a WebSocket?", a: "A WebSocket is a full-duplex communication protocol over a persistent TCP connection. Unlike HTTP (request-response), WebSockets allow the server to push data to the client at any time. They are used in chat apps, live dashboards, collaborative tools, gaming, and financial data feeds." },
    { q: "How do I connect to a WebSocket server?", a: "Enter the WebSocket URL (ws:// for unencrypted, wss:// for TLS-encrypted) in the URL field and click Connect. Once the connection is established, type a message in the input and click Send. Incoming messages appear in the log panel." },
    { q: "What is the difference between ws:// and wss://?", a: "wss:// (WebSocket Secure) uses TLS encryption, the same as HTTPS. ws:// is unencrypted. Use wss:// for any production endpoint. Browsers block ws:// connections on HTTPS pages due to mixed-content restrictions — use wss:// for endpoints used from the DevBench tester." },
    { q: "Is my WebSocket data safe here?", a: "Messages you send and receive are displayed in the browser and not logged by DevBench. Your WebSocket traffic flows directly from your browser to the target server — DevBench does not proxy WebSocket connections." },
  ],

  "salary-hike-calculator": [
    { q: "How is the percentage hike calculated?", a: "Hike % = ((New Salary − Old Salary) / Old Salary) × 100. For example, if your CTC goes from ₹800,000 to ₹960,000, the hike is ((960,000 − 800,000) / 800,000) × 100 = 20%." },
    { q: "Should I compare CTC or take-home salary?", a: "Compare the same figure in both cases. CTC (Cost to Company) includes employer PF contributions, gratuity, and benefits — it is the total cost to the employer. Take-home is post-tax, post-deduction cash you actually receive. Offers should be compared on CTC if one employer includes more benefits." },
    { q: "What is a good hike percentage in India?", a: "Industry benchmarks vary by sector. In India's IT sector, an average annual hike is 8–12%. Job-change hikes are typically 20–40%. Inflation adjustment hikes (to maintain purchasing power) require at least matching the CPI inflation rate." },
    { q: "Is my salary data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  // ── Conversion tools ────────────────────────────────────────────────────────
  "temperature-converter": [
    { q: "What is the formula for Celsius to Fahrenheit?", a: "°F = (°C × 9/5) + 32. The reverse: °C = (°F − 32) × 5/9. Quick mental approximation: double the Celsius and add 30 (e.g. 20°C ≈ 70°F). For exact conversion use the calculator." },
    { q: "What is Kelvin and when is it used?", a: "Kelvin (K) is the absolute temperature scale used in physics and chemistry. 0 K is absolute zero (−273.15°C), the coldest possible temperature. Water freezes at 273.15 K and boils at 373.15 K. Kelvin is used in thermodynamics, gas laws, and colour temperature of light sources." },
    { q: "What is normal human body temperature?", a: "The traditional value is 98.6°F (37°C), but research shows the average is closer to 97.5°F (36.4°C) and varies by person, age, and time of day. A temperature above 100.4°F (38°C) is generally considered a fever." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "byte-converter": [
    { q: "What is the difference between KB and KiB?", a: "1 KB (kilobyte, SI standard) = 1000 bytes. 1 KiB (kibibyte, IEC standard) = 1024 bytes. Hard drive manufacturers use SI (so a '1 TB' drive has 1,000,000,000,000 bytes). Operating systems traditionally use binary prefixes (so Windows shows it as ~931 GiB). This discrepancy is the source of the apparent 'missing' space on drives." },
    { q: "How much is 1 gigabyte?", a: "1 GB (SI) = 1,000,000,000 bytes (10^9). 1 GiB (binary) = 1,073,741,824 bytes (2^30). For networking (ISP speeds) SI is used. For RAM and operating system file sizes, binary prefixes are standard. Always check which convention is being used when comparing storage or network capacities." },
    { q: "What is the largest common unit?", a: "The converter goes up to petabytes (PB, 10^15 bytes) and pebibytes (PiB, 2^50 bytes). Above that are exabytes, zettabytes, and yottabytes — relevant for global internet traffic and data centre storage at scale." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "unit-converter": [
    { q: "What unit categories are supported?", a: "Length (millimetres to miles), weight/mass (milligrams to tonnes and imperial pounds), area (square millimetres to square miles and acres), volume (millilitres to cubic metres and gallons), and speed (metres per second to miles per hour)." },
    { q: "What is the difference between mass and weight?", a: "Mass is the amount of matter in an object (measured in kg, grams, pounds) and does not change with gravity. Weight is the force exerted by gravity on that mass (measured in Newtons). In everyday usage, 'weight' usually means mass — the converter uses mass units (kg, lb)." },
    { q: "How many teaspoons are in a tablespoon?", a: "3 teaspoons = 1 tablespoon (US). 1 US tablespoon = 14.787 ml. 1 UK tablespoon = 15 ml. The unit converter covers cooking volumes — switch to the volume category and look for teaspoon/tablespoon." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "roman-numerals": [
    { q: "What are the basic Roman numeral symbols?", a: "I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. Subtractive notation: IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900. Only six subtractive combinations are valid — all others are additive (e.g. VIII = 8)." },
    { q: "What is the largest number representable in standard Roman numerals?", a: "3999 (MMMCMXCIX). Standard Roman numerals cannot represent zero or numbers above 3999 without using a bar over a numeral (vinculum) to multiply by 1000, which is non-standard in most modern use." },
    { q: "Where are Roman numerals still used today?", a: "Clock faces, movie copyright years (e.g. MMXXIV), Super Bowl numbering (Super Bowl LVIII), chapter and page numbering in books, names of monarchs and popes (King Charles III), academic outlines, and film/TV sequel numbering (Rocky IV)." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "duration-converter": [
    { q: "How do I convert 3600 seconds to HH:MM:SS?", a: "3600 seconds = 1 hour = 01:00:00. The formula: hours = floor(seconds / 3600), minutes = floor((seconds % 3600) / 60), seconds = seconds % 60. In JavaScript: new Date(3600 * 1000).toISOString().substring(11, 19)." },
    { q: "What is the difference between HH:MM:SS and HH:MM:SS.mmm?", a: "HH:MM:SS shows whole seconds. HH:MM:SS.mmm includes milliseconds (three decimal places). For video timecodes, audio editing, and performance profiling, millisecond precision is often needed. Enable milliseconds mode in the converter." },
    { q: "How many seconds are in a day?", a: "86,400 seconds (60 × 60 × 24). In a week: 604,800 seconds. In a 30-day month: 2,592,000 seconds. In a 365-day year: 31,536,000 seconds." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  "percentage-calc": [
    { q: "How do I calculate a 20% discount on a price?", a: "Discounted price = original × (1 − 0.20) = original × 0.80. For example, 20% off ₹500 = ₹500 × 0.80 = ₹400. The savings amount = original × 0.20 = ₹100. Use the 'X% of Y' mode in the calculator." },
    { q: "How do I calculate percentage change?", a: "Percentage change = ((New − Old) / Old) × 100. If sales went from 80 to 92: ((92 − 80) / 80) × 100 = +15%. A negative result is a percentage decrease. Use the '% change from A to B' mode." },
    { q: "What is the difference between percentage points and percent?", a: "Percentage points are absolute differences: if interest rates rise from 2% to 5%, that is a 3 percentage-point increase. Percent change is relative: 2% to 5% is a 150% increase (3 / 2 × 100). The distinction matters greatly in finance and statistics reporting." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "aspect-ratio": [
    { q: "What does '16:9' mean?", a: "16:9 means for every 16 units of width, there are 9 units of height. This is the standard widescreen aspect ratio used for HDTV (1920×1080, 2560×1440, 3840×2160 — all 16:9). The ratio can be any consistent unit — pixels, centimetres, or inches." },
    { q: "How do I maintain aspect ratio when resizing an image?", a: "Use the calculator: enter the original width and height, then enter the new width — the calculator computes the height that preserves the original ratio. For CSS: use aspect-ratio: 16/9 on the element, or padding-bottom trick for older browsers." },
    { q: "What are common social media aspect ratios?", a: "Instagram feed: 1:1 (square) or 4:5 portrait. Instagram Stories / Reels: 9:16 vertical. YouTube thumbnails: 16:9. Twitter/X card images: 2:1. LinkedIn banner: ~4:1. Facebook cover: ~2.7:1. Enter the pixel dimensions of any platform into the calculator to find its exact ratio." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "world-clock": [
    { q: "How do I know if a city is currently in standard time or DST?", a: "The World Clock shows the current UTC offset for each city — if a city normally observes DST, its offset during summer (e.g. UTC+5:30 → UTC+6:30) indicates whether DST is active. The displayed time already accounts for the current DST status." },
    { q: "What is UTC and why is it used as the reference?", a: "UTC (Coordinated Universal Time) is the international standard time reference, maintained by atomic clocks. It does not observe Daylight Saving Time. All other time zones are expressed as UTC+X or UTC−X offsets. Using UTC avoids ambiguity when coordinating across time zones." },
    { q: "What is the time difference between India and the US (Eastern)?", a: "India (IST, UTC+5:30) is 10.5 hours ahead of US Eastern Standard Time (EST, UTC−5) and 9.5 hours ahead of Eastern Daylight Time (EDT, UTC−4). Use the Timezone Converter for exact scheduling." },
    { q: "Is my data safe here?", a: "Yes. The clock runs in your browser. Nothing is sent to a server." },
  ],

  // ── Finance tools ──────────────────────────────────────────────────────────
  "gst-calculator": [
    { q: "What is the difference between inclusive and exclusive GST?", a: "Exclusive GST: the listed price does not include tax — tax is added on top. If the base price is ₹1000 and GST is 18%, the total is ₹1180. Inclusive GST: the listed price already includes the tax. To extract the base from ₹1180 at 18%: ₹1180 / 1.18 = ₹1000." },
    { q: "What are the GST tax slabs in India?", a: "India's GST has four main tax slabs: 5% (essential goods and services), 12% (standard goods), 18% (most services and processed goods), and 28% (luxury goods, demerit goods like tobacco and aerated drinks). Some goods like fresh food and health services are exempt (0%)." },
    { q: "What is IGST, CGST, and SGST?", a: "For inter-state transactions, IGST (Integrated GST) applies — the full rate collected by the central government. For intra-state transactions, the rate is split equally between CGST (Central GST) and SGST (State GST). A 18% intra-state transaction has 9% CGST + 9% SGST." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "discount-calculator": [
    { q: "How do I calculate the final price after multiple discounts?", a: "Discounts are applied sequentially, not additively. A 20% discount followed by a 10% discount is NOT 30% off — it is: price × 0.80 × 0.90 = 72% of original (28% total reduction). Apply them one at a time using the calculator." },
    { q: "What is the difference between discount and markdown?", a: "A discount is a reduction from the listed price (the customer pays less). A markdown is a permanent reduction in the price itself (the new lower price becomes the regular price). Both reduce what the customer pays, but markdown implies the price has been permanently lowered." },
    { q: "How do I find the original price from the sale price and discount?", a: "Original = Sale price / (1 − discount%). For a ₹800 item after a 20% discount: original = 800 / (1 − 0.20) = 800 / 0.80 = ₹1000. Use the reverse mode in the calculator." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "tip-calculator": [
    { q: "What is a standard tip percentage?", a: "In India, tipping is not mandatory and 10% is considered generous at restaurants. In the US, 15–20% is standard for sit-down restaurants, with 20–25% for excellent service. In the UK, 10–12.5% is standard; many restaurants add a discretionary service charge." },
    { q: "How is tip calculated on a bill?", a: "Tip = bill amount × (tip percentage / 100). Total per person = (bill + tip) / number of people. If the bill is ₹1200, tip is 15%, and 3 people split it: tip = ₹180, total = ₹1380, per person = ₹460." },
    { q: "Should tip be calculated before or after tax?", a: "In the US, tipping etiquette says to tip on the pre-tax amount, though many people tip on the total including tax for simplicity. The calculator lets you choose which amount to use as the base." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "roi-calculator": [
    { q: "What does a negative ROI mean?", a: "A negative ROI means the investment lost money — the gain was less than the cost. For example, investing ₹10,000 and getting back ₹8,000 gives ROI = (8,000 − 10,000) / 10,000 = −20%." },
    { q: "What is annualised ROI and when should I use it?", a: "Simple ROI does not account for how long the investment was held. Annualised ROI normalises the return to a per-year basis using the formula: (1 + ROI)^(1/years) − 1. Use annualised ROI when comparing investments held for different periods." },
    { q: "Is ROI the same as profit margin?", a: "No. ROI measures return relative to the cost of investment. Profit margin measures profit relative to revenue. A product with ₹500 cost and ₹700 sale price has ROI = 40% and gross margin = 28.6%." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "profit-loss-calculator": [
    { q: "What is gross profit vs net profit?", a: "Gross profit = revenue − cost of goods sold (COGS). Net profit = gross profit − operating expenses − taxes − interest. The P&L calculator computes gross profit margin from revenue and direct cost. For net profit, you would also subtract overhead, salaries, rent, and taxes." },
    { q: "What is a good gross margin?", a: "It varies heavily by industry. Software/SaaS: 70–90%. Retail: 20–40%. Manufacturing: 25–50%. Restaurants: 60–70% on food (but high overheads reduce net margin significantly). Compare gross margin against industry benchmarks, not absolute figures." },
    { q: "What is the difference between markup and margin?", a: "Markup is profit as a percentage of cost. Margin is profit as a percentage of revenue. If cost is ₹100 and price is ₹150: markup = 50%, margin = 33%. The P&L calculator shows both so you can communicate pricing in whichever convention your context uses." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "compound-interest": [
    { q: "Why is compound interest called 'the eighth wonder of the world'?", a: "The phrase is attributed to Albert Einstein (though disputed). Compound interest grows exponentially — interest earns interest. ₹10,000 at 10% simple interest for 30 years gives ₹40,000. At 10% compound interest annually it gives ₹174,494. The longer the period, the more dramatic the difference." },
    { q: "How does compounding frequency affect returns?", a: "More frequent compounding = higher effective annual rate. ₹10,000 at 10% per year: annual compounding = ₹11,000 after 1 year; monthly compounding = ₹11,047; daily = ₹11,052. The difference matters over long periods. India's FDs compound quarterly; many US savings accounts compound daily." },
    { q: "What is the Rule of 72?", a: "Divide 72 by the annual interest rate to estimate how many years it takes to double your money. At 8% interest: 72 / 8 = 9 years to double. At 6%: 12 years. It is a quick mental approximation — the exact value uses logarithms." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "loan-emi-calculator": [
    { q: "What is the EMI formula?", a: "EMI = [P × r × (1+r)^n] / [(1+r)^n − 1], where P is the principal loan amount, r is the monthly interest rate (annual rate / 12 / 100), and n is the total number of monthly instalments (tenure in months). This is the standard reducing-balance EMI formula used by banks." },
    { q: "How do I reduce my EMI amount?", a: "You can: (1) increase the tenure — longer loan means lower monthly payment but higher total interest paid; (2) make a larger down payment to reduce the principal; (3) negotiate a lower interest rate or switch to a bank offering better rates; (4) make prepayments to reduce the outstanding principal." },
    { q: "What is the total interest paid on a home loan?", a: "A ₹50 lakh loan at 8.5% for 20 years has an EMI of about ₹43,391. Over 240 months, total payments = ₹1,04,13,840. Total interest = ₹54,13,840 — more than the principal itself. Use the calculator to see this breakdown for your specific numbers." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  // ── Health tools ────────────────────────────────────────────────────────────
  "bmi-calculator": [
    { q: "Is BMI an accurate measure of health?", a: "BMI is a population-level screening tool, not an individual health diagnostic. It does not account for muscle mass (athletes often have 'overweight' BMI), bone density, fat distribution, age, or ethnicity. A person can have a 'normal' BMI and still have metabolic risk factors. Consult a healthcare provider for a full assessment." },
    { q: "What is a healthy BMI range?", a: "WHO categories: underweight < 18.5, normal weight 18.5–24.9, overweight 25–29.9, obese ≥ 30. However, research suggests that optimal BMI ranges may differ by ethnicity — for example, the Asia-Pacific guidelines suggest overweight starts at 23 for Asian populations." },
    { q: "Why does BMI not account for muscle?", a: "BMI is calculated only from height and weight — it cannot distinguish between muscle and fat. A 90 kg bodybuilder and a 90 kg sedentary person with the same height have the same BMI despite very different body compositions and health risks." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "bmr-calculator": [
    { q: "What is BMR used for?", a: "BMR is the starting point for calculating TDEE (Total Daily Energy Expenditure) — the total calories you need each day. Multiply BMR by an activity factor to get TDEE. Set calorie intake below TDEE to lose weight, above to gain, or equal to maintain." },
    { q: "Why is Mifflin-St Jeor more accurate than Harris-Benedict?", a: "The Harris-Benedict equation was developed in 1919. Mifflin-St Jeor (1990) was validated on modern populations and has been shown in multiple studies to be closer to actual measured RMR values, especially for overweight individuals. TDEE calculators on most nutrition platforms use Mifflin-St Jeor." },
    { q: "Does BMR change over time?", a: "Yes. BMR tends to decrease with age due to loss of muscle mass. It increases during illness, injury, pregnancy, and high-intensity training adaptation. Significant weight loss also reduces BMR (the 'metabolic adaptation' effect)." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "calorie-calculator": [
    { q: "What does TDEE mean?", a: "TDEE (Total Daily Energy Expenditure) is the total number of calories your body burns in a day, including BMR (at rest), the thermic effect of food (digesting food), and physical activity. It is the figure you compare your calorie intake against for weight management." },
    { q: "What calorie deficit is recommended for weight loss?", a: "A deficit of 500 calories per day below TDEE produces approximately 0.5 kg (1 lb) of fat loss per week — the commonly cited sustainable rate. Aggressive deficits (>750 kcal/day) risk muscle loss, nutrient deficiencies, and metabolic adaptation. Consult a dietitian for personalised guidance." },
    { q: "Why does my calorie calculation seem off?", a: "TDEE calculators are estimates — individual metabolisms vary by 15–20% from predicted values. Use the calculated TDEE as a starting point, track actual intake and weight for 2–3 weeks, and adjust up or down based on observed results." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "water-intake-calculator": [
    { q: "How much water should I drink per day?", a: "The general guideline is 35 ml per kg of body weight for an adult at rest. A 70 kg adult should aim for about 2.45 litres per day. However, actual needs vary with temperature, exercise intensity, kidney health, and diet (fruits and vegetables contribute to fluid intake)." },
    { q: "Do coffee and tea count towards water intake?", a: "Mild caffeine consumption (1–2 cups per day) has a minimal net diuretic effect — moderate amounts of coffee and tea do count towards fluid intake. Alcohol, however, is dehydrating and should not be counted." },
    { q: "What are signs of dehydration?", a: "Early signs: thirst, darker yellow urine, dry mouth, slight fatigue. Moderate: headache, dizziness, reduced concentration. Severe dehydration requires medical attention. Urine colour is a practical guide — pale yellow is well-hydrated; dark yellow or amber suggests dehydration." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "body-fat-calculator": [
    { q: "How accurate is the Deurenberg body fat formula?", a: "The Deurenberg formula is a statistical estimate with a standard error of about ±3.5 percentage points. It is less accurate than DEXA scan, hydrostatic weighing, or Bod Pod measurements. Use it as a rough reference, not a clinical measurement. For athletic individuals, it tends to overestimate body fat." },
    { q: "What is a healthy body fat percentage?", a: "General guidelines: Men — essential fat 2–5%, athletes 6–13%, fitness 14–17%, acceptable 18–24%, obese ≥25%. Women — essential fat 10–13%, athletes 14–20%, fitness 21–24%, acceptable 25–31%, obese ≥32%. Ranges differ by age." },
    { q: "What is the most accurate way to measure body fat?", a: "DEXA (Dual-Energy X-ray Absorptiometry) scan is considered the gold standard, with error around ±1–2%. Hydrostatic weighing and Bod Pod are also accurate. Skinfold calipers (with trained operator) are moderately accurate. Smart scales using bioelectrical impedance are the least accurate." },
    { q: "Is my data safe here?", a: "Yes. Estimation runs in your browser. Nothing is sent to a server." },
  ],

  // ── Math tools ──────────────────────────────────────────────────────────────
  "quadratic-solver": [
    { q: "What is the quadratic formula?", a: "x = (−b ± √(b² − 4ac)) / 2a. The two roots are found by using + and − in the ± position. The solver computes both roots and also the discriminant (b² − 4ac) which tells you the nature of the roots before computing." },
    { q: "What does the discriminant tell me?", a: "If b² − 4ac > 0: two distinct real roots. If b² − 4ac = 0: one repeated real root (the parabola touches the x-axis at one point). If b² − 4ac < 0: two complex conjugate roots (the parabola does not cross the x-axis)." },
    { q: "What does a = 0 mean?", a: "If a = 0, the equation becomes linear (bx + c = 0) rather than quadratic. The solver detects this and reports the single linear solution x = −c/b." },
    { q: "Is my data safe here?", a: "Yes. Solving runs in your browser. Nothing is sent to a server." },
  ],

  "pythagorean-theorem": [
    { q: "What is the Pythagorean theorem?", a: "In a right-angled triangle, the square of the hypotenuse (the side opposite the right angle) equals the sum of the squares of the other two sides: a² + b² = c². Given any two sides, the third can be calculated." },
    { q: "What are Pythagorean triples?", a: "Pythagorean triples are sets of three integers that satisfy a² + b² = c². The most famous is (3, 4, 5) — confirmed: 9 + 16 = 25. Other common triples: (5, 12, 13), (8, 15, 17), (7, 24, 25). Any multiple of a triple is also a triple: (6, 8, 10)." },
    { q: "Where is the Pythagorean theorem used in practice?", a: "Construction (verifying right angles with the 3-4-5 rule), navigation (calculating straight-line distances), computer graphics (2D/3D distance calculations), physics (vector magnitudes), and any geometry problem involving perpendicular sides." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "gcd-lcm-calculator": [
    { q: "What is the GCD used for?", a: "The GCD (Greatest Common Divisor) is used to simplify fractions (divide numerator and denominator by GCD), synchronise repeating events (finding the common cycle length), and in cryptography (RSA algorithm relies on GCD computation)." },
    { q: "What is the LCM used for?", a: "The LCM (Least Common Multiple) is used to add fractions with different denominators (find the common denominator), schedule events that repeat at different intervals (when will two events next coincide), and in music theory (rhythm and metre)." },
    { q: "How is GCD calculated (Euclidean algorithm)?", a: "GCD(a, b) = GCD(b, a mod b), recursively until b = 0. Example: GCD(48, 18): GCD(18, 12) → GCD(12, 6) → GCD(6, 0) = 6. Then LCM(a, b) = (a × b) / GCD(a, b)." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  // ── Date & time tools ───────────────────────────────────────────────────────
  "age-calculator": [
    { q: "How is exact age calculated?", a: "The calculator subtracts the birth date from the target date (default: today) using calendar-accurate arithmetic — accounting for leap years, varying month lengths, and the exact day of birth. The result shows years, months, and days as separate components." },
    { q: "Why might my age calculation differ by a day from other tools?", a: "Different tools handle the boundary differently: some count the birthday itself, others count the day after. This calculator counts complete calendar days elapsed, which is the standard for age-of-majority calculations." },
    { q: "Can I calculate someone's age on a future date?", a: "Yes. Set the 'As of' date to any future date and the calculator will show the age at that point — useful for checking whether someone will be of legal age by a specific deadline." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "days-between-dates": [
    { q: "Does the count include both the start and end dates?", a: "The default counts the difference as the number of full days between the two dates — not including the start date but including the end date (standard calendar convention). Toggle 'inclusive' mode to count both endpoints if your use case requires it." },
    { q: "How do I calculate a deadline?", a: "Enter today as the start date and the due date as the end date. The result shows how many days remain. For business day counting (excluding weekends), enable the 'Exclude weekends' option." },
    { q: "What is the date difference between two dates in months?", a: "The calculator shows the difference in calendar months alongside the day count. Note that months are not uniform in length, so 2 months could be 59, 60, or 62 days depending on which months are involved." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "countdown-calculator": [
    { q: "Does the countdown update in real time?", a: "Yes. The remaining time updates every second while the page is open. The display shows days, hours, minutes, and seconds counting down live." },
    { q: "What happens when the countdown reaches zero?", a: "The counter displays 0 days, 0 hours, 0 minutes, 0 seconds and may show a 'reached' indicator. For past dates, the calculator shows elapsed time since the date instead." },
    { q: "Can I share a countdown link?", a: "Yes. The target date is encoded in the URL — copy the address bar to share the countdown with anyone. When they open it they will see the same target date counting down in their browser's timezone." },
    { q: "Is my data safe here?", a: "Yes. The countdown runs in your browser. Nothing is sent to a server." },
  ],

  "week-number-calculator": [
    { q: "Why does the ISO week number sometimes show a different year?", a: "ISO 8601 defines weeks as starting on Monday and week 1 as the week containing the first Thursday of the year. This means the last few days of December can belong to week 1 of the next year, and the first few days of January can belong to week 52 or 53 of the previous year." },
    { q: "What countries use ISO week numbers?", a: "ISO week numbers are standard across Europe and widely used in Scandinavia, Germany, France, and the Netherlands for business and logistics. The US and UK more commonly use simple week-of-year counting (January 1 = week 1)." },
    { q: "How many weeks are in a year?", a: "Most years have 52 ISO weeks. Long years (ISO years with 53 weeks) occur when January 1 falls on Thursday, or when it falls on Wednesday in a leap year. Use the calculator to check any specific year." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server." },
  ],

  "due-date-calculator": [
    { q: "What is Naegele's rule?", a: "Naegele's rule calculates the expected due date by adding 280 days (40 weeks) to the first day of the last menstrual period (LMP). This is the standard method used by most healthcare providers worldwide, though it assumes a regular 28-day cycle." },
    { q: "How accurate is the calculated due date?", a: "Only about 5% of babies are born exactly on their estimated due date. The typical delivery window is 37–42 weeks of gestation. Ultrasound dating (especially in the first trimester) can provide more accurate gestational age estimates." },
    { q: "What are the trimester dates?", a: "First trimester: weeks 1–12. Second trimester: weeks 13–26. Third trimester: weeks 27–40+. The calculator shows these milestone weeks based on your LMP date." },
    { q: "Is my data safe here?", a: "Yes. Calculation runs in your browser. Nothing is sent to a server. This tool is for informational purposes — consult your healthcare provider for medical advice." },
  ],

  // ── Dev/Design extras ────────────────────────────────────────────────────────
  "gradient-generator": [
    { q: "How do I create a gradient in CSS?", a: "Use the linear-gradient() function: background: linear-gradient(angle, color1, color2). Example: background: linear-gradient(135deg, #4f46e5, #7c3aed). The generator creates this for you visually — adjust the angle, color stops, and copy the CSS." },
    { q: "Can I add more than two colours?", a: "Yes. Add multiple colour stops: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%). The percentages define where each colour is placed along the gradient axis." },
    { q: "How do I use a gradient as a background in Tailwind CSS?", a: "Tailwind supports gradients with bg-gradient-to-{direction} and from-{colour} via-{colour} to-{colour} utilities. For custom gradients not in the palette, use a [background:linear-gradient(...)] arbitrary value or add it to your tailwind.config." },
    { q: "Is my data safe here?", a: "Yes. Generation runs in your browser. Nothing is sent to a server." },
  ],

  "currency-converter": [
    { q: "Where do the exchange rates come from?", a: "Rates are sourced from the European Central Bank (ECB) reference rates, which are published daily on business days. They are indicative mid-market rates and not the rates you will get at a bank or currency exchange (which include a spread)." },
    { q: "How often are the rates updated?", a: "ECB rates are updated once per business day, typically around 16:00 CET. The converter fetches the latest available rates when you load the page. Rates are not real-time tick-by-tick quotes." },
    { q: "Why is the rate different from what my bank shows?", a: "Banks and currency exchanges add a margin (spread) on top of the mid-market rate — typically 1–5% for consumer transactions. The mid-market rate (what this tool shows) is the midpoint between buy and sell rates." },
    { q: "Is my data safe here?", a: "Yes. Conversion runs in your browser. Nothing is sent to a server." },
  ],

  // ── Image tools ─────────────────────────────────────────────────────────────
  "image-resizer": [
    { q: "Does resizing an image reduce file size?", a: "Usually yes — fewer pixels means less data to store. But a JPEG resized from 4000px to 800px will be much smaller in file size. However, if you resize a small image to a larger size, the file size increases and quality degrades (upscaling interpolates pixels rather than adding real detail)." },
    { q: "What is the maximum resolution I can resize to?", a: "There is no hard limit, but very large outputs (e.g. 10,000 × 10,000 pixels) may be slow or cause memory issues depending on your device. For web use, images rarely need to exceed 2000–3000 pixels on the longest side." },
    { q: "Will resizing change the image format?", a: "No. The output format matches the input format — PNG in, PNG out; JPEG in, JPEG out. To convert format while resizing, use the Image Format Converter on DevBench." },
    { q: "Is my image safe here?", a: "Yes. Resizing runs in your browser using the Canvas API. Your image is never uploaded to a server." },
  ],

  "image-compressor": [
    { q: "What quality level should I choose?", a: "For web images: 70–80% quality typically provides a good balance between visual quality and file size. JPEG at 80% is usually indistinguishable from 100% for most photos. For images with text or sharp lines, use higher quality (85–90%) as JPEG compression artefacts are more visible on edges." },
    { q: "Will I lose quality every time I compress?", a: "Yes. JPEG is a lossy format — each compression introduces artefacts. Never compress an already-compressed JPEG for distribution; always start from the original uncompressed source. Keep a TIFF or PNG master and compress from that for each use." },
    { q: "How much smaller does compression make the file?", a: "At 75% quality, a typical photo JPEG may reduce to 30–50% of its original size. Results vary by image content — photos with lots of detail or noise compress less; photos with large uniform areas compress more." },
    { q: "Is my image safe here?", a: "Yes. Compression runs in your browser using the Canvas API. Your image is never uploaded to a server." },
  ],

  "image-format-converter": [
    { q: "What is the best format for web images?", a: "WebP is generally the best format for web — it provides smaller file sizes than JPEG and PNG at similar quality, supports transparency (like PNG), and is supported by all modern browsers. AVIF is even more efficient but has slower encoding and less universal browser support. PNG is best for screenshots, diagrams, and images with text." },
    { q: "When should I use SVG vs PNG?", a: "SVG (Scalable Vector Graphics) is ideal for logos, icons, illustrations, and anything with flat colour and geometric shapes — it scales without pixelation. PNG is better for photographs, complex gradients, and screenshots. SVG files can be very small for simple shapes; PNG can be smaller for complex photographic content." },
    { q: "Can I convert a PNG to SVG?", a: "A direct raster-to-vector conversion (PNG → SVG) requires tracing the bitmap into vector paths — this is called vectorisation and is not a simple format conversion. Use a dedicated vectorisation tool (Inkscape Trace Bitmap or Adobe Illustrator Live Trace). This converter handles raster-to-raster conversions (PNG ↔ JPEG ↔ WebP) and SVG to raster." },
    { q: "Is my image safe here?", a: "Yes. Conversion runs in your browser. Your image is never uploaded to a server." },
  ],

  "svg-optimizer": [
    { q: "Why are SVGs exported from Illustrator or Figma so large?", a: "Design tools embed editor metadata: Illustrator adds <sodipodi:*> and <inkscape:*> namespaces, Adobe XMP metadata, author information, and grid settings. Figma embeds layer names and IDs. None of this is needed for rendering. The optimizer strips all of it, keeping only the visual content." },
    { q: "How much can SVG optimisation reduce file size?", a: "Typically 30–70% reduction for Illustrator/Inkscape exports. Simple icons can shrink from 10 KB to 2–3 KB. Complex illustrations see smaller percentage reductions because the actual path data dominates." },
    { q: "Will optimisation change how the SVG looks?", a: "Correctly optimised SVGs render identically to the original. The optimizer uses safe passes: removing metadata, compressing path data numerically, merging redundant elements. Aggressive passes (merging paths, removing IDs) are off by default and can occasionally affect SVGs that rely on CSS targeting." },
    { q: "Is my SVG safe here?", a: "Yes. Optimisation runs in your browser. Your file is never uploaded to a server." },
  ],

  "exif-viewer": [
    { q: "What EXIF data is typically stored in a photo?", a: "Camera model and manufacturer, lens model and focal length, aperture (f-stop), shutter speed, ISO, exposure mode (auto/manual), flash status, white balance, date/time taken, GPS coordinates (latitude, longitude, altitude), and image dimensions. Smartphones add additional data like the direction the phone was facing." },
    { q: "How do I remove EXIF data from a photo?", a: "To strip EXIF before sharing: on Windows, right-click → Properties → Details → Remove Properties and Personal Information. On macOS, use Preview → Tools → Show Inspector, or use exiftool -all= filename.jpg in Terminal. Online privacy tools also strip EXIF." },
    { q: "Can I tell where a photo was taken from EXIF?", a: "If the GPS data was recorded at the time the photo was taken, the EXIF viewer shows the latitude and longitude. Many smartphones record GPS in photos by default. Camera apps often have an option to disable location tagging for privacy." },
    { q: "Is my photo safe here?", a: "Yes. EXIF data is read in your browser using the ExifReader library. Your photo is never uploaded to a server — it is read directly from local memory." },
  ],

  "image-to-pdf": [
    { q: "What image formats can be converted to PDF?", a: "JPEG, PNG, WebP, and GIF are supported. Each image becomes one page in the resulting PDF, sized to fit an A4 page with margins. For best quality, use high-resolution source images." },
    { q: "Can I control the order of pages?", a: "Yes. After adding images, drag them to reorder before generating the PDF. The PDF pages will follow the order shown in the preview." },
    { q: "What is the output PDF page size?", a: "Pages are sized to A4 (210 × 297 mm) by default, with each image scaled to fit within the margins. Images are centred on the page. If you need a different page size, convert on-device with a tool like ImageMagick or Adobe Acrobat." },
    { q: "Is my image data safe here?", a: "Yes. PDF generation runs in your browser using pdf-lib. Your images are never uploaded to a server." },
  ],

  // ── PDF tools ───────────────────────────────────────────────────────────────
  "merge-pdf": [
    { q: "Is there a limit on how many PDFs I can merge?", a: "There is no enforced limit. Very large files or many files may be slow on lower-powered devices, but the processing runs in your browser without any server-side constraints." },
    { q: "Does merging preserve bookmarks and annotations?", a: "Bookmarks (outline/table of contents) from individual PDFs are merged into the combined document. Annotations (comments, highlights) are preserved. Form fields are included but may not be fillable in the merged PDF depending on the original PDF format." },
    { q: "Can I merge password-protected PDFs?", a: "No. Password-protected (encrypted) PDFs cannot be opened or merged without the password. Decrypt the PDF first using the appropriate tool, then merge." },
    { q: "Is my PDF data safe here?", a: "Yes. Merging runs in your browser using pdf-lib. Your files are never uploaded to a server." },
  ],

  "split-pdf": [
    { q: "How are the split pages packaged?", a: "Each page is saved as a separate single-page PDF, and all pages are packaged together in a ZIP archive for download. The files are named page-1.pdf, page-2.pdf, etc." },
    { q: "Can I extract just specific pages instead of all pages?", a: "To extract specific pages, use the PDF Page Editor tool on DevBench — it lets you select individual pages to keep or remove and download the result as a new PDF." },
    { q: "Will the split PDFs be the same quality as the original?", a: "Yes. The pages are extracted, not re-rendered — there is no re-encoding or quality loss. The split PDFs are identical copies of the corresponding pages from the original." },
    { q: "Is my PDF data safe here?", a: "Yes. Splitting runs in your browser using pdf-lib. Your file is never uploaded to a server." },
  ],

  "organize-pdf": [
    { q: "Can I also delete pages in the organiser?", a: "The organiser is focused on reordering. To delete pages, use the PDF Page Editor on DevBench, which lets you mark pages for removal before downloading." },
    { q: "What if my PDF has many pages?", a: "The organiser shows thumbnail previews for each page. For large PDFs (100+ pages), thumbnail generation may take a few seconds. Drag-and-drop reordering works for any number of pages." },
    { q: "Is my PDF data safe here?", a: "Yes. Reordering runs in your browser using pdf-lib. Your file is never uploaded to a server." },
  ],

  "rotate-pdf": [
    { q: "Can I rotate only specific pages?", a: "The current tool rotates all pages by the same angle. To rotate individual pages by different amounts, open the PDF in Adobe Acrobat Reader (free) or use a tool that supports per-page rotation." },
    { q: "Why was my PDF scanned sideways?", a: "Scanners sometimes produce landscape-oriented output when the document was fed sideways, or when a flatbed scanner lid is not closed fully. The rotation tool lets you correct the orientation in one click without re-scanning." },
    { q: "Is my PDF data safe here?", a: "Yes. Rotation runs in your browser using pdf-lib. Your file is never uploaded to a server." },
  ],

  "compress-pdf": [
    { q: "Why is compression less effective on scanned PDFs?", a: "Scanned PDFs store pages as images (JPEG or PNG) embedded in the PDF wrapper. Most of the file size is already the compressed image data. The PDF object-stream compression mostly affects the PDF metadata and structure, which is small relative to the image data." },
    { q: "What compression method is used?", a: "The compressor applies PDF object stream compression (FlateDecode/Deflate on the PDF structure). This is safe and standards-compliant — the output is a valid PDF readable by any PDF viewer." },
    { q: "Is my PDF data safe here?", a: "Yes. Compression runs in your browser using pdf-lib. Your file is never uploaded to a server." },
  ],

  "watermark-pdf": [
    { q: "Can I add an image watermark instead of text?", a: "The current tool adds a text watermark. For image watermarks (e.g. a semi-transparent logo), use Adobe Acrobat or LibreOffice, which support image overlays." },
    { q: "Will the watermark cover the existing content?", a: "The watermark is added as a semi-transparent diagonal overlay — the opacity slider controls how visible it is. At 20–30% opacity, the original text remains readable. At 50%+ it becomes more prominent." },
    { q: "Is my PDF data safe here?", a: "Yes. Watermarking runs in your browser using pdf-lib. Your file is never uploaded to a server." },
  ],

  "pdf-page-numbers": [
    { q: "Where is the page number placed?", a: "Page numbers are added at the bottom centre of each page (footer position) using pdf-lib's text drawing API. The font size and margin can be adjusted before downloading." },
    { q: "Can I start numbering from a page other than 1?", a: "Yes. Set the start number offset — for example, if the first 3 pages are a cover and table of contents, set the offset to -2 so the first numbered page shows '1' on what is physically page 4 of the PDF." },
    { q: "Is my PDF data safe here?", a: "Yes. Page numbering runs in your browser using pdf-lib. Your file is never uploaded to a server." },
  ],

  "pdf-page-editor": [
    { q: "Can I preview individual pages before removing them?", a: "Yes. The page editor shows thumbnail previews of each page. Click a thumbnail to mark it for removal — it will be greyed out. Review the selection before downloading the edited PDF." },
    { q: "What happens if I mark all pages for removal?", a: "The download is blocked and you will see a validation error. A PDF must have at least one page. Deselect at least one page to proceed." },
    { q: "Is my PDF data safe here?", a: "Yes. Editing runs in your browser using pdf-lib. Your file is never uploaded to a server." },
  ],

  "text-to-pdf": [
    { q: "What formatting is applied to the text?", a: "The text is rendered in a standard serif or sans-serif font at a readable size with automatic line wrapping to fit within the A4 page margins. Blank lines between paragraphs are preserved as paragraph breaks. There is no Markdown or HTML rendering." },
    { q: "Can I control the font or page size?", a: "Font and page size options (A4, Letter) are available in the settings. For more advanced formatting, use the HTML to PDF tool — paste HTML with inline CSS for full control over typography, headings, and layout." },
    { q: "Is my text data safe here?", a: "Yes. PDF generation runs in your browser using pdf-lib. Your text is never uploaded to a server." },
  ],

  "html-to-pdf": [
    { q: "Why does the PDF look different from the screen preview?", a: "The browser's print engine applies print stylesheets and ignores some screen-only styles. Backgrounds may not print by default (enable 'Background graphics' in the print dialog). Also, some CSS features (viewport units, CSS animations) behave differently in print mode." },
    { q: "How do I force backgrounds to print?", a: "In the browser print dialog: Chrome → 'More settings' → enable 'Background graphics'. Firefox → 'Page Setup' → Formatting → enable 'Print Background Colors and Images'. Safari → hold Option/Alt when clicking the print button." },
    { q: "Can I include external fonts?", a: "Yes. Include a <link> to Google Fonts or another font CDN in the HTML head. The preview iframe will load the font. Whether it appears in the PDF depends on the browser's print renderer — most modern browsers embed web fonts correctly." },
    { q: "Is my HTML data safe here?", a: "Yes. The HTML renders in a local sandboxed iframe. Nothing is uploaded to a server." },
  ],

  "ipynb-to-pdf": [
    { q: "What notebook cell types are rendered?", a: "Markdown cells are rendered as formatted HTML (headings, bold, lists, code blocks). Code cells show the source with styled input boxes and output — stream output (print statements), error tracebacks, and base64-encoded PNG figures are all preserved. Other output types (DataFrames, widgets) may appear as plain text." },
    { q: "Do I need nbconvert or LaTeX installed?", a: "No. This converter runs entirely in your browser — no server, no nbconvert, no LaTeX, no Python installation required. The .ipynb JSON is parsed client-side and rendered to HTML, then printed to PDF via the browser's print dialog." },
    { q: "Why are some outputs missing in the PDF?", a: "If the notebook was not saved with output (outputs: [] in the cell), those outputs will not appear. Re-run the notebook in JupyterLab and save it with outputs before converting. Also, rich interactive outputs (Plotly, ipywidgets) are not rendered — only static PNG images embedded in the output." },
    { q: "Is my notebook data safe here?", a: "Yes. The .ipynb file is parsed in your browser. Nothing is uploaded to a server." },
  ],

  "pdf-to-jpg": [
    { q: "What scale factor should I use?", a: "Scale 1.0 renders each page at 96 DPI (standard screen resolution). Scale 2.0 gives 192 DPI — good for printing and presentations. Scale 3.0 gives 288 DPI — high quality but larger file sizes. For screen use, scale 1.5 is a good balance." },
    { q: "Are all pages exported?", a: "Yes. All pages are rendered and included in the ZIP archive. File names follow the pattern page-001.jpg, page-002.jpg, etc. with zero-padded numbers for correct sort order." },
    { q: "Why does text look blurry in the exported JPEGs?", a: "Increase the scale factor before exporting — higher scale means more pixels per page. Also, JPEG compression can soften sharp edges; for text-heavy PDFs, consider using a PNG output instead (not available in this tool, but available via PDF to image tools in other software)." },
    { q: "Is my PDF data safe here?", a: "Yes. Rendering runs in your browser using PDF.js. Your file is never uploaded to a server." },
  ],

  "pdf-compare": [
    { q: "Why does the diff show text in the wrong order?", a: "PDF does not store text in reading order — text extraction follows the order objects appear in the PDF file, which may differ from visual reading order for multi-column layouts, tables, and rotated text. The diff is most reliable on simple, single-column digitally-created PDFs." },
    { q: "Does this work with scanned PDFs?", a: "Scanned PDFs store pages as images with no embedded text. There is no text to extract and compare. For scanned document comparison you would need OCR (Optical Character Recognition) first. Use Adobe Acrobat's OCR feature or an online OCR tool, then compare the extracted text." },
    { q: "What diff format is shown?", a: "A unified diff format: lines starting with + are present in the second PDF but not the first (additions); lines starting with - are in the first PDF but not the second (deletions); lines with no prefix are unchanged context." },
    { q: "Is my PDF data safe here?", a: "Yes. Text extraction and diffing run in your browser. Your PDFs are never uploaded to a server." },
  ],

  // ── Other tools ─────────────────────────────────────────────────────────────
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
    {
      q: "What is a MIME type?",
      a: "A MIME type (Multipurpose Internet Mail Extensions type) is a label that identifies the nature and format of a file. It follows the format type/subtype — for example, text/html for web pages, application/json for JSON data, image/png for PNG images. Web servers include the Content-Type header with the MIME type so browsers know how to handle the response.",
    },
    {
      q: "What MIME type should I use for JSON API responses?",
      a: "Use application/json. Some older APIs used text/plain or application/x-json, but application/json is the IANA-registered standard since RFC 4627 (2006). Set it as Content-Type: application/json in your HTTP response header.",
    },
    {
      q: "What is the MIME type for a PDF file?",
      a: "application/pdf. This is the correct Content-Type when serving a PDF file over HTTP. If you also want the browser to prompt a download instead of displaying the PDF, add Content-Disposition: attachment; filename=\"file.pdf\".",
    },
    {
      q: "What MIME type should I use for SVG images?",
      a: "image/svg+xml. This is the correct Content-Type for SVG files. Using image/svg without the +xml is incorrect and may cause browsers to not render the SVG correctly. Also set the charset: Content-Type: image/svg+xml; charset=utf-8.",
    },
  ],

  // ── Workspace pages ──────────────────────────────────────────────────────────
  "yaml": [
    { q: "What is YAML and what is it used for?", a: "YAML (YAML Ain't Markup Language) is a human-readable data serialisation format used primarily for configuration files. It is common in Kubernetes manifests, Docker Compose, GitHub Actions workflows, Ansible playbooks, and CI/CD pipelines. Unlike JSON, YAML supports comments, multi-line strings, and anchors for reuse." },
    { q: "Why is my YAML invalid?", a: "The most common YAML errors are: using tabs instead of spaces for indentation (YAML requires spaces only), inconsistent indentation depth, missing quotes around strings containing special characters (: { } [ ] , & * # ? | - < > = ! % @ `), and duplicate keys. The YAML validator reports the exact line and column of the error." },
    { q: "What is the difference between YAML and JSON?", a: "YAML is a superset of JSON — valid JSON is also valid YAML 1.2. Key differences: YAML supports comments (# comment) while JSON does not; YAML uses indentation for structure while JSON uses braces; YAML anchors (&) and aliases (*) allow value reuse; YAML has more data types including timestamps and binary. JSON is safer for machine-to-machine communication; YAML excels in human-edited config files." },
    { q: "How do I convert YAML to JSON?", a: "Paste your YAML into the workspace and switch to the YAML to JSON tab. The converter handles multi-document YAML streams (separated by ---), anchors and aliases, and all standard YAML types. The result is formatted JSON you can copy with one click." },
    { q: "What are YAML anchors and aliases?", a: "Anchors (&name) mark a value so it can be reused; aliases (*name) reference the anchored value. This avoids repetition in config files — define shared defaults once under an anchor and merge them into multiple sections with <<: *anchorName. The YAML formatter preserves anchors and aliases." },
  ],

  "diff-checker": [
    { q: "What is a diff and how do I read it?", a: "A diff (difference) highlights what changed between two texts. Lines marked with + exist only in the right/new text (additions); lines marked with - exist only in the left/old text (deletions); unmarked lines are unchanged context. The diff checker shows changes at line level with optional character-level highlighting for precise edit location." },
    { q: "Can I compare code files, not just plain text?", a: "Yes. Paste any text including source code, JSON, YAML, HTML, SQL, or configuration files. The diff is purely text-based — it compares line by line regardless of content type. For structured JSON comparison, the JSON workspace at /json has a dedicated JSON diff mode that understands JSON structure." },
    { q: "What does 'ignore whitespace' do?", a: "When enabled, whitespace-only differences (extra spaces, tab vs space, trailing spaces) are ignored and do not appear as changes. This is useful when comparing code that has been reformatted or when whitespace normalisation differences should not count as meaningful changes." },
    { q: "Is my text private?", a: "Yes. Comparison runs entirely in your browser using JavaScript. Neither the left nor the right text is sent to any server. You can use the diff checker with sensitive content such as config files, credentials, or proprietary code." },
  ],

  "code-beautify": [
    { q: "Which languages does the formatter support?", a: "The Code Beautify workspace formats: HTML, CSS, JavaScript, TypeScript, TSX/JSX, JSON, Markdown, YAML, GraphQL, XML, and SQL (using sql-formatter). Python indentation cleanup is also supported. Most formatters use Prettier under the hood, so results match what you would get from running Prettier in your project." },
    { q: "Does this use the same rules as Prettier?", a: "Yes for most languages — JavaScript, TypeScript, HTML, CSS, JSON, YAML, GraphQL, and Markdown are formatted with Prettier running in a Web Worker in your browser. The default options (2-space indent, single quotes, 80-char line width) match Prettier defaults. SQL uses sql-formatter with a separate rule set." },
    { q: "Will formatting change how my code behaves?", a: "No. Code formatters only change whitespace, indentation, and line breaks — they never alter the semantics or logic of your code. The formatted output is functionally identical to the input." },
    { q: "Is my code kept private?", a: "Yes. All formatting runs in your browser using Web Workers. Your code is never uploaded to a server. This means you can safely format proprietary source code, internal configuration files, or sensitive data." },
  ],

  "date-calculator": [
    { q: "How does adding months work when the result month has fewer days?", a: "When you add months and the resulting month is shorter than the start month, the date is clamped to the last day of that month. For example, 31 January + 1 month = 28 February (or 29 in a leap year). This is standard calendar-safe month arithmetic — the same behaviour as most date libraries." },
    { q: "Can I add negative values to subtract time?", a: "Yes. Enter a negative number in any field to subtract that unit. For example, -7 days subtracts a week, -1 year subtracts a year. The result is the same as if you had subtracted that duration." },
    { q: "How are years and months different from weeks and days?", a: "Years and months are calendar units — their exact length varies (months have 28–31 days, years have 365 or 366). Weeks and days are fixed durations (7 days, 86400 seconds). The calculator applies year/month arithmetic on the calendar first, then adds the day/week count as an exact offset." },
    { q: "What day of the week will a date fall on?", a: "The result date shows the weekday name (Monday, Tuesday, etc.) so you can instantly see whether a deadline falls on a weekend or a business day." },
  ],

  "astronomy": [
    { q: "How accurate are the sunrise and sunset times?", a: "Times are computed using standard astronomical algorithms (the SunCalc library). Accuracy is typically within 1–2 minutes for locations at normal latitudes. The calculation assumes a flat horizon at sea level — actual times vary with terrain elevation, atmospheric refraction, and obstructions on the horizon." },
    { q: "What is golden hour?", a: "Golden hour is the period shortly after sunrise and before sunset when sunlight is soft, warm, and directional — ideal for photography. It typically lasts 20–60 minutes depending on your latitude and season. The closer you are to the equator, the shorter and more abrupt the golden hour." },
    { q: "What does moon illumination percentage mean?", a: "Moon illumination is the percentage of the Moon's visible disc that is lit by the Sun from Earth's perspective. 0% is a new moon (invisible), 50% is a quarter moon (half-lit disc), 100% is a full moon. The illumination grows (waxing) from new to full and shrinks (waning) back to new over approximately 29.5 days." },
    { q: "Why does the tool show 'always up' for the moon?", a: "Near the Arctic and Antarctic circles, the Moon can remain above or below the horizon for multiple days depending on the season and the Moon's orbital position. The calculator correctly shows this as 'always up' or 'always down' rather than fabricating a rise/set time." },
    { q: "Does the tool need my location?", a: "You can grant location access for automatic coordinates, or type any city name or latitude/longitude manually. All calculations run in your browser — your location is not sent to any server." },
  ],

  "webhook-simulator": [
    { q: "What is a webhook signature and why does it matter?", a: "A webhook signature is an HMAC hash of the request body, included in a request header (e.g. X-Hub-Signature-256 for GitHub, Stripe-Signature for Stripe). The receiver recomputes the HMAC using its shared secret and compares it to the header value. If they match, the payload is authentic and unmodified. This prevents attackers from sending forged webhook payloads to your endpoint." },
    { q: "Which platforms does this simulator support?", a: "GitHub (X-Hub-Signature-256, HMAC-SHA256), Stripe (Stripe-Signature with timestamp replay protection), Slack (X-Slack-Signature, HMAC-SHA256), Shopify (X-Shopify-Hmac-SHA256), and a generic HMAC-SHA256 option for any custom webhook system." },
    { q: "Is my webhook secret safe?", a: "Yes. HMAC signing runs entirely in your browser using the Web Crypto API. Your secret key is never sent to any server. You can safely test with real webhook secrets." },
    { q: "How do I verify a webhook signature in Node.js?", a: "Compute HMAC-SHA256 of the raw request body using your secret key, then compare to the signature header in constant time (to prevent timing attacks): const sig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex'); then use crypto.timingSafeEqual() to compare. The exact header name and format differ by platform." },
  ],

  "linux-cheatsheet": [
    { q: "How do I find a file by name on Linux?", a: "Use find: find /path -name 'filename.txt' searches by exact name; find /path -name '*.log' uses a wildcard. Add -type f to match only files, -type d for directories. For faster searches on an indexed system, use locate filename (requires the locate database to be updated with sudo updatedb)." },
    { q: "How do I check disk usage?", a: "df -h shows free and used space on all mounted filesystems in human-readable units. du -sh /path shows the total size of a directory. du -sh * lists sizes of all items in the current directory. To find the largest directories: du -h /path | sort -rh | head -20." },
    { q: "How do I check what is running on a port?", a: "Use ss -tlnp | grep :PORT or lsof -i :PORT. For example, ss -tlnp | grep :8080 shows what process is listening on port 8080. On older systems, netstat -tlnp | grep :PORT serves the same purpose." },
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
    { q: "What functions are supported in the expression evaluator?", a: "Trigonometry: sin, cos, tan, asin, acos, atan, atan2. Hyperbolic: sinh, cosh, tanh. Exponential and logarithm: exp, log (natural), log2, log10. Roots: sqrt, cbrt. Rounding: floor, ceil, round, abs, sign. Constants: pi, e, phi (golden ratio). Power: pow(base, exp) or use the ^ operator." },
    { q: "How do I calculate a matrix determinant or inverse?", a: "Switch to the Matrix tab. Enter the size (N×N) and fill in the values. The calculator computes the determinant, inverse (if it exists), transpose, and matrix multiplication instantly. Non-square matrices cannot be inverted — the inverse button is disabled for those." },
    { q: "How do I find where two functions intersect?", a: "Plot both functions on the graph. The calculator automatically detects intersections and marks them on the graph. Hover over an intersection marker to see the exact (x, y) coordinates." },
  ],

  "pdf": [
    { q: "What PDF tools are available?", a: "The PDF workspace includes: merge PDFs (combine multiple files), split PDF (extract a range of pages), rotate pages, compress PDF to reduce file size, add page numbers, add a watermark, remove pages, reorder pages, convert images to PDF, convert HTML to PDF, convert PDF pages to JPG images, and compare two PDFs." },
    { q: "Are my PDFs uploaded to a server?", a: "No. All PDF operations run in your browser using pdf-lib and PDF.js. Your files are never sent to DevBench servers. This makes the tools safe to use with confidential documents, contracts, or personal files." },
    { q: "What is the maximum file size?", a: "There is no hard server-side limit since processing is client-side. Practical limits depend on your device's available memory. Very large PDFs (over 100 MB) may be slow on devices with limited RAM. For most documents under 20 MB, processing is near-instant." },
    { q: "Can I combine more than two PDFs?", a: "Yes. The merge tool accepts multiple files — add as many PDFs as you need, reorder them by dragging, and merge them into a single file." },
  ],
};
