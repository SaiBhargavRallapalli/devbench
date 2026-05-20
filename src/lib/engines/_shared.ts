// Copyright (c) 2026 DevBench contributors. MIT License.

export type Result = string | { output: string; error?: string };

/** Browsers only expose SubtleCrypto in secure contexts (HTTPS or localhost). */
export function requireSubtleCrypto(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error(
      "Web Crypto is unavailable (crypto.subtle is missing). Open this site over HTTPS or http://localhost — plain HTTP on a LAN hostname or IP disables AES and hashing in the browser."
    );
  }
  return subtle;
}
