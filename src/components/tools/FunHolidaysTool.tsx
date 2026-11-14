"use client";

import { useState } from "react";
import { CalendarDays, ChevronRight, PartyPopper, Shuffle, X } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import {
  FUN_HOLIDAYS,
  holidaysInMonth,
  holidaysOn,
  nextHolidays,
  randomHoliday,
  type FunHoliday,
} from "@/lib/fun-holidays";

const inp =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";
const btn =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const btnAccent = `${btn} bg-accent text-accent-foreground hover:bg-accent/90`;
const btnMuted = `${btn} bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80`;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function localTodayIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function shortDate(mmdd: string): string {
  const month = Number(mmdd.slice(0, 2));
  const day = Number(mmdd.slice(3));
  return `${MONTH_NAMES[month - 1].slice(0, 3)} ${day}`;
}

export default function FunHolidaysTool({ tool }: { tool: Tool }) {
  const [date, setDate] = useState(localTodayIso);
  const [surprise, setSurprise] = useState<FunHoliday | null>(null);

  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const mmdd = dateOk ? date.slice(5) : "";
  const month = dateOk ? Number(date.slice(5, 7)) : 0;
  const year = dateOk ? date.slice(0, 4) : "";

  const todays = mmdd ? holidaysOn(mmdd) : [];
  const monthList = month ? holidaysInMonth(month) : [];
  const upcoming = todays.length === 0 && mmdd ? nextHolidays(mmdd, 3) : [];

  const pickHoliday = (holiday: FunHoliday) => {
    // Keep the currently viewed year so the grid stays where the user is.
    setDate(`${year}-${holiday.date}`);
    setSurprise(null);
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 space-y-5">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-52">
            <label htmlFor="fh-date" className="mb-1.5 block text-sm font-medium">
              Date
            </label>
            <input
              id="fh-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inp}
            />
          </div>
          <button
            onClick={() => {
              setDate(localTodayIso());
              setSurprise(null);
            }}
            className={btnMuted}
            disabled={date === localTodayIso()}
          >
            <CalendarDays className="w-4 h-4" aria-hidden />
            Today
          </button>
          <button
            onClick={() => setSurprise(randomHoliday())}
            className={btnAccent}
          >
            <Shuffle className="w-4 h-4" aria-hidden />
            Surprise me
          </button>
          <p className="ml-auto text-xs text-muted-foreground">
            {FUN_HOLIDAYS.length} fixed-date holidays in the collection
          </p>
        </div>

        {/* Surprise card */}
        {surprise && (
          <div className="rounded-xl border border-accent/40 bg-accent/5 p-4" role="status">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-accent">
                  Surprise holiday · {shortDate(surprise.date)}
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">{surprise.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{surprise.blurb}</p>
              </div>
              <button
                onClick={() => setSurprise(null)}
                aria-label="Dismiss surprise holiday"
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" aria-hidden />
              </button>
            </div>
            <button onClick={() => pickHoliday(surprise)} className={`${btnMuted} mt-3`}>
              Go to this date
              <ChevronRight className="w-4 h-4" aria-hidden />
            </button>
          </div>
        )}

        {/* The day's holidays */}
        {!dateOk ? (
          <p className="text-sm text-destructive">Pick a valid date.</p>
        ) : todays.length > 0 ? (
          <section aria-label="Holidays on this date" className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              On {MONTH_NAMES[month - 1]} {Number(mmdd.slice(3))}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {todays.map((h) => (
                <div
                  key={h.name}
                  className="rounded-xl border border-border bg-muted/30 p-4"
                >
                  <p className="flex items-center gap-2 font-semibold text-foreground">
                    <PartyPopper className="w-4 h-4 text-accent" aria-hidden />
                    {h.name}
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{h.blurb}</p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section aria-label="No holiday today" className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">
              No fixed-date holiday on this day — but here&apos;s what&apos;s coming up:
            </p>
            <ul className="mt-2 space-y-1.5">
              {upcoming.map((h) => (
                <li key={`${h.date}-${h.name}`}>
                  <button
                    onClick={() => pickHoliday(h)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-background"
                  >
                    <span className="w-20 shrink-0 text-xs font-semibold tabular-nums text-accent">
                      {shortDate(h.date)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {h.name}
                    </span>
                    <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* All holidays in the month */}
        <section aria-label={`Holidays in ${MONTH_NAMES[month - 1]}`} className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Every holiday in {MONTH_NAMES[month - 1]} ({monthList.length})
          </p>
          {monthList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing in the collection for this month yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {monthList.map((h) => {
                const isCurrent = h.date === mmdd;
                return (
                  <li key={`${h.date}-${h.name}`}>
                    <button
                      onClick={() => pickHoliday(h)}
                      aria-current={isCurrent ? "date" : undefined}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                        isCurrent
                          ? "border-accent/50 bg-accent/5"
                          : "border-border bg-muted/20 hover:bg-muted/40"
                      }`}
                    >
                      <span className="w-20 shrink-0 pt-0.5 text-xs font-semibold tabular-nums text-accent">
                        {shortDate(h.date)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">
                          {h.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {h.blurb}
                        </span>
                      </span>
                      <ChevronRight className="w-4 h-4 shrink-0 pt-0.5 text-muted-foreground" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="text-xs text-muted-foreground">
          Only holidays that fall on the same date every year are listed — floating
          observances (Mother&apos;s Day, Thanksgiving, Diwali) move with the calendar and
          are deliberately left out so nothing here is ever wrong. Click any entry to jump
          the date picker to it.
        </p>
      </div>
    </main>
  );
}
