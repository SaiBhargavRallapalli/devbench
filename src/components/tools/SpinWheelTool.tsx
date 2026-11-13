"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Play, Plus, RotateCcw, Trash2, Trophy, X } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import { trackToolDownload } from "@/lib/analytics-events";

// ─── Types & constants ────────────────────────────────────────────────────────

type Segment = { label: string; weight: number };
type HistoryEntry = { label: string; at: string };

interface StoredWheel {
  segments: Segment[];
  eliminated: string[];
  elimination: boolean;
  sound: boolean;
  durationMs: number;
  history: HistoryEntry[];
}

const STORAGE_KEY = "devbench-spin-wheel.v1";
const MAX_SEGMENTS = 40;
const TWO_PI = Math.PI * 2;

const PALETTE = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
  "#84cc16",
  "#14b8a6",
  "#eab308",
  "#3b82f6",
];

const DEFAULT_SEGMENTS: Segment[] = [
  { label: "Yes", weight: 1 },
  { label: "No", weight: 1 },
  { label: "Maybe", weight: 1 },
];

const PRESETS: { name: string; segments: Segment[] }[] = [
  { name: "Yes / No", segments: [{ label: "Yes", weight: 1 }, { label: "No", weight: 1 }] },
  {
    name: "1 – 10",
    segments: Array.from({ length: 10 }, (_, i) => ({ label: String(i + 1), weight: 1 })),
  },
  {
    name: "Colors",
    segments: ["Red", "Orange", "Yellow", "Green", "Blue", "Purple"].map((label) => ({
      label,
      weight: 1,
    })),
  },
  {
    name: "Food",
    segments: ["Pizza", "Sushi", "Burgers", "Tacos", "Pasta", "Salad", "Ramen", "Dessert"].map(
      (label) => ({ label, weight: 1 })
    ),
  },
  {
    name: "Icebreaker",
    segments: [
      "Mountains or beach?",
      "Cats or dogs?",
      "First job?",
      "Best superhero?",
      "Fly or invisibility?",
      "Tea or coffee?",
    ].map((label) => ({ label, weight: 1 })),
  },
];

const DURATIONS = [
  { value: 2000, label: "Fast (2s)" },
  { value: 4000, label: "Standard (4s)" },
  { value: 7000, label: "Long (7s)" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const norm = (a: number) => ((a % TWO_PI) + TWO_PI) % TWO_PI;

/** Pick readable text color for a hex background (WCAG-ish luminance). */
function readableText(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#ffffff";
  const ch = (i: number) => parseInt(h.slice(i, i + 2), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const l = 0.2126 * lin(ch(0)) + 0.7152 * lin(ch(2)) + 0.0722 * lin(ch(4));
  return l > 0.42 ? "#1f2937" : "#ffffff";
}

function loadConfig(): StoredWheel | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredWheel>;
    const segments = Array.isArray(parsed.segments)
      ? parsed.segments
          .filter(
            (s): s is Segment =>
              !!s &&
              typeof s.label === "string" &&
              typeof s.weight === "number" &&
              s.weight > 0
          )
          .slice(0, MAX_SEGMENTS)
      : [];
    return {
      segments: segments.length >= 2 ? segments : DEFAULT_SEGMENTS,
      eliminated: Array.isArray(parsed.eliminated) ? parsed.eliminated.filter((x) => typeof x === "string") : [],
      elimination: Boolean(parsed.elimination),
      sound: parsed.sound !== false,
      durationMs:
        typeof parsed.durationMs === "number" && parsed.durationMs >= 1000 && parsed.durationMs <= 10000
          ? parsed.durationMs
          : 4000,
      history: Array.isArray(parsed.history)
        ? parsed.history
            .filter((h) => h && typeof h.label === "string" && typeof h.at === "string")
            .slice(0, 30)
        : [],
    };
  } catch {
    return null;
  }
}

// One load per page session (module cache). The component mounts ssr:false,
// so this only ever runs in the browser.
let bootCache: StoredWheel | null | undefined;
function getBoot(): StoredWheel | null {
  if (bootCache === undefined) bootCache = loadConfig();
  return bootCache;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SpinWheelTool({ tool }: { tool: Tool }) {
  const boot = getBoot();

  const [segments, setSegments] = useState<Segment[]>(() => boot?.segments ?? DEFAULT_SEGMENTS);
  const [eliminated, setEliminated] = useState<Set<string>>(() => new Set(boot?.eliminated ?? []));
  const [elimination, setElimination] = useState<boolean>(() => boot?.elimination ?? false);
  const [sound, setSound] = useState<boolean>(() => boot?.sound ?? true);
  const [durationMs, setDurationMs] = useState<number>(() => boot?.durationMs ?? 4000);
  const [history, setHistory] = useState<HistoryEntry[]>(() => boot?.history ?? []);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [winnerLabel, setWinnerLabel] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundRef = useRef(sound);
  const lastTickAtRef = useRef(0);
  const lastSegRef = useRef(-1);

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  const active = useMemo(
    () => segments.filter((s) => s.label.trim().length > 0 && !eliminated.has(s.label)),
    [segments, eliminated]
  );
  const roundOver = eliminated.size > 0 && active.length === 1;
  const canSpin = !spinning && active.length >= 2 && !roundOver;

  // ── Persistence ──────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const payload: StoredWheel = {
        segments,
        eliminated: [...eliminated],
        elimination,
        sound,
        durationMs,
        history,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // private mode / storage full — preferences just don't persist
    }
  }, [segments, eliminated, elimination, sound, durationMs, history]);

  // ── Audio (created inside the first spin gesture so autoplay policy is happy) ─
  const ensureAudio = useCallback((): AudioContext | null => {
    if (!soundRef.current) return null;
    if (!audioCtxRef.current) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      audioCtxRef.current = new Ctor();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  }, []);

  const tickSound = useCallback(() => {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 1150;
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }, [ensureAudio]);

  const chime = useCallback(() => {
    const ctx = ensureAudio();
    if (!ctx) return;
    [784, 1046.5, 1318.5].forEach((freq, i) => {
      const t0 = ctx.currentTime + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.11, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.26);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.3);
    });
  }, [ensureAudio]);

  // ── Drawing ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssSize = canvas.clientWidth || 440;
    if (canvas.width !== Math.round(cssSize * dpr)) {
      canvas.width = Math.round(cssSize * dpr);
      canvas.height = Math.round(cssSize * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssSize, cssSize);

    const styles = getComputedStyle(document.documentElement);
    const card = styles.getPropertyValue("--card").trim() || "#ffffff";
    const border = styles.getPropertyValue("--border").trim() || "#e5e7eb";
    const accent = styles.getPropertyValue("--accent").trim() || "#4f46e5";
    const muted = styles.getPropertyValue("--muted-foreground").trim() || "#6b7280";

    const cx = cssSize / 2;
    const cy = cssSize / 2;
    const R = cssSize / 2 - 16;
    const hub = R * 0.24;
    const total = active.reduce((sum, s) => sum + s.weight, 0);

    if (active.length === 0 || total <= 0) {
      ctx.strokeStyle = border;
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TWO_PI);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = muted;
      ctx.font = "14px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Add at least 2 options", cx, cy);
      return;
    }

    const rotation = rotationRef.current;
    const spans = active.map((s) => (s.weight / total) * TWO_PI);
    const starts: number[] = [];
    let acc = 0;
    for (const span of spans) {
      starts.push(acc);
      acc += span;
    }

    // Segments
    const fs = Math.max(11, Math.min(16, R * 0.075));
    active.forEach((seg, i) => {
      const a0 = -Math.PI / 2 + starts[i] + rotation;
      const a1 = a0 + spans[i];
      const color = PALETTE[Math.max(0, segments.findIndex((s) => s.label === seg.label)) % PALETTE.length];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, a0, a1);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label along the radius, flipped on the left half so text stays upright
      const mid = a0 + spans[i] / 2;
      const cosMid = Math.cos(mid);
      const flip = cosMid < 0;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(flip ? mid + Math.PI : mid);
      ctx.font = `600 ${fs}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = readableText(color);
      ctx.textBaseline = "middle";
      const maxW = (R - hub) * 0.84;
      let label = seg.label;
      while (label.length > 1 && ctx.measureText(label).width > maxW) {
        label = label.slice(0, -1);
      }
      if (label !== seg.label) label = `${label.trimEnd()}…`;
      const w = ctx.measureText(label).width;
      const r0 = hub + (R - hub - w) * 0.42;
      ctx.textAlign = "left";
      if (flip) {
        ctx.translate(-r0 - w, 0);
        ctx.textAlign = "left";
      } else {
        ctx.translate(r0, 0);
      }
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });

    // Winner highlight arc
    if (winnerLabel) {
      const wi = active.findIndex((s) => s.label === winnerLabel);
      if (wi >= 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, R - 2, -Math.PI / 2 + starts[wi] + rotation, -Math.PI / 2 + starts[wi] + spans[wi] + rotation);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 5;
        ctx.stroke();
      }
    }

    // Hub
    ctx.beginPath();
    ctx.arc(cx, cy, hub, 0, TWO_PI);
    ctx.fillStyle = card;
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointer (top, overlapping the rim)
    ctx.beginPath();
    ctx.moveTo(cx - 11, cy - R - 4);
    ctx.lineTo(cx + 11, cy - R - 4);
    ctx.lineTo(cx, cy - R + 20);
    ctx.closePath();
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.strokeStyle = card;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [active, segments, winnerLabel]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Redraw when the theme changes (hub/pointer colors read CSS variables).
  useEffect(() => {
    const onChange = () => draw();
    window.addEventListener("devbench:prefs-changed", onChange);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("devbench:prefs-changed", onChange);
      mq.removeEventListener("change", onChange);
    };
  }, [draw]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  // ── Spin ─────────────────────────────────────────────────────────────────────
  const spin = useCallback(() => {
    if (!canSpin || spinning) return;
    const list = active;
    const total = list.reduce((sum, s) => sum + s.weight, 0);
    if (list.length < 2 || total <= 0) return;

    // Deterministic weighted pick: each slice's chance equals its weight.
    let roll = Math.random() * total;
    let winIdx = 0;
    for (let i = 0; i < list.length; i++) {
      roll -= list[i].weight;
      if (roll <= 0) {
        winIdx = i;
        break;
      }
      winIdx = i;
    }
    const winner = list[winIdx];

    // Spans in draw order — must mirror draw() exactly.
    const spans = list.map((s) => (s.weight / total) * TWO_PI);
    let cum = 0;
    for (let i = 0; i < winIdx; i++) cum += spans[i];
    // Land the winner's centre under the top pointer, jittered inside its
    // middle 60% so the stop never sits ambiguous on a boundary.
    const jitter = (Math.random() - 0.5) * spans[winIdx] * 0.6;
    const target = -(cum + spans[winIdx] / 2 + jitter);
    const current = rotationRef.current;
    const delta = norm(target - current);
    const baseTurns = durationMs <= 2000 ? 3 : durationMs <= 4000 ? 5 : 8;
    const turns = baseTurns + (Math.random() < 0.5 ? 1 : 0);
    const finalRotation = current + turns * TWO_PI + delta;

    setSpinning(true);
    setResult(null);
    if (soundRef.current) ensureAudio(); // unlock audio inside the click gesture

    const finish = () => {
      rotationRef.current = finalRotation;
      setSpinning(false);
      setResult(winner.label);
      setWinnerLabel(winner.label);
      const at = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setHistory((h) => [{ label: winner.label, at }, ...h].slice(0, 30));
      if (soundRef.current) chime();
      if (elimination) {
        setEliminated((prev) => new Set(prev).add(winner.label));
      }
      draw();
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Functional, near-instant result — no spin animation at all.
      finish();
      return;
    }

    const start = performance.now();
    lastSegRef.current = -1;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 4); // ease-out quart
      rotationRef.current = current + (finalRotation - current) * eased;

      // Tick whenever the pointer crosses into a new slice.
      const local = norm(-rotationRef.current);
      let acc2 = 0;
      let idx = list.length - 1;
      for (let i = 0; i < spans.length; i++) {
        acc2 += spans[i];
        if (local < acc2) {
          idx = i;
          break;
        }
      }
      if (idx !== lastSegRef.current) {
        lastSegRef.current = idx;
        if (soundRef.current && now - lastTickAtRef.current > 22) {
          lastTickAtRef.current = now;
          tickSound();
        }
      }

      draw();
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
        finish();
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, [active, canSpin, spinning, durationMs, elimination, ensureAudio, tickSound, chime, draw]);

  // ── Editing ──────────────────────────────────────────────────────────────────
  const updateSegment = (i: number, patch: Partial<Segment>) => {
    setSegments((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };
  const removeSegment = (i: number) => {
    setSegments((prev) => (prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)));
  };
  const addSegment = () => {
    setSegments((prev) =>
      prev.length >= MAX_SEGMENTS ? prev : [...prev, { label: `Option ${prev.length + 1}`, weight: 1 }]
    );
  };
  const applyPreset = (preset: Segment[]) => {
    if (spinning) return;
    setSegments(preset.map((s) => ({ ...s })));
    setEliminated(new Set());
    setResult(null);
    setWinnerLabel(null);
  };
  const newRound = () => {
    setEliminated(new Set());
    setResult(null);
    setWinnerLabel(null);
  };
  const clearHistory = () => setHistory([]);

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "spin-wheel.png";
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      trackToolDownload("spin-wheel", "png");
    }, "image/png");
  };

  const wheelLabel = `Spin wheel with ${active.length} options: ${active
    .slice(0, 12)
    .map((s) => s.label)
    .join(", ")}${active.length > 12 ? ", …" : ""}`;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* ── Wheel ── */}
          <div className="space-y-4">
            <div className="relative mx-auto w-full max-w-[440px]">
              <canvas
                ref={canvasRef}
                className="block aspect-square w-full"
                role="img"
                aria-label={wheelLabel}
              />
              <button
                type="button"
                onClick={spin}
                disabled={!canSpin}
                aria-label={spinning ? "Spinning" : "Spin the wheel"}
                className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-sm font-bold tracking-wide text-accent-foreground shadow-lg transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 disabled:opacity-60 enabled:hover:scale-105 enabled:active:scale-95"
              >
                {spinning ? (
                  <span className="animate-pulse">…</span>
                ) : (
                  <span className="flex flex-col items-center gap-0.5">
                    <Play className="h-5 w-5" aria-hidden />
                    SPIN
                  </span>
                )}
              </button>
            </div>

            {/* Result */}
            <div
              role="status"
              aria-live="polite"
              className="min-h-[52px] rounded-xl border border-border bg-muted/30 px-4 py-3 text-center"
            >
              {roundOver && active.length === 1 ? (
                <p className="flex items-center justify-center gap-2 text-sm font-semibold">
                  <Trophy className="h-4 w-4 text-amber-500" aria-hidden />
                  {active[0].label} wins the round!
                </p>
              ) : result ? (
                <p className="text-sm">
                  <span className="text-muted-foreground">Result:</span>{" "}
                  <strong className="text-base">{result}</strong>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Tap SPIN — or focus it and press Space / Enter. Slice size follows each
                  option&apos;s weight.
                </p>
              )}
            </div>

            {(roundOver || eliminated.size > 0) && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={newRound}
                  disabled={spinning}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-40"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  New round
                </button>
              </div>
            )}
          </div>

          {/* ── Controls ── */}
          <div className="space-y-5">
            {/* Presets */}
            <div>
              <p className="mb-2 text-sm font-medium">Presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p.segments)}
                    disabled={spinning}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">
                  Options <span className="text-xs font-normal text-muted-foreground">({segments.length}/{MAX_SEGMENTS})</span>
                </p>
                <button
                  type="button"
                  onClick={addSegment}
                  disabled={spinning || segments.length >= MAX_SEGMENTS}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {segments.map((s, i) => {
                  const isOut = eliminated.has(s.label);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          background:
                            PALETTE[Math.max(0, segments.findIndex((x) => x.label === s.label)) % PALETTE.length],
                        }}
                      />
                      <input
                        type="text"
                        value={s.label}
                        maxLength={60}
                        disabled={spinning}
                        aria-label={`Option ${i + 1}`}
                        onChange={(e) => updateSegment(i, { label: e.target.value })}
                        className={`min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60 ${
                          isOut ? "text-muted-foreground line-through" : ""
                        }`}
                      />
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={s.weight}
                        disabled={spinning}
                        aria-label={`Weight for option ${i + 1}`}
                        onChange={(e) =>
                          updateSegment(i, { weight: Math.max(1, Math.min(999, Number(e.target.value) || 1)) })
                        }
                        className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60"
                      />
                      {isOut && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                          Out
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeSegment(i)}
                        disabled={spinning || segments.length <= 2}
                        aria-label={`Remove option ${i + 1}`}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Weight sets the slice size — a weight of 3 is three times as likely to win.
              </p>
            </div>

            {/* Settings */}
            <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={elimination}
                  disabled={spinning}
                  onChange={(e) => {
                    setElimination(e.target.checked);
                    if (!e.target.checked) newRound();
                  }}
                  className="h-4 w-4 accent-accent"
                />
                Elimination mode — remove each winner until one remains
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sound}
                  onChange={(e) => setSound(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                Tick sound while spinning
              </label>
              <label className="flex items-center gap-2 text-sm">
                Spin duration
                <select
                  value={durationMs}
                  disabled={spinning}
                  onChange={(e) => setDurationMs(Number(e.target.value))}
                  className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60"
                >
                  {DURATIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* History + export */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">History</p>
                <div className="flex gap-2">
                  {history.length > 0 && (
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={exportPng}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden />
                    PNG
                  </button>
                </div>
              </div>
              {history.length > 0 ? (
                <ol className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-border p-2 text-sm">
                  {history.map((h, i) => (
                    <li
                      key={`${h.at}-${h.label}-${i}`}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 odd:bg-muted/40"
                    >
                      <span className="truncate">
                        <span className="mr-2 text-xs text-muted-foreground">#{history.length - i}</span>
                        {h.label}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{h.at}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                  No spins yet — results will appear here.
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Everything runs locally: the wheel, weights, history and sound are computed in your
          browser, and your options are saved to this browser&apos;s storage so the wheel is ready
          next time. PNG export includes the pointer and current slices.
        </p>
      </div>
    </main>
  );
}
