"use client";

import { cloneElement, isValidElement, useId, useMemo, useState } from "react";
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
      <p className={`mt-1.5 text-2xl font-bold tabular-nums ${accent ? "text-accent" : "text-foreground"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── BMR Calculator ─────────────────────────────────────────────────────────
function BmrCalculator() {
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("170");
  const [age, setAge] = useState("30");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const out = useMemo(() => {
    let W = parseFloat(weight);
    let H = parseFloat(height);
    const A = parseFloat(age);
    if (!isFinite(W) || !isFinite(H) || !isFinite(A) || W <= 0 || H <= 0 || A <= 0) return null;
    if (unit === "imperial") {
      W = W * 0.453592;
      H = H * 2.54;
    }
    const bmr = sex === "male"
      ? 10 * W + 6.25 * H - 5 * A + 5
      : 10 * W + 6.25 * H - 5 * A - 161;
    return { bmr };
  }, [weight, height, age, sex, unit]);

  return (
    <div className="space-y-5">
      <div className="flex gap-2 mb-1">
        {(["metric", "imperial"] as const).map((u) => (
          <button key={u} onClick={() => setUnit(u)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${unit === u ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {u === "metric" ? "Metric (kg, cm)" : "Imperial (lb, in)"}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={unit === "metric" ? "Weight (kg)" : "Weight (lb)"}>
          <input type="number" min={1} step={0.1} value={weight} onChange={(e) => setWeight(e.target.value)} className={inp} />
        </Field>
        <Field label={unit === "metric" ? "Height (cm)" : "Height (in)"}>
          <input type="number" min={1} step={0.5} value={height} onChange={(e) => setHeight(e.target.value)} className={inp} />
        </Field>
        <Field label="Age (years)">
          <input type="number" min={1} max={120} step={1} value={age} onChange={(e) => setAge(e.target.value)} className={inp} />
        </Field>
        <Field label="Biological sex">
          <select value={sex} onChange={(e) => setSex(e.target.value as "male" | "female")} className={sel}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>
      </div>
      {out ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Basal Metabolic Rate" value={`${Math.round(out.bmr)} kcal/day`} accent sub="Calories burned at complete rest" />
            <StatCard label="Formula" value="Mifflin–St Jeor" sub="Most accurate for general population" />
          </div>
          <p className="text-xs text-muted-foreground">BMR is your calorie need at rest. Multiply by an activity factor to get your TDEE.</p>
        </>
      ) : (
        <p className="text-sm text-destructive">Enter valid positive numbers.</p>
      )}
    </div>
  );
}

// ─── Calorie / TDEE ──────────────────────────────────────────────────────────
const ACTIVITY_LEVELS = [
  { value: "1.2",  label: "Sedentary",        desc: "Little or no exercise" },
  { value: "1.375",label: "Lightly active",   desc: "Light exercise 1–3 days/week" },
  { value: "1.55", label: "Moderately active", desc: "Moderate exercise 3–5 days/week" },
  { value: "1.725",label: "Very active",      desc: "Hard exercise 6–7 days/week" },
  { value: "1.9",  label: "Extra active",     desc: "Very hard exercise or physical job" },
];

function CalorieCalculator() {
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("170");
  const [age, setAge] = useState("30");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState("1.55");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const out = useMemo(() => {
    let W = parseFloat(weight);
    let H = parseFloat(height);
    const A = parseFloat(age);
    const act = parseFloat(activity);
    if (!isFinite(W) || !isFinite(H) || !isFinite(A) || W <= 0 || H <= 0 || A <= 0) return null;
    if (unit === "imperial") { W = W * 0.453592; H = H * 2.54; }
    const bmr = sex === "male"
      ? 10 * W + 6.25 * H - 5 * A + 5
      : 10 * W + 6.25 * H - 5 * A - 161;
    const tdee = bmr * act;
    return { bmr, tdee, lose: tdee - 500, gain: tdee + 500 };
  }, [weight, height, age, sex, activity, unit]);

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(["metric", "imperial"] as const).map((u) => (
          <button key={u} onClick={() => setUnit(u)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${unit === u ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {u === "metric" ? "Metric (kg, cm)" : "Imperial (lb, in)"}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={unit === "metric" ? "Weight (kg)" : "Weight (lb)"}>
          <input type="number" min={1} step={0.1} value={weight} onChange={(e) => setWeight(e.target.value)} className={inp} />
        </Field>
        <Field label={unit === "metric" ? "Height (cm)" : "Height (in)"}>
          <input type="number" min={1} step={0.5} value={height} onChange={(e) => setHeight(e.target.value)} className={inp} />
        </Field>
        <Field label="Age (years)">
          <input type="number" min={1} max={120} step={1} value={age} onChange={(e) => setAge(e.target.value)} className={inp} />
        </Field>
        <Field label="Biological sex">
          <select value={sex} onChange={(e) => setSex(e.target.value as "male" | "female")} className={sel}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>
      </div>
      <Field label="Activity level" hint="Choose the option that best describes your weekly activity">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mt-1">
          {ACTIVITY_LEVELS.map((lvl) => (
            <button key={lvl.value} onClick={() => setActivity(lvl.value)}
              className={`rounded-xl border p-3 text-left transition-colors ${activity === lvl.value ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}>
              <p className="text-sm font-medium">{lvl.label}</p>
              <p className="text-xs text-muted-foreground">{lvl.desc}</p>
            </button>
          ))}
        </div>
      </Field>
      {out ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="BMR" value={`${Math.round(out.bmr)} kcal`} sub="At complete rest" />
          <StatCard label="Maintenance (TDEE)" value={`${Math.round(out.tdee)} kcal`} accent sub="To maintain current weight" />
          <StatCard label="Weight loss" value={`${Math.round(out.lose)} kcal`} sub="~0.5 kg/week deficit" />
          <StatCard label="Weight gain" value={`${Math.round(out.gain)} kcal`} sub="~0.5 kg/week surplus" />
        </div>
      ) : (
        <p className="text-sm text-destructive">Enter valid positive numbers.</p>
      )}
    </div>
  );
}

// ─── Water Intake ────────────────────────────────────────────────────────────
function WaterIntakeCalculator() {
  const [weight, setWeight] = useState("70");
  const [exercise, setExercise] = useState("30");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [climate, setClimate] = useState<"temperate" | "hot">("temperate");

  const out = useMemo(() => {
    let W = parseFloat(weight);
    const ex = parseFloat(exercise) || 0;
    if (!isFinite(W) || W <= 0) return null;
    if (unit === "imperial") W = W * 0.453592;
    const base = W * 35;
    const exBonus = (ex / 30) * 350;
    const climateBonus = climate === "hot" ? 500 : 0;
    const totalMl = base + exBonus + climateBonus;
    const totalL = totalMl / 1000;
    const glasses8oz = totalMl / 240;
    return { totalMl, totalL, glasses8oz };
  }, [weight, exercise, unit, climate]);

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(["metric", "imperial"] as const).map((u) => (
          <button key={u} onClick={() => setUnit(u)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${unit === u ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {u === "metric" ? "Metric (kg)" : "Imperial (lb)"}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={unit === "metric" ? "Body weight (kg)" : "Body weight (lb)"} hint="Your current body weight">
          <input type="number" min={1} step={0.5} value={weight} onChange={(e) => setWeight(e.target.value)} className={inp} />
        </Field>
        <Field label="Exercise duration (min/day)" hint="Average daily exercise time">
          <input type="number" min={0} step={5} value={exercise} onChange={(e) => setExercise(e.target.value)} className={inp} />
        </Field>
        <Field label="Climate" hint="Your typical environment">
          <select value={climate} onChange={(e) => setClimate(e.target.value as "temperate" | "hot")} className={sel}>
            <option value="temperate">Temperate / cool</option>
            <option value="hot">Hot / humid</option>
          </select>
        </Field>
      </div>
      {out ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Daily water" value={`${out.totalL.toFixed(1)} L`} accent sub={`${Math.round(out.totalMl)} ml`} />
          <StatCard label="8 oz glasses" value={`${out.glasses8oz.toFixed(1)}`} sub="Standard glasses per day" />
          <StatCard label="Basis" value="35 ml / kg" sub="+exercise & climate adjustments" />
        </div>
      ) : (
        <p className="text-sm text-destructive">Enter a valid body weight.</p>
      )}
    </div>
  );
}

// ─── Body Fat Estimator ──────────────────────────────────────────────────────
const BF_BANDS_M = [
  { max: 6,  label: "Essential fat",  color: "text-blue-500" },
  { max: 13, label: "Athletic",       color: "text-green-500" },
  { max: 17, label: "Fitness",        color: "text-emerald-500" },
  { max: 24, label: "Average",        color: "text-yellow-500" },
  { max: Infinity, label: "Obese",    color: "text-red-500" },
];
const BF_BANDS_F = [
  { max: 14, label: "Essential fat",  color: "text-blue-500" },
  { max: 20, label: "Athletic",       color: "text-green-500" },
  { max: 24, label: "Fitness",        color: "text-emerald-500" },
  { max: 31, label: "Average",        color: "text-yellow-500" },
  { max: Infinity, label: "Obese",    color: "text-red-500" },
];

function BodyFatCalculator() {
  const [weight, setWeight] = useState("75");
  const [height, setHeight] = useState("175");
  const [age, setAge] = useState("30");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const out = useMemo(() => {
    let W = parseFloat(weight);
    let H = parseFloat(height);
    const A = parseFloat(age);
    if (!isFinite(W) || !isFinite(H) || !isFinite(A) || W <= 0 || H <= 0 || A <= 0) return null;
    if (unit === "imperial") { W = W * 0.453592; H = H * 2.54; }
    const heightM = H / 100;
    const bmi = W / (heightM * heightM);
    const bfPct = 1.2 * bmi + 0.23 * A - (sex === "male" ? 16.2 : 5.4);
    const fatMass = (bfPct / 100) * W;
    const leanMass = W - fatMass;
    const bands = sex === "male" ? BF_BANDS_M : BF_BANDS_F;
    const band = bands.find((b) => bfPct <= b.max) ?? bands[bands.length - 1];
    return { bfPct, fatMass, leanMass, bmi, band };
  }, [weight, height, age, sex, unit]);

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(["metric", "imperial"] as const).map((u) => (
          <button key={u} onClick={() => setUnit(u)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${unit === u ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {u === "metric" ? "Metric (kg, cm)" : "Imperial (lb, in)"}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={unit === "metric" ? "Weight (kg)" : "Weight (lb)"}>
          <input type="number" min={1} step={0.1} value={weight} onChange={(e) => setWeight(e.target.value)} className={inp} />
        </Field>
        <Field label={unit === "metric" ? "Height (cm)" : "Height (in)"}>
          <input type="number" min={1} step={0.5} value={height} onChange={(e) => setHeight(e.target.value)} className={inp} />
        </Field>
        <Field label="Age (years)">
          <input type="number" min={1} max={120} step={1} value={age} onChange={(e) => setAge(e.target.value)} className={inp} />
        </Field>
        <Field label="Biological sex">
          <select value={sex} onChange={(e) => setSex(e.target.value as "male" | "female")} className={sel}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>
      </div>
      {out ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Body Fat %" value={`${out.bfPct.toFixed(1)}%`} accent />
            <StatCard label="Category" value={out.band.label} sub="Deurenberg formula estimate" />
            <StatCard label="Fat Mass" value={`${out.fatMass.toFixed(1)} kg`} />
            <StatCard label="Lean Mass" value={`${out.leanMass.toFixed(1)} kg`} />
          </div>
          <p className="text-xs text-muted-foreground">Estimate only (Deurenberg BMI-based). For accurate measurement use DEXA or skinfold callipers.</p>
        </>
      ) : (
        <p className="text-sm text-destructive">Enter valid positive numbers.</p>
      )}
    </div>
  );
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────
export default function HealthFormTools({ tool }: { tool: Tool }) {
  const body = (() => {
    switch (tool.slug) {
      case "bmr-calculator":       return <BmrCalculator />;
      case "calorie-calculator":   return <CalorieCalculator />;
      case "water-intake-calculator": return <WaterIntakeCalculator />;
      case "body-fat-calculator":  return <BodyFatCalculator />;
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
