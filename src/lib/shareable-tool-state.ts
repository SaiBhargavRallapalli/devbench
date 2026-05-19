// Copyright (c) 2026 DevBench contributors. MIT License.
/** Share tool inputs via URL fragment `#state=…` (fully client-side; never hits the server). */

export type SharedToolPayload = {
  v: 1;
  i: string;
  i2?: string;
};

const PREFIX = "#state=";

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64UrlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let k = 0; k < bin.length; k++) out[k] = bin.charCodeAt(k);
  return out;
}

export function encodeSharedToolState(input: string, input2?: string): string {
  const payload: SharedToolPayload = {
    v: 1,
    i: input,
    ...(input2 !== undefined && input2 !== "" ? { i2: input2 } : {}),
  };
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return PREFIX + bytesToBase64Url(bytes);
}

export function decodeSharedToolState(hash: string): SharedToolPayload | null {
  if (!hash.startsWith(PREFIX)) return null;
  const raw = hash.slice(PREFIX.length).trim();
  if (!raw) return null;
  try {
    const bytes = base64UrlToBytes(raw);
    const json = new TextDecoder().decode(bytes);
    const o = JSON.parse(json) as SharedToolPayload;
    if (o.v !== 1 || typeof o.i !== "string") return null;
    return o;
  } catch {
    return null;
  }
}

/** ~8k safe fragment in most browsers; warn above this. */
export const SHARE_STATE_WARN_CHARS = 7000;

export function sharePayloadTooLong(encodedFragment: string): boolean {
  return encodedFragment.length > SHARE_STATE_WARN_CHARS;
}
