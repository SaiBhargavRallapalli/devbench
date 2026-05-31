// Copyright (c) 2026 DevBench contributors. MIT License.
import type { NotepadSession } from "@/lib/notepad-session";

export type NamedSession = {
  name: string;
  savedAt: number;
  session: NotepadSession;
};

const KEY = "devbench:notepad-named-sessions";

export function listNamedSessions(): NamedSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NamedSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNamedSession(name: string, session: NotepadSession): void {
  const list = listNamedSessions().filter((s) => s.name !== name);
  list.unshift({ name, savedAt: Date.now(), session });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 12)));
}

export function loadNamedSession(name: string): NotepadSession | null {
  return listNamedSessions().find((s) => s.name === name)?.session ?? null;
}

export function deleteNamedSession(name: string): void {
  const list = listNamedSessions().filter((s) => s.name !== name);
  localStorage.setItem(KEY, JSON.stringify(list));
}
