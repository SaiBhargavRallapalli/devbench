// Copyright (c) 2026 DevBench contributors. MIT License.
/** Synchronous JSON workspace ops (main thread) for small payloads. */
import { fixCommonMistakes, type FixResult } from "@/lib/json-repair";
import { formatJson, minifyJson } from "@/lib/engines/json";
import {
  sortKeysDeep,
  removeNullsDeep,
  flattenObject,
  unflattenObject,
  toNdjson,
  fromNdjson,
} from "@/lib/json-workspace/transform-data";
import type { JsonWorkspaceWorkerRequest } from "@/lib/json-workspace-worker-types";

export type JsonWorkspaceOpResult =
  | { ok: true; output?: string; parsed?: unknown; fixResult?: FixResult; usedWorker: false }
  | { ok: false; error: string; usedWorker: false };

export function runJsonWorkspaceOpSync(req: JsonWorkspaceWorkerRequest): JsonWorkspaceOpResult {
  try {
    switch (req.op) {
      case "format": {
        const r = formatJson(req.input, req.indent ?? 2);
        if (typeof r === "string") return { ok: true, output: r, usedWorker: false };
        return { ok: false, error: r.error ?? "Format failed", usedWorker: false };
      }
      case "minify": {
        const r = minifyJson(req.input);
        if (typeof r === "string") return { ok: true, output: r, usedWorker: false };
        return { ok: false, error: r.error ?? "Minify failed", usedWorker: false };
      }
      case "repair":
        return { ok: true, fixResult: fixCommonMistakes(req.input), usedWorker: false };
      case "sortKeys": {
        const parsed = JSON.parse(req.input);
        const sorted = sortKeysDeep(parsed);
        return {
          ok: true,
          output: JSON.stringify(sorted, null, req.indent ?? 2),
          usedWorker: false,
        };
      }
      case "removeNulls": {
        const parsed = JSON.parse(req.input);
        const cleaned = removeNullsDeep(parsed);
        return {
          ok: true,
          output: JSON.stringify(cleaned, null, req.indent ?? 2),
          usedWorker: false,
        };
      }
      case "flatten": {
        const parsed = JSON.parse(req.input);
        return {
          ok: true,
          output: JSON.stringify(flattenObject(parsed), null, 2),
          usedWorker: false,
        };
      }
      case "unflatten": {
        const parsed = JSON.parse(req.input);
        return {
          ok: true,
          output: JSON.stringify(
            unflattenObject(parsed as Record<string, unknown>),
            null,
            2,
          ),
          usedWorker: false,
        };
      }
      case "ndjson": {
        if (req.mode === "to") {
          const parsed = JSON.parse(req.input);
          return { ok: true, output: toNdjson(parsed), usedWorker: false };
        }
        const parsed = fromNdjson(req.input);
        return {
          ok: true,
          output: JSON.stringify(parsed, null, 2),
          usedWorker: false,
        };
      }
      case "parse":
        return { ok: true, parsed: JSON.parse(req.input), usedWorker: false };
      default: {
        const _exhaustive: never = req;
        return {
          ok: false,
          error: `Unknown op: ${(_exhaustive as { op: string }).op}`,
          usedWorker: false,
        };
      }
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      usedWorker: false,
    };
  }
}
