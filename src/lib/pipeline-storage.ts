// Copyright (c) 2026 DevBench contributors. MIT License.
import type { PipelineStep } from "@/lib/tool-pipelines";

const KEY = "devbench:saved-pipelines";

export type SavedPipeline = {
  id: string;
  name: string;
  steps: PipelineStep[];
  updatedAt: number;
};

export function listSavedPipelines(): SavedPipeline[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedPipeline[];
  } catch {
    return [];
  }
}

export function savePipeline(name: string, steps: PipelineStep[]): SavedPipeline {
  const list = listSavedPipelines();
  const entry: SavedPipeline = {
    id: `pl_${Date.now()}`,
    name,
    steps,
    updatedAt: Date.now(),
  };
  list.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
  return entry;
}

export function deleteSavedPipeline(id: string): void {
  const next = listSavedPipelines().filter((p) => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
}
