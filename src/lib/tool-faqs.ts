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
      a: "A JWT is a compact, URL-safe token that encodes a JSON payload and is digitally signed. It consists of three Base64URL-encoded parts separated by dots: the header (algorithm and token type), the payload (claims like user ID and expiry), and the signature. JWTs are widely used for authentication and information exchange in REST APIs.",
    },
    {
      q: "Is it safe to paste my JWT here?",
      a: "Yes. The JWT debugger runs entirely in your browser — no token is sent to any server, stored, or logged. The decoding and signature verification happen locally using JavaScript's SubtleCrypto API. Check the browser's Network tab to confirm no requests are made when you paste a token.",
    },
    {
      q: "What is the difference between HS256 and RS256?",
      a: "HS256 (HMAC-SHA256) uses a shared secret key — the same key signs and verifies the token. RS256 (RSA-SHA256) uses a private/public key pair — the server signs with the private key and clients verify with the public key. RS256 is preferred for distributed systems because the public key can be shared without exposing signing capability.",
    },
    {
      q: "What does 'signature verification failed' mean?",
      a: "It means the token's signature does not match the expected value for the given header and payload. Common causes: wrong secret key, the token was tampered with, or the algorithm in the header doesn't match the key type. Never trust a JWT whose signature you cannot verify.",
    },
    {
      q: "What is the 'exp' claim and what happens when a JWT expires?",
      a: "The exp (expiration time) claim is a Unix timestamp after which the token must be rejected. When a JWT expires, the server should return 401 Unauthorized, and the client should request a new token using a refresh token or re-authenticate. The iat (issued at) and nbf (not before) claims are related timestamp claims.",
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
};
