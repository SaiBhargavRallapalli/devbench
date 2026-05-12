/**
 * Shareable JSON workspace state via URL fragment `#jw=…` (client-only).
 * Distinct from `/tools/*` #state= payloads (see shareable-tool-state.ts).
 */

import type { JsonWorkspaceTab } from "@/lib/json-workspace-types";

export type SharedJsonWorkspacePayload = {
  v: 2;
  input: string;
  schemaText: string;
  activeTab: JsonWorkspaceTab;
  diffLeft: string;
  diffRight: string;
};

const PREFIX = "#jw=";

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64UrlToBytes(b64url: string): Uint8Array {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let k = 0; k < bin.length; k++) out[k] = bin.charCodeAt(k);
  return out;
}

const TAB_IDS = new Set<string>([
  "format",
  "tree",
  "diff",
  "convert",
  "generate",
  "transform",
  "table",
]);

function normalizeTab(t: string): JsonWorkspaceTab {
  return TAB_IDS.has(t) ? (t as JsonWorkspaceTab) : "format";
}

export function encodeJsonWorkspaceState(payload: SharedJsonWorkspacePayload): string {
  const body: SharedJsonWorkspacePayload = {
    v: 2,
    input: payload.input,
    schemaText: payload.schemaText ?? "",
    activeTab: normalizeTab(payload.activeTab),
    diffLeft: payload.diffLeft ?? "",
    diffRight: payload.diffRight ?? "",
  };
  const json = JSON.stringify(body);
  const bytes = new TextEncoder().encode(json);
  return PREFIX + bytesToBase64Url(bytes);
}

export function decodeJsonWorkspaceState(hash: string): SharedJsonWorkspacePayload | null {
  if (!hash.startsWith(PREFIX)) return null;
  const raw = hash.slice(PREFIX.length).trim();
  if (!raw) return null;
  try {
    const bytes = base64UrlToBytes(raw);
    const json = new TextDecoder().decode(bytes);
    const o = JSON.parse(json) as Partial<SharedJsonWorkspacePayload>;
    if (o.v !== 2 || typeof o.input !== "string") return null;
    return {
      v: 2,
      input: o.input,
      schemaText: typeof o.schemaText === "string" ? o.schemaText : "",
      activeTab: normalizeTab(typeof o.activeTab === "string" ? o.activeTab : "format"),
      diffLeft: typeof o.diffLeft === "string" ? o.diffLeft : "",
      diffRight: typeof o.diffRight === "string" ? o.diffRight : "",
    };
  } catch {
    return null;
  }
}

/** Same practical limit as generic tool share links. */
export const JSON_WORKSPACE_SHARE_WARN_CHARS = 7000;

export function jsonWorkspaceShareTooLong(fragment: string): boolean {
  return fragment.length > JSON_WORKSPACE_SHARE_WARN_CHARS;
}
