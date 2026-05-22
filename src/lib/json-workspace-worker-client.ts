// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Off-main-thread JSON workspace operations via a module Web Worker.
 * Falls back to sync ops on the main thread for small payloads or when Workers are unavailable.
 */
import type { FixResult } from "@/lib/json-repair";
import { runJsonWorkspaceOpSync } from "@/lib/json-workspace-ops-sync";
import type {
  JsonWorkspaceWorkerRequest,
  JsonWorkspaceWorkerResponse,
} from "@/lib/json-workspace-worker-types";

/** Use a worker when input is at least this size (bytes, UTF-16 code units). */
export const JSON_WORKER_THRESHOLD = 16 * 1024;

export function canUseJsonWorker(): boolean {
  return typeof Worker !== "undefined";
}

export function shouldUseJsonWorker(input: string): boolean {
  return canUseJsonWorker() && input.length >= JSON_WORKER_THRESHOLD;
}

export type JsonWorkspaceOpResultWithWorker =
  | { ok: true; output?: string; parsed?: unknown; fixResult?: FixResult; usedWorker: boolean }
  | { ok: false; error: string; usedWorker: boolean };

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<
  number,
  { resolve: (r: JsonWorkspaceOpResultWithWorker) => void }
>();

function ensureWorker(): Worker | null {
  if (!canUseJsonWorker()) return null;
  if (!worker) {
    try {
      worker = new Worker(
        new URL("../workers/json-workspace.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.onmessage = (ev: MessageEvent<JsonWorkspaceWorkerResponse>) => {
        const data = ev.data;
        const entry = pending.get(data.id);
        if (!entry) return;
        pending.delete(data.id);
        if (data.ok) {
          entry.resolve({
            ok: true,
            output: data.output,
            parsed: data.parsed,
            fixResult: data.fixResult,
            usedWorker: true,
          });
        } else {
          entry.resolve({ ok: false, error: data.error, usedWorker: true });
        }
      };
      worker.onerror = () => {
        for (const [id, entry] of pending) {
          pending.delete(id);
          entry.resolve({ ok: false, error: "JSON worker failed", usedWorker: true });
        }
        worker?.terminate();
        worker = null;
      };
    } catch {
      return null;
    }
  }
  return worker;
}

function runInWorker(req: JsonWorkspaceWorkerRequest): Promise<JsonWorkspaceOpResultWithWorker> {
  const w = ensureWorker();
  if (!w) {
    return Promise.resolve(runJsonWorkspaceOpSync(req));
  }
  return new Promise((resolve) => {
    const id = ++seq;
    pending.set(id, { resolve });
    w.postMessage({ id, ...req });
  });
}

/** Run a JSON workspace op off the main thread when the payload is large enough. */
export async function runJsonWorkspaceOp(
  req: JsonWorkspaceWorkerRequest,
  options?: { forceWorker?: boolean },
): Promise<JsonWorkspaceOpResultWithWorker> {
  const useWorker =
    options?.forceWorker === true ||
    (options?.forceWorker !== false && shouldUseJsonWorker(req.input));
  if (!useWorker) {
    return runJsonWorkspaceOpSync(req);
  }
  return runInWorker(req);
}

/** @deprecated Use runJsonWorkspaceOp — kept for existing call sites. */
export async function formatJsonInWorker(
  input: string,
  mode: "format" | "minify",
  indent = 2,
): Promise<{ output: string; error?: string }> {
  const r = await runJsonWorkspaceOp(
    mode === "minify" ? { op: "minify", input } : { op: "format", input, indent },
    { forceWorker: true },
  );
  if (r.ok && r.output !== undefined) return { output: r.output };
  return { output: "", error: r.ok ? undefined : r.error };
}
