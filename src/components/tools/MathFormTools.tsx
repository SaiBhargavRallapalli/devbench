"use client";

import { cloneElement, isValidElement, useId, useMemo, useState } from "react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";

const inp =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 font-mono";

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

function ResultBlock({ title, rows }: { title: string; rows: { label: string; value: string }[] }) {
  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent">{title}</p>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-muted-foreground">{r.label}</span>
            <span className="font-mono text-sm font-semibold text-foreground">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Quadratic Solver ────────────────────────────────────────────────────────
function QuadraticSolver() {
  const [a, setA] = useState("1");
  const [b, setB] = useState("-5");
  const [c, setC] = useState("6");

  const out = useMemo(() => {
    const A = parseFloat(a);
    const B = parseFloat(b);
    const C = parseFloat(c);
    if (!isFinite(A) || !isFinite(B) || !isFinite(C)) return null;
    if (A === 0) return { error: "Coefficient a cannot be 0 (not a quadratic)." };
    const disc = B * B - 4 * A * C;
    const vertex = { x: -B / (2 * A), y: C - B * B / (4 * A) };
    if (disc > 0) {
      const x1 = (-B + Math.sqrt(disc)) / (2 * A);
      const x2 = (-B - Math.sqrt(disc)) / (2 * A);
      return { type: "two real roots", roots: [`x₁ = ${+x1.toPrecision(8)}`, `x₂ = ${+x2.toPrecision(8)}`], disc, vertex };
    } else if (disc === 0) {
      const x = -B / (2 * A);
      return { type: "one repeated root", roots: [`x = ${+x.toPrecision(8)}`], disc, vertex };
    } else {
      const re = (-B / (2 * A));
      const im = Math.sqrt(-disc) / (2 * A);
      return {
        type: "complex roots",
        roots: [`x₁ = ${+re.toPrecision(6)} + ${+im.toPrecision(6)}i`, `x₂ = ${+re.toPrecision(6)} − ${+im.toPrecision(6)}i`],
        disc,
        vertex,
      };
    }
  }, [a, b, c]);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 font-mono text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">ax² + bx + c = 0</span>
        {a && b && c && (
          <span className="ml-3 text-xs">
            {a}x² {parseFloat(b) >= 0 ? "+" : "−"} {Math.abs(parseFloat(b))}x {parseFloat(c) >= 0 ? "+" : "−"} {Math.abs(parseFloat(c))} = 0
          </span>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="a  (coefficient of x²)" hint="Cannot be 0">
          <input type="number" step="any" value={a} onChange={(e) => setA(e.target.value)} className={inp} />
        </Field>
        <Field label="b  (coefficient of x)">
          <input type="number" step="any" value={b} onChange={(e) => setB(e.target.value)} className={inp} />
        </Field>
        <Field label="c  (constant term)">
          <input type="number" step="any" value={c} onChange={(e) => setC(e.target.value)} className={inp} />
        </Field>
      </div>
      {out && "error" in out && <p className="text-sm text-destructive">{out.error}</p>}
      {out && !("error" in out) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <ResultBlock
            title={`${out.type} (discriminant = ${+out.disc.toPrecision(6)})`}
            rows={out.roots.map((r, i) => ({ label: `Root ${i + 1}`, value: r }))}
          />
          <ResultBlock title="Vertex" rows={[
            { label: "x-coordinate", value: `${+out.vertex.x.toPrecision(6)}` },
            { label: "y-coordinate", value: `${+out.vertex.y.toPrecision(6)}` },
          ]} />
        </div>
      )}
    </div>
  );
}

// ─── Pythagorean Theorem ─────────────────────────────────────────────────────
type PytagSide = "a" | "b" | "c";

function PythagoreanTheorem() {
  const [vals, setVals] = useState<Record<PytagSide, string>>({ a: "3", b: "4", c: "" });
  const [missing, setMissing] = useState<PytagSide>("c");

  const set = (k: PytagSide, v: string) => setVals((prev) => ({ ...prev, [k]: v }));

  const out = useMemo(() => {
    const known = (["a", "b", "c"] as PytagSide[]).filter((k) => k !== missing);
    const v1 = parseFloat(vals[known[0]]);
    const v2 = parseFloat(vals[known[1]]);
    if (!isFinite(v1) || !isFinite(v2) || v1 <= 0 || v2 <= 0) return null;
    let result: number;
    if (missing === "c") {
      result = Math.sqrt(v1 ** 2 + v2 ** 2);
    } else if (missing === "a") {
      const sq = v2 ** 2 - v1 ** 2;
      if (sq <= 0) return { error: "c must be greater than b for a valid triangle." };
      result = Math.sqrt(sq);
    } else {
      const sq = v2 ** 2 - v1 ** 2;
      if (sq <= 0) return { error: "c must be greater than a for a valid triangle." };
      result = Math.sqrt(sq);
    }
    const sides: Record<PytagSide, number> = { a: 0, b: 0, c: 0 };
    sides[known[0]] = v1;
    sides[known[1]] = v2;
    sides[missing] = result;
    const area = 0.5 * sides.a * sides.b;
    const perimeter = sides.a + sides.b + sides.c;
    return { result, sides, area, perimeter };
  }, [vals, missing]);

  const sideLabels: Record<PytagSide, string> = { a: "Leg a", b: "Leg b", c: "Hypotenuse c" };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 font-mono text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">a² + b² = c²</span>
        <span className="ml-3 text-xs">Right triangle — enter two sides to find the third</span>
      </div>
      <Field label="Which side to solve for?">
        <div className="flex gap-2 mt-1">
          {(["a", "b", "c"] as PytagSide[]).map((s) => (
            <button key={s} onClick={() => setMissing(s)}
              className={`rounded-lg px-4 py-2 font-mono text-sm font-medium transition-colors ${missing === s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              Find {s}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        {(["a", "b", "c"] as PytagSide[]).map((s) => (
          <Field key={s} label={sideLabels[s]}>
            {missing === s ? (
              <div className={`${inp} flex items-center justify-between text-muted-foreground`}>
                <span>Solving for {s}…</span>
                {out && !("error" in out) && (
                  <span className="font-semibold text-accent">{+out.sides[s].toPrecision(8)}</span>
                )}
              </div>
            ) : (
              <input type="number" min={0.001} step="any" value={vals[s]} onChange={(e) => set(s, e.target.value)} className={inp} />
            )}
          </Field>
        ))}
      </div>
      {out && "error" in out && <p className="text-sm text-destructive">{out.error}</p>}
      {out && !("error" in out) && (
        <ResultBlock title="Triangle Properties" rows={[
          { label: `${sideLabels[missing]}`, value: `${+out.result.toPrecision(8)}` },
          { label: "Area  (½ab)", value: `${+out.area.toPrecision(8)}` },
          { label: "Perimeter", value: `${+out.perimeter.toPrecision(8)}` },
        ]} />
      )}
    </div>
  );
}

// ─── GCD & LCM ───────────────────────────────────────────────────────────────
function gcdTwo(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function GcdLcmCalculator() {
  const [a, setA] = useState("48");
  const [b, setB] = useState("18");

  const out = useMemo(() => {
    const A = parseInt(a);
    const B = parseInt(b);
    if (!isFinite(A) || !isFinite(B) || A <= 0 || B <= 0) return null;
    const g = gcdTwo(A, B);
    const l = (A / g) * B;
    return { a: A, b: B, gcd: g, lcm: l };
  }, [a, b]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First integer (a)" hint="Positive whole number">
          <input type="number" min={1} step={1} value={a} onChange={(e) => setA(e.target.value)} className={inp} />
        </Field>
        <Field label="Second integer (b)" hint="Positive whole number">
          <input type="number" min={1} step={1} value={b} onChange={(e) => setB(e.target.value)} className={inp} />
        </Field>
      </div>
      {out ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <ResultBlock title="Greatest Common Divisor" rows={[
            { label: "GCD(a, b)", value: String(out.gcd) },
            { label: `${out.a} = ${out.gcd} × ${out.a / out.gcd}`, value: "" },
            { label: `${out.b} = ${out.gcd} × ${out.b / out.gcd}`, value: "" },
          ]} />
          <ResultBlock title="Least Common Multiple" rows={[
            { label: "LCM(a, b)", value: String(out.lcm) },
            { label: "Formula: a × b / GCD", value: `${out.a} × ${out.b} / ${out.gcd}` },
          ]} />
        </div>
      ) : (
        <p className="text-sm text-destructive">Enter two positive integers.</p>
      )}
    </div>
  );
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────
export default function MathFormTools({ tool }: { tool: Tool }) {
  const body = (() => {
    switch (tool.slug) {
      case "quadratic-solver":     return <QuadraticSolver />;
      case "pythagorean-theorem":  return <PythagoreanTheorem />;
      case "gcd-lcm-calculator":   return <GcdLcmCalculator />;
      default:                     return null;
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
