/** Share playground code via URL fragment `#pg=` (client-side only). */

import { SHARE_FRAGMENT_MAX_CHARS } from "@/lib/share-fragment-limits";

const PREFIX = "#pg=";

export type PlaygroundSharePayload = {
  v: 1;
  lang: "javascript" | "typescript" | "nodejs" | "python";
  code: string;
  stdin?: string;
};

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64UrlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let k = 0; k < bin.length; k++) out[k] = bin.charCodeAt(k);
  return out;
}

export function encodePlaygroundShare(payload: PlaygroundSharePayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return PREFIX + bytesToBase64Url(bytes);
}

export function decodePlaygroundShare(hash: string): PlaygroundSharePayload | null {
  if (!hash.startsWith(PREFIX)) return null;
  const raw = hash.slice(PREFIX.length).trim();
  if (!raw || raw.length > SHARE_FRAGMENT_MAX_CHARS) return null;
  try {
    const bytes = base64UrlToBytes(raw);
    const json = new TextDecoder().decode(bytes);
    const o = JSON.parse(json) as PlaygroundSharePayload;
    if (o.v !== 1 || typeof o.code !== "string") return null;
    return o;
  } catch {
    return null;
  }
}

export const PLAYGROUND_SHARE_WARN = 6000;
