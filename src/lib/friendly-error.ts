/**
 * Map raw exceptions to user-safe copy.
 *
 * Tool components must never render `error.message` directly: pdf-lib, pdf.js,
 * JSON.parse, canvas, and workers throw internal jargon ("WinAnsi cannot encode
 * 日", "Unexpected token < in JSON at position 23", "Cannot read properties of
 * undefined") that confuses users and leaks implementation details.
 *
 * Display path: `friendlyError(e, fallback)` → safe copy.
 * Analytics path: keep passing the RAW message to `trackToolError` so debugging
 * still has the real cause.
 */

interface Rule {
  /** Test against `error.message` (and name for DOMException-style errors). */
  test: (message: string, name: string) => boolean;
  message: string;
}

const RULES: Rule[] = [
  {
    test: (m) => /WinAnsi cannot encode/i.test(m),
    message:
      "Your text contains characters this PDF font can't render (e.g. emoji or CJK). Try ASCII/Latin text, or the unsupported characters were replaced with “?”.",
  },
  {
    test: (m, n) => n === "SyntaxError" || /JSON\.parse|Unexpected token|Unexpected end of JSON/i.test(m),
    message: "That file isn't valid JSON — it may be truncated or not a real .ipynb/JSON export.",
  },
  {
    test: (m) => /encrypted|password|Permissions/i.test(m) && /PDF|password/i.test(m),
    message: "This PDF is password-protected. Remove the password and try again.",
  },
  {
    test: (m) => /Invalid PDF|PDF header|not a PDF|xref|startxref|damaged/i.test(m),
    message: "Couldn't read this PDF — the file may be damaged or not a real PDF.",
  },
  {
    test: (m, n) => n === "SecurityError" || /tainted|cross-origin|Permission denied/i.test(m),
    message: "The browser blocked processing this image because of its source. Try re-uploading the file directly.",
  },
  {
    test: (m) => /toBlob|toDataURL|out of memory|allocation failed/i.test(m),
    message: "The image is too large to process in the browser. Try a smaller file.",
  },
  {
    test: (m) => /Failed to fetch|NetworkError|network|ECONN|load failed/i.test(m),
    message: "Network error — check your connection and try again.",
  },
  {
    test: (m) => /timeout|timed out/i.test(m),
    message: "The operation timed out. Try a smaller file or try again.",
  },
  {
    test: (m) => /exceeds the|too large|file size/i.test(m),
    message: "That file is too large. Try a smaller file.",
  },
  {
    test: (m) => /encrypted/i.test(m),
    message: "This file is encrypted and can't be processed. Remove the password and try again.",
  },
];

/**
 * Return a user-safe message for any thrown value.
 * Always returns non-empty copy — callers can render it directly.
 */
export function friendlyError(e: unknown, fallback: string): string {
  // DOMException is NOT `instanceof Error` in some environments (jsdom, older
  // Safari), so check it by name/shape first, before the Error guard below.
  if (e instanceof DOMException) {
    if (e.name === "SecurityError") {
      return "The browser blocked processing this image because of its source. Try re-uploading the file directly.";
    }
    if (e.name === "NotAllowedError") {
      return "The browser blocked this action. Check permissions and try again.";
    }
  }

  if (e instanceof Error) {
    const message = e.message || "";
    const name = e.name || "";
    for (const rule of RULES) {
      if (rule.test(message, name)) return rule.message;
    }
    if (e instanceof TypeError) {
      // JS TypeErrors ("Cannot read properties of undefined…") are internal bugs
      // or unsupported inputs — never show them verbatim.
      return fallback;
    }
  }
  return fallback;
}
