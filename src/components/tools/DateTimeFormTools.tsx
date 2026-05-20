"use client";

import { cloneElement, isValidElement, useId, useMemo, useState, useEffect } from "react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";

const inp =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";
const sel =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      {hint && <p className="mb-1.5 text-xs text-muted-foreground">{hint}</p>}
      {isValidElement(children)
        ? cloneElement(children as React.ReactElement<{ id?: string }>, { id })
        : children}
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? "border-accent/40 bg-accent/5" : "border-border bg-muted/30"}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1.5 text-xl font-bold tabular-nums leading-tight ${accent ? "text-accent" : "text-foreground"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Days Between Dates ──────────────────────────────────────────────────────
function DaysBetweenDates() {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(today);

  const out = useMemo(() => {
    const a = new Date(`${from}T12:00:00`);
    const b = new Date(`${to}T12:00:00`);
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
    const ms = b.getTime() - a.getTime();
    const days = Math.round(ms / 86400000);
    const absDays = Math.abs(days);
    const weeks = Math.floor(absDays / 7);
    const remDays = absDays % 7;
    const months = Math.abs(
      (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
    );
    const workdays = (() => {
      let count = 0;
      const start = new Date(Math.min(a.getTime(), b.getTime()));
      const end = new Date(Math.max(a.getTime(), b.getTime()));
      const cur = new Date(start);
      while (cur <= end) {
        const dow = cur.getDay();
        if (dow !== 0 && dow !== 6) count++;
        cur.setDate(cur.getDate() + 1);
      }
      return count;
    })();
    const direction = days >= 0 ? "after" : "before";
    return { days, absDays, weeks, remDays, months, workdays, direction };
  }, [from, to]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inp} />
        </Field>
        <Field label="End date">
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inp} />
        </Field>
      </div>
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "Last 7 days", fn: () => { const d = new Date(); d.setDate(d.getDate()-7); setFrom(d.toISOString().slice(0,10)); setTo(today()); } },
          { label: "Last 30 days", fn: () => { const d = new Date(); d.setDate(d.getDate()-30); setFrom(d.toISOString().slice(0,10)); setTo(today()); } },
          { label: "Last 90 days", fn: () => { const d = new Date(); d.setDate(d.getDate()-90); setFrom(d.toISOString().slice(0,10)); setTo(today()); } },
          { label: "This year", fn: () => { setFrom(`${new Date().getFullYear()}-01-01`); setTo(today()); } },
        ].map((q) => (
          <button key={q.label} onClick={q.fn}
            className="rounded-lg px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors">
            {q.label}
          </button>
        ))}
      </div>
      {out ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Days" value={`${out.absDays} days`} accent sub={`End is ${Math.abs(out.days)} days ${out.direction} start`} />
          <StatCard label="Weeks + days" value={`${out.weeks}w ${out.remDays}d`} />
          <StatCard label="Months" value={`~${out.months} months`} />
          <StatCard label="Workdays (Mon–Fri)" value={`${out.workdays} days`} />
        </div>
      ) : (
        <p className="text-sm text-destructive">Select valid dates.</p>
      )}
    </div>
  );
}

// ─── Countdown Calculator ────────────────────────────────────────────────────
function CountdownCalculator() {
  const [target, setTarget] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [label, setLabel] = useState("My event");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const out = useMemo(() => {
    const t = new Date(`${target}T00:00:00`);
    if (isNaN(t.getTime())) return null;
    const ms = t.getTime() - now.getTime();
    const abMs = Math.abs(ms);
    const past = ms < 0;
    const days = Math.floor(abMs / 86400000);
    const hours = Math.floor((abMs % 86400000) / 3600000);
    const minutes = Math.floor((abMs % 3600000) / 60000);
    const seconds = Math.floor((abMs % 60000) / 1000);
    const weeks = Math.floor(days / 7);
    const months = Math.abs(
      (t.getFullYear() - now.getFullYear()) * 12 + (t.getMonth() - now.getMonth())
    );
    return { days, hours, minutes, seconds, weeks, months, past };
  }, [target, now]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Target date" hint="When does the event happen?">
          <input type="date" value={target} onChange={(e) => setTarget(e.target.value)} className={inp} />
        </Field>
        <Field label="Event name (optional)" hint="Label for the countdown">
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="My event" className={inp} />
        </Field>
      </div>
      {out ? (
        <>
          <div className={`rounded-xl border p-4 text-center ${out.past ? "border-amber-500/30 bg-amber-500/5" : "border-accent/30 bg-accent/5"}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {label || "Countdown"} — {out.past ? "Passed" : "Remaining"}
            </p>
            <div className="flex justify-center gap-4 sm:gap-8">
              {[
                { val: out.days, unit: "Days" },
                { val: out.hours, unit: "Hours" },
                { val: out.minutes, unit: "Min" },
                { val: out.seconds, unit: "Sec" },
              ].map((item) => (
                <div key={item.unit} className="text-center">
                  <p className="text-4xl font-bold tabular-nums text-accent">{String(item.val).padStart(2, "0")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.unit}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Total days" value={`${out.days} days`} />
            <StatCard label="Weeks" value={`${out.weeks} weeks`} />
            <StatCard label="Months" value={`~${out.months} months`} />
          </div>
        </>
      ) : (
        <p className="text-sm text-destructive">Select a valid target date.</p>
      )}
    </div>
  );
}

// ─── ISO Week Number ─────────────────────────────────────────────────────────
function WeekNumberCalculator() {
  const [date, setDate] = useState(today);

  const out = useMemo(() => {
    const d = new Date(`${date}T12:00:00`);
    if (isNaN(d.getTime())) return null;
    const jan4 = new Date(d.getFullYear(), 0, 4);
    const startOfWeek1 = new Date(jan4);
    startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
    const diffMs = d.getTime() - startOfWeek1.getTime();
    let week = Math.floor(diffMs / 604800000) + 1;
    let year = d.getFullYear();
    if (week < 1) {
      year -= 1;
      const jan4Prev = new Date(year, 0, 4);
      const startPrev = new Date(jan4Prev);
      startPrev.setDate(jan4Prev.getDate() - ((jan4Prev.getDay() + 6) % 7));
      week = Math.floor((d.getTime() - startPrev.getTime()) / 604800000) + 1;
    } else {
      const nextJan4 = new Date(d.getFullYear() + 1, 0, 4);
      const nextStart = new Date(nextJan4);
      nextStart.setDate(nextJan4.getDate() - ((nextJan4.getDay() + 6) % 7));
      if (d >= nextStart) { year += 1; week = 1; }
    }
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfYear = Math.ceil((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
    return { week, year, dayOfWeek: dayNames[d.getDay()], dayOfYear, quarter: Math.ceil((d.getMonth() + 1) / 3) };
  }, [date]);

  return (
    <div className="space-y-5">
      <div className="max-w-xs">
        <Field label="Date" hint="Find the ISO week number for any date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} />
        </Field>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setDate(today())}
          className="rounded-lg px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors">
          Today
        </button>
      </div>
      {out ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="ISO Week" value={`W${String(out.week).padStart(2, "0")}`} accent sub={`ISO year ${out.year}`} />
          <StatCard label="Day of week" value={out.dayOfWeek} />
          <StatCard label="Day of year" value={`Day ${out.dayOfYear}`} />
          <StatCard label="Quarter" value={`Q${out.quarter}`} />
        </div>
      ) : (
        <p className="text-sm text-destructive">Select a valid date.</p>
      )}
    </div>
  );
}

// ─── Due Date (Pregnancy) ────────────────────────────────────────────────────
function DueDateCalculator() {
  const [lmp, setLmp] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 42);
    return d.toISOString().slice(0, 10);
  });

  const out = useMemo(() => {
    const d = new Date(`${lmp}T12:00:00`);
    if (isNaN(d.getTime())) return null;
    const edd = new Date(d);
    edd.setDate(edd.getDate() + 280);
    const now = new Date();
    const msPregnant = now.getTime() - d.getTime();
    const daysPregnant = Math.max(0, Math.floor(msPregnant / 86400000));
    const weeksPregnant = Math.floor(daysPregnant / 7);
    const daysRemainder = daysPregnant % 7;
    const trimester =
      weeksPregnant < 13 ? "1st Trimester" :
      weeksPregnant < 27 ? "2nd Trimester" : "3rd Trimester";
    const daysUntilEdd = Math.ceil((edd.getTime() - now.getTime()) / 86400000);
    const percentComplete = Math.min(100, Math.round((daysPregnant / 280) * 100));
    return { edd, daysPregnant, weeksPregnant, daysRemainder, trimester, daysUntilEdd, percentComplete };
  }, [lmp]);

  const fmtDate = (d: Date) =>
    d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-5">
      <div className="max-w-xs">
        <Field label="First day of last menstrual period (LMP)" hint="Naegele's rule: EDD = LMP + 280 days (40 weeks)">
          <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className={inp} max={today()} />
        </Field>
      </div>
      {out ? (
        <>
          <div className="rounded-xl border border-accent/40 bg-accent/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-1">Estimated Due Date</p>
            <p className="text-2xl font-bold text-foreground">{fmtDate(out.edd)}</p>
            {out.daysUntilEdd > 0 && (
              <p className="text-sm text-muted-foreground mt-1">{out.daysUntilEdd} days remaining</p>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Gestational age" value={`${out.weeksPregnant}w ${out.daysRemainder}d`} sub="Weeks + days" />
            <StatCard label="Trimester" value={out.trimester} />
            <StatCard label="Progress" value={`${out.percentComplete}%`} sub="of 40-week pregnancy" />
            <StatCard label="Days pregnant" value={`${out.daysPregnant} days`} />
          </div>
          {out.weeksPregnant >= 0 && (
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Week 0</span>
                <span>Week 40</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${out.percentComplete}%` }}
                />
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            This is an estimate. Only ~5% of babies arrive on their exact due date. Consult a healthcare provider for medical guidance.
          </p>
        </>
      ) : (
        <p className="text-sm text-destructive">Select a valid LMP date.</p>
      )}
    </div>
  );
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────
export default function DateTimeFormTools({ tool }: { tool: Tool }) {
  const body = (() => {
    switch (tool.slug) {
      case "days-between-dates":      return <DaysBetweenDates />;
      case "countdown-calculator":    return <CountdownCalculator />;
      case "week-number-calculator":  return <WeekNumberCalculator />;
      case "due-date-calculator":     return <DueDateCalculator />;
      default:                        return null;
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
