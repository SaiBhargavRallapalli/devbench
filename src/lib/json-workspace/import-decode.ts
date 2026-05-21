import { stripJsonComments } from "@/lib/json-repair";

// ── JSONC / JSON5 → JSON ─────────────────────────────────────────────────

export function jsoncToJson(input: string, minify = false): string {
  const { text: commentStripped } = stripJsonComments(input);
  const noTrailing = commentStripped.replace(/,(\s*[}\]])/g, "$1");
  const withQuotedKeys = noTrailing.replace(
    /(?<=[\{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:\s*)/g,
    '"$1"$2'
  );
  const parsed = JSON.parse(withQuotedKeys);
  return minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
}

// ── JWT Decoder ──────────────────────────────────────────────────────────

export function decodeJwt(token: string): unknown {
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    throw new Error(`Invalid JWT: expected 3 dot-separated parts, got ${parts.length}`);
  }

  function decodeBase64Url(str: string): unknown {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(padLen);
    try {
      return JSON.parse(atob(padded));
    } catch {
      return atob(padded);
    }
  }

  const header = decodeBase64Url(parts[0]);
  const payload = decodeBase64Url(parts[1]);

  const result: Record<string, unknown> = { header, payload, signature: parts[2] };

  if (typeof payload === "object" && payload !== null) {
    const p = payload as Record<string, unknown>;
    if (typeof p.iat === "number") result.issuedAt = new Date(p.iat * 1000).toISOString();
    if (typeof p.exp === "number") result.expiresAt = new Date(p.exp * 1000).toISOString();
    if (typeof p.nbf === "number") result.notBefore = new Date(p.nbf * 1000).toISOString();
    const now = Math.floor(Date.now() / 1000);
    if (typeof p.exp === "number") result.expired = now > p.exp;
  }

  return result;
}
