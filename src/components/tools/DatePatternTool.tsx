"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Hash, Sparkles, Trophy } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import {
  analyzeDate,
  describePattern,
  nextPalindromeDates,
  type PatternKind,
} from "@/lib/date-pattern";

const inp =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";
const btn =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const btnMuted = `${btn} bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80`;

const KIND_META: Record<PatternKind, { label: string; badge: string }> = {
  palindrome: {
    label: "Palindrome",
    badge: "bg-accent/10 text-accent border-accent/40",
  },
  repeating: {
    label: "Repeating digits",
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/40",
  },
  ascending: {
    label: "Ascending run",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40",
  },
  descending: {
    label: "Descending run",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/40",
  },
};

function localTodayIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function DatePatternTool({ tool }: { tool: Tool }) {
  const [date, setDate] = useState(localTodayIso);
  // Fixed for the session: the "days until next occurrence" fact only changes
  // at midnight, and freezing it avoids re-rendering the whole analysis.
  const [today] = useState(() => new Date());

  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));
  const usable = dateOk && month >= 1 && month <= 12 && day >= 1 && day <= 31;

  const analysis = useMemo(
    () => (usable ? analyzeDate(year, month, day, today) : null),
    [usable, year, month, day, today],
  );

  const palindromes = useMemo(() => {
    if (!usable) return [];
    return nextPalindromeDates(new Date(Date.UTC(year, month - 1, day)), 5);
  }, [usable, year, month, day]);

  const occurrenceLabel = (n: number): string => {
    if (n === 0) return "today";
    if (n === 1) return "tomorrow";
    return `in ${n} days`;
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 space-y-5">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-52">
            <label htmlFor="dp-date" className="mb-1.5 block text-sm font-medium">
              Date
            </label>
            <input
              id="dp-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inp}
            />
          </div>
          <button
            onClick={() => setDate(localTodayIso())}
            className={btnMuted}
            disabled={date === localTodayIso()}
          >
            <CalendarDays className="w-4 h-4" aria-hidden />
            Today
          </button>
        </div>

        {!usable ? (
          <p className="text-sm text-destructive">Pick a valid date.</p>
        ) : (
          analysis && (
            <>
              {/* Digits view */}
              <section aria-label="The date as digits" className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  How {analysis.iso} looks as digits
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {analysis.formats.map((f) => {
                    const matched = analysis.matches.find((m) => m.label === f.label);
                    return (
                      <div
                        key={f.label}
                        className={`rounded-xl border p-3 ${
                          matched
                            ? "border-accent/50 bg-accent/5"
                            : "border-border bg-muted/20"
                        }`}
                      >
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {f.label}
                        </p>
                        <p className="mt-1 font-mono text-lg font-semibold tabular-nums tracking-widest text-foreground">
                          {f.digits}
                        </p>
                        {matched && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {matched.kinds.map((k) => (
                              <span
                                key={k}
                                className={`rounded border px-1.5 py-0.5 text-[11px] font-medium ${KIND_META[k].badge}`}
                              >
                                {KIND_META[k].label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Pattern verdict */}
              <section aria-label="Patterns found" className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Patterns found
                </p>
                {analysis.matches.length > 0 ? (
                  <ul className="space-y-2">
                    {analysis.matches.flatMap((m) =>
                      m.kinds.map((k) => (
                        <li
                          key={`${m.label}-${k}`}
                          className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3"
                        >
                          <Sparkles className="mt-0.5 w-4 h-4 shrink-0 text-accent" aria-hidden />
                          <div className="min-w-0">
                            <span
                              className={`inline-block rounded border px-1.5 py-0.5 text-[11px] font-medium ${KIND_META[k].badge}`}
                            >
                              {KIND_META[k].label}
                            </span>
                            <p className="mt-1 text-sm text-foreground">
                              {describePattern(k, m.digits, m.label)}
                            </p>
                          </div>
                        </li>
                      )),
                    )}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                    No repeating-digit pattern in this date — ordinary dates are the norm,
                    which is exactly why palindrome days stand out.
                  </p>
                )}
                {analysis.facts.twinDate && (
                  <p className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
                    <Trophy className="w-4 h-4 shrink-0" aria-hidden />
                    Twin date — the day number equals the month number (
                    {String(month).padStart(2, "0")}/{String(day).padStart(2, "0")}).
                  </p>
                )}
              </section>

              {/* Calendar facts */}
              <section aria-label="Calendar facts" className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Calendar facts
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {[
                    ["Weekday", analysis.facts.weekday],
                    ["Day of year", `${analysis.facts.dayOfYear}`],
                    [
                      "ISO week",
                      `W${analysis.facts.isoWeek} of ${analysis.facts.isoWeekYear}`,
                    ],
                    ["Leap year", analysis.facts.leapYear ? "Yes" : "No"],
                    [
                      "Next occurrence",
                      occurrenceLabel(analysis.facts.nextOccurrenceDays),
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-border bg-muted/20 p-3"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Next palindrome dates */}
              <section aria-label="Next palindrome dates" className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Next palindrome dates after {analysis.iso}
                </p>
                {palindromes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    None found within the next 120 years — this format combination is
                    rarer than it looks.
                  </p>
                ) : (
                  <ol className="space-y-1.5">
                    {palindromes.map((p, i) => (
                      <li
                        key={p.iso}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border bg-muted/20 px-3 py-2.5"
                      >
                        <span className="w-6 text-xs font-semibold tabular-nums text-muted-foreground">
                          {i + 1}.
                        </span>
                        <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                          {p.iso}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          palindrome in {p.formats.join(" and ")}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
                <p className="text-xs text-muted-foreground">
                  A date counts as a palindrome when its digits read the same forwards
                  and backwards in a given order — so 3 February 2030 is one in
                  DD/MM/YYYY (03022030), while 2 March 2030 is the same digits in
                  MM/DD/YYYY.
                </p>
              </section>
            </>
          )
        )}

        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5" aria-hidden />
          All analysis runs locally in your browser — nothing is sent anywhere.
        </p>
      </div>
    </main>
  );
}
