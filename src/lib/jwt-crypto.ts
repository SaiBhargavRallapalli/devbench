/**
 * Sign and verify JWTs across the WebCrypto-supported algorithm families:
 * HMAC (HS256/384/512), RSA (RS256/384/512), ECDSA (ES256/384/512), and
 * EdDSA (Ed25519). Lives client-side so secrets, private keys, and tokens
 * never leave the browser.
 *
 * JWS reference: https://www.rfc-editor.org/rfc/rfc7515
 */

export type JwtAlgorithm =
  | "HS256" | "HS384" | "HS512"
  | "RS256" | "RS384" | "RS512"
  | "ES256" | "ES384" | "ES512"
  | "EdDSA";

export type AlgFamily = "hmac" | "rsa" | "ecdsa" | "eddsa";

export const HMAC_ALGS:  JwtAlgorithm[] = ["HS256", "HS384", "HS512"];
export const RSA_ALGS:   JwtAlgorithm[] = ["RS256", "RS384", "RS512"];
export const ECDSA_ALGS: JwtAlgorithm[] = ["ES256", "ES384", "ES512"];

export function familyOf(alg: JwtAlgorithm): AlgFamily {
  if (HMAC_ALGS.includes(alg)) return "hmac";
  if (RSA_ALGS.includes(alg)) return "rsa";
  if (ECDSA_ALGS.includes(alg)) return "ecdsa";
  return "eddsa";
}

// JWS ES512 = P-521 (RFC 7518 §3.4). That mismatch trips people up — keep the table explicit.
const ECDSA_PARAMS: Record<string, { namedCurve: string; hash: string }> = {
  ES256: { namedCurve: "P-256", hash: "SHA-256" },
  ES384: { namedCurve: "P-384", hash: "SHA-384" },
  ES512: { namedCurve: "P-521", hash: "SHA-512" },
};

const HMAC_HASH: Record<string, string> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };
const RSA_HASH:  Record<string, string> = { RS256: "SHA-256", RS384: "SHA-384", RS512: "SHA-512" };

// ── base64url ──────────────────────────────────────────────────────────

export function base64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64urlDecode(s: string): Uint8Array {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function utf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

// ── PEM parsing ────────────────────────────────────────────────────────

export type PemKind = "pkcs8" | "spki" | "pkcs1" | "sec1" | "rsa-pub" | "unknown";

export function detectPemKind(pem: string): PemKind {
  const t = pem.trim();
  if (t.includes("-----BEGIN PRIVATE KEY-----"))     return "pkcs8";
  if (t.includes("-----BEGIN PUBLIC KEY-----"))      return "spki";
  if (t.includes("-----BEGIN RSA PRIVATE KEY-----")) return "pkcs1";
  if (t.includes("-----BEGIN EC PRIVATE KEY-----"))  return "sec1";
  if (t.includes("-----BEGIN RSA PUBLIC KEY-----"))  return "rsa-pub";
  return "unknown";
}

function pemBodyToBuffer(pem: string): ArrayBuffer {
  const body = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  if (!body) throw new Error("PEM body is empty");
  const bin = atob(body);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

function pkcs1Hint(kind: PemKind, want: "private" | "public"): string {
  if (want === "private") {
    if (kind === "pkcs1") return "This is a PKCS#1 RSA private key. Convert it first: `openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in key.pem -out key-pkcs8.pem`";
    if (kind === "sec1")  return "This is a SEC1 EC private key. Convert it first: `openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in key.pem -out key-pkcs8.pem`";
    return "Expected a PKCS#8 PEM (starts with `-----BEGIN PRIVATE KEY-----`).";
  }
  if (kind === "rsa-pub") return "This is a PKCS#1 RSA public key. Convert it first: `openssl rsa -RSAPublicKey_in -in pub.pem -pubout`";
  return "Expected an SPKI PEM (starts with `-----BEGIN PUBLIC KEY-----`).";
}

// ── crypto.subtle guard ────────────────────────────────────────────────

function subtle(): SubtleCrypto {
  const s = globalThis.crypto?.subtle;
  if (!s) throw new Error("Web Crypto is unavailable. Use HTTPS or http://localhost.");
  return s;
}

// ── Key import ─────────────────────────────────────────────────────────

async function importHmacKey(alg: JwtAlgorithm, secret: string, isB64Url: boolean, usage: KeyUsage): Promise<CryptoKey> {
  const bytes = isB64Url ? base64urlDecode(secret) : utf8(secret);
  return subtle().importKey(
    "raw",
    bytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: HMAC_HASH[alg] },
    false,
    [usage],
  );
}

async function importPrivateKey(alg: JwtAlgorithm, pem: string): Promise<CryptoKey> {
  const kind = detectPemKind(pem);
  if (kind !== "pkcs8") throw new Error(pkcs1Hint(kind, "private"));
  const buf = pemBodyToBuffer(pem);
  const fam = familyOf(alg);
  if (fam === "rsa")    return subtle().importKey("pkcs8", buf, { name: "RSASSA-PKCS1-v1_5", hash: RSA_HASH[alg] }, false, ["sign"]);
  if (fam === "ecdsa")  return subtle().importKey("pkcs8", buf, { name: "ECDSA", namedCurve: ECDSA_PARAMS[alg].namedCurve }, false, ["sign"]);
  return subtle().importKey("pkcs8", buf, { name: "Ed25519" } as unknown as AlgorithmIdentifier, false, ["sign"]);
}

async function importPublicKey(alg: JwtAlgorithm, pem: string): Promise<CryptoKey> {
  const kind = detectPemKind(pem);
  if (kind !== "spki") throw new Error(pkcs1Hint(kind, "public"));
  const buf = pemBodyToBuffer(pem);
  const fam = familyOf(alg);
  if (fam === "rsa")   return subtle().importKey("spki", buf, { name: "RSASSA-PKCS1-v1_5", hash: RSA_HASH[alg] }, false, ["verify"]);
  if (fam === "ecdsa") return subtle().importKey("spki", buf, { name: "ECDSA", namedCurve: ECDSA_PARAMS[alg].namedCurve }, false, ["verify"]);
  return subtle().importKey("spki", buf, { name: "Ed25519" } as unknown as AlgorithmIdentifier, false, ["verify"]);
}

function signAlgFor(alg: JwtAlgorithm): AlgorithmIdentifier {
  const fam = familyOf(alg);
  if (fam === "hmac")  return "HMAC";
  if (fam === "rsa")   return "RSASSA-PKCS1-v1_5";
  if (fam === "ecdsa") return { name: "ECDSA", hash: ECDSA_PARAMS[alg].hash } as AlgorithmIdentifier;
  return "Ed25519" as unknown as AlgorithmIdentifier;
}

// ── Sign / Verify ──────────────────────────────────────────────────────

export interface SignOpts {
  alg: JwtAlgorithm;
  signingInput: string;                  // `${headerB64}.${payloadB64}`
  key: string;                           // HMAC secret OR PKCS#8 PEM
  keyIsBase64Url?: boolean;              // HMAC only
}

export async function signJws(opts: SignOpts): Promise<string> {
  const { alg, signingInput, key } = opts;
  const cryptoKey =
    familyOf(alg) === "hmac"
      ? await importHmacKey(alg, key, !!opts.keyIsBase64Url, "sign")
      : await importPrivateKey(alg, key);
  const sig = await subtle().sign(signAlgFor(alg), cryptoKey, utf8(signingInput).buffer as ArrayBuffer);
  return base64urlEncode(new Uint8Array(sig));
}

export interface VerifyOpts {
  alg: JwtAlgorithm;
  signingInput: string;
  signatureB64Url: string;
  key: string;                           // HMAC secret OR SPKI PEM
  keyIsBase64Url?: boolean;              // HMAC only
}

export async function verifyJws(opts: VerifyOpts): Promise<boolean> {
  const { alg, signingInput, signatureB64Url, key } = opts;
  const cryptoKey =
    familyOf(alg) === "hmac"
      ? await importHmacKey(alg, key, !!opts.keyIsBase64Url, "verify")
      : await importPublicKey(alg, key);
  const sigBytes = base64urlDecode(signatureB64Url);
  return subtle().verify(
    signAlgFor(alg),
    cryptoKey,
    sigBytes.buffer as ArrayBuffer,
    utf8(signingInput).buffer as ArrayBuffer,
  );
}

// ── Keypair generation (for "Generate keypair" affordance) ─────────────

async function exportPem(key: CryptoKey, format: "pkcs8" | "spki"): Promise<string> {
  const buf = await subtle().exportKey(format, key);
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  const wrapped = b64.match(/.{1,64}/g)?.join("\n") ?? b64;
  const label = format === "pkcs8" ? "PRIVATE KEY" : "PUBLIC KEY";
  return `-----BEGIN ${label}-----\n${wrapped}\n-----END ${label}-----`;
}

export async function generateKeypairPem(alg: JwtAlgorithm): Promise<{ privatePem: string; publicPem: string }> {
  const fam = familyOf(alg);
  let params: AlgorithmIdentifier;
  if (fam === "rsa") {
    params = { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: RSA_HASH[alg] } as unknown as AlgorithmIdentifier;
  } else if (fam === "ecdsa") {
    params = { name: "ECDSA", namedCurve: ECDSA_PARAMS[alg].namedCurve } as AlgorithmIdentifier;
  } else if (fam === "eddsa") {
    params = { name: "Ed25519" } as unknown as AlgorithmIdentifier;
  } else {
    throw new Error("Keypair generation is only for asymmetric algorithms.");
  }
  const pair = await subtle().generateKey(params, true, ["sign", "verify"]) as CryptoKeyPair;
  const [privatePem, publicPem] = await Promise.all([
    exportPem(pair.privateKey, "pkcs8"),
    exportPem(pair.publicKey, "spki"),
  ]);
  return { privatePem, publicPem };
}

/** 32 random bytes as base64url — pair with "Base64URL encoded" so HS* keys match server libs. */
export function generateHmacSecretB64Url(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64urlEncode(bytes);
}
