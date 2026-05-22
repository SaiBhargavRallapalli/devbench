// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Legacy static worker (format/minify only). Prefer the bundled module worker
 * in src/workers/json-workspace.worker.ts; this file remains for offline PWA cache.
 */
self.addEventListener("message", (ev) => {
  const { id, input, mode, indent } = ev.data ?? {};
  try {
    const parsed = JSON.parse(input);
    const output =
      mode === "minify" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent ?? 2);
    self.postMessage({ id, ok: true, output });
  } catch (e) {
    self.postMessage({ id, ok: false, error: String(e && e.message ? e.message : e) });
  }
});
