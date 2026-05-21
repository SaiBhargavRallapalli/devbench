// Copyright (c) 2026 DevBench contributors. MIT License.
import type { WizardState } from "./types";

export function buildQueryFromWizard(wizard: WizardState): string {
  const parts: string[] = ["data"];

  if (wizard.filterField && wizard.filterValue) {
    const val = isNaN(Number(wizard.filterValue)) ? `"${wizard.filterValue}"` : wizard.filterValue;
    if (wizard.filterOp === "contains") {
      parts.push(`.filter(item => String(item.${wizard.filterField}).includes(${val}))`);
    } else if (wizard.filterOp === "startsWith") {
      parts.push(`.filter(item => String(item.${wizard.filterField}).startsWith(${val}))`);
    } else {
      parts.push(`.filter(item => item.${wizard.filterField} ${wizard.filterOp} ${val})`);
    }
  }

  if (wizard.sortField) {
    const dir = wizard.sortDir === "desc" ? -1 : 1;
    parts.push(`.sort((a, b) => a.${wizard.sortField} > b.${wizard.sortField} ? ${dir} : ${-dir})`);
  }

  if (wizard.pickFields.length > 0) {
    const fields = wizard.pickFields.map((f) => `${f}: item.${f}`).join(", ");
    parts.push(`.map(item => ({ ${fields} }))`);
  }

  if (wizard.groupByField) {
    parts.push(`.reduce((acc, item) => { const key = item.${wizard.groupByField}; (acc[key] = acc[key] || []).push(item); return acc; }, {})`);
  }

  if (wizard.uniq) {
    parts.push(`.filter((item, i, arr) => i === arr.findIndex(o => JSON.stringify(o) === JSON.stringify(item)))`);
  }

  return parts.join("\n  ");
}


// ── Helpers to deep-get/set/delete by path ───────────────────────────────

export function deepGet(obj: unknown, path: (string | number)[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      current = current[key as number];
    } else if (typeof current === "object") {
      current = (current as Record<string, unknown>)[String(key)];
    } else {
      return undefined;
    }
  }
  return current;
}

export function deepSet(obj: unknown, path: (string | number)[], value: unknown): unknown {
  if (path.length === 0) return value;
  const clone = Array.isArray(obj) ? [...obj] : { ...(obj as Record<string, unknown>) };
  const key = path[0];
  if (Array.isArray(clone)) {
    clone[key as number] = deepSet(clone[key as number], path.slice(1), value);
  } else {
    (clone as Record<string, unknown>)[String(key)] = deepSet(
      (clone as Record<string, unknown>)[String(key)],
      path.slice(1),
      value
    );
  }
  return clone;
}

export function deepDelete(obj: unknown, path: (string | number)[]): unknown {
  if (path.length === 0) return undefined;
  if (path.length === 1) {
    if (Array.isArray(obj)) {
      const clone = [...obj];
      clone.splice(path[0] as number, 1);
      return clone;
    }
    const clone = { ...(obj as Record<string, unknown>) };
    delete clone[String(path[0])];
    return clone;
  }
  const key = path[0];
  if (Array.isArray(obj)) {
    const clone = [...obj];
    clone[key as number] = deepDelete(clone[key as number], path.slice(1));
    return clone;
  }
  const clone = { ...(obj as Record<string, unknown>) };
  clone[String(key)] = deepDelete(clone[String(key)], path.slice(1));
  return clone;
}

export function deepInsert(obj: unknown, path: (string | number)[], key: string | number, value: unknown): unknown {
  const parent = path.length > 0 ? deepGet(obj, path) : obj;
  if (Array.isArray(parent)) {
    const newArr = [...parent, value];
    return path.length > 0 ? deepSet(obj, path, newArr) : newArr;
  }
  if (typeof parent === "object" && parent !== null) {
    const newObj = { ...(parent as Record<string, unknown>), [String(key)]: value };
    return path.length > 0 ? deepSet(obj, path, newObj) : newObj;
  }
  return obj;
}

export function getFieldsFromData(data: unknown): string[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  const first = data[0];
  if (typeof first !== "object" || first === null) return [];
  return Object.keys(first);
}
