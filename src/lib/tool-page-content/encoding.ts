import type { ToolPageContent } from "./_types";

export const pageContentEncoding: Record<string, ToolPageContent> = {
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

  "base64-image": {
    title: "Base64 Image Encoder/Decoder — Data URI Tool",
    metaDescription:
      "Encode images to Base64 data URIs or decode Base64 back to a viewable image. PNG, JPG, WebP, SVG supported. Instant preview. No signup, 100% client-side.",
    openingParagraph:
      "Base64 Image converts any image (PNG, JPEG, WebP, GIF, SVG) to a Base64 data URI for embedding directly in HTML, CSS, or JSON without a separate HTTP request. Paste a Base64 string to decode it back to a viewable image and download it. Useful for embedding icons in HTML emails, inlining images in CSS, and passing image data through APIs. Runs entirely in your browser — nothing is uploaded.",
  },

  "url-encode": {
    title: "URL Encoder — Percent-Encode URLs Online",
    metaDescription:
      "Percent-encode URLs and query strings online. Encode special characters, decode percent-encoded strings, and parse URL components. No signup, 100% in your browser.",
    openingParagraph:
      "URL Encode percent-encodes any text for safe use in URLs and query strings, converting characters like spaces, &, =, and non-ASCII to their %XX equivalents. Paste a full URL or just a query parameter value, choose between full URL encoding or component encoding, and copy the safe output instantly. Decode percent-encoded strings back to readable text with one click. Runs entirely in your browser.",
  },

  "url-decode": {
    title: "URL Decoder — Percent-Decode Online",
    metaDescription:
      "Decode percent-encoded URLs and query strings online instantly. Handles %20, %26, UTF-8 multi-byte sequences, and form-encoded + signs. No signup, 100% in your browser.",
    openingParagraph:
      "URL Decode converts percent-encoded strings back to readable text instantly — %20 becomes a space, %2F becomes a slash, multi-byte UTF-8 sequences decode to their correct Unicode characters. Paste any encoded URL, query parameter, or API response value and get the human-readable version in one click. Optionally decode + as space for HTML form data. Runs entirely in your browser with no server calls.",
  },

  "aes-encrypt-decrypt": {
    title: "AES-256 Encrypt & Decrypt — Free Online Tool",
    metaDescription:
      "Encrypt and decrypt text with AES-256-GCM in your browser. PBKDF2 key derivation, authenticated encryption. No signup, no server — 100% client-side.",
    openingParagraph:
      "AES Encrypt encrypts and decrypts text using AES-256-GCM — the same algorithm used by TLS 1.3 and Signal — entirely in your browser via the Web Crypto API. Enter your plaintext and a password, and the tool derives a 256-bit key using PBKDF2 with 310,000 iterations and a random salt. GCM mode provides authenticated encryption, so any tampering with the ciphertext is detected on decryption. Nothing is ever sent to a server.",
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
    title: "Morse Code Generator — Convert & Translate Text Online",
    metaDescription:
      "Generate Morse code from any text online — convert letters, words, and sentences to dots and dashes. Decode any Morse code back to text instantly. No signup, browser-only.",
    openingParagraph:
      "Morse Code Generator converts any Latin text to International Morse Code (dots, dashes, and spaces) and decodes Morse back to text — a full two-way Morse code converter in one tool. Words are separated by slashes (/), letters by spaces. Paste SOS (... --- ...) or any Morse sequence to decode it, or type any message to generate its Morse representation. Runs entirely in your browser with instant conversion.",
  },
};
