"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  FileJson,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  ShieldX,
  Clock,
  Info,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import {
  trackToolSuccess,
  trackToolError,
  trackToolCopy,
} from "@/lib/analytics-events";
import {
  ECDSA_ALGS,
  HMAC_ALGS,
  RSA_ALGS,
  detectPemKind,
  familyOf,
  generateHmacSecretB64Url,
  generateKeypairPem,
  signJws,
  verifyJws,
  type JwtAlgorithm,
} from "@/lib/jwt-crypto";

const TOOL_SLUG = "jwt-debugger";

// ─── base64url helpers ──────────────────────────────────────────────────

function base64urlEncode(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.byteLength; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  try {
    return atob(base64);
  } catch {
    return "";
  }
}

function base64urlToUint8Array(str: string): Uint8Array {
  const raw = base64urlDecode(str);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function textToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// ─── JWT parsing ────────────────────────────────────────────────────────

interface DecodedJWT {
  headerRaw: string;
  payloadRaw: string;
  signatureRaw: string;
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  isValid: boolean;
}

function decodeJWT(token: string): DecodedJWT | null {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return null;
  try {
    const headerStr = base64urlDecode(parts[0]);
    const payloadStr = base64urlDecode(parts[1]);
    if (!headerStr || !payloadStr) return null;
    const header = JSON.parse(headerStr);
    const payload = JSON.parse(payloadStr);
    return {
      headerRaw: parts[0],
      payloadRaw: parts[1],
      signatureRaw: parts[2],
      header,
      payload,
      isValid: true,
    };
  } catch {
    return null;
  }
}

// ─── registered claims ──────────────────────────────────────────────────

const REGISTERED_CLAIMS: Record<string, string> = {
  iss: "Issuer — identifies the principal that issued the JWT",
  sub: "Subject — identifies the principal that is the subject",
  aud: "Audience — identifies the recipients the JWT is intended for",
  exp: "Expiration Time — time after which the JWT must not be accepted",
  nbf: "Not Before — time before which the JWT must not be accepted",
  iat: "Issued At — time at which the JWT was issued",
  jti: "JWT ID — unique identifier for the JWT",
};

// ─── relative time ──────────────────────────────────────────────────────

function relativeTime(epochSec: number): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const diff = epochSec - nowSec;
  const abs = Math.abs(diff);

  let value: string;
  if (abs < 60) {
    value = `${abs} second${abs !== 1 ? "s" : ""}`;
  } else if (abs < 3600) {
    const m = Math.floor(abs / 60);
    value = `${m} minute${m !== 1 ? "s" : ""}`;
  } else if (abs < 86400) {
    const h = Math.floor(abs / 3600);
    value = `${h} hour${h !== 1 ? "s" : ""}`;
  } else {
    const d = Math.floor(abs / 86400);
    value = `${d} day${d !== 1 ? "s" : ""}`;
  }

  return diff >= 0 ? `expires in ${value}` : `expired ${value} ago`;
}

// ─── CopyBtn ────────────────────────────────────────────────────────────

function CopyBtn({ text, label, className = "" }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    trackToolCopy(TOOL_SLUG, label);
  }, [text, label]);
  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
        copied
          ? "text-success"
          : "text-muted-foreground hover:text-accent"
      } ${className}`}
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {label && <span>{copied ? "Copied!" : label}</span>}
    </button>
  );
}

// ─── JSON syntax highlighting ───────────────────────────────────────────

function HighlightedJSON({ json }: { json: string }) {
  const tokens = useMemo(() => {
    const result: { type: string; value: string }[] = [];
    const regex =
      /("(?:\\.|[^"\\])*")\s*(:)|("(?:\\.|[^"\\])*")|(true|false|null)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],])|(\s+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(json)) !== null) {
      if (match[1]) {
        result.push({ type: "key", value: match[1] });
        result.push({ type: "punct", value: ":" });
      } else if (match[3]) {
        result.push({ type: "string", value: match[3] });
      } else if (match[4]) {
        result.push({ type: "boolean", value: match[4] });
      } else if (match[5]) {
        result.push({ type: "number", value: match[5] });
      } else if (match[6]) {
        result.push({ type: "punct", value: match[6] });
      } else if (match[7]) {
        result.push({ type: "ws", value: match[7] });
      }
    }
    return result;
  }, [json]);

  return (
    <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-all">
      {tokens.map((t, i) => {
        switch (t.type) {
          case "key":
            return <span key={i} className="text-[#f472b6]">{t.value}</span>;
          case "string":
            return <span key={i} className="text-[#34d399]">{t.value}</span>;
          case "number":
            return <span key={i} className="text-[#60a5fa]">{t.value}</span>;
          case "boolean":
            return <span key={i} className="text-[#fbbf24]">{t.value}</span>;
          case "punct":
            return <span key={i} className="text-muted-foreground">{t.value}</span>;
          default:
            return <span key={i}>{t.value}</span>;
        }
      })}
    </pre>
  );
}

// ─── color-coded token display ──────────────────────────────────────────

function ColoredToken({ token }: { token: string }) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return <span className="font-mono text-sm break-all">{token}</span>;
  }
  return (
    <span className="font-mono text-sm break-all leading-relaxed">
      <span className="text-[#f87171]">{parts[0]}</span>
      <span className="text-muted-foreground">.</span>
      <span className="text-[#c084fc]">{parts[1]}</span>
      <span className="text-muted-foreground">.</span>
      <span className="text-[#22d3ee]">{parts[2]}</span>
    </span>
  );
}

// ─── sample tokens ──────────────────────────────────────────────────────

const SAMPLE_HEADER = JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2);
const SAMPLE_PAYLOAD = JSON.stringify(
  {
    sub: "1234567890",
    name: "John Doe",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    iss: "devbench.co.in",
    aud: "devbench-users",
  },
  null,
  2
);

const EXAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function JwtSecretInstructions() {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground leading-relaxed space-y-2">
      <p>
        <span className="font-medium text-foreground">What is this secret?</span> For HS256/384/512,
        the verifier uses the same symmetric key the issuer used to sign the JWT. You don&apos;t
        “download” it from jwt.io — it comes from your{" "}
        <span className="text-foreground">server or identity provider</span>: env vars like{" "}
        <code className="font-mono text-[11px] text-accent">JWT_SECRET</code>, dashboard signing
        secrets (Auth0, Supabase, Clerk, Firebase, etc.), or your framework&apos;s auth config.
      </p>
      <p>
        The preset <code className="font-mono text-[11px] text-foreground">your-256-bit-secret</code>{" "}
        is only a familiar placeholder so the{" "}
        <span className="text-foreground">bundled example JWT on the Decoder tab</span> verifies.
        Replace it with your real secret for your own tokens. For new keys, prefer at least{" "}
        <span className="text-foreground">32 random bytes</span> of entropy; “256-bit” refers to the
        HMAC algorithm strength, not the exact character count of the string.
      </p>
    </div>
  );
}

// ─── main page ──────────────────────────────────────────────────────────

export default function JWTDebuggerPage() {
  const [activeTab, setActiveTab] = useState<"decode" | "encode">("decode");

  // Decoder state
  const [token, setToken] = useState(EXAMPLE_JWT);
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [secretIsBase64, setSecretIsBase64] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [decodePubPem, setDecodePubPem] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Encoder state
  const [encAlg, setEncAlg] = useState<JwtAlgorithm>("HS256");
  const [encHeader, setEncHeader] = useState(SAMPLE_HEADER);
  const [encPayload, setEncPayload] = useState(SAMPLE_PAYLOAD);
  const [encSecret, setEncSecret] = useState("your-256-bit-secret");
  const [encSecretIsBase64, setEncSecretIsBase64] = useState(false);
  const [encPrivatePem, setEncPrivatePem] = useState("");
  const [encGeneratedPublicPem, setEncGeneratedPublicPem] = useState("");
  const [encKeypairBusy, setEncKeypairBusy] = useState(false);
  const [encodedToken, setEncodedToken] = useState("");
  const [encodeError, setEncodeError] = useState("");

  const encFamily = familyOf(encAlg);

  const decoded = useMemo(() => decodeJWT(token), [token]);

  const headerJSON = useMemo(() => {
    if (!decoded) return "";
    try {
      return JSON.stringify(decoded.header, null, 2);
    } catch {
      return "";
    }
  }, [decoded]);

  const payloadJSON = useMemo(() => {
    if (!decoded) return "";
    try {
      return JSON.stringify(decoded.payload, null, 2);
    } catch {
      return "";
    }
  }, [decoded]);

  const tokenBytes = useMemo(() => new TextEncoder().encode(token).length, [token]);

  const claimEntries = useMemo(() => {
    if (!decoded) return [];
    return Object.entries(decoded.payload).map(([key, value]) => ({
      key,
      value,
      description: REGISTERED_CLAIMS[key] || "Custom claim",
      isRegistered: key in REGISTERED_CLAIMS,
    }));
  }, [decoded]);

  const expirationInfo = useMemo(() => {
    if (!decoded || typeof decoded.payload.exp !== "number") return null;
    const exp = decoded.payload.exp as number;
    const nowSec = Math.floor(Date.now() / 1000);
    const isExpired = exp < nowSec;
    return {
      exp,
      isExpired,
      expDate: new Date(exp * 1000).toISOString(),
      relative: relativeTime(exp),
    };
  }, [decoded]);

  const decodedAlg: JwtAlgorithm | null = useMemo(() => {
    const raw = decoded?.header?.alg;
    if (typeof raw !== "string") return null;
    return ([...HMAC_ALGS, ...RSA_ALGS, ...ECDSA_ALGS, "EdDSA"] as JwtAlgorithm[]).find((a) => a === raw) ?? null;
  }, [decoded]);

  const decodedFamily = decodedAlg ? familyOf(decodedAlg) : null;

  // Verify signature
  useEffect(() => {
    if (!decoded || !decodedAlg) {
      setVerifyResult(null);
      setVerifyError(null);
      return;
    }

    const isHmac = decodedFamily === "hmac";
    const keyValue = isHmac ? secret : decodePubPem;
    if (!keyValue || !keyValue.trim()) {
      setVerifyResult(null);
      setVerifyError(null);
      return;
    }

    let cancelled = false;
    setIsVerifying(true);
    setVerifyError(null);

    verifyJws({
      alg: decodedAlg,
      signingInput: `${decoded.headerRaw}.${decoded.payloadRaw}`,
      signatureB64Url: decoded.signatureRaw,
      key: keyValue,
      keyIsBase64Url: isHmac ? secretIsBase64 : undefined,
    })
      .then((result) => {
        if (!cancelled) {
          setVerifyResult(result);
          setIsVerifying(false);
          trackToolSuccess(TOOL_SLUG, "verify", { valid: result, alg: decodedAlg });
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setVerifyResult(false);
          setVerifyError(e instanceof Error ? e.message : "Verification failed");
          setIsVerifying(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [decoded, decodedAlg, decodedFamily, secret, secretIsBase64, decodePubPem]);

  // Encode JWT
  useEffect(() => {
    let cancelled = false;

    async function encode() {
      try {
        const headerObj = JSON.parse(encHeader);
        const payloadObj = JSON.parse(encPayload);

        headerObj.alg = encAlg;
        if (!headerObj.typ) headerObj.typ = "JWT";

        const headerB64 = base64urlEncode(textToUint8Array(JSON.stringify(headerObj)));
        const payloadB64 = base64urlEncode(textToUint8Array(JSON.stringify(payloadObj)));

        const isHmac = encFamily === "hmac";
        const keyValue = isHmac ? encSecret : encPrivatePem;

        const signature = await signJws({
          alg: encAlg,
          signingInput: `${headerB64}.${payloadB64}`,
          key: keyValue,
          keyIsBase64Url: isHmac ? encSecretIsBase64 : undefined,
        });

        if (!cancelled) {
          setEncodedToken(`${headerB64}.${payloadB64}.${signature}`);
          setEncodeError("");
          trackToolSuccess(TOOL_SLUG, "encode", { alg: encAlg });
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Failed to encode JWT";
          setEncodeError(msg);
          setEncodedToken("");
          trackToolError(TOOL_SLUG, "encode", msg);
        }
      }
    }

    const haveKey = encFamily === "hmac" ? !!encSecret : !!encPrivatePem.trim();
    if (encHeader.trim() && encPayload.trim() && haveKey) {
      encode();
    } else {
      setEncodedToken("");
      setEncodeError("");
    }

    return () => {
      cancelled = true;
    };
  }, [encAlg, encFamily, encHeader, encPayload, encSecret, encSecretIsBase64, encPrivatePem]);

  const onGenerateEncoderKey = useCallback(async () => {
    setEncodeError("");
    if (encFamily === "hmac") {
      setEncSecret(generateHmacSecretB64Url());
      setEncSecretIsBase64(true);
      setShowSecret(true);
      setEncGeneratedPublicPem("");
      return;
    }
    setEncKeypairBusy(true);
    try {
      const { privatePem, publicPem } = await generateKeypairPem(encAlg);
      setEncPrivatePem(privatePem);
      setEncGeneratedPublicPem(publicPem);
    } catch (e) {
      setEncodeError(e instanceof Error ? e.message : "Keypair generation failed");
    } finally {
      setEncKeypairBusy(false);
    }
  }, [encAlg, encFamily]);

  const inputClass =
    "px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/50 transition-shadow";

  const tabClass = (active: boolean) =>
    `px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      active
        ? "bg-accent text-accent-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  return (
    <>
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full space-y-6">
        {/* Page header */}
        <div className="animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-accent/10">
              <FileJson className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">JWT Debugger</h1>
              <p className="text-sm text-muted-foreground">
                Decode, encode &amp; verify JSON Web Tokens — all in your browser
              </p>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/60 border border-border w-fit animate-slide-up">
          <button className={tabClass(activeTab === "decode")} onClick={() => setActiveTab("decode")}>
            Decoder
          </button>
          <button className={tabClass(activeTab === "encode")} onClick={() => setActiveTab("encode")}>
            Encoder
          </button>
        </div>

        {/* ═══ DECODER TAB ═══ */}
        {activeTab === "decode" && (
          <div className="space-y-6 animate-fade-in">
            {/* Token input */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Encoded Token</label>
                <div className="flex items-center gap-3">
                  {decoded ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-success/10 text-success">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Valid JWT
                    </span>
                  ) : token.trim() ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-destructive/10 text-destructive">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Invalid JWT
                    </span>
                  ) : null}
                  <span className="text-xs text-muted-foreground">{tokenBytes} bytes</span>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4 max-h-36 overflow-auto scrollbar-thin">
                {token.trim() && decoded ? (
                  <ColoredToken token={token.trim()} />
                ) : (
                  <span className="font-mono text-sm text-muted-foreground break-all">{token}</span>
                )}
              </div>

              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste a JWT token here..."
                rows={3}
                className={`${inputClass} w-full resize-none`}
              />
            </div>

            {decoded && (
              <>
                {/* Header / Payload / Signature */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Header */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#f87171]/5">
                      <span className="text-sm font-semibold text-[#f87171]">Header</span>
                      <CopyBtn text={headerJSON} label="Copy" />
                    </div>
                    <div className="p-4 overflow-auto max-h-56 scrollbar-thin">
                      <HighlightedJSON json={headerJSON} />
                    </div>
                  </div>

                  {/* Payload */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#c084fc]/5">
                      <span className="text-sm font-semibold text-[#c084fc]">Payload</span>
                      <CopyBtn text={payloadJSON} label="Copy" />
                    </div>
                    <div className="p-4 overflow-auto max-h-56 scrollbar-thin">
                      <HighlightedJSON json={payloadJSON} />
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#22d3ee]/5">
                      <span className="text-sm font-semibold text-[#22d3ee]">Signature</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Algorithm:</span>{" "}
                        {String(decoded.header.alg || "unknown")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Type:</span>{" "}
                        {String(decoded.header.typ || "unknown")}
                      </div>
                      <div className="font-mono text-xs text-[#22d3ee] break-all bg-muted/50 p-2 rounded-lg">
                        {decoded.signatureRaw}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature verification */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-accent" />
                    <h2 className="text-sm font-semibold">Signature Verification</h2>
                  </div>

                  {!decodedAlg ? (
                    <p className="text-xs text-muted-foreground">
                      This token uses <strong>{String(decoded.header.alg)}</strong>, which isn&apos;t a
                      supported JWS algorithm. Supported: HS256/384/512, RS256/384/512, ES256/384/512, EdDSA.
                    </p>
                  ) : decodedFamily === "hmac" ? (
                    <>
                      <JwtSecretInstructions />

                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                          <input
                            type={showSecret ? "text" : "password"}
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            placeholder="Enter secret key..."
                            autoComplete="off"
                            className={`${inputClass} w-full pr-10`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSecret(generateHmacSecretB64Url());
                              setSecretIsBase64(true);
                              setShowSecret(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors whitespace-nowrap"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Generate secret
                          </button>
                          <label className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={secretIsBase64}
                              onChange={(e) => setSecretIsBase64(e.target.checked)}
                              className="rounded border-border accent-accent"
                            />
                            Base64URL encoded
                          </label>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground">Generate secret</span> fills a
                        32-byte random key and checks Base64URL so the key bytes match standard
                        signing libraries. Uncheck only if your secret is a plain string (UTF-8).
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground">
                        Paste the <strong>SPKI public key</strong> matching the signer&apos;s private key.
                        Token uses <strong>{decodedAlg}</strong>.
                      </p>
                      <textarea
                        value={decodePubPem}
                        onChange={(e) => setDecodePubPem(e.target.value)}
                        placeholder={"-----BEGIN PUBLIC KEY-----\n…\n-----END PUBLIC KEY-----"}
                        rows={5}
                        className={`${inputClass} w-full resize-y`}
                        spellCheck={false}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Need to convert a PKCS#1 RSA public key?{" "}
                        <code className="font-mono">openssl rsa -RSAPublicKey_in -in pub.pem -pubout</code>
                      </p>
                    </>
                  )}

                  {decodedAlg && (
                    <div>
                      {isVerifying ? (
                        <span className="text-xs text-muted-foreground">Verifying…</span>
                      ) : verifyError ? (
                        <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <ShieldX className="w-5 h-5 text-destructive shrink-0" />
                          <span className="text-sm font-medium text-destructive break-words">{verifyError}</span>
                        </div>
                      ) : verifyResult === true ? (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-success/10 border border-success/20">
                          <ShieldCheck className="w-5 h-5 text-success" />
                          <span className="text-sm font-medium text-success">Signature Verified</span>
                        </div>
                      ) : verifyResult === false ? (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <ShieldX className="w-5 h-5 text-destructive" />
                          <span className="text-sm font-medium text-destructive">Signature Invalid</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Expiration */}
                {expirationInfo && (
                  <div
                    className={`rounded-xl border p-4 flex items-center gap-3 ${
                      expirationInfo.isExpired
                        ? "border-destructive/30 bg-destructive/5"
                        : "border-success/30 bg-success/5"
                    }`}
                  >
                    <Clock
                      className={`w-5 h-5 shrink-0 ${
                        expirationInfo.isExpired ? "text-destructive" : "text-success"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          expirationInfo.isExpired ? "text-destructive" : "text-success"
                        }`}
                      >
                        {expirationInfo.isExpired ? "Token Expired" : "Token Active"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {expirationInfo.relative} &middot; {expirationInfo.expDate}
                      </p>
                    </div>
                  </div>
                )}

                {/* Token info panel */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-accent" />
                    <h2 className="text-sm font-semibold">Token Info</h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg bg-muted/50 border border-border p-3">
                      <p className="text-xs text-muted-foreground">Size</p>
                      <p className="text-lg font-bold font-mono">{tokenBytes} <span className="text-xs font-normal text-muted-foreground">bytes</span></p>
                    </div>
                    <div className="rounded-lg bg-muted/50 border border-border p-3">
                      <p className="text-xs text-muted-foreground">Claims</p>
                      <p className="text-lg font-bold font-mono">{claimEntries.length}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 border border-border p-3">
                      <p className="text-xs text-muted-foreground">Algorithm</p>
                      <p className="text-lg font-bold font-mono">{String(decoded.header.alg || "N/A")}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 border border-border p-3">
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-lg font-bold font-mono">{String(decoded.header.typ || "N/A")}</p>
                    </div>
                  </div>

                  {/* Header claims table */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Header Claims
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="py-2 pr-4 text-xs font-semibold text-foreground">Claim</th>
                            <th className="py-2 text-xs font-semibold text-foreground">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(decoded.header).map(([k, v]) => (
                            <tr key={k} className="border-b border-border/50">
                              <td className="py-2 pr-4 font-mono text-sm text-accent">{k}</td>
                              <td className="py-2 font-mono text-sm">{JSON.stringify(v)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Registered claims table */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Payload Claims
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="py-2 pr-4 text-xs font-semibold text-foreground w-24">Claim</th>
                            <th className="py-2 pr-4 text-xs font-semibold text-foreground">Value</th>
                            <th className="py-2 text-xs font-semibold text-foreground">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {claimEntries.map(({ key, value, description, isRegistered }) => (
                            <tr key={key} className="border-b border-border/50">
                              <td className="py-2 pr-4 font-mono text-sm">
                                <span className={isRegistered ? "text-accent" : "text-muted-foreground"}>
                                  {key}
                                </span>
                              </td>
                              <td className="py-2 pr-4 font-mono text-sm break-all max-w-xs">
                                {typeof value === "number" && ["exp", "nbf", "iat"].includes(key) ? (
                                  <span>
                                    {value}{" "}
                                    <span className="text-xs text-muted-foreground">
                                      ({new Date(value * 1000).toISOString()})
                                    </span>
                                  </span>
                                ) : (
                                  JSON.stringify(value)
                                )}
                              </td>
                              <td className="py-2 text-xs text-muted-foreground">{description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Full decoded output copy */}
                  <div className="flex justify-end pt-2">
                    <CopyBtn
                      text={JSON.stringify({ header: decoded.header, payload: decoded.payload }, null, 2)}
                      label="Copy Full Decoded Output"
                      className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ ENCODER TAB ═══ */}
        {activeTab === "encode" && (
          <div className="space-y-6 animate-fade-in">
            {/* Algorithm selector */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-semibold">Algorithm</h2>
              </div>
              <div className="space-y-2">
                {[
                  { label: "HMAC (shared secret)", algs: HMAC_ALGS },
                  { label: "RSA",                  algs: RSA_ALGS  },
                  { label: "ECDSA",                algs: ECDSA_ALGS },
                  { label: "EdDSA",                algs: ["EdDSA"] as JwtAlgorithm[] },
                ].map((g) => (
                  <div key={g.label} className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground w-44 shrink-0">{g.label}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {g.algs.map((alg) => (
                        <button
                          key={alg}
                          onClick={() => setEncAlg(alg)}
                          className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors ${
                            encAlg === alg
                              ? "bg-accent text-accent-foreground border-accent"
                              : "bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {alg}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {encFamily === "eddsa" && (
                <p className="text-[11px] text-muted-foreground">
                  EdDSA (Ed25519) requires a current browser. Older Firefox/Safari may not expose it via WebCrypto.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Header input */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#f87171]">Header</span>
                  <span className="text-xs text-muted-foreground">JSON</span>
                </div>
                <textarea
                  value={encHeader}
                  onChange={(e) => setEncHeader(e.target.value)}
                  rows={5}
                  className={`${inputClass} w-full resize-none`}
                  spellCheck={false}
                />
              </div>

              {/* Payload input */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#c084fc]">Payload</span>
                  <span className="text-xs text-muted-foreground">JSON</span>
                </div>
                <textarea
                  value={encPayload}
                  onChange={(e) => setEncPayload(e.target.value)}
                  rows={5}
                  className={`${inputClass} w-full resize-none`}
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Signing key */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-accent" />
                  <h2 className="text-sm font-semibold">
                    {encFamily === "hmac" ? "Secret" : "Private key (PKCS#8 PEM)"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onGenerateEncoderKey}
                  disabled={encKeypairBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors disabled:opacity-60"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {encKeypairBusy
                    ? "Generating…"
                    : encFamily === "hmac"
                      ? "Generate secret"
                      : "Generate keypair"}
                </button>
              </div>

              {encFamily === "hmac" ? (
                <>
                  <JwtSecretInstructions />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <input
                        type={showSecret ? "text" : "password"}
                        value={encSecret}
                        onChange={(e) => setEncSecret(e.target.value)}
                        placeholder="Enter secret key..."
                        autoComplete="off"
                        className={`${inputClass} w-full pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={encSecretIsBase64}
                        onChange={(e) => setEncSecretIsBase64(e.target.checked)}
                        className="rounded border-border accent-accent"
                      />
                      Base64URL encoded
                    </label>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Use the same encoding your runtime expects: Base64URL + checked when the key is raw
                    bytes; unchecked when the secret is a literal string in env.
                  </p>
                </>
              ) : (
                <>
                  <textarea
                    value={encPrivatePem}
                    onChange={(e) => {
                      setEncPrivatePem(e.target.value);
                      // If the user pastes their own key, clear any previously-generated public key
                      // to avoid showing a mismatched pair.
                      if (encGeneratedPublicPem && detectPemKind(e.target.value) === "pkcs8") {
                        setEncGeneratedPublicPem("");
                      }
                    }}
                    placeholder={"-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----"}
                    rows={6}
                    className={`${inputClass} w-full resize-y`}
                    spellCheck={false}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    PKCS#8 only. Convert PKCS#1 / SEC1 keys first:{" "}
                    <code className="font-mono">openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in key.pem -out key-pkcs8.pem</code>
                  </p>
                  {encGeneratedPublicPem && (
                    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Matching public key (use this on the Decoder tab to verify)
                        </span>
                        <CopyBtn text={encGeneratedPublicPem} label="Copy" />
                      </div>
                      <pre className="text-[11px] font-mono text-foreground/80 whitespace-pre-wrap break-all max-h-40 overflow-auto scrollbar-thin">
                        {encGeneratedPublicPem}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Generated token */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Generated Token</h2>
                {encodedToken && <CopyBtn text={encodedToken} label="Copy" />}
              </div>

              {encodeError ? (
                <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {encodeError}
                </div>
              ) : encodedToken ? (
                <div className="rounded-lg border border-border bg-muted/30 p-4 max-h-36 overflow-auto scrollbar-thin">
                  <ColoredToken token={encodedToken} />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Fill in the header, payload, and secret to generate a JWT.
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* SEO content — server-rendered, crawlable */}
      <section className="max-w-6xl mx-auto px-4 pb-10 w-full border-t border-border pt-8 mt-2 space-y-3">
        <h2 className="text-base font-semibold text-foreground mt-6 mb-2">
          What is a JWT?
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A <strong>JSON Web Token</strong> (JWT) is a compact, URL-safe token
          format defined in{" "}
          <a
            href="https://www.rfc-editor.org/rfc/rfc7519"
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="text-accent hover:underline"
          >
            RFC 7519
          </a>
          . It consists of three Base64url-encoded sections separated by dots:{" "}
          <strong>header</strong>, <strong>payload</strong>, and{" "}
          <strong>signature</strong>. JWTs are most commonly used as bearer
          tokens in HTTP Authorization headers to authenticate API requests
          without server-side session storage.
        </p>

        <h2 className="text-base font-semibold text-foreground mt-6 mb-2">
          JWT structure: header, payload, signature
        </h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>
            <strong>Header</strong> — a JSON object declaring the token type (
            <code className="font-mono text-xs">typ: &quot;JWT&quot;</code>) and
            signing algorithm (e.g.{" "}
            <code className="font-mono text-xs">alg: &quot;HS256&quot;</code>
            ).
          </li>
          <li>
            <strong>Payload</strong> — the claims: registered claims like{" "}
            <code className="font-mono text-xs">iss</code> (issuer),{" "}
            <code className="font-mono text-xs">sub</code> (subject),{" "}
            <code className="font-mono text-xs">exp</code> (expiry), and{" "}
            <code className="font-mono text-xs">iat</code> (issued-at), plus any
            custom application data.
          </li>
          <li>
            <strong>Signature</strong> — a cryptographic MAC or digital
            signature over the header and payload. Verifying this signature
            proves the token was not tampered with and was issued by the expected
            party.
          </li>
        </ul>

        <h2 className="text-base font-semibold text-foreground mt-6 mb-2">
          Supported signing algorithms
        </h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>
            <strong>HS256 / HS384 / HS512</strong> — HMAC with SHA-2. Uses a
            shared secret key known by both issuer and verifier. Fast and simple;
            cannot verify without knowing the secret.
          </li>
          <li>
            <strong>RS256 / RS384 / RS512</strong> — RSA with SHA-2. Signed
            with a private key; anyone with the public key can verify. Common in
            OAuth 2.0 / OIDC identity providers.
          </li>
          <li>
            <strong>ES256 / ES384 / ES512</strong> — ECDSA. Smaller signatures
            and keys than RSA at equivalent security levels.
          </li>
        </ul>

        <h2 className="text-base font-semibold text-foreground mt-6 mb-2">
          Security warning: JWTs are not encrypted by default
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The header and payload of a standard JWT are only Base64url-encoded —
          anyone who obtains the token can read its contents. Never put
          sensitive data (passwords, PII, secrets) in a JWT payload unless you
          are using JWE (JSON Web Encryption). Signing proves integrity and
          authenticity; it does not provide confidentiality.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Also useful:{" "}
          <a href="/tools/base64-decode" className="text-accent hover:underline">
            Base64 Decode
          </a>
          {", "}
          <a href="/tools/hash-generator" className="text-accent hover:underline">
            Hash Generator
          </a>
          {", "}
          <a href="/tools/aes-encrypt-decrypt" className="text-accent hover:underline">
            AES Encryptor
          </a>
          .
        </p>
      </section>
    </>
  );
}
