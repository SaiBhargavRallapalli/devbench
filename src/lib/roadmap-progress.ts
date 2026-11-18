// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Roadmap progress stored locally — DevBench has no accounts, so completion
 * state lives in localStorage and never leaves the browser.
 */

const PROGRESS_KEY = "devbench:roadmap-progress";

type ProgressMap = Record<string, string[]>;

function readMap(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: ProgressMap): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent("devbench:prefs-changed"));
}

export function getDoneNodeIds(roadmapSlug: string): string[] {
  return readMap()[roadmapSlug] ?? [];
}

/** Returns the new done-state for the node. */
export function toggleNodeDone(roadmapSlug: string, nodeId: string): boolean {
  const map = readMap();
  const current = new Set(map[roadmapSlug] ?? []);
  if (current.has(nodeId)) {
    current.delete(nodeId);
  } else {
    current.add(nodeId);
  }
  map[roadmapSlug] = [...current];
  writeMap(map);
  return current.has(nodeId);
}

export function resetRoadmapProgress(roadmapSlug: string): void {
  const map = readMap();
  delete map[roadmapSlug];
  writeMap(map);
}
