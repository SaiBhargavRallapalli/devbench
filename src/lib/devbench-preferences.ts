/**
 * Local preferences: favorites, tool history, custom homepage pins — all in localStorage.
 */

const FAVORITES_KEY = "devbench:favorites";
const HISTORY_KEY = "devbench:history";
const PINS_KEY = "devbench:pins";
const MAX_HISTORY = 40;

export type HistoryEntry = {
  slug: string;
  name: string;
  href: string;
  at: number;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getFavoriteSlugs(): string[] {
  return readJson<string[]>(FAVORITES_KEY, []);
}

export function toggleFavorite(slug: string): boolean {
  const set = new Set(getFavoriteSlugs());
  if (set.has(slug)) {
    set.delete(slug);
  } else {
    set.add(slug);
  }
  const next = [...set];
  writeJson(FAVORITES_KEY, next);
  window.dispatchEvent(new CustomEvent("devbench:prefs-changed"));
  return set.has(slug);
}

export function isFavorite(slug: string): boolean {
  return getFavoriteSlugs().includes(slug);
}

export function recordToolVisit(entry: Omit<HistoryEntry, "at">): void {
  const list = readJson<HistoryEntry[]>(HISTORY_KEY, []);
  const filtered = list.filter((h) => h.slug !== entry.slug);
  filtered.unshift({ ...entry, at: Date.now() });
  writeJson(HISTORY_KEY, filtered.slice(0, MAX_HISTORY));
  window.dispatchEvent(new CustomEvent("devbench:prefs-changed"));
}

export function getToolHistory(): HistoryEntry[] {
  return readJson<HistoryEntry[]>(HISTORY_KEY, []);
}

export function clearToolHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
  window.dispatchEvent(new CustomEvent("devbench:prefs-changed"));
}

export function getHomePins(): string[] {
  return readJson<string[]>(PINS_KEY, ["json-formatter", "jwt-debugger", "api-tester", "diff-checker"]);
}

export function setHomePins(slugs: string[]): void {
  writeJson(PINS_KEY, slugs.slice(0, 12));
  window.dispatchEvent(new CustomEvent("devbench:prefs-changed"));
}
