// Copyright (c) 2026 DevBench contributors. MIT License.

export type MacroStep =
  | { type: "insert"; text: string }
  | { type: "replaceSelection"; text: string }
  | { type: "runTransform"; transform: "upper" | "lower" | "trimTrailing" };

const STORAGE_KEY = "devbench:notepad-macro";

export function loadMacro(): MacroStep[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MacroStep[];
  } catch {
    return [];
  }
}

export function saveMacro(steps: MacroStep[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(steps.slice(0, 200)));
}

export function clearMacro(): void {
  localStorage.removeItem(STORAGE_KEY);
}
