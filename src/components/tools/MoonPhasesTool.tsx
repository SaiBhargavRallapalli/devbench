"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Clock, Info, Moon, Sparkles } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import {
  moonAgeDays,
  moonStateAt,
  nextPhaseEvents,
  phaseDiscPath,
  phaseName,
  SYNODIC_MONTH_DAYS,
} from "@/lib/moon-phases";

const btn =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const btnMuted = `${btn} bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80`;

const EVENT_ICONS: Record<string, string> = {
  "New Moon": "🌑",
  "First Quarter": "🌓",
  "Full Moon": "🌕",
  "Last Quarter": "🌗",
};

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "in 3d 14h" / "in 42m" relative to the selected instant. */
function untilLabel(target: Date, from: Date): string {
  const ms = target.valueOf() - from.valueOf();
  if (ms <= 0) return "now";
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `in ${hours}h ${mins % 60}m`;
  const days = Math.floor(hours / 24);
  return `in ${days}d ${hours % 24}h`;
}

export default function MoonPhasesTool({ tool }: { tool: Tool }) {
  const [when, setWhen] = useState(() => toLocalInput(new Date()));
  const [now] = useState(() => new Date());

  const parsed = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(when)) return null;
    const d = new Date(when);
    return Number.isNaN(d.valueOf()) ? null : d;
  }, [when]);

  const state = useMemo(() => (parsed ? moonStateAt(parsed) : null), [parsed]);
  const events = useMemo(
    () => (parsed ? nextPhaseEvents(parsed, 6) : []),
    [parsed],
  );

  const pct = state ? Math.round(state.fraction * 1000) / 10 : 0;
  const name = state ? phaseName(state.phase) : "";
  const nextFull = events.find((e) => e.name === "Full Moon");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 space-y-5">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-64">
            <label htmlFor="mp-when" className="mb-1.5 block text-sm font-medium">
              Date &amp; time
            </label>
            <input
              id="mp-when"
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <button
            onClick={() => setWhen(toLocalInput(new Date()))}
            className={btnMuted}
            disabled={when === toLocalInput(now)}
          >
            <Clock className="w-4 h-4" aria-hidden />
            Now
          </button>
          {parsed && (
            <p className="ml-auto text-xs text-muted-foreground">
              {parsed.toLocaleString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>

        {!parsed || !state ? (
          <p className="text-sm text-destructive">Pick a valid date and time.</p>
        ) : (
          <>
            {/* Disc + headline */}
            <section
              aria-label="Phase of the Moon"
              className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-muted/20 p-6 sm:flex-row sm:items-center"
            >
              <svg
                viewBox="0 0 200 200"
                role="img"
                aria-label={`${name}, ${pct}% illuminated`}
                className="h-44 w-44 shrink-0"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  className="fill-slate-200 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-700"
                  strokeWidth="2"
                />
                <path d={phaseDiscPath(state.phase, 100, 100, 88)} className="fill-amber-100 dark:fill-amber-200" />
              </svg>
              <div className="min-w-0 text-center sm:text-left">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Phase at the selected time
                </p>
                <p className="mt-1 flex items-center justify-center gap-2 text-2xl font-semibold text-foreground sm:justify-start">
                  <Moon className="h-5 w-5 text-accent" aria-hidden />
                  {name}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    ["Illuminated", `${pct}%`],
                    ["Direction", state.waxing ? "Waxing" : "Waning"],
                    ["Moon age", `≈ ${moonAgeDays(state.phase).toFixed(1)} d`],
                    ["Distance", `${Math.round(state.distanceKm).toLocaleString()} km`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border bg-background p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
                {nextFull && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/5 px-3 py-2 text-sm text-foreground">
                    🌕 Next full moon:{" "}
                    <strong className="font-semibold">
                      {nextFull.date.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </strong>{" "}
                    <span className="text-muted-foreground">
                      ({untilLabel(nextFull.date, parsed)})
                    </span>
                  </p>
                )}
              </div>
            </section>

            {/* Upcoming phases */}
            <section aria-label="Next phase events" className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Next phases after the selected time
              </p>
              <ol className="space-y-1.5">
                {events.map((e) => (
                  <li
                    key={`${e.name}-${e.date.valueOf()}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-border bg-muted/20 px-4 py-3"
                  >
                    <span className="text-lg" aria-hidden>
                      {EVENT_ICONS[e.name]}
                    </span>
                    <span className="min-w-36 text-sm font-semibold text-foreground">
                      {e.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {e.date.toLocaleString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="ml-auto rounded-lg bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent tabular-nums">
                      {untilLabel(e.date, parsed)}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                The four phases repeat every ≈ {SYNODIC_MONTH_DAYS.toFixed(1)} days —
                a full lunation from new moon back to new moon.
              </p>
            </section>
          </>
        )}

        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Phase times come from a truncated lunar theory (Meeus ch. 47–48, the same
          geometry the USNO publishes) and are typically within a minute or two of
          the official instants; illumination and distance are geocentric
          approximations. The disc shows the Northern-Hemisphere view — waxing
          moons are lit on the right. Everything runs locally in your browser.
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Astronomy core ported from SunCalc (MIT) — no network calls, no trackers.
        </p>
      </div>
    </main>
  );
}
