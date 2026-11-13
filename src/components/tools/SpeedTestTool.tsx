"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  Copy,
  Gauge,
  Play,
  RotateCw,
  Server,
  Square,
  Waves,
} from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import { copyWithFeedback } from "@/lib/clipboard";

// ─── Test endpoints ───────────────────────────────────────────────────────────
// Cloudflare's public speed endpoints: CORS-enabled (verified), no API key,
// nearest edge picked automatically via anycast routing.

const DOWN_URL = "https://speed.cloudflare.com/__down";
const UP_URL = "https://speed.cloudflare.com/__up";
const TRACE_URL = "https://speed.cloudflare.com/cdn-cgi/trace";

// Byte counter shared by the download reader and the upload progress handler.
const bytesRef = { current: 0 };

const PING_SAMPLES = 10;
const PHASE_MS = 10_000;
const TICK_MS = 150;
const DOWN_STREAMS = 6;
const UP_STREAMS = 3;
const UP_CHUNK_BYTES = 4_000_000;

type Phase = "idle" | "ping" | "download" | "upload" | "done" | "error";
type Series = "d" | "u";
type Edge = { colo: string; loc: string; ip: string };

// ─── Math / formatting helpers ────────────────────────────────────────────────

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Steady-state throughput: mean of the best consecutive ~1s window of tick
 * samples. Discards the slow start (TCP ramp-up) and any tail dip when
 * streams finish at slightly different times — the same idea speed-test
 * sites use to report a stable number.
 */
function bestWindowMbps(samples: number[]): number {
  if (samples.length === 0) return 0;
  const win = Math.max(1, Math.round(1000 / TICK_MS));
  if (samples.length <= win) return mean(samples);
  let best = 0;
  for (let i = 0; i + win <= samples.length; i++) {
    let sum = 0;
    for (let j = i; j < i + win; j++) sum += samples[j];
    best = Math.max(best, sum / win);
  }
  return best;
}

function fmtM(mbps: number): string {
  return mbps >= 100 ? Math.round(mbps).toString() : mbps.toFixed(1);
}

function niceCeil(v: number): number {
  if (v <= 0) return 10;
  const target = v * 1.15;
  const mag = Math.pow(10, Math.floor(Math.log10(target)));
  const norm = target / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

// ─── Contextual ratings (honest, no fake percentiles) ─────────────────────────

interface Rating {
  label: string;
  note: string;
  tone: string;
}

function rateDownload(mbps: number): Rating {
  const tone = "border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-400";
  if (mbps >= 250) return { label: "Exceptional", note: "Several 4K streams, cloud gaming and huge downloads all at once.", tone };
  if (mbps >= 100) return { label: "Excellent", note: "Multiple 4K streams plus heavy work-from-home use.", tone };
  if (mbps >= 50) return { label: "Very good", note: "4K streaming, video calls and fast downloads for everyone at home.", tone: "border-sky-500/30 bg-sky-500/5 text-sky-800 dark:text-sky-400" };
  if (mbps >= 25) return { label: "Good", note: "Full-HD streaming and video calls with room to multitask.", tone: "border-sky-500/30 bg-sky-500/5 text-sky-800 dark:text-sky-400" };
  if (mbps >= 10) return { label: "Fair", note: "HD streaming and browsing; a couple of devices at a time.", tone: "border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-400" };
  if (mbps >= 5) return { label: "Basic", note: "Browsing, music and SD video — light use only.", tone: "border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-400" };
  return { label: "Slow", note: "Basic browsing may buffer; pause heavy downloads and re-test.", tone: "border-destructive/30 bg-destructive/5 text-destructive" };
}

function rateUpload(mbps: number): string {
  if (mbps >= 20) return "Great for big uploads and 4K calls";
  if (mbps >= 5) return "Solid for HD video calls";
  if (mbps >= 1) return "OK for messaging and light calls";
  return "Very low — calls may struggle";
}

function pingNote(ms: number): string {
  if (ms < 15) return "Excellent — great for gaming";
  if (ms < 40) return "Good — responsive for most uses";
  if (ms < 80) return "Fair — noticeable in realtime games";
  return "High — closer servers will feel snappier";
}

function jitterNote(ms: number): string {
  if (ms < 5) return "Very stable connection";
  if (ms < 15) return "Mostly stable";
  return "Unstable — may cause call stutter";
}

// ─── Measurement primitives ───────────────────────────────────────────────────

async function fetchEdge(signal: AbortSignal): Promise<Edge | null> {
  try {
    const text = await fetch(TRACE_URL, { cache: "no-store", signal }).then((r) => r.text());
    const kv: Record<string, string> = {};
    for (const line of text.split("\n")) {
      const eq = line.indexOf("=");
      if (eq > 0) kv[line.slice(0, eq)] = line.slice(eq + 1);
    }
    if (!kv.colo) return null;
    return { colo: kv.colo, loc: kv.loc ?? "", ip: kv.ip ?? "" };
  } catch {
    return null;
  }
}

async function measurePing(signal: AbortSignal): Promise<{ ping: number; jitter: number }> {
  const rtts: number[] = [];
  for (let i = 0; i < PING_SAMPLES; i++) {
    const t0 = performance.now();
    const res = await fetch(`${DOWN_URL}?bytes=1&r=${Math.random().toString(36).slice(2)}`, {
      cache: "no-store",
      signal,
    });
    await res.arrayBuffer();
    rtts.push(performance.now() - t0);
  }
  // First sample includes connection setup — exclude it from the statistics.
  const warm = rtts.length > 1 ? rtts.slice(1) : rtts;
  const best = Math.min(...warm);
  let jSum = 0;
  for (let i = 1; i < warm.length; i++) jSum += Math.abs(warm[i] - warm[i - 1]);
  const jitter = warm.length > 1 ? jSum / (warm.length - 1) : 0;
  return { ping: Math.round(best), jitter: Math.round(jitter * 10) / 10 };
}

async function downloadPhase(signal: AbortSignal): Promise<void> {
  const deadline = performance.now() + PHASE_MS;
  const oneStream = async () => {
    let chunk = 1_000_000;
    while (performance.now() < deadline && !signal.aborted) {
      let res: Response;
      try {
        res = await fetch(`${DOWN_URL}?bytes=${chunk}&r=${Math.random().toString(36).slice(2)}`, {
          cache: "no-store",
          signal,
        });
      } catch {
        return; // aborted or network error — end this stream
      }
      if (!res.ok || !res.body) return;
      const reader = res.body.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          bytesRef.current += value.byteLength;
          if (signal.aborted) break;
        }
      } finally {
        await reader.cancel().catch(() => {});
      }
      chunk = Math.min(chunk * 2, 12_000_000); // grow so fast links stay saturated
    }
  };
  await Promise.all(Array.from({ length: DOWN_STREAMS }, () => oneStream()));
}

function makeChunk(size: number): Blob {
  const buf = new Uint8Array(size);
  for (let off = 0; off < size; off += 65_536) {
    crypto.getRandomValues(buf.subarray(off, Math.min(off + 65_536, size)));
  }
  return new Blob([buf], { type: "application/octet-stream" });
}

function postChunk(blob: Blob, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const xhr = new XMLHttpRequest();
    const onAbortSignal = () => xhr.abort();
    signal.addEventListener("abort", onAbortSignal, { once: true });
    const cleanup = () => signal.removeEventListener("abort", onAbortSignal);
    let counted = 0;
    xhr.open("POST", UP_URL);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      bytesRef.current += e.loaded - counted;
      counted = e.loaded;
    };
    xhr.onload = () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`upload HTTP ${xhr.status}`));
    };
    xhr.onerror = () => {
      cleanup();
      reject(new Error("upload network error"));
    };
    xhr.onabort = () => {
      cleanup();
      resolve();
    };
    xhr.send(blob);
  });
}

async function uploadPhase(signal: AbortSignal): Promise<void> {
  const blob = makeChunk(UP_CHUNK_BYTES);
  const deadline = performance.now() + PHASE_MS;
  const oneStream = async () => {
    while (performance.now() < deadline && !signal.aborted) {
      try {
        await postChunk(blob, signal);
      } catch {
        return; // server rejected the request — end this stream
      }
    }
  };
  await Promise.all(Array.from({ length: UP_STREAMS }, () => oneStream()));
}

// ─── Small presentational pieces ──────────────────────────────────────────────

function StatCard({ label, value, note, icon }: { label: string; value: string; note: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SpeedTestTool({ tool }: { tool: Tool }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [live, setLive] = useState(0);
  const [ping, setPing] = useState<number | null>(null);
  const [jitter, setJitter] = useState<number | null>(null);
  const [down, setDown] = useState<number | null>(null);
  const [up, setUp] = useState<number | null>(null);
  const [edge, setEdge] = useState<Edge | null>(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastBytesRef = useRef(0);
  const lastTickRef = useRef(0);
  const phaseStartRef = useRef(0);
  const progressRef = useRef(0);
  const seriesRef = useRef<Series>("d");
  const samplesRef = useRef<{ d: number[]; u: number[] }>({ d: [], u: [] });

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 640;
    const cssH = 180;
    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const padL = 42;
    const padR = 10;
    const padT = 10;
    const padB = 22;
    const plotW = cssW - padL - padR;
    const plotH = cssH - padT - padB;
    const { d, u } = samplesRef.current;
    const max = niceCeil(Math.max(0, ...d, ...u));

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.font = "10px system-ui, -apple-system, sans-serif";

    // grid + y labels (Mbps)
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= 4; i++) {
      const y = padT + plotH - (i / 4) * plotH;
      ctx.strokeStyle = i === 0 ? "rgba(128,128,150,0.35)" : "rgba(128,128,150,0.15)";
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
      ctx.fillStyle = "rgba(128,128,150,0.9)";
      ctx.fillText(String(Math.round((max / 4) * i)), padL - 6, y);
    }

    const drawSeries = (arr: number[], color: string, fill: string) => {
      if (arr.length === 0) return;
      const n = Math.max(arr.length - 1, 1);
      const px = (i: number) => padL + (i / n) * plotW;
      const py = (v: number) => padT + plotH - (Math.min(v, max) / max) * plotH;
      ctx.beginPath();
      ctx.moveTo(px(0), padT + plotH);
      arr.forEach((v, i) => ctx.lineTo(px(i), py(v)));
      ctx.lineTo(px(arr.length - 1), padT + plotH);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.beginPath();
      arr.forEach((v, i) => (i === 0 ? ctx.moveTo(px(0), py(v)) : ctx.lineTo(px(i), py(v))));
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();
    };

    drawSeries(d, "#6366f1", "rgba(99,102,241,0.12)");
    drawSeries(u, "#f59e0b", "rgba(245,158,11,0.12)");

    // live phase-progress marker
    const p = progressRef.current;
    if (p > 0 && p < 1) {
      const x = padL + p * plotW;
      ctx.strokeStyle = "rgba(128,128,150,0.5)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // x labels (seconds)
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(128,128,150,0.9)";
    for (let s = 0; s <= 10; s += 5) {
      const x = padL + (s / 10) * plotW;
      ctx.textAlign = s === 0 ? "left" : s === 10 ? "right" : "center";
      ctx.fillText(`${s}s`, x, padT + plotH + 6);
    }

    // legend (top-right, inside the plot)
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    let legendY = padT + 2;
    if (u.length) {
      ctx.fillStyle = "#f59e0b";
      ctx.fillText("● Upload", padL + plotW, legendY);
      legendY += 13;
    }
    if (d.length) {
      ctx.fillStyle = "#6366f1";
      ctx.fillText("● Download", padL + plotW, legendY);
    }
  }, []);

  useEffect(() => {
    drawGraph();
    const onResize = () => drawGraph();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawGraph]);

  // Abort any in-flight run when the tool unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const signal = ctrl.signal;

    setErr("");
    setCopied(false);
    setPing(null);
    setJitter(null);
    setDown(null);
    setUp(null);
    setLive(0);
    setPhase("ping");
    samplesRef.current = { d: [], u: [] };
    progressRef.current = 0;

    fetchEdge(signal).then((e) => {
      if (e && !signal.aborted) setEdge(e);
    });

    const tick = () => {
      const now = performance.now();
      const dt = (now - lastTickRef.current) / 1000;
      if (dt <= 0) return;
      const delta = bytesRef.current - lastBytesRef.current;
      lastTickRef.current = now;
      lastBytesRef.current = bytesRef.current;
      const mbps = Math.max(0, (delta * 8) / dt / 1e6);
      samplesRef.current[seriesRef.current].push(mbps);
      progressRef.current = Math.min(1, (now - phaseStartRef.current) / PHASE_MS);
      setLive((prev) => prev * 0.45 + mbps * 0.55);
      drawGraph();
    };

    try {
      const { ping: pingMs, jitter: jitterMs } = await measurePing(signal);
      if (signal.aborted) return;
      setPing(pingMs);
      setJitter(jitterMs);

      const ticker = window.setInterval(tick, TICK_MS);
      try {
        // ── Download ──
        bytesRef.current = 0;
        lastBytesRef.current = 0;
        lastTickRef.current = performance.now();
        phaseStartRef.current = performance.now();
        progressRef.current = 0;
        seriesRef.current = "d";
        samplesRef.current.d = [];
        setLive(0);
        setPhase("download");
        await downloadPhase(signal);
        if (signal.aborted) return;
        if (bytesRef.current === 0) throw new Error("download");
        setDown(bestWindowMbps(samplesRef.current.d));

        // ── Upload ──
        bytesRef.current = 0;
        lastBytesRef.current = 0;
        lastTickRef.current = performance.now();
        phaseStartRef.current = performance.now();
        progressRef.current = 0;
        seriesRef.current = "u";
        samplesRef.current.u = [];
        setLive(0);
        setPhase("upload");
        await uploadPhase(signal);
        if (signal.aborted) return;
        if (bytesRef.current === 0) throw new Error("upload");
        setUp(bestWindowMbps(samplesRef.current.u));

        progressRef.current = 0;
        drawGraph();
        setPhase("done");
      } finally {
        window.clearInterval(ticker);
      }
    } catch (e) {
      if (signal.aborted || (e instanceof DOMException && e.name === "AbortError")) return;
      const msg =
        e instanceof Error && e.message === "download"
          ? "Couldn't download test data. Check your connection, VPN, or any request-blocking extension and try again."
          : e instanceof Error && e.message === "upload"
            ? "Couldn't upload test data. The connection may be blocking large POST requests — try again."
            : "The test failed unexpectedly. Check your connection and try again.";
      setPhase("error");
      setErr(msg);
    }
  }, [drawGraph]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    progressRef.current = 0;
    setPhase("idle");
    setLive(0);
  }, []);

  const copyResults = async () => {
    const text = [
      "DevBench internet speed test",
      `Ping: ${ping ?? "—"} ms · Jitter: ${jitter ?? "—"} ms`,
      `Download: ${down != null ? fmtM(down) : "—"} Mbps · Upload: ${up != null ? fmtM(up) : "—"} Mbps`,
      edge ? `Edge: Cloudflare ${edge.colo}${edge.loc ? ` (${edge.loc})` : ""}` : "Edge: Cloudflare",
    ].join("\n");
    if (!(await copyWithFeedback(text))) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const running = phase === "ping" || phase === "download" || phase === "upload";
  const rating = down != null ? rateDownload(down) : null;
  const devices = down != null ? Math.max(1, Math.min(30, Math.round(down / 12))) : 0;

  const chips: { key: Exclude<Phase, "idle" | "done" | "error">; label: string }[] = [
    { key: "ping", label: "Ping" },
    { key: "download", label: "Download" },
    { key: "upload", label: "Upload" },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        {/* Phase chips */}
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => {
            const active = phase === c.key;
            const doneChip =
              c.key === "ping" ? ping != null : c.key === "download" ? down != null : up != null;
            return (
              <span
                key={c.key}
                aria-current={active ? "step" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                  active
                    ? "border-accent bg-accent/10 text-accent"
                    : doneChip
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "border-border text-muted-foreground"
                }`}
              >
                {doneChip && !active ? (
                  <Check className="h-3 w-3" />
                ) : active ? (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                ) : null}
                {c.label}
              </span>
            );
          })}
        </div>

        {/* Screen-reader status */}
        <p className="sr-only" role="status" aria-live="polite">
          {phase === "ping" && "Testing latency."}
          {phase === "download" && "Measuring download speed."}
          {phase === "upload" && "Measuring upload speed."}
          {phase === "done" &&
            `Test complete. Ping ${ping} milliseconds, jitter ${jitter} milliseconds, download ${
              down != null ? fmtM(down) : "?"
            } megabits per second, upload ${up != null ? fmtM(up) : "?"} megabits per second.`}
          {phase === "error" && `Test failed. ${err}`}
        </p>

        {/* Idle panel */}
        {phase === "idle" && (
          <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-6 text-center">
            <Gauge className="mx-auto h-8 w-8 text-accent" aria-hidden />
            <p className="mx-auto max-w-lg text-sm text-muted-foreground">
              Measures ping, jitter, download and upload between your browser and Cloudflare&apos;s
              nearest edge. Nothing runs until you press Start.
            </p>
          </div>
        )}

        {/* Error */}
        {phase === "error" && (
          <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {err}
          </div>
        )}

        {/* Live gauge */}
        {running && (
          <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {phase === "ping"
                ? "Testing latency…"
                : phase === "download"
                  ? "Download speed"
                  : "Upload speed"}
            </p>
            <p className="mt-2 text-5xl font-bold tabular-nums tracking-tight">
              {phase === "ping" ? (
                <span className="text-3xl">…</span>
              ) : (
                <>
                  {fmtM(live)}
                  <span className="ml-2 text-xl font-semibold text-muted-foreground">Mbps</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Live graph */}
        <div className="rounded-xl border border-border p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Speed over time</p>
            {(phase === "download" || phase === "upload") && (
              <p className="text-xs tabular-nums text-muted-foreground">{fmtM(live)} Mbps now</p>
            )}
          </div>
          <canvas
            ref={canvasRef}
            className="block h-[180px] w-full"
            role="img"
            aria-label="Graph of measured speed over time"
          />
        </div>

        {/* Results */}
        {phase === "done" && down != null && up != null && ping != null && jitter != null && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Ping" value={`${ping} ms`} note={pingNote(ping)} icon={<Activity className="h-3.5 w-3.5" />} />
              <StatCard label="Jitter" value={`${jitter} ms`} note={jitterNote(jitter)} icon={<Waves className="h-3.5 w-3.5" />} />
              <StatCard label="Download" value={`${fmtM(down)} Mbps`} note={rating?.label ?? ""} icon={<ArrowDownToLine className="h-3.5 w-3.5" />} />
              <StatCard label="Upload" value={`${fmtM(up)} Mbps`} note={rateUpload(up)} icon={<ArrowUpFromLine className="h-3.5 w-3.5" />} />
            </div>
            {rating && (
              <div className={`rounded-xl border p-4 text-sm ${rating.tone}`}>
                <p>
                  <strong className="text-base">{rating.label}</strong> — {rating.note}
                </p>
                <p className="mt-1 text-xs opacity-80">
                  Rough guide: smooth for about {devices} connected devices at once. Real-world
                  speeds vary by site, server and Wi-Fi.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Edge / server info */}
        {edge && (
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <Server className="h-3.5 w-3.5" aria-hidden />
            Edge server: Cloudflare {edge.colo}
            {edge.loc && <span>· {edge.loc}</span>}
            {edge.ip && <span>· your IP as seen by the edge: {edge.ip}</span>}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {running ? (
            <button
              type="button"
              onClick={stop}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted"
            >
              <Square className="h-4 w-4" />
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={run}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
            >
              {phase === "done" || phase === "error" ? (
                <RotateCw className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {phase === "done" ? "Test again" : phase === "error" ? "Try again" : "Start speed test"}
            </button>
          )}
          {phase === "done" && (
            <button
              type="button"
              onClick={copyResults}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy results"}
            </button>
          )}
        </div>

        {/* Methodology */}
        <p className="text-xs text-muted-foreground">
          Tested against Cloudflare&apos;s public speed endpoints (speed.cloudflare.com) — the same
          edge network that serves a large share of the web. Other speed sites may report different
          numbers because they test different servers; for the most consistent picture, run any test
          a couple of times with other downloads paused. This tool measures only when you press
          Start.
        </p>
      </div>
    </main>
  );
}
