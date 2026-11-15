// Copyright (c) 2026 DevBench contributors. MIT License.

/**
 * A small, dependency-free HTML formatter/beautifier. It tokenises the input
 * into tags and text, then re-emits with consistent indentation. It is
 * deliberately conservative: content inside raw-text elements (`script`,
 * `style`, `pre`, `textarea`) and inside HTML comments is passed through
 * untouched so formatting never corrupts code or preformatted blocks.
 *
 * An element whose content is only text and inline tags collapses onto a single
 * line (`<p>Hi</p>`); elements containing block children go multi-line. The
 * depth counter is pushed only for real containers, so void tags, self-closing
 * tags and collapsed elements never make the indentation drift.
 */

/** Elements whose inner content must not be re-indented. */
const RAW_TEXT = new Set(["script", "style", "pre", "textarea"]);

/** Elements that never have a closing tag. */
const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

/**
 * Pure-inline tags: an element whose children are only these (plus text and
 * comments) collapses to one line. Deliberately excludes void tags like `br`
 * and `img` so `<div><br></div>` still formats across lines.
 */
const INLINE = new Set([
  "a", "abbr", "b", "bdi", "bdo", "cite", "code", "data", "dfn",
  "em", "i", "kbd", "mark", "q", "rp", "rt", "ruby", "s", "samp",
  "small", "span", "strong", "sub", "sup", "time", "u", "var",
]);

export interface FormatOptions {
  /** Spaces per indent level. Defaults to 2. */
  indent?: number;
  /** Collapse runs of whitespace in normal text. Defaults to true. */
  collapseWhitespace?: boolean;
}

type Token =
  | { kind: "comment"; text: string }
  | { kind: "doctype"; text: string }
  | { kind: "open"; name: string; raw: string; selfClosing: boolean }
  | { kind: "close"; name: string }
  | { kind: "text"; text: string };

const TOKEN_RE =
  /<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;

function attrEndsWithSlash(attrs: string): boolean {
  return /\/\s*$/.test(attrs);
}

function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN_RE.exec(html))) {
    if (m.index > last) tokens.push({ kind: "text", text: html.slice(last, m.index) });
    const raw = m[0];
    if (raw.startsWith("<!--")) {
      tokens.push({ kind: "comment", text: raw });
    } else if (/^<!DOCTYPE/i.test(raw)) {
      tokens.push({ kind: "doctype", text: raw });
    } else if (m[1] !== undefined) {
      tokens.push({ kind: "close", name: m[1].toLowerCase() });
    } else {
      const name = m[2].toLowerCase();
      const attrs = m[3] ?? "";
      const selfClosing = attrEndsWithSlash(attrs) || VOID.has(name);
      tokens.push({ kind: "open", name, raw: raw.trim(), selfClosing });
    }
    last = m.index + raw.length;
  }
  if (last < html.length) tokens.push({ kind: "text", text: html.slice(last) });
  return tokens;
}

/** Index of the tag closing the open token at `openIdx`, or -1. */
function findClose(tokens: Token[], openIdx: number): number {
  const open = tokens[openIdx];
  if (open.kind !== "open") return -1;
  const name = open.name;
  let depth = 1;
  for (let j = openIdx + 1; j < tokens.length; j++) {
    const t = tokens[j];
    if (t.kind === "open" && t.name === name && !t.selfClosing) depth++;
    else if (t.kind === "close" && t.name === name) {
      depth--;
      if (depth === 0) return j;
    }
  }
  return -1;
}

/** True when every open tag between the pair is a pure-inline tag. */
function isCollapsible(tokens: Token[], start: number, end: number): boolean {
  for (let j = start; j <= end; j++) {
    const t = tokens[j];
    if (t.kind === "open" && !INLINE.has(t.name)) return false;
    if (t.kind === "doctype") return false;
  }
  return true;
}

/** Rebuild the inner source of a collapsed element (text whitespace collapsed). */
function serializeInner(tokens: Token[], start: number, end: number, collapse: boolean): string {
  const parts: string[] = [];
  for (let j = start; j <= end; j++) {
    const t = tokens[j];
    if (t.kind === "text") parts.push(collapse ? t.text.replace(/\s+/g, " ") : t.text);
    else if (t.kind === "comment") parts.push(t.text);
    else if (t.kind === "open") parts.push(t.raw);
    else if (t.kind === "close") parts.push(`</${t.name}>`);
    else if (t.kind === "doctype") parts.push(t.text);
  }
  return parts.join("").trim();
}

/** Rebuild raw-text inner content verbatim (no whitespace collapsing). */
function rawInner(tokens: Token[], start: number, end: number): string {
  const parts: string[] = [];
  for (let j = start; j <= end; j++) {
    const t = tokens[j];
    if (t.kind === "text") parts.push(t.text);
    else if (t.kind === "comment") parts.push(t.text);
    else if (t.kind === "open") parts.push(t.raw);
    else if (t.kind === "close") parts.push(`</${t.name}>`);
  }
  return parts.join("");
}

/**
 * Format an HTML document string. Returns the input unchanged if it is empty.
 */
export function formatHtml(html: string, options: FormatOptions = {}): string {
  const indent = options.indent ?? 2;
  const collapse = options.collapseWhitespace ?? true;
  if (!html.trim()) return "";

  const pad = " ".repeat(indent);
  const tokens = tokenize(html);
  const out: string[] = [];
  // Stack of "did this container push depth". Only multi-line block containers
  // push `true`; inline containers push `false`; everything else pushes nothing.
  const stack: boolean[] = [];
  let depth = 0;
  let i = 0;

  const line = (text: string, level: number) => {
    if (text === "") return;
    out.push(pad.repeat(Math.max(0, level)) + text);
  };

  while (i < tokens.length) {
    const tok = tokens[i];

    if (tok.kind === "doctype") {
      line(tok.text.trim(), depth);
      i++;
      continue;
    }

    if (tok.kind === "comment") {
      line(tok.text.trim(), depth);
      i++;
      continue;
    }

    if (tok.kind === "close") {
      const top = stack.pop();
      if (top === true) depth = Math.max(0, depth - 1);
      line(`</${tok.name}>`, depth);
      i++;
      continue;
    }

    if (tok.kind === "text") {
      let text = tok.text;
      if (collapse) text = text.replace(/\s+/g, " ");
      text = text.trim();
      line(text, depth);
      i++;
      continue;
    }

    // open tag
    if (RAW_TEXT.has(tok.name) && !tok.selfClosing) {
      const closeIdx = findClose(tokens, i);
      line(tok.raw, depth);
      if (closeIdx !== -1) {
        const inner = rawInner(tokens, i + 1, closeIdx - 1)
          .replace(/^[ \t]*\n/, "")
          .replace(/\s+$/, "");
        if (inner) out.push(inner);
        line(`</${tok.name}>`, depth);
        i = closeIdx + 1;
      } else {
        i++;
      }
      continue;
    }

    if (tok.selfClosing) {
      line(tok.raw, depth);
      i++; // void/self-closing: no depth push, no matching close
      continue;
    }

    const closeIdx = findClose(tokens, i);
    if (closeIdx !== -1 && isCollapsible(tokens, i + 1, closeIdx - 1)) {
      const inner = serializeInner(tokens, i + 1, closeIdx - 1, collapse);
      line(`${tok.raw}${inner}</${tok.name}>`, depth);
      i = closeIdx + 1; // collapsed: skip the close token, no depth push
      continue;
    }

    // Multi-line container (or unmatched open): push depth for blocks only.
    line(tok.raw, depth);
    if (INLINE.has(tok.name)) {
      stack.push(false);
    } else {
      stack.push(true);
      depth++;
    }
    i++;
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}
