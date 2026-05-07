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
    title: "Base64 Encoder — Free Online Tool | DevBench",
    metaDescription:
      "Free online Base64 encoder. Convert text or files to Base64 with full UTF-8 support. Decode Base64 back to text instantly. No signup. Runs 100% in your browser.",
    openingParagraph:
      "Base64 Encode converts any text or binary data to Base64 format entirely in your browser — nothing is uploaded to a server. Paste text or load a file, choose between standard Base64 or URL-safe Base64URL, and get the encoded string with the byte count and size ratio in real time. Supports full UTF-8 including emoji and non-Latin scripts. Decode Base64 back to readable text in one click.",
  },

  "base64-decode": {
    title: "Base64 Decoder — Free Online Tool | DevBench",
    metaDescription:
      "Decode Base64 strings back to plain text or binary instantly. Full UTF-8 support, URL-safe Base64URL input accepted. No signup. Runs 100% in your browser.",
    openingParagraph:
      "Base64 Decode reverses Base64-encoded strings back to readable text or raw binary data entirely in your browser. Paste any Base64 or Base64URL string — including those with or without padding — and the decoded output appears instantly. Useful for decoding JWT payloads, API response tokens, email attachments, and data URIs. Nothing is sent to a server.",
  },

  "regex-tester": {
    title: "Regex Tester — Online Regular Expression Tool | DevBench",
    metaDescription:
      "Test regex online with live match highlighting, group captures, and substitution preview. JavaScript RegExp with all flags. No signup, 100% in your browser.",
    openingParagraph:
      "Regex Tester tests JavaScript regular expressions against any input in real time. Type your pattern, pick the flags you need (g, i, m, s, u, v), and every match is highlighted instantly with colour-coded groups, named captures, and exact index positions. Use the Substitution tab to preview replace operations, the Code tab to export snippets for JavaScript, Python, PHP, or Go, and the Pattern Library to load 30 built-in example patterns.",
  },

  "uuid-generator": {
    title: "UUID Generator — Free UUID / ULID / Nano ID | DevBench",
    metaDescription:
      "Generate UUID v4, ULID, and Nano ID online instantly. Bulk generation, multiple formats, copy to clipboard. No signup. Runs 100% in your browser.",
    openingParagraph:
      "UUID Generator creates RFC 4122-compliant UUID v4, time-sortable ULID, and URL-safe Nano ID values in one click. Generate a single identifier or up to 1 000 in bulk, toggle between hyphenated and uppercase formats, and copy everything to the clipboard at once. All values are created using the browser's cryptographically secure random number generator — no server call is made and the IDs are never logged.",
  },

  "hash-generator": {
    title: "Hash Generator — MD5, SHA-1, SHA-256 Online | DevBench",
    metaDescription:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes online. Hash any text or file instantly, compare hashes, client-side only. No signup. Runs 100% in your browser.",
    openingParagraph:
      "Hash Generator computes MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes of any text or file entirely in your browser using the Web Crypto API. Paste a string or upload a file, select the algorithm, and the hash digest appears instantly in hex or Base64 format. Use the compare field to verify a hash matches an expected value — useful for checking download integrity or comparing password hashes.",
  },

  "password-generator": {
    title: "Password Generator — Strong Random Passwords | DevBench",
    metaDescription:
      "Generate strong, random passwords with custom length, character sets, and entropy. Copy instantly. No signup. Runs 100% in your browser — passwords are never sent anywhere.",
    openingParagraph:
      "Password Generator creates cryptographically strong random passwords using your browser's secure random number generator — nothing is ever transmitted or stored. Choose the length (8–128 characters), toggle uppercase, lowercase, digits, and symbols, and exclude ambiguous characters like O, 0, I, and l. The entropy meter shows how long a brute-force attack would take to crack the generated password.",
  },

  "url-encode": {
    title: "URL Encoder — Percent-Encode URLs Online | DevBench",
    metaDescription:
      "Percent-encode URLs and query strings online. Encode special characters, decode percent-encoded strings, and parse URL components. No signup, 100% in your browser.",
    openingParagraph:
      "URL Encode percent-encodes any text for safe use in URLs and query strings, converting characters like spaces, &, =, and non-ASCII to their %XX equivalents. Paste a full URL or just a query parameter value, choose between full URL encoding or component encoding, and copy the safe output instantly. Decode percent-encoded strings back to readable text with one click. Runs entirely in your browser.",
  },

  "string-inspector": {
    title: "String Inspector — Analyse Text Online | DevBench",
    metaDescription:
      "Inspect any string: character count, byte length, Unicode points, line count, entropy, and invisible characters. No signup. Runs 100% in your browser.",
    openingParagraph:
      "String Inspector analyses any text and reports character count, byte length (UTF-8 / UTF-16), word count, line count, unique character count, and Shannon entropy. It lists every Unicode code point with its name, category, and script — making it easy to spot invisible characters, zero-width spaces, or mixed-script homoglyphs that could cause subtle bugs in password or URL handling.",
  },
};
