// Copyright (c) 2026 DevBench contributors. MIT License.
import semver from "semver";
import { requireSubtleCrypto } from "./_shared";
import type { Result } from "./_shared";

export function decodeJwt(input: string): {
  header: unknown;
  payload: unknown;
  signature: string;
  error?: string;
} {
  try {
    const parts = input.trim().split(".");
    if (parts.length !== 3) return { header: null, payload: null, signature: "", error: "Invalid JWT — must have 3 parts separated by dots" };
    const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return { header, payload, signature: parts[2] };
  } catch (e) {
    return { header: null, payload: null, signature: "", error: `JWT decode failed: ${(e as Error).message}` };
  }
}

export async function generateHash(input: string, algo: string): Promise<Result> {
  try {
    const subtle = requireSubtleCrypto();
    const data = new TextEncoder().encode(input);
    const hash = await subtle.digest(algo, data);
    const hex = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hex;
  } catch (e) {
    return { output: "", error: `Hash failed: ${(e as Error).message}` };
  }
}

export function generateUuids(count: number): string[] {
  const uuids: string[] = [];
  for (let i = 0; i < Math.min(count, 25); i++) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    uuids.push(
      `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
    );
  }
  return uuids;
}

export function convertColor(input: string): Result {
  const s = input.trim().toLowerCase();
  let r: number, g: number, b: number, a = 1;

  const hexMatch = s.match(/^#?([0-9a-f]{3,8})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    if (hex.length === 6 || hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
      if (hex.length === 8) a = parseInt(hex.slice(6, 8), 16) / 255;
    } else {
      return { output: "", error: "Invalid hex color" };
    }
  } else {
    const rgbMatch = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
    if (rgbMatch) {
      r = parseInt(rgbMatch[1]);
      g = parseInt(rgbMatch[2]);
      b = parseInt(rgbMatch[3]);
      a = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;
    } else {
      const hslMatch = s.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*(?:,\s*([\d.]+))?\s*\)/);
      if (hslMatch) {
        const h = parseFloat(hslMatch[1]) / 360;
        const sat = parseFloat(hslMatch[2]) / 100;
        const l = parseFloat(hslMatch[3]) / 100;
        a = hslMatch[4] !== undefined ? parseFloat(hslMatch[4]) : 1;
        if (sat === 0) {
          r = g = b = Math.round(l * 255);
        } else {
          const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
          };
          const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat;
          const p = 2 * l - q;
          r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
          g = Math.round(hue2rgb(p, q, h) * 255);
          b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
        }
      } else {
        return { output: "", error: "Unrecognized color format. Use hex (#fff), rgb(r,g,b), or hsl(h,s%,l%)" };
      }
    }
  }

  const hex = `#${[r!, g!, b!].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  const rN = r! / 255, gN = g! / 255, bN = b! / 255;
  const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
  const l = (max + min) / 2;
  let h = 0, sat = 0;
  if (max !== min) {
    const d = max - min;
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rN) h = ((gN - bN) / d + (gN < bN ? 6 : 0)) / 6;
    else if (max === gN) h = ((bN - rN) / d + 2) / 6;
    else h = ((rN - gN) / d + 4) / 6;
  }

  const lines = [
    `HEX:  ${hex}`,
    `RGB:  rgb(${r!}, ${g!}, ${b!})`,
    `RGBA: rgba(${r!}, ${g!}, ${b!}, ${a})`,
    `HSL:  hsl(${Math.round(h * 360)}, ${Math.round(sat * 100)}%, ${Math.round(l * 100)}%)`,
    `HSLA: hsla(${Math.round(h * 360)}, ${Math.round(sat * 100)}%, ${Math.round(l * 100)}%, ${a})`,
  ];
  return lines.join("\n");
}

export function unixTimestamp(input: string): Result {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) {
    let ts = parseInt(trimmed);
    if (ts < 1e12) ts *= 1000;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return { output: "", error: "Invalid timestamp" };
    return [
      `Unix (s):    ${Math.floor(ts / 1000)}`,
      `Unix (ms):   ${ts}`,
      `UTC:         ${d.toUTCString()}`,
      `Local:       ${d.toLocaleString()}`,
      `ISO 8601:    ${d.toISOString()}`,
    ].join("\n");
  }
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return { output: "", error: "Could not parse date. Try a Unix timestamp or ISO 8601 date." };
  return [
    `Unix (s):    ${Math.floor(d.getTime() / 1000)}`,
    `Unix (ms):   ${d.getTime()}`,
    `UTC:         ${d.toUTCString()}`,
    `Local:       ${d.toLocaleString()}`,
    `ISO 8601:    ${d.toISOString()}`,
  ].join("\n");
}

const CRON_NAMES: Record<number, string[]> = {
  0: ["minute", "0", "59"],
  1: ["hour", "0", "23"],
  2: ["day of month", "1", "31"],
  3: ["month", "1", "12"],
  4: ["day of week", "0", "6"],
};

const MONTH_NAMES = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function parseCron(input: string): Result {
  const parts = input.trim().split(/\s+/);
  if (parts.length < 5) return { output: "", error: "Cron expression must have 5 fields: minute hour day month weekday" };

  const descriptions: string[] = [];
  const [min, hr, dom, mon, dow] = parts;

  if (min === "*" && hr === "*") descriptions.push("Every minute");
  else if (min === "0" && hr === "*") descriptions.push("Every hour, at minute 0");
  else if (min !== "*" && hr !== "*" && dom === "*" && mon === "*" && dow === "*")
    descriptions.push(`At ${hr.padStart(2, "0")}:${min.padStart(2, "0")} every day`);
  else {
    if (min !== "*") descriptions.push(`At minute ${min}`);
    if (hr !== "*") descriptions.push(`at hour ${hr}`);
    if (dom !== "*") descriptions.push(`on day ${dom} of the month`);
    if (mon !== "*") {
      const m = parseInt(mon);
      descriptions.push(`in ${MONTH_NAMES[m] || `month ${mon}`}`);
    }
    if (dow !== "*") {
      const d = parseInt(dow);
      descriptions.push(`on ${DAY_NAMES[d] || `weekday ${dow}`}`);
    }
  }

  const now = new Date();
  const nextRuns: { date: Date; iso: string; local: string; rel: string }[] = [];
  const check = new Date(now);
  check.setSeconds(0, 0);
  for (let attempts = 0; attempts < 525600 && nextRuns.length < 10; attempts++) {
    check.setMinutes(check.getMinutes() + 1);
    if (matchesCron(check, parts)) {
      const d = new Date(check);
      nextRuns.push({
        date: d,
        iso: d.toISOString(),
        local: d.toLocaleString(undefined, {
          weekday: "short", year: "numeric", month: "short", day: "2-digit",
          hour: "2-digit", minute: "2-digit",
        }),
        rel: formatRelative(now, d),
      });
    }
  }

  const intervals: number[] = [];
  for (let i = 1; i < nextRuns.length; i++) {
    intervals.push((nextRuns[i].date.getTime() - nextRuns[i - 1].date.getTime()) / 1000 / 60);
  }
  const summary = intervals.length
    ? `Gap between runs: ${describeInterval(intervals)}`
    : "Could not compute interval (only 0–1 run in the next year).";

  return [
    `Description: ${descriptions.join(", ")}`,
    `Expression:  ${input.trim()}`,
    `Now:         ${now.toLocaleString()}`,
    "",
    summary,
    "",
    "Next 10 runs:",
    ...nextRuns.map((r, i) => `  ${String(i + 1).padStart(2, " ")}. ${r.local}  (${r.rel})`),
  ].join("\n");
}

// suppress unused-variable warning — CRON_NAMES is kept for potential future use
void CRON_NAMES;

function formatRelative(from: Date, to: Date): string {
  const seconds = Math.round((to.getTime() - from.getTime()) / 1000);
  if (seconds < 60) return `in ${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `in ${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `in ${hours}h ${minutes % 60}m`;
  const days = Math.round(hours / 24);
  if (days < 30) return `in ${days}d`;
  const months = Math.round(days / 30);
  if (months < 12) return `in ~${months}mo`;
  return `in ~${Math.round(months / 12)}y`;
}

function describeInterval(intervalsMin: number[]): string {
  const min = Math.min(...intervalsMin);
  const max = Math.max(...intervalsMin);
  if (min === max) return `every ${formatMinutes(min)}`;
  return `${formatMinutes(min)} – ${formatMinutes(max)} (irregular)`;
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h < 24) return m ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const hh = h % 24;
  return hh ? `${d}d ${hh}h` : `${d}d`;
}

function matchesCron(d: Date, parts: string[]): boolean {
  const vals = [d.getMinutes(), d.getHours(), d.getDate(), d.getMonth() + 1, d.getDay()];
  return parts.slice(0, 5).every((p, i) => matchesField(p, vals[i]));
}

function matchesField(field: string, value: number): boolean {
  if (field === "*") return true;
  return field.split(",").some((part) => {
    if (part.includes("/")) {
      const [range, step] = part.split("/");
      const s = parseInt(step);
      if (range === "*") return value % s === 0;
      const start = parseInt(range);
      return value >= start && (value - start) % s === 0;
    }
    if (part.includes("-")) {
      const [a, b] = part.split("-").map(Number);
      return value >= a && value <= b;
    }
    return parseInt(part) === value;
  });
}

export function generatePassword(
  length: number,
  opts: { uppercase: boolean; lowercase: boolean; digits: boolean; symbols: boolean }
): Result {
  let chars = "";
  if (opts.uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
  if (opts.digits) chars += "0123456789";
  if (opts.symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (!chars) return { output: "", error: "Select at least one character set" };

  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[arr[i] % chars.length];
  }
  return password;
}

export function parseUrl(input: string): Result {
  try {
    const url = new URL(input);
    const parts = [
      `Protocol:  ${url.protocol}`,
      `Host:      ${url.host}`,
      `Hostname:  ${url.hostname}`,
      `Port:      ${url.port || "(default)"}`,
      `Pathname:  ${url.pathname}`,
      `Search:    ${url.search || "(none)"}`,
      `Hash:      ${url.hash || "(none)"}`,
      `Origin:    ${url.origin}`,
    ];
    if (url.searchParams.toString()) {
      parts.push("", "Query Parameters:");
      url.searchParams.forEach((v, k) => parts.push(`  ${k} = ${v}`));
    }
    return parts.join("\n");
  } catch {
    return { output: "", error: "Invalid URL" };
  }
}

export function convertBase(input: string, fromBase: number, toBase: number): Result {
  try {
    const num = parseInt(input.trim(), fromBase);
    if (isNaN(num)) return { output: "", error: `Invalid number for base ${fromBase}` };
    const result = num.toString(toBase).toUpperCase();
    return [
      `Binary (2):   ${num.toString(2)}`,
      `Octal (8):    ${num.toString(8)}`,
      `Decimal (10): ${num.toString(10)}`,
      `Hex (16):     ${num.toString(16).toUpperCase()}`,
      "",
      `Result (base ${toBase}): ${result}`,
    ].join("\n");
  } catch {
    return { output: "", error: "Conversion failed" };
  }
}

export function minifyCss(input: string): Result {
  const original = input.length;
  const minified = input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
  const saved = original - minified.length;
  const pct = original > 0 ? ((saved / original) * 100).toFixed(1) : "0";
  return `/* Saved ${saved} chars (${pct}%) */\n${minified}`;
}

export function minifyHtml(input: string): Result {
  const original = input.length;
  const minified = input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
  const saved = original - minified.length;
  const pct = original > 0 ? ((saved / original) * 100).toFixed(1) : "0";
  return `<!-- Saved ${saved} chars (${pct}%) -->\n${minified}`;
}

export function formatSql(input: string): Result {
  const keywords = ["SELECT", "FROM", "WHERE", "AND", "OR", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "ALTER", "DROP", "TABLE", "INDEX", "AS", "DISTINCT", "UNION", "ALL", "IN", "NOT", "NULL", "IS", "BETWEEN", "LIKE", "EXISTS", "CASE", "WHEN", "THEN", "ELSE", "END", "ASC", "DESC", "OFFSET"];

  let sql = input;
  keywords.forEach((kw) => {
    const re = new RegExp(`\\b${kw}\\b`, "gi");
    sql = sql.replace(re, kw);
  });

  sql = sql
    .replace(/\s+/g, " ")
    .replace(/\bSELECT\b/g, "\nSELECT")
    .replace(/\bFROM\b/g, "\nFROM")
    .replace(/\bWHERE\b/g, "\nWHERE")
    .replace(/\bAND\b/g, "\n  AND")
    .replace(/\bOR\b/g, "\n  OR")
    .replace(/\b(LEFT |RIGHT |INNER |OUTER )?JOIN\b/g, "\n$1JOIN")
    .replace(/\bON\b/g, "\n  ON")
    .replace(/\bGROUP BY\b/g, "\nGROUP BY")
    .replace(/\bORDER BY\b/g, "\nORDER BY")
    .replace(/\bHAVING\b/g, "\nHAVING")
    .replace(/\bLIMIT\b/g, "\nLIMIT")
    .replace(/\bUNION\b/g, "\nUNION")
    .trim();

  return sql;
}

/** Shell-like tokenizer: splits on whitespace; respects '...' and "..." with \\ escapes in double quotes. */
export function tokenizeShellArgs(line: string): string[] {
  const out: string[] = [];
  let i = 0;
  const n = line.length;
  while (i < n) {
    while (i < n && /\s/.test(line[i])) i++;
    if (i >= n) break;
    const c = line[i];
    if (c === "'") {
      i++;
      let s = "";
      while (i < n && line[i] !== "'") s += line[i++];
      if (line[i] === "'") i++;
      out.push(s);
      continue;
    }
    if (c === '"') {
      i++;
      let s = "";
      while (i < n) {
        if (line[i] === "\\" && i + 1 < n) {
          s += line[i + 1];
          i += 2;
          continue;
        }
        if (line[i] === '"') {
          i++;
          break;
        }
        s += line[i++];
      }
      out.push(s);
      continue;
    }
    let s = "";
    while (i < n && !/\s/.test(line[i])) s += line[i++];
    out.push(s);
  }
  return out;
}

/** Join curl line continuations (`\\\n`) and trim. */
function preprocessCurlRaw(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\\\n[ \t]*/g, " ")
    .trim();
}

function shellSingleQuote(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

export type CurlFormatLayout = "multiline" | "oneline";

/**
 * Parse messy cURL input and emit a clean, copy-pasteable command (consistent flags & quoting).
 */
export function formatCurl(input: string, layout: CurlFormatLayout = "multiline"): Result {
  try {
    const pre = preprocessCurlRaw(input);
    if (!pre) return { output: "", error: "Paste a cURL command" };

    const tokens = tokenizeShellArgs(pre);
    if (tokens.length === 0) return { output: "", error: "Could not parse input" };

    const exe = tokens[0].split(/[/\\]/).pop()?.toLowerCase() ?? "";
    if (exe !== "curl") {
      return {
        output: "",
        error: "First token must be curl (e.g. curl or /usr/bin/curl)",
      };
    }

    let i = 1;
    let url = "";
    let urlFromFlag = "";
    let method = "";
    let methodExplicit = false;
    const headers: [string, string][] = [];
    const dataParts: string[] = [];
    let dataKind: "data" | "data-raw" | "data-binary" | "data-urlencode" | "json" | null = null;
    let user: string | null = null;
    let cookie: string | null = null;
    let cookieJar: string | null = null;
    const forms: string[] = [];
    const booleans = new Set<string>();
    const passthrough: string[] = [];

    const takeBool = (short: string, long?: string) => {
      booleans.add(short);
      if (long) booleans.add(long);
    };

    const splitOpt = (tok: string): [string, string | null] => {
      const eq = tok.indexOf("=");
      if (eq === -1) return [tok, null];
      return [tok.slice(0, eq), tok.slice(eq + 1)];
    };

    while (i < tokens.length) {
      const tok = tokens[i];
      if (/^https?:\/\//i.test(tok)) {
        url = tok;
        i++;
        continue;
      }

      if (!tok.startsWith("-")) {
        passthrough.push(tok);
        i++;
        continue;
      }

      let opt = tok;
      let inlineVal: string | null = null;
      if (opt.includes("=")) {
        const [o, v] = splitOpt(opt);
        opt = o;
        inlineVal = v ?? "";
      }

      const next = () => {
        if (inlineVal !== null) {
          const v = inlineVal;
          inlineVal = null;
          return v;
        }
        if (i + 1 >= tokens.length) return "";
        i++;
        return tokens[i];
      };

      const optNorm = opt.replace(/^--/, "-");

      if (optNorm === "-X" || opt === "--request") {
        method = next().toUpperCase();
        methodExplicit = true;
        i++;
        continue;
      }
      if (optNorm === "-H" || opt === "--header") {
        const h = next();
        const colon = h.indexOf(":");
        if (colon === -1) {
          headers.push([h.trim(), ""]);
        } else {
          headers.push([h.slice(0, colon).trim(), h.slice(colon + 1).trim()]);
        }
        i++;
        continue;
      }
      if (
        optNorm === "-d" ||
        opt === "--data" ||
        opt === "--data-raw" ||
        opt === "--data-binary" ||
        opt === "--data-urlencode"
      ) {
        const body = next();
        dataParts.push(body);
        if (opt === "--data-raw" || optNorm === "-d") dataKind = "data-raw";
        else if (opt === "--data-binary") dataKind = "data-binary";
        else if (opt === "--data-urlencode") dataKind = "data-urlencode";
        else dataKind = dataKind || "data";
        i++;
        continue;
      }
      if (opt === "--json") {
        const body = next();
        dataParts.push(body);
        dataKind = "json";
        i++;
        continue;
      }
      if (optNorm === "-u" || opt === "--user") {
        user = next();
        i++;
        continue;
      }
      if (optNorm === "-b" || opt === "--cookie") {
        cookie = next();
        i++;
        continue;
      }
      if (optNorm === "-c" || opt === "--cookie-jar") {
        cookieJar = next();
        i++;
        continue;
      }
      if (opt === "--url") {
        urlFromFlag = next();
        i++;
        continue;
      }
      if (optNorm === "-F" || opt === "--form") {
        forms.push(next());
        i++;
        continue;
      }
      if (optNorm === "-L" || opt === "--location") {
        takeBool("L", "location");
        i++;
        continue;
      }
      if (optNorm === "-k" || opt === "--insecure") {
        takeBool("k", "insecure");
        i++;
        continue;
      }
      if (optNorm === "-s" || opt === "--silent") {
        takeBool("s", "silent");
        i++;
        continue;
      }
      if (opt === "-S" || opt === "--show-error") {
        takeBool("S", "show-error");
        i++;
        continue;
      }
      if (optNorm === "-i" || opt === "--include") {
        takeBool("i", "include");
        i++;
        continue;
      }
      if (opt === "--compressed") {
        takeBool("compressed");
        i++;
        continue;
      }
      if (optNorm === "-v" || opt === "--verbose") {
        takeBool("v", "verbose");
        i++;
        continue;
      }

      const val = inlineVal !== null ? inlineVal : i + 1 < tokens.length && !tokens[i + 1].startsWith("-") ? tokens[++i] : null;
      if (val !== null) passthrough.push(opt, val);
      else passthrough.push(opt);
      i++;
    }

    const finalUrl = url || urlFromFlag;
    if (!finalUrl) {
      return {
        output: "",
        error: "No URL found — include https://... or --url",
      };
    }

    let outMethod = method || "GET";
    if (!methodExplicit && dataParts.length > 0 && outMethod === "GET") {
      outMethod = "POST";
    }

    const mergedData =
      dataParts.length === 0
        ? null
        : dataParts.length === 1
          ? dataParts[0]
          : dataParts.join("&");

    const flagOrder: { key: string; long: string }[] = [
      { key: "location", long: "--location" },
      { key: "insecure", long: "--insecure" },
      { key: "silent", long: "--silent" },
      { key: "show-error", long: "--show-error" },
      { key: "include", long: "--include" },
      { key: "compressed", long: "--compressed" },
      { key: "verbose", long: "--verbose" },
    ];

    const parts: string[] = ["curl"];

    for (const { key, long } of flagOrder) {
      if (booleans.has(key) || booleans.has(long.replace(/^--/, ""))) {
        parts.push(long);
      }
    }

    if (outMethod !== "GET" || methodExplicit) {
      parts.push("-X", outMethod);
    }

    if (user) {
      parts.push("-u", shellSingleQuote(user));
    }
    if (cookie) {
      parts.push("-b", shellSingleQuote(cookie));
    }
    if (cookieJar) {
      parts.push("-c", shellSingleQuote(cookieJar));
    }

    for (const [hk, hv] of headers) {
      parts.push("-H", shellSingleQuote(`${hk}: ${hv}`));
    }

    if (mergedData !== null) {
      if (dataKind === "json") {
        parts.push("--json", shellSingleQuote(mergedData));
      } else {
        const dataFlag =
          dataKind === "data-binary"
            ? "--data-binary"
            : dataKind === "data-urlencode"
              ? "--data-urlencode"
              : "--data-raw";
        parts.push(dataFlag, shellSingleQuote(mergedData));
      }
    }

    for (const f of forms) {
      parts.push("-F", shellSingleQuote(f));
    }

    for (let j = 0; j < passthrough.length; j++) {
      parts.push(passthrough[j]);
    }

    parts.push(shellSingleQuote(finalUrl));

    if (layout === "oneline") {
      return parts.join(" ");
    }

    const lines: string[] = [];
    lines.push("curl \\");
    for (let k = 1; k < parts.length; k++) {
      const isLast = k === parts.length - 1;
      const seg = parts[k];
      lines.push(`  ${seg}${isLast ? "" : " \\"}`);
    }
    return lines.join("\n");
  } catch (e) {
    return { output: "", error: `Could not format cURL: ${(e as Error).message}` };
  }
}

export function curlToFetch(input: string): Result {
  try {
    const args = input.trim();
    if (!args.startsWith("curl")) return { output: "", error: "Input must start with 'curl'" };

    let url = "";
    let method = "GET";
    const headers: Record<string, string> = {};
    let body = "";

    const urlMatch = args.match(/curl\s+(?:(?:-[A-Za-z]+\s+\S+\s+)*?)['"]?(https?:\/\/[^\s'"]+)['"]?/);
    if (urlMatch) url = urlMatch[1];
    else {
      const fallback = args.match(/['"]?(https?:\/\/[^\s'"]+)['"]?/);
      if (fallback) url = fallback[1];
    }

    const methodMatch = args.match(/-X\s+(\w+)/);
    if (methodMatch) method = methodMatch[1].toUpperCase();

    const headerMatches = args.matchAll(/-H\s+['"]([^'"]+)['"]/g);
    for (const m of headerMatches) {
      const [key, ...val] = m[1].split(":");
      headers[key.trim()] = val.join(":").trim();
    }

    const bodyMatch = args.match(/(?:-d|--data|--data-raw)\s+['"]([^'"]+)['"]/);

    if (bodyMatch) {
      body = bodyMatch[1];
      if (method === "GET") method = "POST";
    }

    let code = `const response = await fetch("${url}", {\n  method: "${method}",\n`;
    if (Object.keys(headers).length) {
      code += `  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")},\n`;
    }
    if (body) {
      code += `  body: ${JSON.stringify(body)},\n`;
    }
    code += `});\n\nconst data = await response.json();\nconsole.log(data);`;
    return code;
  } catch {
    return { output: "", error: "Could not parse cURL command" };
  }
}

export function escapeString(input: string, mode: "json" | "js" | "sql" | "regex"): Result {
  switch (mode) {
    case "json":
      return JSON.stringify(input);
    case "js":
      return input
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");
    case "sql":
      return input.replace(/'/g, "''");
    case "regex":
      return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    default:
      return input;
  }
}

export function mimeLookup(input: string): Result {
  const MIMES: Record<string, string> = {
    html: "text/html", htm: "text/html", css: "text/css", js: "application/javascript",
    mjs: "application/javascript", json: "application/json", xml: "application/xml",
    txt: "text/plain", csv: "text/csv", md: "text/markdown",
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
    svg: "image/svg+xml", webp: "image/webp", ico: "image/x-icon", avif: "image/avif",
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", flac: "audio/flac",
    mp4: "video/mp4", webm: "video/webm", avi: "video/x-msvideo", mkv: "video/x-matroska",
    pdf: "application/pdf", zip: "application/zip", gz: "application/gzip",
    tar: "application/x-tar", "7z": "application/x-7z-compressed",
    doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", otf: "font/otf",
    yaml: "application/yaml", yml: "application/yaml", toml: "application/toml",
    ts: "application/typescript", tsx: "application/typescript",
    wasm: "application/wasm", map: "application/json",
  };

  const ext = input.trim().toLowerCase().replace(/^\./, "");
  if (MIMES[ext]) {
    return `Extension: .${ext}\nMIME Type: ${MIMES[ext]}`;
  }

  const matches = Object.entries(MIMES).filter(
    ([k, v]) => k.includes(ext) || v.includes(ext)
  );
  if (matches.length) {
    return matches.map(([k, v]) => `.${k} → ${v}`).join("\n");
  }
  return { output: "", error: `No MIME type found for "${input}"` };
}

export function compareSemverVersions(a: string, b: string): Result {
  const rawA = a.trim();
  const rawB = b.trim();
  if (!rawA || !rawB) {
    return { output: "", error: "Enter version A and version B." };
  }

  const resolve = (raw: string): string | null => {
    const t = raw.trim();
    const cleaned = semver.clean(t);
    if (cleaned && semver.valid(cleaned)) return cleaned;
    const coerced = semver.coerce(t);
    if (coerced && semver.valid(coerced.version)) return coerced.version;
    return semver.valid(t);
  };

  const va = resolve(rawA);
  const vb = resolve(rawB);
  if (!va || !vb) {
    const bad: string[] = [];
    if (!va) bad.push("A");
    if (!vb) bad.push("B");
    return {
      output: "",
      error: `Invalid semver (${bad.join(" & ")}). Try forms like 1.2.3 or v2.0.0-beta.1.`,
    };
  }

  const cmp = semver.compare(va, vb);
  const rel =
    cmp < 0 ? "A < B (A is older)" : cmp > 0 ? "A > B (A is newer)" : "A === B";
  const diff = semver.diff(va, vb);

  const lines: string[] = [];
  lines.push(`Version A: ${va}`);
  lines.push(
    `  major / minor / patch: ${semver.major(va)} / ${semver.minor(va)} / ${semver.patch(va)}`
  );
  const preA = semver.prerelease(va);
  lines.push(`  prerelease: ${preA ? JSON.stringify(preA) : "(none)"}`);
  lines.push("");
  lines.push(`Version B: ${vb}`);
  lines.push(
    `  major / minor / patch: ${semver.major(vb)} / ${semver.minor(vb)} / ${semver.patch(vb)}`
  );
  const preB = semver.prerelease(vb);
  lines.push(`  prerelease: ${preB ? JSON.stringify(preB) : "(none)"}`);
  lines.push("");
  lines.push(`Comparison: ${rel}`);
  lines.push(`semver.compare(A,B): ${cmp}`);
  lines.push(`semver.diff(A,B): ${diff ?? "(equal)"}`);
  return lines.join("\n");
}

function digitToRwx(d: number): string {
  const r = d & 4 ? "r" : "-";
  const w = d & 2 ? "w" : "-";
  const x = d & 1 ? "x" : "-";
  return r + w + x;
}

function tripletToDigit(t: string): number | null {
  if (t.length !== 3) return null;
  let n = 0;
  if (t[0] === "r") n |= 4;
  else if (t[0] !== "-") return null;
  if (t[1] === "w") n |= 2;
  else if (t[1] !== "-") return null;
  const z = t[2];
  if (z === "-") return n;
  if ("xXsStT".includes(z)) {
    n |= 1;
    return n;
  }
  return null;
}

export function chmodCalculator(input: string): Result {
  const raw = input.trim();
  if (!raw) {
    return {
      output: "",
      error:
        "Enter a 3- or 4-digit octal mode (e.g. 755, 4755) or a symbolic mode (e.g. rwxr-xr-x).",
    };
  }

  const s = raw.replace(/^chmod\s+/i, "").trim();

  const octMatch = s.match(/^0*([0-7]{3,4})$/);
  if (octMatch) {
    const octStr = octMatch[1];
    const mode = parseInt(octStr, 8);
    const perm = mode & 0o777;
    const u = (perm >> 6) & 7;
    const g = (perm >> 3) & 7;
    const o = perm & 7;
    const sym = `${digitToRwx(u)}${digitToRwx(g)}${digitToRwx(o)}`;
    const lines: string[] = [];
    lines.push(`Symbolic (rwx triplets): ${sym}`);
    lines.push(`Octal (permission bits): ${perm.toString(8).padStart(3, "0")}`);
    if (octStr.length >= 4 || mode > 0o777) {
      lines.push(`Octal (full, stat-style): ${octStr}`);
      const bits: string[] = [];
      if (mode & 0o4000) bits.push("setuid");
      if (mode & 0o2000) bits.push("setgid");
      if (mode & 0o1000) bits.push("sticky");
      if (bits.length) lines.push(`Special bits: ${bits.join(", ")}`);
    }
    lines.push(`Decimal mode: ${mode}`);
    return lines.join("\n");
  }

  let body = s;
  const lsMatch = s.match(
    /^([bcdplsw-])([r-][w-][xsStT-])([r-][w-][xsStT-])([r-][w-][xsStT-])$/
  );
  if (lsMatch) {
    body = lsMatch[2] + lsMatch[3] + lsMatch[4];
  }

  const sym9 =
    /^([r-][w-][xsStT-])([r-][w-][xsStT-])([r-][w-][xsStT-])$/;
  const tripletMatch = body.match(sym9);
  if (!tripletMatch) {
    return {
      output: "",
      error:
        'Expected octal (e.g. 644, 0755) or nine symbolic permission characters (e.g. rwxr-xr-x). Optional ls-style leading type letter.',
    };
  }

  const d1 = tripletToDigit(tripletMatch[1]);
  const d2 = tripletToDigit(tripletMatch[2]);
  const d3 = tripletToDigit(tripletMatch[3]);
  if (d1 === null || d2 === null || d3 === null) {
    return {
      output: "",
      error:
        "Could not parse symbolic triplets — each group uses r/-, w/-, and x/s/t/- in the third position.",
    };
  }

  const perm = (d1 << 6) | (d2 << 3) | d3;
  const oct3 = perm.toString(8).padStart(3, "0");
  const symOut = `${digitToRwx(d1)}${digitToRwx(d2)}${digitToRwx(d3)}`;
  return [
    `Octal: ${oct3}`,
    `Symbolic: ${symOut}`,
    `Decimal (permission bits): ${perm}`,
  ].join("\n");
}

export function parseDotenv(input: string): Result {
  const lines = input.split(/\r?\n/);
  const map = new Map<string, string>();
  const duplicateKeys: string[] = [];
  const parseIssues: string[] = [];

  const assignRe = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/;

  function stripQuotes(val: string): string {
    const v = val.trimEnd();
    if (v.startsWith('"') && v.endsWith('"')) {
      return v
        .slice(1, -1)
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
    }
    if (v.startsWith("'") && v.endsWith("'")) {
      return v.slice(1, -1).replace(/\\'/g, "'");
    }
    return val.trim();
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const m = trimmed.match(assignRe);
    if (!m) {
      parseIssues.push(
        `Line ${i + 1}: not KEY=value — ${trimmed.slice(0, 72)}${trimmed.length > 72 ? "…" : ""}`
      );
      continue;
    }
    const key = m[1];
    const value = stripQuotes(m[2]);
    if (map.has(key)) duplicateKeys.push(key);
    map.set(key, value);
  }

  const obj = Object.fromEntries(map);
  const json = JSON.stringify(obj, null, 2);

  const out: string[] = [];
  out.push(`Keys parsed: ${map.size}`);
  if (duplicateKeys.length) {
    const uniq = [...new Set(duplicateKeys)];
    out.push(`Duplicate keys (later value wins): ${uniq.join(", ")}`);
  }
  if (parseIssues.length) {
    out.push("");
    out.push("Warnings:");
    for (const w of parseIssues.slice(0, 25)) out.push(`  - ${w}`);
    if (parseIssues.length > 25) {
      out.push(`  … and ${parseIssues.length - 25} more`);
    }
  }
  out.push("");
  out.push("JSON:");
  out.push(json);

  return out.join("\n");
}
