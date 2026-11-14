"use client";

import { useState, type FormEvent } from "react";
import { Dices, History, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import {
  DIE_PIPS,
  flipCoin,
  outlookOf,
  randomAnswer,
  rollDice,
  type CoinSide,
} from "@/lib/fun-random";

const btn =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const btnAccent = `${btn} bg-accent text-accent-foreground hover:bg-accent/90`;
const btnMuted = `${btn} bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80`;
const inp =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

const OUTLOOK_TEXT: Record<string, string> = {
  positive: "text-emerald-700 dark:text-emerald-400",
  negative: "text-rose-700 dark:text-rose-400",
  neutral: "text-amber-700 dark:text-amber-400",
};

/* ── Coin Flip ─────────────────────────────────────────────── */

function CoinFlip() {
  const [result, setResult] = useState<CoinSide | null>(null);
  const [flipSeq, setFlipSeq] = useState(0);
  const [history, setHistory] = useState<CoinSide[]>([]);

  const heads = history.filter((h) => h === "heads").length;
  const tails = history.length - heads;

  const flip = () => {
    const side = flipCoin();
    setResult(side);
    setFlipSeq((s) => s + 1);
    setHistory((h) => [side, ...h].slice(0, 20));
  };

  return (
    <>
      <div className="flex flex-col items-center gap-5">
        <div className="[perspective:800px]">
          <div
            key={flipSeq}
            aria-live="polite"
            aria-label={result ? `Coin landed on ${result}` : "Coin not flipped yet"}
            className={`flex h-40 w-40 items-center justify-center rounded-full border-4 border-amber-500/70 bg-gradient-to-b from-amber-200 to-amber-400 text-amber-950 shadow-lg dark:from-amber-300 dark:to-amber-500 ${
              flipSeq > 0 ? "animate-coin-flip" : ""
            }`}
          >
            <span className="text-xl font-bold uppercase tracking-widest">
              {result ?? "Flip"}
            </span>
          </div>
        </div>
        <button onClick={flip} className={btnAccent}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Flip coin
        </button>
        {result && (
          <p className="text-sm text-muted-foreground">
            {history.length} flip{history.length === 1 ? "" : "s"} recorded —{" "}
            <strong className="text-foreground">{heads} heads</strong>,{" "}
            <strong className="text-foreground">{tails} tails</strong>
          </p>
        )}
      </div>

      <section aria-label="Flip history" className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Last {Math.min(history.length, 20)} flips (newest first)
          </p>
          {history.length > 0 && (
            <button onClick={() => setHistory([])} className={`${btnMuted} px-3 py-1.5 text-xs`}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Clear
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="rounded-xl border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
            No flips yet — press Flip coin. Each flip is independent: the coin
            has no memory of the last one.
          </p>
        ) : (
          <ol className="flex flex-wrap gap-1.5" aria-label="Flip results">
            {history.map((side, i) => (
              <li
                key={`${flipSeq}-${i}`}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                  side === "heads"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    : "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                }`}
              >
                {side === "heads" ? "H" : "T"}
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

/* ── Dice Roller ───────────────────────────────────────────── */

interface RollRecord {
  values: number[];
  total: number;
}

function Die({ face, label }: { face: number; label: string }) {
  const pips = DIE_PIPS[face] ?? [];
  return (
    <div
      role="img"
      aria-label={label}
      className="grid aspect-square w-16 grid-cols-3 gap-1 rounded-xl border border-border bg-background p-2 shadow-sm"
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="flex items-center justify-center">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              pips.includes(i) ? "bg-foreground" : "opacity-0"
            }`}
          />
        </span>
      ))}
    </div>
  );
}

function DiceRoller() {
  const [count, setCount] = useState(2);
  const [roll, setRoll] = useState<RollRecord | null>(null);
  const [rollSeq, setRollSeq] = useState(0);
  const [history, setHistory] = useState<RollRecord[]>([]);

  const doRoll = () => {
    const next = rollDice(count, 6);
    setRoll(next);
    setRollSeq((s) => s + 1);
    setHistory((h) => [next, ...h].slice(0, 10));
  };

  return (
    <>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="mb-1.5 text-sm font-medium">Number of dice</p>
          <div role="group" aria-label="Number of dice" className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                aria-pressed={count === n}
                className={`h-10 w-10 rounded-xl text-sm font-medium transition-colors ${
                  count === n
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <button onClick={doRoll} className={btnAccent}>
          <Dices className="h-4 w-4" aria-hidden />
          Roll {count}d6
        </button>
        {roll && (
          <p className="ml-auto text-3xl font-bold tabular-nums text-foreground" aria-live="polite">
            {roll.total}
          </p>
        )}
      </div>

      <section aria-label="Dice result" className="min-h-20">
        {!roll ? (
          <p className="rounded-xl border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
            No rolls yet — pick how many dice and press Roll. Fair six-sided
            dice, rolled locally: no server, no seed, just your browser&apos;s
            random number generator.
          </p>
        ) : (
          <div key={rollSeq} className="flex flex-wrap items-center gap-3">
            {roll.values.map((v, i) => (
              <div key={i} className="animate-dice-pop" style={{ animationDelay: `${i * 40}ms` }}>
                <Die face={v} label={`Die ${i + 1}: ${v}`} />
              </div>
            ))}
            <p className="text-sm text-muted-foreground">
              {roll.values.join(" + ")} ={" "}
              <strong className="text-foreground">{roll.total}</strong>
            </p>
          </div>
        )}
      </section>

      <section aria-label="Roll history" className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Last {history.length} roll{history.length === 1 ? "" : "s"} (newest first)
          </p>
          {history.length > 0 && (
            <button onClick={() => setHistory([])} className={`${btnMuted} px-3 py-1.5 text-xs`}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Clear
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing rolled yet.</p>
        ) : (
          <ol className="space-y-1.5">
            {history.map((r, i) => (
              <li
                key={`${rollSeq}-${i}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm"
              >
                <span className="w-8 text-xs font-medium uppercase text-muted-foreground">
                  {r.values.length}d6
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {r.values.join(" + ")}
                </span>
                <span className="ml-auto font-semibold tabular-nums text-foreground">
                  = {r.total}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

/* ── Magic 8-Ball ──────────────────────────────────────────── */

function Magic8Ball() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [askSeq, setAskSeq] = useState(0);
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);

  const ask = (e: FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    const a = randomAnswer();
    setAnswer(a);
    setAskSeq((s) => s + 1);
    setHistory((h) => [{ q, a }, ...h].slice(0, 8));
    setQuestion("");
  };

  const outlook = answer ? outlookOf(answer) : null;

  return (
    <>
      <form onSubmit={ask} className="flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1">
          <label htmlFor="m8-question" className="mb-1.5 block text-sm font-medium">
            Ask a yes-or-no question
          </label>
          <input
            id="m8-question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Will I finish this project on time?"
            maxLength={140}
            className={inp}
          />
        </div>
        <button type="submit" disabled={!question.trim()} className={btnAccent}>
          <Sparkles className="h-4 w-4" aria-hidden />
          Ask
        </button>
      </form>

      <div className="flex flex-col items-center gap-4">
        <div
          role="status"
          aria-live="polite"
          aria-label={answer ? `The answer is: ${answer}` : "The 8-Ball awaits your question"}
          className="flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-b from-indigo-600 to-indigo-950 shadow-lg ring-4 ring-indigo-400/30"
        >
          <div
            key={askSeq}
            className={`flex h-28 w-28 items-center justify-center rounded-full bg-white px-3 text-center shadow-inner dark:bg-slate-100 ${
              askSeq > 0 ? "animate-answer-in" : ""
            }`}
          >
            {answer ? (
              <span className={`text-xs font-semibold leading-snug ${OUTLOOK_TEXT[outlook ?? "neutral"]}`}>
                {answer}
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Ask me anything</span>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          20 classic answers — 10 yes, 5 no, 5 &ldquo;ask again&rdquo;. The
          ball forgets every previous question.
        </p>
      </div>

      <section aria-label="Question history" className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Last {history.length} question{history.length === 1 ? "" : "s"}
          </p>
          {history.length > 0 && (
            <button onClick={() => setHistory([])} className={`${btnMuted} px-3 py-1.5 text-xs`}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Clear
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="rounded-xl border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
            No questions yet — type one above and press Ask. Answers are drawn
            at random from the fixed deck, so the ball never runs out of
            opinions but never knows anything either.
          </p>
        ) : (
          <ol className="space-y-1.5">
            {history.map((item, i) => (
              <li
                key={`${askSeq}-${i}`}
                className="rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm"
              >
                <p className="text-muted-foreground">{item.q}</p>
                <p className={`mt-1 font-medium ${OUTLOOK_TEXT[outlookOf(item.a) ?? "neutral"]}`}>
                  {item.a}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

/* ── Router ────────────────────────────────────────────────── */

export default function FunRandomTools({ tool }: { tool: Tool }) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 space-y-5">
        {tool.slug === "coin-flip" && <CoinFlip />}
        {tool.slug === "dice-roller" && <DiceRoller />}
        {tool.slug === "magic-8-ball" && <Magic8Ball />}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <History className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Everything runs locally in your browser — history lives in memory
          only and disappears when you leave the page.
        </p>
      </div>
    </main>
  );
}
