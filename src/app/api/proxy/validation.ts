import { z } from "zod";

export const MAX_URL_LENGTH = 2048;
export const MAX_HEADER_VALUE_LENGTH = 8192;
export const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_METHODS = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] as const;

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"]);

export function isPrivateAddress(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);
  if (parts.length === 4 && parts.every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
    const [a, b] = parts;
    return (
      a === 10 ||                             // RFC 1918 class A
      (a === 172 && b >= 16 && b <= 31) ||   // RFC 1918 class B
      (a === 192 && b === 168) ||            // RFC 1918 class C
      (a === 169 && b === 254) ||            // Link-local — includes 169.254.169.254 (AWS/GCP/Azure IMDS)
      (a === 100 && b >= 64 && b <= 127) ||  // CGNAT (RFC 6598)
      a === 127 ||                            // Loopback
      a === 0 ||                              // "This" network
      a === 255                               // Broadcast
    );
  }
  const h = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80");
}

export function isBlockedHost(hostname: string): boolean {
  return BLOCKED_HOSTS.has(hostname) || isPrivateAddress(hostname);
}

export const ProxyRequestSchema = z.object({
  url: z
    .string()
    .min(1, "url is required")
    .max(MAX_URL_LENGTH, `url must be at most ${MAX_URL_LENGTH} characters`)
    .refine((v) => {
      try {
        new URL(v);
        return true;
      } catch {
        return false;
      }
    }, "Invalid URL"),
  method: z.enum(ALLOWED_METHODS, {
    error: `method must be one of: ${ALLOWED_METHODS.join(", ")}`,
  }),
  headers: z
    .record(z.string(), z.string().max(MAX_HEADER_VALUE_LENGTH))
    .optional()
    .default({}),
  payload: z.string().max(MAX_PAYLOAD_BYTES, "payload exceeds 10 MB limit").optional(),
});

export type ProxyRequest = z.infer<typeof ProxyRequestSchema>;
