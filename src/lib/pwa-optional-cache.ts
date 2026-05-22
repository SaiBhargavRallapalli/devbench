// Copyright (c) 2026 DevBench contributors. MIT License.
/** Ask the service worker to cache optional URLs (Monaco, workers) after first use. */

export function cacheUrlsForOffline(urls: string[]): void {
  if (typeof navigator === "undefined" || !navigator.serviceWorker?.controller) return;
  navigator.serviceWorker.controller.postMessage({
    type: "CACHE_URLS",
    urls,
  });
}

export const PLAYGROUND_OPTIONAL_URLS = [
  "https://cdn.jsdelivr.net/npm/monaco-editor@0.53.0/min/vs/loader.js",
  "/workers/json-workspace-worker.js",
];
