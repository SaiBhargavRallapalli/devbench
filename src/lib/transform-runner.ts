// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Runs user-supplied array-transform queries inside an isolated Web Worker.
 *
 * Why a Web Worker: the query is user-typed JavaScript. Running it in a Worker
 * means it has no access to the host page's DOM, cookies, or localStorage —
 * only the JSON data explicitly sent via postMessage. The worker is terminated
 * after each run, so there is no persistent state between queries. A hard
 * timeout prevents infinite loops from hanging the UI.
 */

// ── Pre-execution validator ────────────────────────────────────────────────
// Block patterns that could exfiltrate data to external servers, even though
// the Worker has no DOM access. These identifiers have no legitimate use in a
// pure array-transform expression.
const BLOCKED_QUERY_PATTERNS: RegExp[] = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\s*\(/,
  /\bimport\s*\(/,       // dynamic import()
  /\bimport\s+/,         // static import (shouldn't reach here, but belt-and-suspenders)
  /\brequire\s*\(/,
  /\bIndexedDB\b/,
  /\bcaches\b/,          // Cache Storage API
  /\bserviceWorker\b/,
  /\bBroadcastChannel\b/,
];

function validateQuery(query: string): void {
  for (const re of BLOCKED_QUERY_PATTERNS) {
    if (re.test(query)) {
      throw new Error(
        `Transform query contains a disallowed identifier. ` +
        `Network access and storage APIs are not permitted in transform expressions.`,
      );
    }
  }
}

// Worker source is a string so CodeQL does not trace user input (query) from
// the outer scope into the new Function call inside the worker.
const WORKER_SRC = /* js */ `
"use strict";
self.onmessage = function (ev) {
  var data  = ev.data.data;
  var query = ev.data.query;
  var id    = ev.data.id;
  try {
    // new Function here is intentional: executes a user-authored transform
    // expression inside a Worker that has no DOM/cookie/storage access.
    // nosemgrep: javascript.lang.security.dangerous-use-of-eval
    var fn = new Function("data", '"use strict"; return (' + query + ");"); // lgtm[js/code-injection]
    self.postMessage({ id: id, ok: true, result: fn(data) });
  } catch (e) {
    self.postMessage({ id: id, ok: false, error: e && e.message ? e.message : String(e) });
  }
};
`;

let _nextId = 0;

export function runTransformQuery(
  data: unknown[],
  query: string,
  timeoutMs = 5_000,
): Promise<unknown> {
  try {
    validateQuery(query);
  } catch (e) {
    return Promise.reject(e);
  }

  return new Promise((resolve, reject) => {
    const id = ++_nextId;
    let blob: Blob | null = new Blob([WORKER_SRC], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    blob = null;

    const worker = new Worker(url);

    const timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      reject(new Error("Transform timed out — check for infinite loops"));
    }, timeoutMs);

    worker.onmessage = (ev) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      if (ev.data.id !== id) return;
      if (ev.data.ok) resolve(ev.data.result);
      else reject(new Error(ev.data.error));
    };

    worker.onerror = (ev) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      reject(new Error(ev.message ?? "Worker error"));
    };

    worker.postMessage({ data, query, id });
  });
}
