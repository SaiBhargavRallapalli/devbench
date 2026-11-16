/**
 * Lightweight HTML/SVG sanitizer for paths that must not pull in
 * isomorphic-dompurify/jsdom (Vercel serverless: ERR_REQUIRE_ESM via @exodus/bytes).
 * Strips scripts, event handlers, dangerous tags, and dangerous URIs.
 * Prefer sanitize-html.ts (DOMPurify) when a real DOM is available
 * (Mermaid, markdown preview).
 *
 * Hardening notes:
 * - Replacements run to a FIXPOINT. Single-pass regex removal can reassemble
 *   a tag from its own leftovers (e.g. `<scri<script>pt>` -> `<script>` once
 *   the inner match is removed); looping until the output stops changing
 *   removes common reassembly cases, but is not a security boundary.
 * - Dangerous container tags (iframe/object/embed/base/meta/link/form) are
 *   removed outright, not just their scripts: this output is rendered by a
 *   server-side browser (ipynb -> PDF), where such tags can navigate or
 *   pull external content.
 * - javascript:/vbscript: detection tolerates whitespace/control chars
 *   inside the scheme (`java\tscript:`), which browsers strip but a naive
 *   prefix regex misses.
 *
 * Defense in depth: /api/convert-notebook additionally blocks ALL network
 * requests in the rendering browser, so even a sanitizer bypass cannot
 * reach the network.
 */

const SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
// Unclosed trailing <script ...> (no closing tag) must go too.
const LONE_SCRIPT_TAG_RE = /<script\b[^>]*>/gi;
const DANGEROUS_TAG_RE =
  /<\/?(?:iframe|object|embed|base|meta|link|form|applet|noscript)\b[^>]*>/gi;
const EVENT_ATTR_RE = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const DATA_NON_IMAGE_RE =
  /\s(src|href)\s*=\s*(["'])\s*data:(?!image\/(?:png|jpeg|jpg|gif|webp|svg\+xml))[^"']*\2/gi;

/** Quoted URI-bearing attributes, checked with whitespace-insensitive scheme matching. */
const QUOTED_URI_ATTR_RE =
  /\s(href|xlink:href|action|formaction|src|srcdoc|poster|background)\s*=\s*(["'])([\s\S]*?)\2/gi;
const UNQUOTED_URI_ATTR_RE =
  /\s(href|xlink:href|action|formaction|src|poster|background)\s*=\s*([^\s>]+)/gi;

/** Scheme after stripping characters browsers ignore inside schemes. */
function normalizedScheme(value: string): string {
  // Browsers ignore whitespace and control characters inside URL schemes
  // ("java\tscript:"), so strip them before prefix-matching.
  return value.replace(/[\s\u0000-\u001F\u007F]/g, "").toLowerCase();
}

function isDangerousScheme(value: string): boolean {
  const s = normalizedScheme(value);
  return s.startsWith("javascript:") || s.startsWith("vbscript:");
}

function sanitizeOnce(dirty: string): string {
  return dirty
    .replace(DANGEROUS_TAG_RE, "")
    .replace(SCRIPT_RE, "")
    .replace(LONE_SCRIPT_TAG_RE, "")
    .replace(EVENT_ATTR_RE, "")
    .replace(DATA_NON_IMAGE_RE, "")
    .replace(QUOTED_URI_ATTR_RE, (match, name: string, quote: string, value: string) => {
      void quote;
      return isDangerousScheme(value) ? ` ${name}="#"` : match;
    })
    .replace(UNQUOTED_URI_ATTR_RE, (match, name: string, value: string) => {
      return isDangerousScheme(value) ? ` ${name}="#"` : match;
    });
}

export function sanitizeHtmlLite(dirty: string): string {
  let out = dirty;
  // Fixpoint loop; Bound the work; rendering must still disable scripts and network.
  for (let i = 0; i < 10; i++) {
    const next = sanitizeOnce(out);
    if (next === out) return next;
    out = next;
  }
  return out;
}

export function sanitizeSvgLite(dirty: string): string {
  return sanitizeHtmlLite(dirty);
}
