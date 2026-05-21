// Copyright (c) 2026 DevBench contributors. MIT License.
import { flattenObject } from "./transform-data";

export function jsonToUrlEncoded(data: unknown): string {
  const flat = flattenObject(data);
  return Object.entries(flat)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v ?? ""))}`)
    .join("&");
}

export function jsonToXmlExport(obj: unknown, rootTag = "root"): string {
  function toXml(val: unknown, tag: string): string {
    if (val === null || val === undefined) return `<${tag}/>`;
    if (Array.isArray(val)) return val.map((item) => toXml(item, "item")).join("\n");
    if (typeof val === "object") {
      const inner = Object.entries(val as Record<string, unknown>)
        .map(([k, v]) => toXml(v, k))
        .join("\n");
      return `<${tag}>\n${inner.split("\n").map((l) => "  " + l).join("\n")}\n</${tag}>`;
    }
    const escaped = String(val).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<${tag}>${escaped}</${tag}>`;
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + toXml(obj, rootTag);
}

export function jsonToToml(obj: unknown, prefix = ""): string {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return "";
  const lines: string[] = [];
  const tables: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "object" && !Array.isArray(v)) {
      const section = prefix ? `${prefix}.${k}` : k;
      tables.push(`[${section}]`);
      tables.push(jsonToToml(v, section));
    } else if (typeof v === "string") {
      lines.push(`${k} = "${v}"`);
    } else if (typeof v === "boolean" || typeof v === "number") {
      lines.push(`${k} = ${v}`);
    } else if (Array.isArray(v)) {
      lines.push(`${k} = ${JSON.stringify(v)}`);
    }
  }
  return [...lines, ...tables].join("\n");
}

export async function encryptJson(data: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(data));
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptJson(encoded: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const raw = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const salt = raw.slice(0, 16);
  const iv = raw.slice(16, 28);
  const data = raw.slice(28);
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

export function generateJsonSchema(data: unknown): unknown {
  if (data === null) return { type: "null" };
  if (Array.isArray(data)) {
    return { type: "array", items: data.length > 0 ? generateJsonSchema(data[0]) : {} };
  }
  if (typeof data === "object") {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      properties[k] = generateJsonSchema(v);
      if (v !== null && v !== undefined) required.push(k);
    }
    return { type: "object", properties, required };
  }
  return { type: typeof data };
}

export function generateHtmlForm(data: unknown, prefix = ""): string {
  if (typeof data !== "object" || data === null || Array.isArray(data)) return "";
  const fields = Object.entries(data as Record<string, unknown>).map(([k, v]) => {
    const name = prefix ? `${prefix}[${k}]` : k;
    const label = k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, " $1");
    if (typeof v === "boolean") {
      return `  <label>\n    <input type="checkbox" name="${name}" ${v ? "checked" : ""} />\n    ${label}\n  </label>`;
    }
    if (typeof v === "number") {
      return `  <label>${label}\n    <input type="number" name="${name}" value="${v}" />\n  </label>`;
    }
    if (typeof v === "string" && v.length > 80) {
      return `  <label>${label}\n    <textarea name="${name}">${v}</textarea>\n  </label>`;
    }
    return `  <label>${label}\n    <input type="text" name="${name}" value="${typeof v === "string" ? v : ""}" />\n  </label>`;
  });
  return `<form>\n${fields.join("\n\n")}\n\n  <button type="submit">Submit</button>\n</form>`;
}

export function generateMockData(data: unknown, count = 5): unknown[] {
  if (typeof data !== "object" || data === null) return [];
  const template = Array.isArray(data) && data.length > 0 ? data[0] : data;
  if (typeof template !== "object" || template === null) return [];

  const results: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const item: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(template as Record<string, unknown>)) {
      if (typeof v === "string") item[k] = randomString(k, i);
      // lgtm[js/insecure-randomness] — generating fake preview data, not a security token
      else if (typeof v === "number") item[k] = Number.isInteger(v) ? Math.floor(Math.random() * 1000) : +(Math.random() * 100).toFixed(2); // CodeQL[js/insecure-randomness]
      else if (typeof v === "boolean") item[k] = Math.random() > 0.5; // CodeQL[js/insecure-randomness]
      else if (v === null) item[k] = null;
      else item[k] = v;
    }
    results.push(item);
  }
  return results;
}

export function randomString(key: string, idx: number): string {
  const k = key.toLowerCase();
  if (k.includes("email")) return `user${idx + 1}@example.com`;
  if (k.includes("name") && k.includes("first")) return ["Alice", "Bob", "Charlie", "Diana", "Eve"][idx % 5];
  if (k.includes("name") && k.includes("last")) return ["Smith", "Jones", "Brown", "Davis", "Wilson"][idx % 5];
  if (k.includes("name")) return ["Alice Smith", "Bob Jones", "Charlie Brown", "Diana Davis", "Eve Wilson"][idx % 5];
  if (k.includes("phone")) return `+1-555-${String(1000 + idx).slice(-4)}`;
  if (k.includes("url") || k.includes("website")) return `https://example.com/${idx + 1}`;
  if (k.includes("id")) return crypto.randomUUID?.() || `id-${idx + 1}`;
  if (k.includes("date") || k.includes("created") || k.includes("updated")) return new Date(Date.now() - idx * 86400000).toISOString();
  if (k.includes("city")) return ["New York", "London", "Tokyo", "Paris", "Berlin"][idx % 5];
  if (k.includes("country")) return ["US", "UK", "JP", "FR", "DE"][idx % 5];
  if (k.includes("status")) return ["active", "inactive", "pending", "archived", "draft"][idx % 5];
  return `${key}_${idx + 1}`;
}

export function generateTableView(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) return "Data must be an array of objects for table view.";
  const headers = [...new Set(data.flatMap((item) => (typeof item === "object" && item !== null ? Object.keys(item) : [])))];
  if (!headers.length) return "No object keys found.";
  const headerRow = "| " + headers.join(" | ") + " |";
  const separator = "| " + headers.map(() => "---").join(" | ") + " |";
  const rows = data.map((item) => {
    const obj = item as Record<string, unknown>;
    return "| " + headers.map((h) => {
      const v = obj[h];
      if (v === null || v === undefined) return "";
      return String(v).replace(/\|/g, "\\|");
    }).join(" | ") + " |";
  });
  return [headerRow, separator, ...rows].join("\n");
}

export function jsonToCsv(data: unknown): string {
  if (!Array.isArray(data)) {
    throw new Error("CSV conversion requires an array of objects");
  }
  if (data.length === 0) return "";
  const headers = new Set<string>();
  for (const item of data) {
    if (typeof item === "object" && item !== null && !Array.isArray(item)) {
      Object.keys(item).forEach((k) => headers.add(k));
    } else {
      throw new Error("CSV conversion requires an array of flat objects");
    }
  }
  const cols = Array.from(headers);
  const escapeCell = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const rows = [cols.join(",")];
  for (const item of data) {
    const obj = item as Record<string, unknown>;
    rows.push(cols.map((c) => escapeCell(obj[c])).join(","));
  }
  return rows.join("\n");
}

export function jsonToTypeScript(data: unknown, name = "Root"): string {
  const interfaces: string[] = [];
  const seen = new Map<string, string>();

  function toInterfaceName(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/[^a-zA-Z0-9]/g, "");
  }

  function inferType(value: unknown, key: string): string {
    if (value === null) return "null";
    if (Array.isArray(value)) {
      if (value.length === 0) return "unknown[]";
      const itemType = inferType(value[0], key.replace(/s$/, "Item"));
      return `${itemType}[]`;
    }
    if (typeof value === "object") {
      const ifaceName = toInterfaceName(key);
      if (!seen.has(ifaceName)) {
        seen.set(ifaceName, "");
        generateInterface(value as Record<string, unknown>, ifaceName);
      }
      return ifaceName;
    }
    return typeof value;
  }

  function generateInterface(obj: Record<string, unknown>, ifaceName: string) {
    const fields: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      const type = inferType(v, k);
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
      fields.push(`  ${safeKey}: ${type};`);
    }
    interfaces.push(`interface ${ifaceName} {\n${fields.join("\n")}\n}`);
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
      generateInterface(data[0] as Record<string, unknown>, name);
      return [...interfaces].reverse().join("\n\n") + `\n\ntype ${name}Array = ${name}[];`;
    }
    return `type ${name} = ${typeof data[0]}[];`;
  }
  if (typeof data === "object" && data !== null) {
    generateInterface(data as Record<string, unknown>, name);
    return [...interfaces].reverse().join("\n\n");
  }
  return `type ${name} = ${typeof data};`;
}
// ── JSON → SQL ───────────────────────────────────────────────────────────

export function jsonToSql(data: unknown, tableName = "records"): string {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("SQL export requires a non-empty array of objects");
  }
  const headers = [...new Set(data.flatMap((item: unknown) =>
    typeof item === "object" && item !== null ? Object.keys(item as Record<string, unknown>) : []
  ))];
  if (!headers.length) throw new Error("SQL export requires objects with at least one key");

  const escId = (s: string) => `\`${s.replace(/`/g, "``")}\``;
  const escVal = (v: unknown): string => {
    if (v === null || v === undefined) return "NULL";
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    if (typeof v === "number") return String(v);
    if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
    return `'${String(v).replace(/'/g, "''")}'`;
  };

  const cols = headers.map(escId).join(", ");
  const rows = data.map((item: unknown) => {
    const obj = item as Record<string, unknown>;
    const vals = headers.map((h) => escVal(obj[h]));
    return `  (${vals.join(", ")})`;
  });

  const createTable = `CREATE TABLE IF NOT EXISTS ${escId(tableName)} (\n${headers.map((h) => `  ${escId(h)} TEXT`).join(",\n")}\n);\n\n`;
  return createTable + `INSERT INTO ${escId(tableName)} (${cols})\nVALUES\n${rows.join(",\n")};`;
}

// ── JSON → Python ────────────────────────────────────────────────────────

export function jsonToPython(data: unknown, indent = 0): string {
  const pad = "    ".repeat(indent);
  const innerPad = "    ".repeat(indent + 1);

  if (data === null) return "None";
  if (typeof data === "boolean") return data ? "True" : "False";
  if (typeof data === "number") return String(data);
  if (typeof data === "string") {
    const esc = data
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
    return `"${esc}"`;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return "[]";
    const items = data.map((item) => `${innerPad}${jsonToPython(item, indent + 1)}`);
    return `[\n${items.join(",\n")}\n${pad}]`;
  }
  if (typeof data === "object" && data !== null) {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    const items = entries.map(([k, v]) => {
      const escapedKey = k.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      return `${innerPad}"${escapedKey}": ${jsonToPython(v, indent + 1)}`;
    });
    return `{\n${items.join(",\n")}\n${pad}}`;
  }
  return String(data);
}

// ── JSON Stringify ───────────────────────────────────────────────────────

export function jsonToStringify(input: string): string {
  const parsed = JSON.parse(input);
  const minified = JSON.stringify(parsed);
  return JSON.stringify(minified);
}
