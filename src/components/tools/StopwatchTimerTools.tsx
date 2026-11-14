"use client";

import { cloneElement, isValidElement, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Copy, Check, Flag, Pause, Play, RotateCcw } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import { copyWithFeedback } from "@/lib/clipboard";
import { countdownParts, formatClock, formatStopwatch } from "@/lib/time-format";

const inp =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";
const btn =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const btnAccent = `${btn} bg-accent text-accent-foreground hover:bg-accent/90`;
const btnMuted = `${btn} bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80`;

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {hint && <p className="mb-1.5 text-xs text-muted-foreground">{hint}</p>}
      {isValidElement(children)
        ? cloneElement(children as React.ReactElement<{ id?: string }>, { id })
        : children}
    </div>
  );
}

// ─── Stopwatch ───────────────────────────────────────────────────────────────
function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const baseRef = useRef(0);
  const startRef = useRef(0);

  // rAF loop only while running — functional (the display IS the tool), and
  // it stops dead on pause/unmount.
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const tick = () => {
      setElapsed(baseRef.current + (performance.now() - startRef.current));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const start = () => {
    startRef.current = performance.now();
    setRunning(true);
  };
  const pause = () => {
    const finalMs = baseRef.current + (performance.now() - startRef.current);
    baseRef.current = finalMs;
    setElapsed(finalMs);
    setRunning(false);
  };
  const reset = () => {
    baseRef.current = 0;
    setElapsed(0);
    setLaps([]);
    setRunning(false);
  };
  const lap = () => {
    if (!running) return;
    setLaps((prev) => [
      ...prev,
      baseRef.current + (performance.now() - startRef.current),
    ]);
  };

  const rows = useMemo(() => {
    const out: { n: number; total: number; split: number }[] = [];
    for (let i = laps.length - 1; i >= 0; i--) {
      out.push({
        n: i + 1,
        total: laps[i],
        split: i === 0 ? laps[0] : laps[i] - laps[i - 1],
      });
    }
    return out;
  }, [laps]);

  const fastestLap = useMemo(() => {
    if (rows.length < 2) return null;
    let min = Infinity;
    let fastest = 0;
    for (const r of rows) {
      if (r.split < min) {
        min = r.split;
        fastest = r.n;
      }
    }
    return fastest;
  }, [rows]);

  const canReset = elapsed > 0 || laps.length > 0;

  return (
    <div className="space-y-5">
      <p
        className="text-center text-6xl sm:text-7xl font-bold tabular-nums tracking-tight"
        role="timer"
        aria-label={`Elapsed time ${formatStopwatch(elapsed)}`}
      >
        {formatStopwatch(elapsed)}
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={running ? pause : start} className={btnAccent}>
          {running ? <Pause className="w-4 h-4" aria-hidden /> : <Play className="w-4 h-4" aria-hidden />}
          {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
        </button>
        <button onClick={lap} disabled={!running} className={btnMuted}>
          <Flag className="w-4 h-4" aria-hidden />
          Lap
        </button>
        <button onClick={reset} disabled={!canReset} className={btnMuted}>
          <RotateCcw className="w-4 h-4" aria-hidden />
          Reset
        </button>
      </div>

      {rows.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Laps ({rows.length})
          </p>
          <ol className="space-y-1.5">
            {rows.map((r) => (
              <li
                key={r.n}
                className="flex items-center justify-between gap-4 rounded-lg bg-background px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">Lap {r.n}</span>
                <span className="flex items-center gap-4 tabular-nums">
                  <span
                    className={
                      r.n === fastestLap
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {formatStopwatch(r.split)}
                    {r.n === fastestLap && (
                      <span className="ml-1.5 text-xs">fastest</span>
                    )}
                  </span>
                  <span className="w-24 text-right font-medium">
                    {formatStopwatch(r.total)}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        The stopwatch keeps counting from performance.now(), so it stays accurate
        even when the tab is in the background. Laps show the split from the
        previous lap and the total time.
      </p>
    </div>
  );
}

// ─── Timer ───────────────────────────────────────────────────────────────────
const TIMER_PRESETS = [1, 3, 5, 10, 25];

function Timer() {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [durationMs, setDurationMs] = useState(300_000);
  const [remaining, setRemaining] = useState(300_000);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const endRef = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);

  const beep = useCallback(() => {
    const ctx = audioRef.current;
    if (!ctx) return;
    try {
      const t0 = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.001, t0 + i * 0.4);
        gain.gain.exponentialRampToValueAtTime(0.25, t0 + i * 0.4 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.4 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0 + i * 0.4);
        osc.stop(t0 + i * 0.4 + 0.4);
      }
    } catch {
      /* audio is a bonus — the visual state still signals completion */
    }
  }, []);

  // Target-time countdown: remaining is derived from Date.now() each tick, so
  // a backgrounded tab resumes at the correct value instead of drifting.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = endRef.current - Date.now();
      if (left <= 0) {
        setRemaining(0);
        setRunning(false);
        setFinished(true);
        beep();
      } else {
        setRemaining(left);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [running, beep]);

  const applyDuration = useCallback(
    (m: number, s: number) => {
      const ms = (m * 60 + s) * 1000;
      setDurationMs(ms);
      setRemaining(ms);
      setFinished(false);
    },
    [],
  );

  const start = () => {
    const base = finished || remaining <= 0 ? durationMs : remaining;
    if (base <= 0) return;
    try {
      if (!audioRef.current) audioRef.current = new AudioContext();
      void audioRef.current.resume();
    } catch {
      /* no WebAudio — visual alert still works */
    }
    if (finished) {
      setFinished(false);
      setRemaining(base);
    }
    endRef.current = Date.now() + base;
    setRunning(true);
  };

  const pause = () => {
    setRemaining(Math.max(0, endRef.current - Date.now()));
    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setFinished(false);
    setRemaining(durationMs);
  };

  const onMinutes = (raw: number) => {
    const m = Math.max(0, Math.min(999, raw));
    setMinutes(m);
    if (!running) applyDuration(m, seconds);
  };
  const onSeconds = (raw: number) => {
    const s = Math.max(0, Math.min(59, raw));
    setSeconds(s);
    if (!running) applyDuration(minutes, s);
  };
  const applyPreset = (m: number) => {
    setMinutes(m);
    setSeconds(0);
    if (!running) applyDuration(m, 0);
  };

  const pct =
    durationMs > 0
      ? Math.max(0, Math.min(100, (remaining / durationMs) * 100))
      : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-center gap-2">
        {TIMER_PRESETS.map((m) => (
          <button
            key={m}
            onClick={() => applyPreset(m)}
            disabled={running}
            className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            {m} min
          </button>
        ))}
        {minutes === 25 && seconds === 0 && (
          <span className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
            pomodoro
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Minutes">
          <input
            type="number"
            min={0}
            max={999}
            value={minutes}
            disabled={running}
            onChange={(e) => onMinutes(Number(e.target.value))}
            className={inp}
          />
        </Field>
        <Field label="Seconds">
          <input
            type="number"
            min={0}
            max={59}
            value={seconds}
            disabled={running}
            onChange={(e) => onSeconds(Number(e.target.value))}
            className={inp}
          />
        </Field>
      </div>

      <div className="space-y-2">
        <p
          className={`text-center text-6xl sm:text-7xl font-bold tabular-nums tracking-tight ${
            finished
              ? "text-red-600 dark:text-red-400"
              : "text-foreground"
          }`}
          role="timer"
          aria-label={`${formatClock(remaining)} remaining`}
        >
          {formatClock(remaining)}
        </p>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          aria-label="Time remaining"
        >
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              finished ? "bg-red-500" : "bg-accent"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {finished && (
          <p
            className="text-center text-sm font-semibold text-red-600 dark:text-red-400"
            role="status"
          >
            Time&apos;s up!
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={running ? pause : start} className={btnAccent}>
          {running ? <Pause className="w-4 h-4" aria-hidden /> : <Play className="w-4 h-4" aria-hidden />}
          {running ? "Pause" : finished ? "Restart" : "Start"}
        </button>
        <button onClick={reset} disabled={!running && !finished && remaining === durationMs} className={btnMuted}>
          <RotateCcw className="w-4 h-4" aria-hidden />
          Reset
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        When time is up the timer beeps three times and the display turns red.
        The countdown is computed from the clock rather than by decrementing, so
        it stays exact even if this tab is backgrounded.
      </p>
    </div>
  );
}

// ─── Countdown Creator ───────────────────────────────────────────────────────
function localDateAhead(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function CountdownCreator() {
  // Client-only component (ssr: false) — reading the query string during the
  // first render is safe and lets shared links prefill the countdown.
  const [initial] = useState(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const target = q.get("target") ?? "";
      const label = q.get("label") ?? "";
      return {
        date: /^\d{4}-\d{2}-\d{2}/.test(target) ? target.slice(0, 10) : localDateAhead(7),
        time: /T\d{2}:\d{2}/.test(target) ? target.slice(11, 16) : "12:00",
        label: label.slice(0, 60),
      };
    } catch {
      return { date: localDateAhead(7), time: "12:00", label: "" };
    }
  });

  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [label, setLabel] = useState(initial.label);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const targetMs = useMemo(() => {
    const t = new Date(`${date}T${time}`).getTime();
    return Number.isNaN(t) ? null : t;
  }, [date, time]);

  const remaining = targetMs !== null ? targetMs - now : null;
  const arrived = remaining !== null && remaining <= 0;
  const parts = countdownParts(remaining ?? 0);

  const targetLabel = useMemo(() => {
    if (targetMs === null) return null;
    return new Date(targetMs).toLocaleString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [targetMs]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/tools/countdown-creator?target=${date}T${time}&label=${encodeURIComponent(label)}`
      : "";

  const copyLink = async () => {
    const ok = await copyWithFeedback(shareUrl);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  const units: [string, number][] = [
    ["Days", parts.days],
    ["Hours", parts.hours],
    ["Minutes", parts.minutes],
    ["Seconds", parts.seconds],
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Countdown label">
          <input
            type="text"
            value={label}
            maxLength={60}
            placeholder="e.g. Diwali, launch day, exam"
            onChange={(e) => setLabel(e.target.value)}
            className={inp}
          />
        </Field>
        <Field label="Target date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inp}
          />
        </Field>
        <Field label="Target time">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={inp}
          />
        </Field>
      </div>

      {targetMs === null ? (
        <p className="text-sm text-destructive">Pick a valid date and time.</p>
      ) : arrived ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center">
          <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
            {label ? `${label} — the moment has arrived!` : "The moment has arrived!"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{targetLabel}</p>
        </div>
      ) : (
        <>
          <div>
            {label && (
              <p className="mb-3 text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {units.map(([unit, value]) => (
                <div
                  key={unit}
                  className="rounded-xl border border-border bg-muted/30 p-4 text-center"
                >
                  <p className="text-3xl font-bold tabular-nums leading-tight">
                    {value}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {unit}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {targetLabel && <>Until {targetLabel}</>}
          </p>
        </>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button onClick={() => void copyLink()} className={btnAccent}>
          {copied ? <Check className="w-4 h-4" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />}
          {copied ? "Link copied" : "Copy share link"}
        </button>
      </div>
      <p className="text-xs text-muted-foreground text-center break-all">
        The share link encodes the target and label, so anyone who opens it sees
        the same live countdown.
      </p>
    </div>
  );
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────
export default function StopwatchTimerTools({ tool }: { tool: Tool }) {
  const body = (() => {
    switch (tool.slug) {
      case "stopwatch":         return <Stopwatch />;
      case "timer":             return <Timer />;
      case "countdown-creator": return <CountdownCreator />;
      default:                  return null;
    }
  })();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up rounded-2xl border border-border bg-card p-6">
        {body}
      </div>
    </main>
  );
}
