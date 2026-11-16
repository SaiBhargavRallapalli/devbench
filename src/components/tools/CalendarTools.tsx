"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Printer, Trash2 } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import { getMonthGrid, type WeekStart } from "@/lib/month-grid";

const calendarPrintStyles = `@media print {
  body:has(.calendar-print-root) *:not(.calendar-print-root):not(.calendar-print-root *):not(:has(.calendar-print-root)) { display: none !important; }
  body:has(.calendar-print-root), body:has(.calendar-print-root) main { margin: 0 !important; padding: 0 !important; background: white !important; color: black !important; }
  .calendar-print-root { width: 100%; color: black; }
  .calendar-print-root .print\\:hidden { display: none !important; }
  .calendar-print-root .calendar-months { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .calendar-print-root .calendar-month { break-inside: avoid; background: white; color: black; }
  .calendar-print-root * { box-shadow: none !important; }
  @page { margin: 12mm; }
}`;


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

const SUNDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function weekdayLabels(weekStart: WeekStart): string[] {
  return weekStart === 0 ? SUNDAY_LABELS : MONDAY_LABELS;
}

function WeekStartToggle({
  value,
  onChange,
}: {
  value: WeekStart;
  onChange: (v: WeekStart) => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-border bg-muted p-0.5 print:hidden"
      role="group"
      aria-label="Week starts on"
    >
      {(
        [
          [0, "Sunday"],
          [1, "Monday"],
        ] as [WeekStart, string][]
      ).map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
            value === v
              ? "bg-card text-foreground font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Starts {label}
        </button>
      ))}
    </div>
  );
}

interface DayContext {
  isToday: boolean;
}

function MonthGridCard({
  year,
  month,
  weekStart,
  onPickDay,
  markers,
}: {
  year: number;
  month: number;
  weekStart: WeekStart;
  onPickDay?: (dateIso: string) => void;
  /** date (YYYY-MM-DD) → number of events; dots render on such days. */
  markers?: ReadonlyMap<string, number>;
}) {
  const grid = useMemo(() => getMonthGrid(year, month, weekStart), [year, month, weekStart]);
  const now = new Date();
  const ctx: DayContext = {
    isToday: now.getFullYear() === year && now.getMonth() + 1 === month,
  };
  const todayDate = now.getDate();
  const m = String(month).padStart(2, "0");

  return (
    <div className="calendar-month rounded-xl border border-border bg-card p-3 sm:p-4 break-inside-avoid">
      <p className="mb-3 text-center text-sm font-semibold text-foreground">
        {MONTH_NAMES[month - 1]} {year}
      </p>
      <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase text-muted-foreground">
        {weekdayLabels(weekStart).map((d) => (
          <div key={d}>{d.slice(0, 2)}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.weeks.flat().map((day, i) => {
          if (day === 0) return <div key={i} aria-hidden className="aspect-square" />;
          const isToday = ctx.isToday && day === todayDate;
          const iso = `${year}-${m}-${String(day).padStart(2, "0")}`;
          const cls = `aspect-square rounded-md flex items-center justify-center text-sm tabular-nums ${
            isToday
              ? "bg-accent text-accent-foreground font-semibold"
              : "text-foreground hover:bg-muted"
          }`;
          if (onPickDay) {
            const count = markers?.get(iso) ?? 0;
            return (
              <button
                key={i}
                type="button"
                aria-label={`${MONTH_NAMES[month - 1]} ${day}${
                  count > 0 ? `, ${count} event${count > 1 ? "s" : ""}` : ""
                }`}
                onClick={() => onPickDay(iso)}
                className={cls}
              >
                <span className="flex flex-col items-center leading-none">
                  {day}
                  {count > 0 && (
                    <span
                      className="mt-0.5 h-1 w-1 rounded-full bg-accent"
                      aria-hidden
                    />
                  )}
                </span>
              </button>
            );
          }
          return (
            <div key={i} className={cls}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Calendar Generator ──────────────────────────────────────────────────────
function CalendarGenerator() {
  const now = new Date();
  const [yearText, setYearText] = useState(String(now.getFullYear()));
  const [year, setYear] = useState(now.getFullYear());
  const [scope, setScope] = useState<"year" | "month">("year");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [weekStart, setWeekStart] = useState<WeekStart>(0);
  const [title, setTitle] = useState("");

  const commitYear = () => {
    const n = Number(yearText);
    const y = Number.isFinite(n) && yearText.trim() !== "" ? Math.round(n) : year;
    const clamped = Math.min(2200, Math.max(1900, y));
    setYear(clamped);
    setYearText(String(clamped));
  };

  const months = scope === "year" ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [month];

  return (
    <div className="calendar-print-root space-y-5">
      <style>{calendarPrintStyles}</style>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
        <div>
          <label htmlFor="cal-year" className="mb-1.5 block text-sm font-medium">
            Year
          </label>
          <input
            id="cal-year"
            type="number"
            min={1900}
            max={2200}
            inputMode="numeric"
            value={yearText}
            onChange={(e) => setYearText(e.target.value)}
            onBlur={commitYear}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitYear();
            }}
            className={inp}
          />
        </div>
        <div>
          <label htmlFor="cal-scope" className="mb-1.5 block text-sm font-medium">
            Range
          </label>
          <select
            id="cal-scope"
            value={scope}
            onChange={(e) => setScope(e.target.value as "year" | "month")}
            className={inp}
          >
            <option value="year">Full year (12 months)</option>
            <option value="month">Single month</option>
          </select>
        </div>
        <div>
          <label htmlFor="cal-month" className="mb-1.5 block text-sm font-medium">
            Month
          </label>
          <select
            id="cal-month"
            value={month}
            disabled={scope !== "month"}
            onChange={(e) => setMonth(Number(e.target.value))}
            className={inp}
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cal-title" className="mb-1.5 block text-sm font-medium">
            Title (optional)
          </label>
          <input
            id="cal-title"
            type="text"
            maxLength={60}
            value={title}
            placeholder="e.g. Office shift calendar"
            onChange={(e) => setTitle(e.target.value)}
            className={inp}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <WeekStartToggle value={weekStart} onChange={setWeekStart} />
        <button onClick={() => window.print()} className={btnAccent}>
          <Printer className="w-4 h-4" aria-hidden />
          Print calendar
        </button>
      </div>

      {title.trim() && (
        <p className="text-center text-lg font-semibold text-foreground">
          {title.trim()} — {year}
        </p>
      )}

      <div className="calendar-months grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {months.map((m) => (
          <MonthGridCard key={m} year={year} month={m} weekStart={weekStart} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center print:hidden">
        Every grid is aligned with the chosen first weekday and handles leap
        years automatically. Print opens your browser&apos;s print dialog — the
        navigation, forms and buttons stay off the paper, so what prints is the
        calendar itself.
      </p>
    </div>
  );
}

// ─── Custom Calendar ─────────────────────────────────────────────────────────
interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
}

const STORAGE_KEY = "devbench-custom-calendar.v1";

function newEventId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function todayIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function daysUntil(dateIso: string): number | null {
  const target = new Date(`${dateIso}T00:00:00`).getTime();
  if (Number.isNaN(target)) return null;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return Math.round((target - startOfToday.getTime()) / 86_400_000);
}

function relativeLabel(delta: number): string {
  if (delta === 0) return "today";
  if (delta === 1) return "tomorrow";
  if (delta === -1) return "yesterday";
  if (delta > 1) return `in ${delta} days`;
  return `${Math.abs(delta)} days ago`;
}

function loadEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is CalendarEvent =>
          typeof e === "object" &&
          e !== null &&
          typeof (e as CalendarEvent).date === "string" &&
          typeof (e as CalendarEvent).title === "string" &&
          typeof (e as CalendarEvent).id === "string",
      )
      .slice(0, 500);
  } catch {
    return [];
  }
}

function CustomCalendar() {
  const start = new Date();
  const [cursor, setCursor] = useState({ y: start.getFullYear(), m: start.getMonth() + 1 });
  const [weekStart, setWeekStart] = useState<WeekStart>(0);
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents);
  const [draftDate, setDraftDate] = useState(todayIso);
  const [draftTitle, setDraftTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Persist events — write-only sync to an external system; never setState here.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // Storage full or blocked — events just won't persist.
    }
  }, [events]);

  const markerCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const ev of events) {
      map.set(ev.date, (map.get(ev.date) ?? 0) + 1);
    }
    return map;
  }, [events]);

  const monthEvents = useMemo(() => {
    const prefix = `${cursor.y}-${String(cursor.m).padStart(2, "0")}-`;
    return events
      .filter((e) => e.date.startsWith(prefix))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, cursor]);

  const step = (dir: 1 | -1) => {
    setCursor((c) => {
      let m = c.m + dir;
      let y = c.y;
      if (m > 12) {
        m = 1;
        y += 1;
      } else if (m < 1) {
        m = 12;
        y -= 1;
      }
      return { y, m };
    });
  };

  const addEvent = () => {
    const title = draftTitle.trim();
    if (!title) {
      setError("Give the event a name.");
      return;
    }
    if (daysUntil(draftDate) === null) {
      setError("Pick a valid date.");
      return;
    }
    setError(null);
    setEvents((prev) => [...prev, { id: newEventId(), date: draftDate, title }]);
    setDraftTitle("");
    // Jump the view to the event's month so it is visible immediately.
    const [y, m] = draftDate.split("-").map(Number);
    setCursor({ y, m });
  };

  const removeEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const jumpToToday = () => {
    const d = new Date();
    setCursor({ y: d.getFullYear(), m: d.getMonth() + 1 });
    setDraftDate(todayIso());
  };

  const handlePickDay = (iso: string) => setDraftDate(iso);

  return (
    <div className="calendar-print-root space-y-5">
      <style>{calendarPrintStyles}</style>
      {/* Month navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => step(-1)}
            aria-label="Previous month"
            className={btnMuted}
          >
            <ChevronLeft className="w-4 h-4" aria-hidden />
          </button>
          <p className="min-w-40 text-center font-semibold text-foreground">
            {MONTH_NAMES[cursor.m - 1]} {cursor.y}
          </p>
          <button onClick={() => step(1)} aria-label="Next month" className={btnMuted}>
            <ChevronRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={jumpToToday} className={btnMuted}>
            Today
          </button>
          <WeekStartToggle value={weekStart} onChange={setWeekStart} />
          <button onClick={() => window.print()} className={btnAccent}>
            <Printer className="w-4 h-4" aria-hidden />
            Print
          </button>
        </div>
      </div>

      {/* Add event */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 print:hidden">
        <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
          <div>
            <label htmlFor="ev-date" className="mb-1.5 block text-sm font-medium">
              Date
            </label>
            <input
              id="ev-date"
              type="date"
              value={draftDate}
              onChange={(e) => setDraftDate(e.target.value)}
              className={inp}
            />
          </div>
          <div>
            <label htmlFor="ev-title" className="mb-1.5 block text-sm font-medium">
              Event name
            </label>
            <input
              id="ev-title"
              type="text"
              maxLength={80}
              value={draftTitle}
              placeholder="e.g. Product launch, dentist, rent due"
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addEvent();
              }}
              className={inp}
            />
          </div>
          <button onClick={addEvent} className={btnAccent}>
            <Plus className="w-4 h-4" aria-hidden />
            Add event
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Click any day in the grid to move the date picker there. Events are
          stored in this browser only.
        </p>
      </div>

      <MonthGridCard
        year={cursor.y}
        month={cursor.m}
        weekStart={weekStart}
        onPickDay={handlePickDay}
        markers={markerCounts}
      />

      {/* Event list for the visible month */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Events in {MONTH_NAMES[cursor.m - 1]} ({monthEvents.length})
        </p>
        {monthEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing scheduled this month. Add an event above or click a day.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {monthEvents.map((ev) => {
              const delta = daysUntil(ev.date);
              return (
                <li
                  key={ev.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-foreground">{ev.title}</span>
                    <span className="ml-2 text-muted-foreground">
                      {ev.date}
                      {delta !== null && (
                        <span
                          className={
                            delta >= 0
                              ? " text-accent"
                              : " text-muted-foreground/70"
                          }
                        >
                          {" "}
                          · {relativeLabel(delta)}
                        </span>
                      )}
                    </span>
                  </span>
                  <button
                    onClick={() => removeEvent(ev.id)}
                    aria-label={`Delete ${ev.title}`}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-red-600 transition-colors print:hidden"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center print:hidden">
        {events.length > 0
          ? `${events.length} event${events.length === 1 ? "" : "s"} saved in this browser. `
          : ""}
        The calendar prints with the grid and event list only — navigation,
        forms and buttons stay off the paper.
      </p>
    </div>
  );
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────
export default function CalendarTools({ tool }: { tool: Tool }) {
  const body = (() => {
    switch (tool.slug) {
      case "calendar-generator": return <CalendarGenerator />;
      case "custom-calendar":    return <CustomCalendar />;
      default:                   return null;
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
