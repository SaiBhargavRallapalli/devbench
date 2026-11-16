"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Flag,
  RotateCcw,
  X,
} from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import { copyWithFeedback } from "@/lib/clipboard";
import { trackToolSuccess } from "@/lib/analytics-events";
import {
  IQ_MAX,
  IQ_MIN,
  SECTIONS,
  TIME_LIMIT_SECONDS,
  TOTAL_QUESTIONS,
  VERBAL_POOL,
  buildTest,
  formatPercentile,
  scoreTest,
  type Fig,
  type IqItem,
  type IqResult,
} from "@/lib/iq-test";

const SLUG = "iq-test";

const btn =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const btnAccent = `${btn} bg-accent text-accent-foreground hover:bg-accent/90`;
const btnMuted = `${btn} bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80`;

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function newSeed(): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] as number;
  }
  return Math.floor(Math.random() * 4294967296);
}

/* ── Figure drawing ───────────────────────────────────────── */

const COUNT_CENTERS: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [
    [30, 50],
    [70, 50],
  ],
  3: [
    [50, 27],
    [28, 71],
    [72, 71],
  ],
};
const COUNT_SCALE: Record<number, number> = { 1: 1, 2: 0.7, 3: 0.55 };
const BASE_RADIUS = [12, 17, 23];

function ShapeMark({
  shape,
  fill,
  cx,
  cy,
  r,
}: {
  shape: number;
  fill: number;
  cx: number;
  cy: number;
  r: number;
}) {
  const common = {
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinejoin: "round" as const,
    fill: fill === 0 ? "none" : "currentColor",
    fillOpacity: fill === 1 ? 0.3 : 1,
  };
  if (shape === 0) return <circle cx={cx} cy={cy} r={r} {...common} />;
  if (shape === 1) return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} {...common} />;
  const pts = `${cx},${cy - r * 1.15} ${cx - r * 1.1},${cy + r * 0.85} ${cx + r * 1.1},${cy + r * 0.85}`;
  return <polygon points={pts} {...common} />;
}

function FigureSvg({ fig, label }: { fig: Fig; label: string }) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={label} className="h-full w-full text-foreground">
      {fig.kind === "shapes" &&
        (COUNT_CENTERS[fig.count] ?? []).map(([cx, cy], i) => (
          <ShapeMark
            key={i}
            shape={fig.shape}
            fill={fig.fill}
            cx={cx}
            cy={cy}
            r={(BASE_RADIUS[fig.size] ?? 17) * (COUNT_SCALE[fig.count] ?? 1)}
          />
        ))}
      {fig.kind === "dots" &&
        fig.bits.map((on, i) => {
          const cx = 25 + (i % 3) * 25;
          const cy = 25 + Math.floor(i / 3) * 25;
          return on ? (
            <circle key={i} cx={cx} cy={cy} r={9} fill="currentColor" />
          ) : (
            <circle key={i} cx={cx} cy={cy} r={2.5} fill="currentColor" fillOpacity={0.25} />
          );
        })}
      {fig.kind === "poly" &&
        fig.cells.map(([x, y], i) => (
          <rect
            key={i}
            x={10 + x * 20}
            y={10 + y * 20}
            width={20}
            height={20}
            fill="currentColor"
            fillOpacity={0.85}
            stroke="var(--card, #fff)"
            strokeWidth={1.5}
          />
        ))}
    </svg>
  );
}

function describeFig(fig: Fig): string {
  if (fig.kind === "shapes") {
    const shapes = ["circle", "square", "triangle"];
    const fills = ["outlined", "lightly shaded", "solid"];
    const sizes = ["small", "medium", "large"];
    return `${fig.count} ${sizes[fig.size]} ${fills[fig.fill]} ${shapes[fig.shape]}${fig.count > 1 ? "s" : ""}`;
  }
  if (fig.kind === "dots") {
    const rows = [0, 1, 2].map((r) => {
      const cols = [0, 1, 2].filter((c) => fig.bits[r * 3 + c]).map((c) => c + 1);
      return `row ${r + 1} ${cols.length === 0 ? "empty" : `filled in column${cols.length > 1 ? "s" : ""} ${cols.join(" and ")}`}`;
    });
    return `${fig.bits.filter(Boolean).length} filled dots in a 3 by 3 grid, ${rows.join("; ")}`;
  }
  const maxX = Math.max(...fig.cells.map((c) => c[0]));
  const maxY = Math.max(...fig.cells.map((c) => c[1]));
  const rows = Array.from({ length: maxY + 1 }, (_, y) => {
    const cols = fig.cells.filter((c) => c[1] === y).map((c) => c[0] + 1).sort((a, b) => a - b);
    return `row ${y + 1}${y === 0 ? " (top)" : y === maxY ? " (bottom)" : ""} ${cols.length === 0 ? "empty" : `squares in column${cols.length > 1 ? "s" : ""} ${cols.join(" and ")}`}`;
  });
  return `a shape made of ${fig.cells.length} squares in a ${maxX + 1} wide by ${maxY + 1} tall grid, columns counted from the left, ${rows.join("; ")}`;
}

/* ── Question view ────────────────────────────────────────── */

function MatrixBoard({ item }: { item: IqItem }) {
  const grid = item.grid ?? [];
  return (
    <div
      className="mx-auto grid w-full max-w-[22rem] grid-cols-3 gap-2"
      role="group"
      aria-label="3 by 3 pattern with the bottom right figure missing"
    >
      {Array.from({ length: 9 }, (_, i) => {
        const fig = grid[i];
        return (
          <div
            key={i}
            className="aspect-square rounded-lg border border-border bg-background p-1.5"
          >
            {fig ? (
              <FigureSvg fig={fig} label={`Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}: ${describeFig(fig)}`} />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center rounded-md border-2 border-dashed border-accent/60 text-2xl font-semibold text-accent"
                aria-label="Missing figure"
              >
                ?
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OptionButton({
  label,
  index,
  item,
  selected,
  onPick,
}: {
  label: string;
  index: number;
  item: IqItem;
  selected: boolean;
  onPick: () => void;
}) {
  const opt = item.options[index];
  if (!opt) return null;
  const visual = Boolean(opt.fig);
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      aria-label={`Answer ${label}${opt.text ? `: ${opt.text}` : opt.fig ? `: ${describeFig(opt.fig)}` : ""}`}
      className={`flex items-center gap-3 rounded-xl border p-2.5 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 ${
        selected
          ? "border-accent bg-accent/10 text-foreground"
          : "border-border bg-background hover:border-accent/50 hover:bg-muted/40"
      } ${visual ? "flex-col" : ""}`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
          selected ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
        }`}
        aria-hidden
      >
        {label}
      </span>
      {opt.fig ? (
        <span className="block aspect-square w-full max-w-[6.5rem]" aria-hidden>
          <FigureSvg fig={opt.fig} label="" />
        </span>
      ) : (
        <span className="font-medium">{opt.text}</span>
      )}
    </button>
  );
}

/* ── Results ──────────────────────────────────────────────── */

function IqScale({ result }: { result: IqResult }) {
  const pos = (v: number) => `${((Math.min(IQ_MAX + 5, Math.max(IQ_MIN - 5, v)) - (IQ_MIN - 5)) / (IQ_MAX + 5 - (IQ_MIN - 5))) * 100}%`;
  return (
    <div className="mt-4" aria-hidden>
      <div className="relative h-3 rounded-full bg-gradient-to-r from-rose-400/40 via-amber-400/40 to-emerald-400/50">
        <div
          className="absolute top-0 h-3 rounded-full bg-foreground/25"
          style={{ left: pos(result.low), width: `calc(${pos(result.high)} - ${pos(result.low)})` }}
        />
        <div
          className="absolute -top-1 h-5 w-1.5 -translate-x-1/2 rounded-full bg-foreground"
          style={{ left: pos(result.iq) }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>{IQ_MIN}</span>
        <span>85</span>
        <span>100</span>
        <span>115</span>
        <span>130</span>
        <span>{IQ_MAX}</span>
      </div>
    </div>
  );
}

function ReviewFigures({ item, chosen }: { item: IqItem; chosen: number | null }) {
  if (!item.options.some((o) => o.fig)) return null;
  return (
    <div className="space-y-3">
      {item.section === "matrix" && <MatrixBoard item={item} />}
      {item.section === "spatial" && item.target && (
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs text-muted-foreground">Original</span>
          <div className="aspect-square w-28 rounded-lg border border-border bg-background p-1.5">
            <FigureSvg fig={item.target} label={`The original shape: ${describeFig(item.target)}`} />
          </div>
        </div>
      )}
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Answer options">
        {item.options.map((opt, i) => {
          const isCorrect = i === item.correct;
          const isChosen = i === chosen;
          const tags = [isCorrect ? "Correct answer" : "", isChosen ? "Your answer" : ""].filter(Boolean);
          return (
            <li
              key={i}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 ${
                isCorrect ? "border-emerald-500 bg-emerald-500/10" : isChosen ? "border-dashed border-rose-500 bg-rose-500/10" : "border-border bg-background"
              }`}
            >
              <span className="text-xs font-semibold text-foreground">Option {OPTION_LABELS[i]}</span>
              {opt.fig && (
                <span className="block aspect-square w-full max-w-[6.5rem]">
                  <FigureSvg fig={opt.fig} label={`Option ${OPTION_LABELS[i]}: ${describeFig(opt.fig)}`} />
                </span>
              )}
              <span className="min-h-4 text-center text-[11px] font-medium text-foreground">
                {isCorrect && <Check className="mr-0.5 inline h-3 w-3" aria-hidden />}
                {isChosen && !isCorrect && <X className="mr-0.5 inline h-3 w-3" aria-hidden />}
                {tags.join(" · ")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ReviewList({ items, answers }: { items: IqItem[]; answers: Array<number | null> }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <ol className="space-y-2">
      {items.map((item, i) => {
        const a = answers[i] ?? null;
        const ok = a === item.correct;
        const expanded = open === i;
        const sec = SECTIONS.find((s) => s.id === item.section)?.label ?? "";
        return (
          <li key={item.id} className="rounded-xl border border-border bg-background">
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : i)}
              aria-expanded={expanded}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  ok ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : a === null ? "bg-muted text-muted-foreground" : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                }`}
                aria-hidden
              >
                {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              </span>
              <span className="font-medium">Question {i + 1}</span>
              <span className="text-xs text-muted-foreground">{sec}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {ok ? "Correct" : a === null ? "Not answered" : "Incorrect"}
              </span>
            </button>
            {expanded && (
              <div className="space-y-2 border-t border-border px-3 py-3 text-sm text-muted-foreground">
                <p className="text-foreground">{item.prompt}</p>
                <p>
                  Correct answer:{" "}
                  <strong className="text-foreground">
                    {OPTION_LABELS[item.correct]}
                    {item.options[item.correct]?.text ? ` - ${item.options[item.correct]?.text}` : ""}
                  </strong>
                  {a !== null && !ok && (
                    <>
                      {" "}
                      · You chose <strong className="text-foreground">{OPTION_LABELS[a]}</strong>
                    </>
                  )}
                </p>
                <ReviewFigures item={item} chosen={a} />
                <p>{item.explanation}</p>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Main component ───────────────────────────────────────── */

type Phase = "intro" | "test" | "results";

export default function IqTestTool({ tool }: { tool: Tool }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [items, setItems] = useState<IqItem[]>([]);
  const [answers, setAnswers] = useState<Array<number | null>>([]);
  const [flags, setFlags] = useState<boolean[]>([]);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(TIME_LIMIT_SECONDS);
  const [confirming, setConfirming] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [usedSeconds, setUsedSeconds] = useState(0);
  const [copied, setCopied] = useState(false);
  const endAtRef = useRef(0);
  const startedAtRef = useRef(0);
  const topRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const result = useMemo(
    () => (phase === "results" ? scoreTest(items, answers) : null),
    [phase, items, answers],
  );

  const start = useCallback(() => {
    const built = buildTest(newSeed());
    setItems(built);
    setAnswers(built.map(() => null));
    setFlags(built.map(() => false));
    setIndex(0);
    setConfirming(false);
    setTimedOut(false);
    setCopied(false);
    setRemaining(TIME_LIMIT_SECONDS);
    startedAtRef.current = Date.now();
    endAtRef.current = Date.now() + TIME_LIMIT_SECONDS * 1000;
    setPhase("test");
  }, []);

  const finish = useCallback((byTimeout: boolean) => {
    setUsedSeconds(
      byTimeout ? TIME_LIMIT_SECONDS : Math.min(TIME_LIMIT_SECONDS, Math.round((Date.now() - startedAtRef.current) / 1000)),
    );
    setTimedOut(byTimeout);
    setConfirming(false);
    setPhase("results");
    trackToolSuccess(SLUG, "complete");
  }, []);

  // Countdown. Based on the wall clock so a throttled background tab cannot stretch the limit.
  useEffect(() => {
    if (phase !== "test") return;
    const tick = () => {
      const left = Math.ceil((endAtRef.current - Date.now()) / 1000);
      if (left <= 0) {
        setRemaining(0);
        finish(true);
      } else {
        setRemaining(left);
      }
    };
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [phase, finish]);

  const choose = useCallback(
    (option: number) => {
      setAnswers((prev) => prev.map((a, i) => (i === index ? (a === option ? null : option) : a)));
    },
    [index],
  );

  const go = useCallback(
    (next: number) => {
      setIndex(Math.min(TOTAL_QUESTIONS - 1, Math.max(0, next)));
      setConfirming(false);
    },
    [],
  );

  // Keyboard: 1-5 pick an answer, arrows move between questions.
  useEffect(() => {
    if (phase !== "test") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key >= "1" && e.key <= "5") {
        choose(Number(e.key) - 1);
      } else if (e.key === "ArrowRight") {
        go(index + 1);
      } else if (e.key === "ArrowLeft") {
        go(index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, choose, go, index]);

  useEffect(() => {
    if (phase === "results") topRef.current?.scrollIntoView({ block: "start" });
  }, [phase]);

  // On start, retake and question changes, move focus and scroll to the current question heading.
  useEffect(() => {
    if (phase !== "test") return;
    const h = headingRef.current;
    if (!h) return;
    h.focus({ preventScroll: true });
    h.scrollIntoView({ block: "start" });
  }, [phase, index, items]);

  const answeredCount = answers.filter((a) => a !== null).length;
  const item = items[index];

  const summaryText = (r: IqResult) =>
    [
      `My DevBench IQ practice test estimate: ${r.iq} (likely range ${r.low}-${r.high}).`,
      `${r.correct}/${r.total} correct, ${formatPercentile(r.percentile)}.`,
      "This is an estimate for practice, not a clinical IQ score.",
      "https://www.devbench.co.in/tools/iq-test",
    ].join("\n");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      <div ref={topRef} className="animate-slide-up scroll-mt-24 space-y-6 rounded-2xl border border-border bg-card p-6">
        {phase === "intro" && (
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Brain className="mt-0.5 h-6 w-6 shrink-0 text-accent" aria-hidden />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  A {TOTAL_QUESTIONS}-question reasoning test with a {TIME_LIMIT_SECONDS / 60}-minute limit. It mixes
                  pattern, number, word and spatial puzzles that get harder as you go, and ends with an estimated
                  IQ score, a percentile and a breakdown by skill.
                </p>
                <p>
                  Everything runs in your browser. Your answers are not uploaded, stored or tied to an account.
                </p>
              </div>
            </div>

            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SECTIONS.map((s) => (
                <li key={s.id} className="rounded-xl border border-border bg-background p-3 text-sm">
                  <p className="font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.blurb}</p>
                </li>
              ))}
            </ul>

            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>The timer starts when you press Start and cannot be paused. Unanswered questions count as wrong.</li>
              <li>You can move back and forth, change answers and flag questions to revisit. Guessing is fine.</li>
              <li>Keyboard: press 1 to 5 to choose an answer and use the left and right arrow keys to move.</li>
              <li>
                Pattern, number, series and spatial puzzles are newly generated every attempt. The{" "}
                8 verbal questions are picked from a fixed pool of {VERBAL_POOL.length}, so
                some of them can repeat when you retake the test.
              </li>
            </ul>

            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
              <strong>This is an estimate, not a clinical assessment.</strong> The score is based on assumed average
              performance, not on a tested norm group, and it is not a diagnosis or a Mensa or professional IQ result.
              Treat it as a fun practice score. Sleep, stress and distractions also change results.
            </div>

            <button type="button" onClick={start} className={btnAccent}>
              <Clock className="h-4 w-4" aria-hidden />
              Start the test
            </button>
          </div>
        )}

        {phase === "test" && item && (
          <div className="space-y-5">
            <div className="sticky top-[3.25rem] z-20 -mx-6 -mt-2 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/95 px-6 py-2 backdrop-blur">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {SECTIONS.find((s) => s.id === item.section)?.label}
                </p>
                <p className="text-sm font-semibold" data-testid="iq-progress">
                  Question {index + 1} of {TOTAL_QUESTIONS}
                </p>
              </div>
              <div
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-sm tabular-nums ${
                  remaining <= 300 ? "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300" : "border-border bg-background"
                }`}
                role="timer"
                aria-label={`Time left ${formatClock(remaining)}`}
              >
                <Clock className="h-4 w-4" aria-hidden />
                <span data-testid="iq-timer">{formatClock(remaining)}</span>
              </div>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
              <div className="h-full bg-accent transition-all" style={{ width: `${(answeredCount / TOTAL_QUESTIONS) * 100}%` }} />
            </div>

            <section aria-label={`Question ${index + 1}`} className="space-y-4">
              <h2
                ref={headingRef}
                tabIndex={-1}
                aria-label={`Question ${index + 1} of ${TOTAL_QUESTIONS}: ${item.prompt}`}
                className="scroll-mt-36 text-base font-semibold leading-snug focus:outline-none"
              >
                {item.prompt}
              </h2>

              {item.section === "matrix" && <MatrixBoard item={item} />}

              {item.section === "spatial" && item.target && (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xs text-muted-foreground">Original</span>
                  <div className="aspect-square w-28 rounded-lg border border-border bg-background p-1.5">
                    <FigureSvg fig={item.target} label={`The original shape: ${describeFig(item.target)}`} />
                  </div>
                </div>
              )}

              <div
                className={
                  item.options[0]?.fig
                    ? "grid grid-cols-2 gap-2 sm:grid-cols-5"
                    : "grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
                }
                role="group"
                aria-label="Answer options"
              >
                {item.options.map((_, i) => (
                  <OptionButton
                    key={`${item.id}-${i}`}
                    label={OPTION_LABELS[i] as string}
                    index={i}
                    item={item}
                    selected={answers[index] === i}
                    onPick={() => choose(i)}
                  />
                ))}
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className={btnMuted}>
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Previous
              </button>
              <button
                type="button"
                onClick={() => setFlags((f) => f.map((v, i) => (i === index ? !v : v)))}
                aria-pressed={flags[index] ?? false}
                className={`${btnMuted} ${flags[index] ? "!bg-amber-500/20 !text-amber-800 dark:!text-amber-200" : ""}`}
              >
                <Flag className="h-4 w-4" aria-hidden />
                {flags[index] ? "Flagged" : "Flag"}
              </button>
              {index < TOTAL_QUESTIONS - 1 ? (
                <button type="button" onClick={() => go(index + 1)} className={btnAccent}>
                  {answers[index] === null ? "Skip" : "Next"}
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              ) : (
                <button type="button" onClick={() => setConfirming(true)} className={btnAccent}>
                  Finish test
                </button>
              )}
              <button type="button" onClick={() => setConfirming(true)} className={`${btnMuted} ml-auto`}>
                Submit early
              </button>
            </div>

            {confirming && (
              <div role="alertdialog" aria-label="Confirm submit" className="space-y-3 rounded-xl border border-border bg-background p-4 text-sm">
                <p>
                  You have answered <strong>{answeredCount}</strong> of {TOTAL_QUESTIONS} questions
                  {answeredCount < TOTAL_QUESTIONS ? `; ${TOTAL_QUESTIONS - answeredCount} unanswered will count as wrong` : ""}.
                  Submit now?
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => finish(false)} className={btnAccent}>
                    Submit and see my score
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} className={btnMuted}>
                    Keep going
                  </button>
                </div>
              </div>
            )}

            <nav aria-label="Question navigator">
              <ol className="grid grid-cols-5 gap-2 sm:grid-cols-[repeat(20,minmax(0,1fr))] sm:gap-1.5">
                {items.map((it, i) => {
                  const answered = answers[i] !== null;
                  const current = i === index;
                  return (
                    <li key={it.id}>
                      <button
                        type="button"
                        onClick={() => go(i)}
                        aria-label={`Question ${i + 1}${answered ? ", answered" : ""}${flags[i] ? ", flagged" : ""}`}
                        aria-current={current ? "step" : undefined}
                        className={`relative flex h-11 w-full items-center sm:h-8 justify-center rounded-md border text-xs font-medium transition-colors ${
                          current
                            ? "border-accent bg-accent text-accent-foreground"
                            : answered
                              ? "border-accent/40 bg-accent/10 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        {i + 1}
                        {flags[i] && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" aria-hidden />}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        )}

        {phase === "results" && result && (
          <div className="space-y-6">
            {timedOut && (
              <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
                Time ran out, so the test was submitted with the answers you had.
              </p>
            )}

            <div className="rounded-2xl border border-border bg-background p-6 text-center" aria-live="polite">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your estimated IQ</p>
              <p className="mt-1 text-6xl font-bold tabular-nums" data-testid="iq-score">
                {result.iq}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Likely range {result.low} to {result.high} · {result.band}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Roughly {formatPercentile(result.percentile)} on the standard IQ scale
              </p>
              <IqScale result={result} />
              {(result.iq <= IQ_MIN || result.iq >= IQ_MAX) && (
                <p className="mt-3 text-xs text-muted-foreground">
                  This test cannot tell scores apart beyond {IQ_MIN} to {IQ_MAX}, so your estimate sits at the edge of its range.
                </p>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                ["Correct", `${result.correct} / ${result.total}`],
                ["Answered", `${result.answered} / ${result.total}`],
                ["Time used", formatClock(usedSeconds)],
                ["Difficulty-weighted", `${Math.round(result.weightedPercent)}%`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border bg-background p-3">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="text-lg font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>

            <section aria-label="Results by skill" className="space-y-3">
              <h2 className="text-base font-semibold">By skill</h2>
              {result.sections.map((s) => {
                const pct = s.total === 0 ? 0 : (s.correct / s.total) * 100;
                return (
                  <div key={s.id}>
                    <div className="flex justify-between text-sm">
                      <span>{s.label}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {s.correct} / {s.total}
                      </span>
                    </div>
                    <div
                      className="mt-1 h-2 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-label={`${s.label} score`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(pct)}
                    >
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </section>

            <p className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              How the score is built: each correct answer earns points equal to its difficulty (1 to 5). Your
              weighted total is compared with the total an average adult is assumed to earn, converted to a
              score with an average of 100 and a spread of 15, and capped at {IQ_MIN} to {IQ_MAX}. These
              assumptions are not tested against a real norm group, so this is a practice estimate, not a
              clinical or official IQ result.
            </p>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={start} className={btnAccent}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                Take it again with new questions
              </button>
              <button
                type="button"
                onClick={async () => {
                  const ok = await copyWithFeedback(summaryText(result));
                  setCopied(ok);
                }}
                className={btnMuted}
              >
                <Copy className="h-4 w-4" aria-hidden />
                {copied ? "Copied" : "Copy my result"}
              </button>
            </div>

            <section aria-label="Answer review" className="space-y-3">
              <h2 className="text-base font-semibold">Review your answers</h2>
              <ReviewList items={items} answers={answers} />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
