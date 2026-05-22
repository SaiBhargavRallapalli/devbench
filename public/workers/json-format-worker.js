// Copyright (c) 2026 DevBench contributors. MIT License.
/** @deprecated Prefer bundled module worker; kept for older cached service workers. */
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
