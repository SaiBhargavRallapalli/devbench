// Copyright (c) 2026 DevBench contributors. MIT License.
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  readMinutes: number;
  relatedToolSlug?: string;
  relatedToolLabel?: string;
  relatedToolHref?: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "browser-code-playground-privacy",
    title: "Browser code playgrounds: what runs where (and what never leaves your tab)",
    date: "2026-05-08",
    excerpt:
      "Online playgrounds mix iframes, WebAssembly, and remote compilers. Here is a practical map of which pieces stay local, which hit a third-party API, and how to choose a flow for secrets and stdin-heavy programs.",
    tags: ["devtools", "python", "javascript", "security"],
    readMinutes: 6,
    relatedToolSlug: "code-playground",
    relatedToolLabel: "Code playground",
    relatedToolHref: "/playground",
  },
  {
    slug: "how-base64-encoding-works-and-when-not-to-use-it",
    title: "How Base64 encoding works — and when NOT to use it",
    date: "2026-05-08",
    excerpt:
      "Base64 turns binary into printable ASCII — useful for email, JSON, and data URIs. Here is how the encoding actually works, why it inflates size by ~33%, and the dangerous cases where people mistake it for encryption.",
    tags: ["encoding", "security", "web"],
    readMinutes: 9,
    relatedToolSlug: "base64-encode",
    relatedToolLabel: "Base64 Encode",
    relatedToolHref: "/tools/base64-encode",
  },
  {
    slug: "jwt-security-best-practices-10-things-developers-get-wrong",
    title: "JWT security best practices — 10 things developers get wrong",
    date: "2026-05-08",
    excerpt:
      "JWTs are convenient, but misuse is everywhere: treating payloads as secret, skipping audience checks, weak HMAC keys, and storing tokens where XSS can read them. Here are ten concrete mistakes and what to do instead.",
    tags: ["jwt", "security", "auth"],
    readMinutes: 10,
    relatedToolSlug: "jwt-debugger",
    relatedToolLabel: "JWT Debugger",
    relatedToolHref: "/jwt-debugger",
  },
  {
    slug: "yaml-vs-json-key-differences-with-real-examples",
    title: "YAML vs JSON — key differences with real examples",
    date: "2026-05-08",
    excerpt:
      "JSON is strict and universal; YAML is human-friendly and dangerously powerful. Compare syntax, types, anchors, comments, and multi-document streams — with copy-paste examples you can run through a formatter.",
    tags: ["yaml", "json", "config"],
    readMinutes: 8,
    relatedToolSlug: "yaml-formatter",
    relatedToolLabel: "YAML Formatter & Validator",
    relatedToolHref: "/tools/yaml-formatter",
  },
  {
    slug: "how-to-validate-json-online",
    title: "How to Validate JSON Online (Safely)",
    date: "2026-05-08",
    excerpt:
      "Validate JSON before it breaks production APIs — what “valid JSON” means, how browser-only tools differ from server uploads, and a simple workflow you can repeat every time.",
    tags: ["json", "debugging", "web"],
    readMinutes: 5,
    relatedToolSlug: "json-formatter",
    relatedToolLabel: "JSON Formatter & Validator",
    relatedToolHref: "/json",
  },
  {
    slug: "jwt-decoder-without-uploading-to-server",
    title: "JWT Decoder Without Uploading to a Server",
    date: "2026-05-07",
    excerpt:
      "Decode JWT header and payload in the browser: why Base64 is not encryption, what stays local vs what never leaves your machine, and why decoding still isn’t verification.",
    tags: ["jwt", "security", "auth"],
    readMinutes: 5,
    relatedToolSlug: "jwt-debugger",
    relatedToolLabel: "JWT Debugger",
    relatedToolHref: "/jwt-debugger",
  },
  {
    slug: "uuid-vs-ulid-vs-nanoid",
    title: "UUID vs ULID vs Nano ID: Which Should You Use?",
    date: "2026-05-05",
    excerpt:
      "UUID v4 is everywhere, but ULID and Nano ID solve real problems UUID can't. Here's a practical breakdown of when to use each.",
    tags: ["identifiers", "databases", "javascript"],
    readMinutes: 5,
    relatedToolSlug: "uuid-generator",
    relatedToolLabel: "UUID / ULID / Nano ID Generator",
    relatedToolHref: "/tools/uuid-generator",
  },
  {
    slug: "jwt-explained",
    title: "JWT Explained: Header, Payload, and Signature Decoded",
    date: "2026-05-04",
    excerpt:
      "What actually goes inside a JSON Web Token? We break down every part of a JWT, explain the signature algorithm, and show the common pitfalls.",
    tags: ["auth", "security", "jwt"],
    readMinutes: 6,
    relatedToolSlug: "jwt-debugger",
    relatedToolLabel: "JWT Debugger",
    relatedToolHref: "/jwt-debugger",
  },
  {
    slug: "encodeuricomponent-vs-encodeuri",
    title: "URL Encoding: encodeURIComponent vs encodeURI Explained",
    date: "2026-05-03",
    excerpt:
      "JavaScript has two URL encoding functions and most developers mix them up. Here's exactly when to use each one — and what breaks when you don't.",
    tags: ["javascript", "web", "urls"],
    readMinutes: 4,
    relatedToolSlug: "url-encode",
    relatedToolLabel: "URL Encoder / Decoder",
    relatedToolHref: "/tools/url-encode",
  },
  {
    slug: "common-json-errors",
    title: "What Makes JSON Invalid? The 7 Most Common JSON Syntax Errors",
    date: "2026-05-02",
    excerpt:
      "Trailing commas, single quotes, comments — these valid JavaScript patterns silently break JSON parsers. Learn to spot and fix all of them.",
    tags: ["json", "debugging", "javascript"],
    readMinutes: 4,
    relatedToolSlug: "json-formatter",
    relatedToolLabel: "JSON Formatter & Validator",
    relatedToolHref: "/json",
  },
  {
    slug: "regex-cheat-sheet-javascript",
    title: "Regular Expressions Cheat Sheet for JavaScript Developers",
    date: "2026-05-01",
    excerpt:
      "The 20 regex patterns every JavaScript developer actually uses — email, URL, IP address, date, and more — with copy-ready code.",
    tags: ["regex", "javascript", "reference"],
    readMinutes: 7,
    relatedToolSlug: "regex-tester",
    relatedToolLabel: "Regex Tester",
    relatedToolHref: "/tools/regex-tester",
  },
  {
    slug: "how-to-generate-secure-passwords",
    title: "How to Generate Secure Passwords: A Developer's Guide",
    date: "2026-05-15",
    excerpt:
      "What makes a password truly secure — entropy, character sets, length — and how to generate cryptographically strong passwords in JavaScript, Python, and on the command line.",
    tags: ["security", "javascript"],
    readMinutes: 5,
    relatedToolSlug: "password-generator",
    relatedToolLabel: "Password Generator",
    relatedToolHref: "/tools/password-generator",
  },
  {
    slug: "sha256-vs-md5-hash-functions",
    title: "SHA-256 vs MD5: Which Hash Function Should You Use?",
    date: "2026-05-15",
    excerpt:
      "MD5 is fast and broken; SHA-256 is the modern baseline. A practical breakdown of hash functions, collision resistance, and when to reach for bcrypt or Argon2 instead.",
    tags: ["security", "devtools"],
    readMinutes: 6,
    relatedToolSlug: "hash-generator",
    relatedToolLabel: "Hash Generator",
    relatedToolHref: "/tools/hash-generator",
  },
  {
    slug: "cron-expression-syntax-guide",
    title: "Cron Expression Syntax: A Complete Guide with Examples",
    date: "2026-05-15",
    excerpt:
      "Master cron expression syntax from the five standard fields through extended six-field formats, special strings, and common scheduling patterns with copy-ready examples.",
    tags: ["devtools", "reference"],
    readMinutes: 7,
    relatedToolSlug: "cron-parser",
    relatedToolLabel: "Cron Expression Parser",
    relatedToolHref: "/tools/cron-parser",
  },
  {
    slug: "unix-timestamps-explained",
    title: "Unix Timestamps Explained for Developers",
    date: "2026-05-15",
    excerpt:
      "Unix timestamps are the lingua franca of time in software — what they are, how to work with them in JavaScript and Python, common pitfalls around timezones and milliseconds, and the 2038 problem.",
    tags: ["devtools", "javascript"],
    readMinutes: 5,
    relatedToolSlug: "unix-timestamp",
    relatedToolLabel: "Unix Timestamp Converter",
    relatedToolHref: "/tools/unix-timestamp",
  },
  {
    slug: "hex-rgb-hsl-css-colors-explained",
    title: "HEX, RGB, HSL: CSS Color Formats Explained",
    date: "2026-05-15",
    excerpt:
      "HEX, RGB, HSL, and modern CSS color formats each have a job: copy from design tools, manipulate programmatically, or communicate intent. Here is when to use each and how to convert between them.",
    tags: ["web", "reference"],
    readMinutes: 6,
    relatedToolSlug: "color-converter",
    relatedToolLabel: "Color Converter",
    relatedToolHref: "/tools/color-converter",
  },
  {
    slug: "celsius-to-fahrenheit-converter",
    title: "Celsius to Fahrenheit: Formula, Examples & Quick Reference Chart",
    date: "2026-05-16",
    excerpt:
      "The exact formula, a quick mental trick, and a reference table for every temperature that matters — freezing, body temp, oven settings, and more.",
    tags: ["temperature", "converter", "math", "reference"],
    readMinutes: 5,
    relatedToolSlug: "temperature-converter",
    relatedToolLabel: "Temperature Converter",
    relatedToolHref: "/tools/temperature-converter",
  },
  {
    slug: "morse-code-alphabet-chart",
    title: "Morse Code Alphabet: Complete A–Z Chart, Numbers & How to Use It",
    date: "2026-05-16",
    excerpt:
      "A complete Morse code reference: every letter, digit, and common punctuation mark, plus a brief history and where Morse is still used today.",
    tags: ["encoding", "morse-code", "reference", "communication"],
    readMinutes: 5,
    relatedToolSlug: "morse-code",
    relatedToolLabel: "Morse Code Translator",
    relatedToolHref: "/tools/morse-code",
  },
  {
    slug: "pythagorean-theorem-examples",
    title: "Pythagorean Theorem: Formula, Worked Examples & Calculator",
    date: "2026-05-16",
    excerpt:
      "a² + b² = c² explained from scratch: finding the hypotenuse, solving for a missing leg, Pythagorean triples, and real-world applications with step-by-step worked examples.",
    tags: ["math", "geometry", "calculator", "education"],
    readMinutes: 6,
    relatedToolSlug: "pythagorean-theorem",
    relatedToolLabel: "Pythagorean Theorem Calculator",
    relatedToolHref: "/tools/pythagorean-theorem",
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
