import { jsonrepair } from "jsonrepair";

export interface FixResult {
  text: string;
  fixes: string[];
  original?: string;
  /** True when the fixed text parses as valid JSON */
  success?: boolean;
}

/** Normalize invalid JSON escape sequences (\\x, \\u{}, \\—, etc.). */
function fixInvalidJsonEscapes(text: string): string {
  let t = text;
  t = t.replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => `\\u00${h}`);
  t = t.replace(/\\u\{([0-9a-fA-F]{1,5})\}/g, (_, hex) => {
    const code = parseInt(hex, 16);
    if (code <= 0xffff) return `\\u${code.toString(16).padStart(4, "0")}`;
    const shifted = code - 0x10000;
    const high = 0xd800 + (shifted >> 10);
    const low = 0xdc00 + (shifted & 0x3ff);
    return `\\u${high.toString(16)}\\u${low.toString(16)}`;
  });
  t = t.replace(/\\u(?![0-9a-fA-F]{4})/g, "\\\\u");
  t = t.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
  return t;
}

/** Strip BOM, trim, unwrap `"{\n  \"a\": 1\n}"` style stringified JSON (up to 3 layers). */
function unwrapStringifiedJsonLayers(raw: string): { text: string; fixes: string[] } {
  const fixes: string[] = [];
  let t = raw;
  if (t.length > 0 && t.charCodeAt(0) === 0xfeff) {
    t = t.slice(1);
    fixes.push("Removed BOM (UTF-8 byte order mark)");
  }
  const trimmed = t.trim();
  if (trimmed !== t) {
    fixes.push("Trimmed leading/trailing whitespace");
    t = trimmed;
  }

  for (let layer = 0; layer < 3; layer++) {
    const s = t.trim();
    if (s.length < 2 || s[0] !== '"' || s[s.length - 1] !== '"') break;
    try {
      const inner = JSON.parse(s) as unknown;
      if (typeof inner !== "string") break;
      let candidate = inner;
      let innerEscapesFixed = false;
      let unwrappedLayer = false;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          JSON.parse(candidate);
          t = candidate;
          unwrappedLayer = true;
          fixes.push(
            layer === 0
              ? "Unwrapped stringified JSON (document was stored as a JSON string)"
              : "Unwrapped another JSON string layer",
          );
          if (innerEscapesFixed) {
            fixes.push("Fixed invalid escape sequences inside a stringified JSON layer");
          }
          break;
        } catch {
          const refixed = fixInvalidJsonEscapes(candidate);
          if (refixed === candidate) break;
          candidate = refixed;
          innerEscapesFixed = true;
        }
      }
      if (!unwrappedLayer) break;
    } catch {
      break;
    }
  }
  return { text: t, fixes };
}

/** Replace Python-style single-quoted strings only outside JSON double-quoted strings. */
function replaceSingleQuotesOutsideStrings(raw: string): { text: string; fixed: boolean } {
  const pattern = /(?<=[\[{,:\s])(\s*)'((?:[^'\\]|\\.)*)'(\s*)(?=[,\]}\s:])/;
  let out = "";
  let i = 0;
  let fixed = false;
  let inString = false;
  let escape = false;

  while (i < raw.length) {
    const ch = raw[i];
    if (inString) {
      out += ch;
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      i++;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      i++;
      continue;
    }
    const rest = raw.slice(i);
    const m = rest.match(pattern);
    if (m && m.index === 0) {
      out += `${m[1]}"${m[2]}"${m[3]}`;
      i += m[0].length;
      fixed = true;
      continue;
    }
    out += ch;
    i++;
  }
  return { text: out, fixed };
}

/** Read a JavaScript double-quoted string starting at or after `start` (leading whitespace skipped). */
function readJsDoubleQuotedString(
  s: string,
  start: number,
): { value: string; end: number } | null {
  let i = start;
  while (i < s.length && /\s/.test(s[i])) i++;
  if (s[i] !== '"') return null;
  i++;
  let value = "";
  while (i < s.length) {
    const ch = s[i];
    if (ch === '"') return { value, end: i + 1 };
    if (ch === "\\") {
      i++;
      if (i >= s.length) return null;
      const esc = s[i];
      switch (esc) {
        case '"':
        case "\\":
        case "/":
          value += esc;
          break;
        case "n":
          value += "\n";
          break;
        case "r":
          value += "\r";
          break;
        case "t":
          value += "\t";
          break;
        case "b":
          value += "\b";
          break;
        case "f":
          value += "\f";
          break;
        case "u": {
          if (i + 4 >= s.length) return null;
          const hex = s.slice(i + 1, i + 5);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) return null;
          value += String.fromCharCode(parseInt(hex, 16));
          i += 4;
          break;
        }
        case "x": {
          if (i + 2 >= s.length) return null;
          const hex = s.slice(i + 1, i + 3);
          if (!/^[0-9a-fA-F]{2}$/.test(hex)) return null;
          value += String.fromCharCode(parseInt(hex, 16));
          i += 2;
          break;
        }
        default:
          value += esc;
      }
      i++;
      continue;
    }
    value += ch;
    i++;
  }
  return null;
}

/**
 * Strip leading `+` and join `"a" + "b"` fragments copied from JavaScript source
 * (e.g. `+ "{\"resp\": true}"` or chunked JSON string builds).
 */
function unwrapJsStringConcatenation(raw: string): { text: string; fixes: string[] } {
  const fixes: string[] = [];
  let text = raw.trim();

  const leadingPlus = /^\+\s*/.exec(text);
  if (leadingPlus) {
    text = text.slice(leadingPlus[0].length).trimStart();
    fixes.push("Removed leading + from JavaScript string concatenation");
  }

  const parts: string[] = [];
  let pos = 0;
  while (pos <= text.length) {
    const tail = text.slice(pos).trimStart();
    if (!tail) break;
    pos = text.length - tail.length;
    const parsed = readJsDoubleQuotedString(text, pos);
    if (!parsed) break;
    parts.push(parsed.value);
    pos = parsed.end;
    const after = text.slice(pos).trimStart();
    if (!after) {
      pos = text.length;
      break;
    }
    if (after[0] !== "+") break;
    pos = text.length - after.length + 1;
    while (pos < text.length && /\s/.test(text[pos])) pos++;
  }

  const remainder = text.slice(pos).trim();
  if (parts.length > 0 && !remainder) {
    const joined = parts.join("");
    if (joined !== text) {
      if (parts.length > 1) {
        fixes.push(`Joined ${parts.length} JavaScript string literals`);
      } else if (!fixes.some((f) => f.includes("leading +"))) {
        fixes.push("Unwrapped JavaScript string literal");
      }
      text = joined;
    }
  }

  return { text, fixes };
}

/** Removes line and block comments (// and slash-star pairs) outside JSON strings. */
function stripJsonComments(raw: string): { text: string; fixed: boolean } {
  let out = "";
  let i = 0;
  let fixed = false;
  let inString = false;
  let escape = false;
  const len = raw.length;

  while (i < len) {
    const ch = raw[i];

    if (inString) {
      out += ch;
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      i++;
      continue;
    }

    if (ch === '"') {
      inString = true;
      out += ch;
      i++;
      continue;
    }

    if (ch === "/" && i + 1 < len && raw[i + 1] === "*") {
      fixed = true;
      i += 2;
      while (i + 1 < len && !(raw[i] === "*" && raw[i + 1] === "/")) {
        i++;
      }
      i = i + 2 <= len ? i + 2 : len;
      out += "\n";
      continue;
    }

    if (ch === "/" && i + 1 < len && raw[i + 1] === "/") {
      fixed = true;
      i += 2;
      while (i < len && raw[i] !== "\n" && raw[i] !== "\r") {
        i++;
      }
      continue;
    }

    out += ch;
    i++;
  }

  return { text: out, fixed };
}

/** Replace Python True/False/None with JSON true/false/null, skipping inside strings. */
function replacePythonLiterals(raw: string): string {
  let out = "";
  let i = 0;
  let inString = false;
  let escape = false;
  while (i < raw.length) {
    const ch = raw[i];
    if (inString) {
      out += ch;
      if (escape) { escape = false; }
      else if (ch === "\\") { escape = true; }
      else if (ch === '"') { inString = false; }
      i++;
      continue;
    }
    if (ch === '"') { inString = true; out += ch; i++; continue; }
    const rest = raw.slice(i);
    if (rest.startsWith("True") && !/[a-zA-Z0-9_]/.test(raw[i + 4] ?? "")) {
      out += "true"; i += 4;
    } else if (rest.startsWith("False") && !/[a-zA-Z0-9_]/.test(raw[i + 5] ?? "")) {
      out += "false"; i += 5;
    } else if (rest.startsWith("None") && !/[a-zA-Z0-9_]/.test(raw[i + 4] ?? "")) {
      out += "null"; i += 4;
    } else { out += ch; i++; }
  }
  return out;
}

/** Escape literal newlines/tabs/control chars that appear raw inside JSON strings. */
function fixLiteralControlChars(raw: string): { text: string; fixed: boolean } {
  let out = "";
  let i = 0;
  let inString = false;
  let escape = false;
  let fixed = false;
  while (i < raw.length) {
    const ch = raw[i];
    const code = raw.charCodeAt(i);
    if (inString) {
      if (escape) {
        escape = false; out += ch;
      } else if (ch === "\\") {
        escape = true; out += ch;
      } else if (ch === '"') {
        inString = false; out += ch;
      } else if (ch === "\n") {
        out += "\\n"; fixed = true;
      } else if (ch === "\r") {
        if (i + 1 < raw.length && raw[i + 1] === "\n") { i++; }
        out += "\\n"; fixed = true;
      } else if (ch === "\t") {
        out += "\\t"; fixed = true;
      } else if (code < 0x20) {
        out += `\\u${code.toString(16).padStart(4, "0")}`; fixed = true;
      } else {
        out += ch;
      }
    } else if (ch === '"') {
      inString = true; out += ch;
    } else {
      out += ch;
    }
    i++;
  }
  return { text: out, fixed };
}

export function fixCommonMistakes(input: string): FixResult {
  const fixes: string[] = [];
  let text = input;

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  const codeFenceBefore = text;
  text = text.replace(/^\s*```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?\s*```\s*$/i, "$1").trim();
  if (text !== codeFenceBefore) {
    fixes.push("Stripped markdown code fence");
  }

  // Replace curly/smart quotes with straight ASCII quotes (common when pasting from word
  // processors, Slack, Notion, etc.) — must run before escape normalization.
  const curlyQuoteBefore = text;
  text = text.replace(/[“”]/g, '"');
  text = text.replace(/[‘’]/g, "'");
  if (text !== curlyQuoteBefore) {
    fixes.push("Replaced curly/smart quotes (“”‘’) with straight ASCII quotes");
  }

  const jsConcat = unwrapJsStringConcatenation(text);
  if (jsConcat.fixes.length) {
    fixes.push(...jsConcat.fixes);
    text = jsConcat.text;
  }

  // Fix escape sequences FIRST so that stringified-JSON layers can be parsed below.
  const escapeBefore = text;
  text = fixInvalidJsonEscapes(text);
  if (text !== escapeBefore) {
    fixes.push("Fixed invalid escape sequences (\\x, \\u{}, partial \\u, non-standard backslash)");
  }

  const unwrap = unwrapStringifiedJsonLayers(text);
  if (unwrap.fixes.length) {
    fixes.push(...unwrap.fixes);
    text = unwrap.text;
  }

  // Replace Python literals (True/False/None) outside string values
  const pythonBefore = text;
  text = replacePythonLiterals(text);
  if (text !== pythonBefore) {
    fixes.push("Replaced Python literals (True → true, False → false, None → null)");
  }

  const mistakenKeySlash = text;
  text = text.replace(/"\/\/([a-zA-Z_$][\w$]*)"/g, '"$1"');
  if (text !== mistakenKeySlash) {
    fixes.push('Fixed keys that accidentally started with "//" inside quotes');
  }

  const slashNumberValue = text;
  text = text.replace(/:\s*\/\/(\d+)/g, ": $1");
  if (text !== slashNumberValue) {
    fixes.push("Replaced mistaken //number value with a number");
  }

  const missingOpenQuoteKey = text;
  text = text.replace(/([\[,]\s*)([a-zA-Z_$][\w$]*)"(\s*:)/g, '$1"$2"$3');
  if (text !== missingOpenQuoteKey) {
    fixes.push('Added missing " before a key (e.g. ,user": → ,"user":)');
  }

  const stripped = stripJsonComments(text);
  if (stripped.fixed) {
    fixes.push("Removed // or /* */ comments (JSON does not allow them)");
    text = stripped.text;
  }

  // Quote unquoted {{template}} variables used as values
  const templateVarBefore = text;
  text = text.replace(/([:\[,]\s*)\{\{([^{}]*)\}\}(?=\s*[,\]}\r\n])/g, '$1"{{$2}}"');
  text = text.replace(/([:\[,]\s*)\{\{([^{}]*)\}\}(\s*[}\]])/g, (_, pre, name, post) =>
    `${pre}"{{${name}}}"${post}`
  );
  if (text !== templateVarBefore) {
    fixes.push('Quoted unquoted template variables ({{variable}} → "{{variable}}")');
  }

  const singleQuoteResult = replaceSingleQuotesOutsideStrings(text);
  if (singleQuoteResult.fixed) {
    fixes.push("Replaced single quotes with double quotes (outside string values only)");
    text = singleQuoteResult.text;
  }

  const unquotedKeysBefore = text;
  text = text.replace(
    /(?<=[\{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:\s*)/g,
    '"$1"$2'
  );
  if (text !== unquotedKeysBefore) {
    fixes.push("Added quotes to unquoted keys");
  }

  const trailingBefore = text;
  text = text.replace(/,(\s*[}\]])/g, "$1");
  if (text !== trailingBefore) {
    fixes.push("Removed trailing commas");
  }

  const jsLiteralBefore = text;
  text = text
    .replace(/\bNaN\b/g, "null")
    .replace(/\bundefined\b/g, "null")
    .replace(/-Infinity\b/g, "null")
    .replace(/\bInfinity\b/g, "null");
  if (text !== jsLiteralBefore) {
    fixes.push("Replaced JavaScript-only literals (NaN, undefined, Infinity) with JSON null");
  }

  // Escape literal newlines/tabs that appear raw inside JSON strings
  const ctrlResult = fixLiteralControlChars(text);
  if (ctrlResult.fixed) {
    fixes.push("Escaped literal newlines/tabs inside string values");
    text = ctrlResult.text;
  }

  // Remove leading + from numbers (e.g. +5 → 5)
  const plusNumBefore = text;
  text = text.replace(/(?<=[:\[,]\s*)\+(\d)/g, "$1");
  if (text !== plusNumBefore) {
    fixes.push("Removed leading + from numbers");
  }

  // Deep-parse helper: expands string values that contain valid (or repairable) JSON objects/arrays.
  // Defined here so it can be called both before and after the jsonrepair last-resort pass.
  let deepExpandCount = 0;
  function deepParseStrings(val: unknown): unknown {
    if (typeof val === "string") {
      // Build candidate list: try raw string first, then with invalid escapes fixed.
      // This handles embedded JSON like `{"text": "Added 2\× Salt"}` where \× is an
      // invalid escape sequence that only appears inside the nested string content.
      const candidates: string[] = [val];
      const reescaped = fixInvalidJsonEscapes(val);
      if (reescaped !== val) candidates.push(reescaped);
      for (const candidate of candidates) {
        try {
          const inner = JSON.parse(candidate) as unknown;
          if (inner !== null && typeof inner === "object") {
            deepExpandCount++;
            return deepParseStrings(inner);
          }
        } catch { /* try next candidate */ }
      }
      try {
        const unescaped = JSON.parse('"' + val + '"') as unknown;
        if (typeof unescaped === "string") {
          const inner = JSON.parse(unescaped) as unknown;
          if (inner !== null && typeof inner === "object") {
            deepExpandCount++;
            return deepParseStrings(inner);
          }
        }
      } catch { /* not parseable either way */ }
      return val;
    }
    if (Array.isArray(val)) return val.map(deepParseStrings);
    if (val !== null && typeof val === "object") {
      const r: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) r[k] = deepParseStrings(v);
      return r;
    }
    return val;
  }

  function tryDeepParse(): void {
    try {
      const parsed = JSON.parse(text) as unknown;
      deepExpandCount = 0;
      const deep = deepParseStrings(parsed);
      if (deepExpandCount > 0) {
        text = JSON.stringify(deep, null, 2);
        fixes.push(`Expanded ${deepExpandCount} embedded JSON string${deepExpandCount > 1 ? "s" : ""} into nested objects`);
      }
    } catch { /* outer JSON still invalid — skip */ }
  }

  // Deep-parse string values that are themselves valid JSON objects/arrays
  tryDeepParse();

  // Last resort: NDJSON / JSON Lines → wrap in array
  try {
    JSON.parse(text);
  } catch {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      try {
        const parsed = lines.map((l) => JSON.parse(l));
        text = JSON.stringify(parsed, null, 2);
        fixes.push(`Detected ${lines.length} JSON Lines (NDJSON) and wrapped them in an array`);
      } catch { /* not NDJSON */ }
    }
  }

  // Advanced repair (missing commas, truncated brackets, etc.) via jsonrepair
  if (!tryParseJson(text)) {
    for (const [source, label] of [
      [text, "Applied advanced repair (missing commas, truncated brackets, …)"],
      [input, "Applied advanced repair on original input"],
    ] as const) {
      try {
        const repaired = jsonrepair(source);
        if (repaired !== text && tryParseJson(repaired)) {
          text = repaired;
          fixes.push(label);
          break;
        }
      } catch {
        /* try next source */
      }
    }
    // Retry deep-parse after jsonrepair: the outer structure may have been invalid
    // when we first tried (e.g. missing wrapping braces), so embedded JSON strings
    // inside the now-repaired document were never expanded.
    tryDeepParse();
  }

  const success = tryParseJson(text);
  return { text, fixes, success };
}

function tryParseJson(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

/** Strip comments outside JSON strings (shared with JSONC import). */
export { stripJsonComments };
