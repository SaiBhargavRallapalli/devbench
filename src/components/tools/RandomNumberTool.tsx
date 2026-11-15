"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Shuffle, Trash2, Dices } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import { randomInts } from "@/lib/random-numbers";
import { copyWithFeedback } from "@/lib/clipboard";

const inp =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";
const btn =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const btnAccent = `${btn} bg-accent text-accent-foreground hover:bg-accent/90`;

const PRESETS: { label: string; min: number; max: number }[] = [
  { label: "1–10", min: 1, max: 10 },
  { label: "1–50", min: 1, max: 50 },
  { label: "1–100", min: 1, max: 100 },
  { label: "1–1000", min: 1, max: 1000 },
];

export default function RandomNumberTool({ tool }: { tool: Tool }) {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(false);
  const [sort, setSort] = useState(false);
  const [values, setValues] = useState<number[]>([]);
  const [history, setHistory] = useState<number[][]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rangeSize = max - min + 1;
  const uniqueImpossible = unique && count > rangeSize;

  const generate = () => {
    if (max < min) {
      setError("Max must be greater than or equal to min.");
      return;
    }
    if (uniqueImpossible) {
      setError(
        `Can't pick ${count} unique numbers from a range of only ${rangeSize}.`,
      );
      return;
    }
    setError(null);
    try {
      const next = randomInts({ min, max, count, unique, sort });
      setValues(next);
      setHistory((h) => [next, ...h].slice(0, 12));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate numbers.");
    }
  };

  const copy = () => {
    copyWithFeedback(values.join(", ")).then((ok) => {
      if (!ok) return;
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const summary = useMemo(() => {
    if (values.length === 0) return null;
    return { min: Math.min(...values), max: Math.max(...values), sum: values.reduce((a, b) => a + b, 0) };
  }, [values]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 space-y-5">
        {/* Range */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-28">
            <label htmlFor="rn-min" className="mb-1.5 block text-sm font-medium">Min</label>
            <input
              id="rn-min"
              type="number"
              value={min}
              onChange={(e) => setMin(parseInt(e.target.value) || 0)}
              className={inp}
            />
          </div>
          <div className="w-28">
            <label htmlFor="rn-max" className="mb-1.5 block text-sm font-medium">Max</label>
            <input
              id="rn-max"
              type="number"
              value={max}
              onChange={(e) => setMax(parseInt(e.target.value) || 0)}
              className={inp}
            />
          </div>
          <div className="w-24">
            <label htmlFor="rn-count" className="mb-1.5 block text-sm font-medium">How many</label>
            <input
              id="rn-count"
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              className={inp}
            />
          </div>
          <button onClick={generate} className={btnAccent}>
            <Shuffle className="h-4 w-4" aria-hidden />
            Generate
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { setMin(p.min); setMax(p.max); }}
              className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {p.label}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-border" aria-hidden />
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={unique}
              onChange={(e) => setUnique(e.target.checked)}
              className="h-3.5 w-3.5 accent-accent"
            />
            No repeats
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={sort}
              onChange={(e) => setSort(e.target.checked)}
              className="h-3.5 w-3.5 accent-accent"
            />
            Sort ascending
          </label>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Result */}
        <section aria-label="Generated numbers" className="min-h-20 space-y-3">
          {values.length === 0 ? (
            <p className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              Pick a range and press <strong className="text-foreground">Generate</strong>.
              Numbers are drawn fresh from your browser&apos;s random number
              generator every time — fair, unpredictable and never sent anywhere.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {values.length} number{values.length === 1 ? "" : "s"} (newest first)
                </p>
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
                >
                  {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <ul className="flex flex-wrap gap-2" aria-label="Results">
                {values.map((v, i) => (
                  <li
                    key={`${v}-${i}`}
                    className="animate-dice-pop min-w-14 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 text-center font-mono text-lg font-semibold tabular-nums text-foreground"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    {v}
                  </li>
                ))}
              </ul>
              {summary && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["Lowest", summary.min],
                    ["Highest", summary.max],
                    ["Total", summary.sum],
                  ].map(([label, v]) => (
                    <div key={label as string} className="rounded-xl border border-border bg-muted/20 p-3 text-center">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                      <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">{v}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* History */}
        <section aria-label="Recent draws" className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Recent draws
            </p>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No draws yet.</p>
          ) : (
            <ol className="space-y-1.5">
              {history.map((row, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm"
                >
                  <Dices className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="truncate font-mono tabular-nums text-muted-foreground">
                    {row.join(", ")}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
