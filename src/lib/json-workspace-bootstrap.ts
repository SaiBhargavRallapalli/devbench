// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * JSONLint-compatible URL bootstrap: ?json=… and ?url=… (see https://jsonlint.com/)
 */

const MAX_INLINE_JSON_CHARS = 32_000;
const MAX_FETCH_BODY_CHARS = 2_000_000;

export type JsonBootstrapSource =
  | { kind: "inline"; text: string }
  | { kind: "url"; url: string };

/** Read ?json= or ?url= from a search string (leading ? optional). */
export function readJsonBootstrapFromSearch(search: string): JsonBootstrapSource | null {
  const q = search.startsWith("?") ? search.slice(1) : search;
  if (!q.trim()) return null;
  const params = new URLSearchParams(q);
  const json = params.get("json");
  if (json !== null && json.length > 0) {
    if (json.length > MAX_INLINE_JSON_CHARS) return null;
    return { kind: "inline", text: json };
  }
  const url = params.get("url");
  if (url !== null && url.trim().length > 0) {
    return { kind: "url", url: url.trim() };
  }
  return null;
}

/** Build a shareable ?json= link (JSONLint-style) for small payloads. */
export function buildJsonQueryShareUrl(origin: string, pathname: string, jsonText: string): string | null {
  if (jsonText.length > MAX_INLINE_JSON_CHARS) return null;
  const params = new URLSearchParams({ json: jsonText });
  return `${origin}${pathname}?${params.toString()}`;
}

export type FetchRemoteJsonResult =
  | { ok: true; text: string; contentType: string; finalUrl: string }
  | { ok: false; error: string };

/** Fetch JSON (or text) via same-origin proxy — avoids browser CORS limits. */
export async function fetchRemoteJsonForWorkspace(url: string): Promise<FetchRemoteJsonResult> {
  const trimmed = url.trim();
  if (!trimmed) return { ok: false, error: "Enter a URL." };

  let res: Response;
  try {
    res = await fetch("/api/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: trimmed, method: "GET", headers: { Accept: "application/json, text/plain, */*" } }),
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network request failed." };
  }

  let data: {
    error?: string;
    body?: string;
    contentType?: string;
    finalUrl?: string;
    status?: number;
  };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return { ok: false, error: "Invalid response from proxy." };
  }

  if (data.error) return { ok: false, error: data.error };
  const body = typeof data.body === "string" ? data.body : "";
  if (!body.trim()) return { ok: false, error: "Empty response body." };
  if (body.length > MAX_FETCH_BODY_CHARS) {
    return { ok: false, error: `Response too large (${(body.length / 1_000_000).toFixed(1)} MB).` };
  }

  if (typeof data.status === "number" && data.status >= 400) {
    return { ok: false, error: `HTTP ${data.status} — could not load JSON from URL.` };
  }

  const normalized = normalizeFetchedBody(body);
  return {
    ok: true,
    text: normalized,
    contentType: data.contentType ?? "",
    finalUrl: data.finalUrl ?? trimmed,
  };
}

function normalizeFetchedBody(body: string): string {
  const trimmed = body.trim();
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return trimmed;
  }
}
