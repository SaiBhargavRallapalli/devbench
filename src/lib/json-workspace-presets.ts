import type { JsonWorkspaceTab } from "@/lib/json-workspace-types";

const STORAGE_KEY = "devbench:json-workspace-presets";
const MAX_PRESETS = 15;

export type JsonWorkspacePreset = {
  id: string;
  name: string;
  createdAt: number;
  input: string;
  schemaText: string;
  activeTab: JsonWorkspaceTab;
  diffLeft: string;
  diffRight: string;
};

function safeParse(raw: string | null): JsonWorkspacePreset[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter(isPresetRecord);
  } catch {
    return [];
  }
}

function isPresetRecord(x: unknown): x is JsonWorkspacePreset {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.createdAt === "number" &&
    typeof o.input === "string" &&
    typeof o.schemaText === "string" &&
    typeof o.activeTab === "string" &&
    typeof o.diffLeft === "string" &&
    typeof o.diffRight === "string"
  );
}

export function loadJsonPresets(): JsonWorkspacePreset[] {
  if (typeof window === "undefined") return [];
  try {
    return safeParse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveJsonPresets(list: JsonWorkspacePreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_PRESETS)));
  } catch {
    /* quota */
  }
}

export function upsertJsonPreset(
  preset: Omit<JsonWorkspacePreset, "id" | "createdAt"> & { id?: string },
): JsonWorkspacePreset {
  const list = loadJsonPresets();
  const now = Date.now();
  const id = preset.id ?? crypto.randomUUID();
  const next: JsonWorkspacePreset = {
    id,
    name: preset.name.trim() || "Untitled",
    createdAt: now,
    input: preset.input,
    schemaText: preset.schemaText,
    activeTab: preset.activeTab,
    diffLeft: preset.diffLeft,
    diffRight: preset.diffRight,
  };
  const without = list.filter((p) => p.id !== id);
  const merged = [next, ...without].slice(0, MAX_PRESETS);
  saveJsonPresets(merged);
  return next;
}

export function deleteJsonPreset(id: string): void {
  const list = loadJsonPresets().filter((p) => p.id !== id);
  saveJsonPresets(list);
}
