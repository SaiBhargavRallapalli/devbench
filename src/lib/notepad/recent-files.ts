// Copyright (c) 2026 DevBench contributors. MIT License.

export type RecentFile = {
  name: string;
  openedAt: number;
  /** First 2k chars snapshot for quick reopen without file picker */
  preview?: string;
};

const KEY = "devbench:notepad-recent";
const MAX = 16;

export function loadRecentFiles(): RecentFile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentFile[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function pushRecentFile(name: string, content: string): void {
  try {
    const list = loadRecentFiles().filter((f) => f.name !== name);
    list.unshift({
      name,
      openedAt: Date.now(),
      preview: content.slice(0, 2048),
    });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* quota */
  }
}

export function clearRecentFiles(): void {
  localStorage.removeItem(KEY);
}
