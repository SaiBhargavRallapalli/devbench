// Copyright (c) 2026 DevBench contributors. MIT License.
/// <reference lib="webworker" />
import { fixCommonMistakes } from "@/lib/json-repair";
import {
  sortKeysDeep,
  removeNullsDeep,
  flattenObject,
  unflattenObject,
  toNdjson,
  fromNdjson,
} from "@/lib/json-workspace/transform-data";
import type { JsonWorkspaceWorkerRequest } from "@/lib/json-workspace-worker-types";

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = (ev: MessageEvent<JsonWorkspaceWorkerRequest & { id: number }>) => {
  const { id, ...req } = ev.data;
  try {
    switch (req.op) {
      case "format": {
        const parsed = JSON.parse(req.input);
        ctx.postMessage({
          id,
          ok: true,
          output: JSON.stringify(parsed, null, req.indent ?? 2),
        });
        break;
      }
      case "minify": {
        const parsed = JSON.parse(req.input);
        ctx.postMessage({ id, ok: true, output: JSON.stringify(parsed) });
        break;
      }
      case "repair": {
        const fixResult = fixCommonMistakes(req.input);
        ctx.postMessage({ id, ok: true, fixResult });
        break;
      }
      case "sortKeys": {
        const parsed = JSON.parse(req.input);
        const sorted = sortKeysDeep(parsed);
        ctx.postMessage({
          id,
          ok: true,
          output: JSON.stringify(sorted, null, req.indent ?? 2),
        });
        break;
      }
      case "removeNulls": {
        const parsed = JSON.parse(req.input);
        const cleaned = removeNullsDeep(parsed);
        ctx.postMessage({
          id,
          ok: true,
          output: JSON.stringify(cleaned, null, req.indent ?? 2),
        });
        break;
      }
      case "flatten": {
        const parsed = JSON.parse(req.input);
        const flat = flattenObject(parsed);
        ctx.postMessage({ id, ok: true, output: JSON.stringify(flat, null, 2) });
        break;
      }
      case "unflatten": {
        const parsed = JSON.parse(req.input);
        const unflat = unflattenObject(parsed as Record<string, unknown>);
        ctx.postMessage({ id, ok: true, output: JSON.stringify(unflat, null, 2) });
        break;
      }
      case "ndjson": {
        if (req.mode === "to") {
          const parsed = JSON.parse(req.input);
          ctx.postMessage({ id, ok: true, output: toNdjson(parsed) });
        } else {
          const parsed = fromNdjson(req.input);
          ctx.postMessage({
            id,
            ok: true,
            output: JSON.stringify(parsed, null, 2),
          });
        }
        break;
      }
      case "parse": {
        const parsed = JSON.parse(req.input);
        ctx.postMessage({ id, ok: true, parsed });
        break;
      }
      default: {
        const _exhaustive: never = req;
        ctx.postMessage({ id, ok: false, error: `Unknown op: ${(_exhaustive as { op: string }).op}` });
      }
    }
  } catch (e) {
    ctx.postMessage({
      id,
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    });
  }
};
