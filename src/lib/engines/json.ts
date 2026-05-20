// Copyright (c) 2026 DevBench contributors. MIT License.
import yaml from "js-yaml";
import { requireSubtleCrypto } from "./_shared";
import type { Result } from "./_shared";

export function formatJson(input: string, indent = 2): Result {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed, null, indent);
  } catch (e) {
    return { output: "", error: `Invalid JSON: ${(e as Error).message}` };
  }
}

export function minifyJson(input: string): Result {
  try {
    return JSON.stringify(JSON.parse(input));
  } catch (e) {
    return { output: "", error: `Invalid JSON: ${(e as Error).message}` };
  }
}

export function jsonToYaml(input: string): Result {
  try {
    const obj = JSON.parse(input);
    return yaml.dump(obj, { indent: 2, lineWidth: 120 });
  } catch (e) {
    return { output: "", error: `Invalid JSON: ${(e as Error).message}` };
  }
}

export function yamlToJson(input: string): Result {
  try {
    const obj = yaml.load(input);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return { output: "", error: `Invalid YAML: ${(e as Error).message}` };
  }
}

export function jsonToCsv(input: string): Result {
  try {
    const data = JSON.parse(input);
    if (!Array.isArray(data)) return { output: "", error: "JSON must be an array of objects" };
    if (!data.length) return "";
    const headers = [...new Set(data.flatMap((item: Record<string, unknown>) => Object.keys(item)))];
    const csvLines = [
      headers.map((h) => `"${h}"`).join(","),
      ...data.map((item: Record<string, unknown>) =>
        headers.map((h) => {
          const val = item[h];
          if (val === null || val === undefined) return "";
          const str = typeof val === "object" ? JSON.stringify(val) : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        }).join(",")
      ),
    ];
    return csvLines.join("\n");
  } catch (e) {
    return { output: "", error: `Invalid JSON: ${(e as Error).message}` };
  }
}

export function csvToJson(input: string): Result {
  try {
    const lines = input.trim().split("\n");
    if (lines.length < 2) return { output: "", error: "CSV must have a header row and at least one data row" };
    const headers = parseCsvLine(lines[0]);
    const data = lines.slice(1).map((line) => {
      const values = parseCsvLine(line);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || "";
      });
      return obj;
    });
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return { output: "", error: `CSV parse error: ${(e as Error).message}` };
  }
}

/** Tab-separated for spreadsheets; escapes tabs/newlines in cells. */
export function jsonToTsv(input: string): Result {
  try {
    const data = JSON.parse(input);
    if (!Array.isArray(data)) return { output: "", error: "JSON must be an array of objects" };
    if (!data.length) return "";
    const headers = [...new Set(data.flatMap((item: Record<string, unknown>) => Object.keys(item)))];
    const esc = (val: string) => {
      if (/[\t\n\r"]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
      return val;
    };
    const lines = [
      headers.map((h) => esc(String(h))).join("\t"),
      ...data.map((item: Record<string, unknown>) =>
        headers
          .map((h) => {
            const val = item[h];
            if (val === null || val === undefined) return "";
            const str = typeof val === "object" ? JSON.stringify(val) : String(val);
            return esc(str);
          })
          .join("\t"),
      ),
    ];
    return lines.join("\n");
  } catch (e) {
    return { output: "", error: `Invalid JSON: ${(e as Error).message}` };
  }
}

/** Simple TSV: one header row, tab-split rows (quoted cells optional). */
export function tsvToJson(input: string): Result {
  try {
    const lines = input.trim().split(/\r?\n/).filter((l) => l.length > 0);
    if (lines.length < 2) {
      return { output: "", error: "TSV must have a header row and at least one data row" };
    }
    const headers = parseTsvLine(lines[0]);
    const data = lines.slice(1).map((line) => {
      const values = parseTsvLine(line);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] ?? "";
      });
      return obj;
    });
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return { output: "", error: `TSV parse error: ${(e as Error).message}` };
  }
}

function parseTsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === "\t") {
      result.push(current);
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = false;
      } else {
        current += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { result.push(current); current = ""; }
      else current += c;
    }
  }
  result.push(current);
  return result;
}

/** Split unstructured text logs into rows with optional ISO/bracket timestamps and levels. */
export function parseApplicationLogs(input: string): Result {
  const lines = input.split(/\r?\n/);
  const rows: Record<string, unknown>[] = [];
  for (let n = 0; n < lines.length; n++) {
    const line = lines[n];
    if (!line.trim()) continue;
    rows.push(parseOneLogLine(line, n + 1));
  }
  if (!rows.length) return { output: "", error: "Paste one or more non-empty log lines" };
  return JSON.stringify(rows, null, 2);
}

function parseOneLogLine(line: string, lineNo: number): Record<string, unknown> {
  const out: Record<string, unknown> = { line: lineNo, raw: line };
  let rest = line;

  const iso = /^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:?\d{2})?)/u.exec(rest);
  if (iso) {
    out.timestamp = iso[1];
    rest = rest.slice(iso[0].length).replace(/^\s+/u, "");
  } else {
    const bracket = /^\[([^\]]+)\]\s*/u.exec(rest);
    if (bracket) {
      out.timestamp = bracket[1];
      rest = rest.slice(bracket[0].length);
    }
  }

  const lev =
    /^(?:\[)?(ERROR|ERR|WARN|WARNING|INFO|DEBUG|TRACE|FATAL)\]?\s*:?\s*/iu.exec(rest);
  if (lev) {
    const rawLev = lev[1].toUpperCase();
    out.level = rawLev === "ERR" ? "ERROR" : rawLev === "WARNING" ? "WARN" : rawLev;
    rest = rest.slice(lev[0].length);
  }

  out.message = rest.trim();
  return out;
}

export function jsonToTypescript(input: string): Result {
  try {
    const data = JSON.parse(input);
    return generateInterface("Root", data);
  } catch (e) {
    return { output: "", error: `Invalid JSON: ${(e as Error).message}` };
  }
}

function generateInterface(name: string, obj: unknown, depth = 0): string {
  if (obj === null || typeof obj !== "object") {
    return `type ${name} = ${tsType(obj)};\n`;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return `type ${name} = unknown[];\n`;
    const item = obj[0];
    if (typeof item === "object" && item !== null && !Array.isArray(item)) {
      return generateInterface(`${name}Item`, item, depth) + `\ntype ${name} = ${name}Item[];\n`;
    }
    return `type ${name} = ${tsType(item)}[];\n`;
  }
  const lines: string[] = [`interface ${name} {`];
  const nested: string[] = [];
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const safeName = /^[a-zA-Z_$][\w$]*$/.test(key) ? key : `"${key}"`;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const typeName = capitalize(key);
      lines.push(`  ${safeName}: ${typeName};`);
      nested.push(generateInterface(typeName, value, depth + 1));
    } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
      const typeName = capitalize(key) + "Item";
      lines.push(`  ${safeName}: ${typeName}[];`);
      nested.push(generateInterface(typeName, value[0], depth + 1));
    } else {
      lines.push(`  ${safeName}: ${tsType(value)};`);
    }
  }
  lines.push("}");
  return [...nested, lines.join("\n")].join("\n\n");
}

function tsType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    return `${tsType(value[0])}[]`;
  }
  switch (typeof value) {
    case "string": return "string";
    case "number": return "number";
    case "boolean": return "boolean";
    default: return "unknown";
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/[-_](.)/g, (_, c) => c.toUpperCase());
}

export function jsonToXml(input: string): Result {
  try {
    const data = JSON.parse(input);
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + toXml(data, "root");
  } catch (e) {
    return { output: "", error: `Invalid JSON: ${(e as Error).message}` };
  }
}

function toXml(obj: unknown, tag: string): string {
  if (obj === null || obj === undefined) return `<${tag}/>`;
  if (Array.isArray(obj)) return obj.map((item) => toXml(item, "item")).join("\n");
  if (typeof obj === "object") {
    const inner = Object.entries(obj as Record<string, unknown>)
      .map(([k, v]) => toXml(v, k))
      .join("\n");
    return `<${tag}>\n${inner.split("\n").map((l) => "  " + l).join("\n")}\n</${tag}>`;
  }
  const escaped = String(obj).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<${tag}>${escaped}</${tag}>`;
}

export function xmlToJson(input: string): Result {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, "text/xml");
    const errorNode = doc.querySelector("parsererror");
    if (errorNode) return { output: "", error: "Invalid XML: " + errorNode.textContent };
    return JSON.stringify(xmlNodeToObj(doc.documentElement), null, 2);
  } catch (e) {
    return { output: "", error: `XML parse error: ${(e as Error).message}` };
  }
}

function xmlNodeToObj(node: Element): unknown {
  const obj: Record<string, unknown> = {};
  if (node.attributes.length) {
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      obj[`@${attr.name}`] = attr.value;
    }
  }
  const children = Array.from(node.childNodes);
  const textContent = children
    .filter((c) => c.nodeType === 3)
    .map((c) => c.textContent?.trim())
    .filter(Boolean)
    .join("");

  if (!node.children.length && textContent) {
    if (!node.attributes.length) return textContent;
    obj["#text"] = textContent;
    return obj;
  }

  const childMap: Record<string, unknown[]> = {};
  for (const child of Array.from(node.children)) {
    const key = child.tagName;
    if (!childMap[key]) childMap[key] = [];
    childMap[key].push(xmlNodeToObj(child));
  }

  for (const [key, values] of Object.entries(childMap)) {
    obj[key] = values.length === 1 ? values[0] : values;
  }

  return obj;
}

function escapeXmlTextChunk(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeXmlAttrValue(s: string): string {
  return escapeXmlTextChunk(s).replace(/"/g, "&quot;");
}

function parseXmlDoc(input: string): { doc: Document; error?: string } {
  const doc = new DOMParser().parseFromString(input, "text/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    return {
      doc,
      error: errorNode.textContent?.trim() || "Malformed XML",
    };
  }
  return { doc };
}

/** Well-formedness check for the XML Tools Suite. */
export function xmlSuiteValidate(input: string): Result {
  const trimmed = input.trim();
  if (!trimmed) return { output: "", error: "Paste XML to validate" };
  const { error } = parseXmlDoc(trimmed);
  if (error) return { output: "", error };
  return {
    output:
      "Document is well-formed.\n\nTip: validation uses the browser XML parser (same engine as XML → JSON).",
  };
}

function serializeXmlPretty(el: Element, depth: number): string {
  const pad = "  ".repeat(depth);
  const name = el.tagName;
  const attrs = [...el.attributes]
    .map((a) => ` ${a.name}="${escapeXmlAttrValue(a.value)}"`)
    .join("");
  const rawChildren = [...el.childNodes];
  const meaningful = rawChildren.filter((ch) => {
    if (ch.nodeType === Node.TEXT_NODE) {
      return Boolean((ch.textContent ?? "").trim());
    }
    return (
      ch.nodeType === Node.ELEMENT_NODE ||
      ch.nodeType === Node.COMMENT_NODE ||
      ch.nodeType === Node.CDATA_SECTION_NODE
    );
  });

  if (meaningful.length === 0) return `${pad}<${name}${attrs}/>`;

  if (
    meaningful.length === 1 &&
    meaningful[0].nodeType === Node.TEXT_NODE
  ) {
    const t = meaningful[0].textContent ?? "";
    return `${pad}<${name}${attrs}>${escapeXmlTextChunk(t)}</${name}>`;
  }

  const inner = meaningful
    .map((ch) => {
      if (ch.nodeType === Node.TEXT_NODE) {
        const t = (ch.textContent ?? "").trim();
        return t ? `${pad}  ${escapeXmlTextChunk(t)}` : "";
      }
      if (ch.nodeType === Node.ELEMENT_NODE) {
        return serializeXmlPretty(ch as Element, depth + 1);
      }
      if (ch.nodeType === Node.COMMENT_NODE) {
        return `${pad}  <!--${(ch as Comment).data}-->`;
      }
      if (ch.nodeType === Node.CDATA_SECTION_NODE) {
        return `${pad}  <![CDATA[${(ch as CDATASection).data}]]>`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");

  return `${pad}<${name}${attrs}>\n${inner}\n${pad}</${name}>`;
}

export function xmlSuitePrettyPrint(input: string): Result {
  const trimmed = input.trim();
  if (!trimmed) return { output: "", error: "Paste XML to format" };
  const { doc, error } = parseXmlDoc(trimmed);
  if (error) return { output: "", error };
  const declMatch = trimmed.match(/^<\?xml[^?]*\?>\s*/);
  const decl = declMatch ? declMatch[0].trimEnd() : "";
  const body = serializeXmlPretty(doc.documentElement, 0);
  const out = decl ? `${decl}\n${body}` : body;
  return { output: out };
}

function minifyXmlElement(el: Element): string {
  const name = el.tagName;
  const attrs = [...el.attributes]
    .map((a) => ` ${a.name}="${escapeXmlAttrValue(a.value)}"`)
    .join("");
  let inner = "";
  for (const ch of el.childNodes) {
    if (ch.nodeType === Node.TEXT_NODE) {
      inner += escapeXmlTextChunk(ch.textContent ?? "");
    } else if (ch.nodeType === Node.ELEMENT_NODE) {
      inner += minifyXmlElement(ch as Element);
    } else if (ch.nodeType === Node.CDATA_SECTION_NODE) {
      inner += `<![CDATA[${(ch as CDATASection).data}]]>`;
    } else if (ch.nodeType === Node.COMMENT_NODE) {
      inner += `<!--${(ch as Comment).data}-->`;
    }
  }
  if (!inner) return `<${name}${attrs}/>`;
  return `<${name}${attrs}>${inner}</${name}>`;
}

export function xmlSuiteMinify(input: string): Result {
  const trimmed = input.trim();
  if (!trimmed) return { output: "", error: "Paste XML to minify" };
  const { doc, error } = parseXmlDoc(trimmed);
  if (error) return { output: "", error };
  const declMatch = trimmed.match(/^<\?xml[^?]*\?>/);
  const decl = declMatch ? declMatch[0] : "";
  const body = minifyXmlElement(doc.documentElement);
  const out = decl ? `${decl}${body}` : body;
  return { output: out };
}

export function xmlSuiteXPath(input: string, xpathExpr: string): Result {
  const trimmed = input.trim();
  if (!trimmed) return { output: "", error: "Paste XML first" };
  const expr = xpathExpr.trim();
  if (!expr) return { output: "", error: "Enter an XPath expression" };
  const { doc, error } = parseXmlDoc(trimmed);
  if (error) return { output: "", error };
  try {
    const snapshot = doc.evaluate(
      expr,
      doc,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    const lines: string[] = [];
    const max = Math.min(snapshot.snapshotLength, 500);
    for (let i = 0; i < max; i++) {
      const node = snapshot.snapshotItem(i);
      if (!node) continue;
      if (node.nodeType === Node.ELEMENT_NODE) {
        lines.push((node as Element).outerHTML);
      } else if (node.nodeType === Node.ATTRIBUTE_NODE) {
        lines.push(`${(node as Attr).name}="${(node as Attr).value}"`);
      } else {
        lines.push(node.textContent ?? "");
      }
    }
    if (snapshot.snapshotLength > 500) {
      lines.push(`… truncated (${snapshot.snapshotLength} total matches, showing 500)`);
    }
    return {
      output:
        lines.length > 0 ? lines.join("\n---\n") : "(no matches for this XPath)",
    };
  } catch (e) {
    return { output: "", error: `XPath error: ${(e as Error).message}` };
  }
}

export function xmlSuiteSearch(input: string, needle: string): Result {
  const n = needle.trim();
  if (!input.trim()) return { output: "", error: "Paste XML to search" };
  if (!n) return { output: "", error: "Enter text to find" };
  const lines = input.split(/\n/);
  const hits: string[] = [];
  lines.forEach((line, i) => {
    if (line.includes(n)) {
      const preview = line.trim().slice(0, 240);
      hits.push(`${i + 1}: ${preview}${line.trim().length > 240 ? "…" : ""}`);
    }
  });
  return {
    output:
      hits.length > 0
        ? `${hits.length} line(s) containing "${n}":\n\n${hits.join("\n")}`
        : `No lines contain "${n}".`,
  };
}

export function tomlToJson(input: string): Result {
  try {
    const result: Record<string, unknown> = {};
    let currentTable = result;
    const lines = input.split("\n");

    for (const rawLine of lines) {
      const line = rawLine.replace(/#.*$/, "").trim();
      if (!line) continue;

      const tableMatch = line.match(/^\[([^\]]+)\]$/);
      if (tableMatch) {
        const path = tableMatch[1].split(".");
        let obj = result;
        for (const key of path) {
          if (!obj[key]) obj[key] = {};
          obj = obj[key] as Record<string, unknown>;
        }
        currentTable = obj;
        continue;
      }

      const kvMatch = line.match(/^([^=]+)=(.+)$/);
      if (kvMatch) {
        const key = kvMatch[1].trim().replace(/^["']|["']$/g, "");
        const val = kvMatch[2].trim();
        currentTable[key] = parseTomlValue(val);
      }
    }

    return JSON.stringify(result, null, 2);
  } catch (e) {
    return { output: "", error: `TOML parse error: ${(e as Error).message}` };
  }
}

// ── AES-256-GCM Encrypt/Decrypt ─────────────────────────────────────────

export async function aesEncrypt(plaintext: string, password: string): Promise<string> {
  const subtle = requireSubtleCrypto();
  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function aesDecrypt(ciphertext: string, password: string): Promise<string> {
  const subtle = requireSubtleCrypto();
  const enc = new TextEncoder();
  const raw = Uint8Array.from(atob(ciphertext.trim()), (c) => c.charCodeAt(0));
  const salt = raw.slice(0, 16);
  const iv = raw.slice(16, 28);
  const data = raw.slice(28);
  const keyMaterial = await subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const decrypted = await subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

function parseTomlValue(val: string): unknown {
  if (val === "true") return true;
  if (val === "false") return false;
  if (/^-?\d+$/.test(val)) return parseInt(val);
  if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);
  if (/^".*"$/.test(val) || /^'.*'$/.test(val)) return val.slice(1, -1);
  if (val.startsWith("[")) {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}
