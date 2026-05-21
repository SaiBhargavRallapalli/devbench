// Copyright (c) 2026 DevBench contributors. MIT License.
// ── Transform utilities ──────────────────────────────────────────────────

export function sortKeysDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeysDeep);
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortKeysDeep((obj as Record<string, unknown>)[key]);
        return acc;
      }, {} as Record<string, unknown>);
  }
  return obj;
}

export function removeNullsDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(removeNullsDeep).filter((v) => v !== null);
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (v !== null) result[k] = removeNullsDeep(v);
    }
    return result;
  }
  return obj;
}

export function flattenObject(obj: unknown, prefix = ""): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const newKey = prefix ? `${prefix}.${k}` : k;
      if (v !== null && typeof v === "object" && !Array.isArray(v)) {
        Object.assign(result, flattenObject(v, newKey));
      } else if (Array.isArray(v)) {
        v.forEach((item, i) => {
          if (typeof item === "object" && item !== null) {
            Object.assign(result, flattenObject(item, `${newKey}[${i}]`));
          } else {
            result[`${newKey}[${i}]`] = item;
          }
        });
      } else {
        result[newKey] = v;
      }
    }
  } else {
    result[prefix || "value"] = obj;
  }
  return result;
}

export function unflattenObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const parts = key.replace(/\[(\d+)\]/g, ".$1").split(".");
    let current: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const nextPart = parts[i + 1];
      if (!(part in current)) {
        current[part] = /^\d+$/.test(nextPart) ? [] : {};
      }
      current = current[part] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

export function toNdjson(data: unknown): string {
  if (Array.isArray(data)) return data.map((item) => JSON.stringify(item)).join("\n");
  return JSON.stringify(data);
}

export function fromNdjson(text: string): unknown[] {
  return text.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

export function jsonToEnv(data: unknown): string {
  const flat = flattenObject(data);
  return Object.entries(flat)
    .map(([k, v]) => {
      const envKey = k.toUpperCase().replace(/[.\[\]]/g, "_").replace(/_+/g, "_");
      const val = typeof v === "string" ? v : JSON.stringify(v);
      return val.includes(" ") || val.includes('"') ? `${envKey}="${val}"` : `${envKey}=${val}`;
    })
    .join("\n");
}

export function envToJson(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

