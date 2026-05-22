// Copyright (c) 2026 DevBench contributors. MIT License.
import type { FixResult } from "@/lib/json-repair";

export type JsonWorkspaceWorkerRequest =
  | { op: "format"; input: string; indent?: number }
  | { op: "minify"; input: string }
  | { op: "repair"; input: string }
  | { op: "sortKeys"; input: string; indent?: number }
  | { op: "removeNulls"; input: string; indent?: number }
  | { op: "flatten"; input: string }
  | { op: "unflatten"; input: string }
  | { op: "ndjson"; input: string; mode: "to" | "from" }
  | { op: "parse"; input: string };

export type JsonWorkspaceWorkerResponse =
  | { id: number; ok: true; output?: string; parsed?: unknown; fixResult?: FixResult }
  | { id: number; ok: false; error: string };
