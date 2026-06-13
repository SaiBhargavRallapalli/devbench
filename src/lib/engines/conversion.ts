// Copyright (c) 2026 DevBench contributors. MIT License.
import type { Result } from "./_shared";

export function convertTemperature(value: number, from: "C" | "F" | "K"): Result {
  const c = from === "C" ? value : from === "F" ? ((value - 32) * 5) / 9 : value - 273.15;
  const f = from === "F" ? value : from === "C" ? (value * 9) / 5 + 32 : ((value - 273.15) * 9) / 5 + 32;
  const k = from === "K" ? value : from === "C" ? value + 273.15 : ((value - 32) * 5) / 9 + 273.15;
  return [
    `Celsius:    ${c.toFixed(2)} °C`,
    `Fahrenheit: ${f.toFixed(2)} °F`,
    `Kelvin:     ${k.toFixed(2)} K`,
  ].join("\n");
}

export function convertBytes(value: number, fromUnit: string): Result {
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const idx = units.indexOf(fromUnit);
  if (idx === -1) return { output: "", error: "Unknown unit" };
  const bytes = value * Math.pow(1024, idx);
  return units
    .map((u, i) => {
      const val = bytes / Math.pow(1024, i);
      return `${u}:  ${val >= 0.01 ? val.toLocaleString(undefined, { maximumFractionDigits: 4 }) : val.toExponential(2)}`;
    })
    .join("\n");
}

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function numToWordsHelper(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
  if (n < 1000) return ONES[Math.floor(n / 100)] + " hundred" + (n % 100 ? " and " + numToWordsHelper(n % 100) : "");
  if (n < 1000000) return numToWordsHelper(Math.floor(n / 1000)) + " thousand" + (n % 1000 ? " " + numToWordsHelper(n % 1000) : "");
  if (n < 1000000000) return numToWordsHelper(Math.floor(n / 1000000)) + " million" + (n % 1000000 ? " " + numToWordsHelper(n % 1000000) : "");
  if (n < 1000000000000) return numToWordsHelper(Math.floor(n / 1000000000)) + " billion" + (n % 1000000000 ? " " + numToWordsHelper(n % 1000000000) : "");
  return numToWordsHelper(Math.floor(n / 1000000000000)) + " trillion" + (n % 1000000000000 ? " " + numToWordsHelper(n % 1000000000000) : "");
}

export function numberToWords(n: number): Result {
  if (n === 0) return "zero";
  const neg = n < 0;
  return (neg ? "negative " : "") + numToWordsHelper(Math.abs(n));
}

export function toRomanNumeral(n: number): Result {
  if (n <= 0 || n > 3999) return { output: "", error: "Number must be between 1 and 3999" };
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let result = "";
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) {
      result += syms[i];
      n -= vals[i];
    }
  }
  return result;
}

export function fromRomanNumeral(s: string): number | string {
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  if (!/^[IVXLCDM]+$/.test(s)) return "Invalid Roman numeral";
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    const curr = map[s[i]];
    const next = map[s[i + 1]];
    if (next > curr) {
      result += next - curr;
      i++;
    } else {
      result += curr;
    }
  }
  return result;
}

export function convertDuration(seconds: number): Result {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);

  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  const parts: string[] = [];
  if (d) parts.push(`${d} day${d > 1 ? "s" : ""}`);
  if (h) parts.push(`${h} hour${h > 1 ? "s" : ""}`);
  if (m) parts.push(`${m} minute${m > 1 ? "s" : ""}`);
  if (s || !parts.length) parts.push(`${s} second${s !== 1 ? "s" : ""}`);
  if (ms) parts.push(`${ms} millisecond${ms !== 1 ? "s" : ""}`);

  return [
    `HH:MM:SS:   ${hh}:${mm}:${ss}`,
    `Breakdown:   ${parts.join(", ")}`,
    "",
    `Total seconds:      ${Math.floor(seconds).toLocaleString()}`,
    `Total minutes:      ${(seconds / 60).toFixed(2)}`,
    `Total hours:        ${(seconds / 3600).toFixed(4)}`,
    `Total days:         ${(seconds / 86400).toFixed(6)}`,
  ].join("\n");
}

export function calculatePercentage(input: string): Result {
  const lines = input.trim().split("\n").filter(Boolean);
  const results: string[] = [];

  for (const line of lines) {
    const pctOf = line.match(/([\d.]+)%?\s*of\s*([\d.]+)/i);
    if (pctOf) {
      const pct = parseFloat(pctOf[1]);
      const total = parseFloat(pctOf[2]);
      results.push(`${pct}% of ${total} = ${(pct / 100) * total}`);
      continue;
    }
    const whatPct = line.match(/([\d.]+)\s*(?:is\s*)?(?:what\s*%|percentage)\s*(?:of\s*)?([\d.]+)/i);
    if (whatPct) {
      const part = parseFloat(whatPct[1]);
      const total = parseFloat(whatPct[2]);
      results.push(`${part} is ${((part / total) * 100).toFixed(2)}% of ${total}`);
      continue;
    }
    const nums = line.match(/[\d.]+/g);
    if (nums && nums.length >= 2) {
      const a = parseFloat(nums[0]);
      const b = parseFloat(nums[1]);
      results.push(`${a} → ${b}: ${(((b - a) / Math.abs(a)) * 100).toFixed(2)}% change`);
    } else {
      results.push(`Could not parse: "${line}"`);
    }
  }
  return results.join("\n");
}

export function calculateAspectRatio(width: number, height: number): Result {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const g = gcd(Math.round(width), Math.round(height));
  const rw = Math.round(width) / g;
  const rh = Math.round(height) / g;
  const decimal = (width / height).toFixed(4);

  const standards = [
    { name: "1:1", val: 1 },
    { name: "4:3", val: 4 / 3 },
    { name: "3:2", val: 3 / 2 },
    { name: "16:10", val: 16 / 10 },
    { name: "16:9", val: 16 / 9 },
    { name: "21:9", val: 21 / 9 },
    { name: "9:16", val: 9 / 16 },
    { name: "3:4", val: 3 / 4 },
  ];
  const ratio = width / height;
  const closest = standards.reduce((prev, curr) =>
    Math.abs(curr.val - ratio) < Math.abs(prev.val - ratio) ? curr : prev
  );

  return [
    `Dimensions:     ${width} × ${height}`,
    `Aspect Ratio:   ${rw}:${rh}`,
    `Decimal:        ${decimal}`,
    `Closest Common: ${closest.name}`,
  ].join("\n");
}

export function convertTimezone(input: string): Result {
  const now = new Date();
  const zones = [
    "UTC", "America/New_York", "America/Chicago", "America/Denver",
    "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin",
    "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai",
    "Australia/Sydney", "Pacific/Auckland",
  ];
  const dateToUse = input.trim() ? new Date(input.trim()) : now;
  if (isNaN(dateToUse.getTime())) return { output: "", error: "Invalid date. Enter a date/time or leave empty for current time." };

  return zones
    .map((tz) => {
      const str = dateToUse.toLocaleString("en-US", {
        timeZone: tz,
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      return `${tz.padEnd(24)} ${str}`;
    })
    .join("\n");
}

// ── Finance / health / math / datetime (calculator-style tools; key=value lines) ──

function parseCalcKV(input: string): Record<string, string> {
  const r: Record<string, string> = {};
  for (const raw of input.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*[=:]\s*(.+)$/);
    if (m) r[m[1].toLowerCase()] = m[2].trim();
  }
  return r;
}

function kvNum(kv: Record<string, string>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = kv[k];
    if (v !== undefined && v !== "") {
      const n = parseFloat(v.replace(/,/g, ""));
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function gcdTwo(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function mifflinBmr(weightKg: number, heightCm: number, age: number, female: boolean): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return female ? base - 161 : base + 5;
}

export function calcSimpleInterest(input: string): Result {
  const kv = parseCalcKV(input);
  const p = kvNum(kv, "p", "principal");
  const r = kvNum(kv, "r", "rate");
  const t = kvNum(kv, "t", "time", "years");
  if (p === undefined || r === undefined || t === undefined) {
    return {
      output: "",
      error:
        "Example:\nprincipal=1000\nrate=5\ntime=2\n(rate = % per year, time = years)",
    };
  }
  const si = (p * r * t) / 100;
  const total = p + si;
  return [
    `Principal:    ${p}`,
    `Rate:         ${r}% / year`,
    `Time:         ${t} years`,
    `Interest:     ${si.toFixed(2)}`,
    `Total owed:   ${total.toFixed(2)}`,
  ].join("\n");
}

export function calcGst(input: string, basis: "exclusive" | "inclusive"): Result {
  const kv = parseCalcKV(input);
  const amount = kvNum(kv, "amount", "amt", "a");
  const rate = kvNum(kv, "rate", "gst", "g");
  if (amount === undefined || rate === undefined) {
    return { output: "", error: "amount=1000\nrate=18" };
  }
  if (basis === "exclusive") {
    const gstAmt = (amount * rate) / 100;
    const gross = amount + gstAmt;
    return [
      `Net (before GST): ${amount.toFixed(2)}`,
      `GST (${rate}%):   ${gstAmt.toFixed(2)}`,
      `Gross total:      ${gross.toFixed(2)}`,
    ].join("\n");
  }
  const net = (amount * 100) / (100 + rate);
  const gstAmt = amount - net;
  return [
    `Gross (incl. GST): ${amount.toFixed(2)}`,
    `Net (taxable):     ${net.toFixed(2)}`,
    `GST (${rate}%):    ${gstAmt.toFixed(2)}`,
  ].join("\n");
}

export function calcDiscount(input: string): Result {
  const kv = parseCalcKV(input);
  const price = kvNum(kv, "price", "list", "mrp");
  const d = kvNum(kv, "discount", "d", "off");
  if (price === undefined || d === undefined) {
    return { output: "", error: "price=100\ndiscount=15   (% off list price)" };
  }
  const saved = (price * d) / 100;
  const sale = price - saved;
  return [
    `List price:       ${price.toFixed(2)}`,
    `Discount (${d}%): ${saved.toFixed(2)}`,
    `Sale price:       ${sale.toFixed(2)}`,
  ].join("\n");
}

export function calcTip(input: string): Result {
  const kv = parseCalcKV(input);
  const bill = kvNum(kv, "bill", "amount");
  const tipPct = kvNum(kv, "tip", "percent");
  const split = kvNum(kv, "split", "people", "p") ?? 1;
  if (bill === undefined || tipPct === undefined) {
    return { output: "", error: "bill=50\ntip=18\nsplit=4   (split optional, default 1)" };
  }
  const tipAmt = (bill * tipPct) / 100;
  const total = bill + tipAmt;
  const per = total / Math.max(1, Math.round(split));
  const lines = [
    `Bill:            ${bill.toFixed(2)}`,
    `Tip (${tipPct}%): ${tipAmt.toFixed(2)}`,
    `Total:           ${total.toFixed(2)}`,
  ];
  if (split > 1) lines.push(`Per person (${Math.round(split)}): ${per.toFixed(2)}`);
  return lines.join("\n");
}

export function calcRoi(input: string): Result {
  const kv = parseCalcKV(input);
  const cost = kvNum(kv, "cost", "invested");
  const gain = kvNum(kv, "gain", "value", "current");
  const profitOnly = kvNum(kv, "profit");
  if (cost !== undefined && profitOnly !== undefined) {
    const roi = (profitOnly / cost) * 100;
    return [
      `Investment / cost: ${cost}`,
      `Profit:            ${profitOnly}`,
      `ROI:               ${roi.toFixed(2)}%`,
    ].join("\n");
  }
  if (cost === undefined || gain === undefined) {
    return {
      output: "",
      error: "cost=100\ngain=120   (final value)\nor cost=100 profit=20",
    };
  }
  const profit = gain - cost;
  const roi = (profit / cost) * 100;
  return [
    `Cost:      ${cost}`,
    `Returned:  ${gain}`,
    `Profit:    ${profit.toFixed(2)}`,
    `ROI:       ${roi.toFixed(2)}%`,
  ].join("\n");
}

export function calcProfitLoss(input: string): Result {
  const kv = parseCalcKV(input);
  const revenue = kvNum(kv, "revenue", "sales");
  const cost = kvNum(kv, "cost", "cogs");
  if (revenue === undefined || cost === undefined) {
    return { output: "", error: "revenue=120\ncost=80" };
  }
  const profit = revenue - cost;
  const margin = revenue !== 0 ? (profit / revenue) * 100 : 0;
  const markup = cost !== 0 ? (profit / cost) * 100 : 0;
  return [
    `Revenue:       ${revenue.toFixed(2)}`,
    `Cost:          ${cost.toFixed(2)}`,
    `Profit / loss: ${profit.toFixed(2)}`,
    `Margin (rev):  ${margin.toFixed(2)}%`,
    `Markup (cost): ${markup.toFixed(2)}%`,
  ].join("\n");
}

export function calcBmr(input: string): Result {
  const kv = parseCalcKV(input);
  const w = kvNum(kv, "weight", "w");
  const h = kvNum(kv, "height");
  const age = kvNum(kv, "age", "a");
  const female = /^f/i.test(kv.sex || kv.gender || "m");
  if (w === undefined || h === undefined || age === undefined) {
    return {
      output: "",
      error: "weight=70 (kg)\nheight=175 (cm)\nage=30\nsex=m or f   (Mifflin–St Jeor)",
    };
  }
  const bmr = mifflinBmr(w, h, age, female);
  return [
    `BMR: ~${bmr.toFixed(0)} kcal/day`,
    `(${female ? "female" : "male"}, Mifflin–St Jeor)`,
    "",
    "TDEE multipliers (× BMR): sedentary 1.2 · light 1.375 · moderate 1.55 · active 1.725 · very 1.9",
  ].join("\n");
}

export function calcCalorieCalculator(input: string): Result {
  const kv = parseCalcKV(input);
  const w = kvNum(kv, "weight", "w");
  const h = kvNum(kv, "height");
  const age = kvNum(kv, "age", "a");
  const female = /^f/i.test(kv.sex || kv.gender || "m");
  const level = (kv.activity || kv.level || "moderate").toLowerCase();
  const map: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very: 1.9,
    extra: 1.9,
  };
  const mult = map[level] ?? 1.55;
  if (w === undefined || h === undefined || age === undefined) {
    return {
      output: "",
      error:
        "weight=70\nheight=175\nage=30\nsex=m\nactivity=moderate\n(activity: sedentary|light|moderate|active|very)",
    };
  }
  const bmr = mifflinBmr(w, h, age, female);
  const tdee = bmr * mult;
  return [
    `BMR:              ~${bmr.toFixed(0)} kcal/day`,
    `Activity level: ${level} (×${mult})`,
    `TDEE (estimate): ~${tdee.toFixed(0)} kcal/day`,
    "",
    "Estimates only — not medical advice.",
  ].join("\n");
}

export function calcWaterIntake(input: string): Result {
  const kv = parseCalcKV(input);
  const w = kvNum(kv, "weight", "w");
  const exerciseMin = kvNum(kv, "exercise", "workout") ?? 0;
  if (w === undefined) {
    return { output: "", error: "weight=70 (kg)\nexercise=30 (optional minutes/day)" };
  }
  let ml = w * 35;
  ml += (exerciseMin / 30) * 250;
  return [
    `Estimated fluids: ~${Math.round(ml)} ml (~${(ml / 1000).toFixed(1)} L/day)`,
    `(rule-of-thumb from weight${exerciseMin ? ` + ${exerciseMin} min activity` : ""})`,
    "",
    "Rough guideline — not medical advice.",
  ].join("\n");
}

export function calcBodyFatEstimate(input: string): Result {
  const kv = parseCalcKV(input);
  const w = kvNum(kv, "weight");
  const hCm = kvNum(kv, "height");
  const age = kvNum(kv, "age");
  const female = /^f/i.test(kv.sex || kv.gender || "m");
  if (w === undefined || hCm === undefined || age === undefined) {
    return {
      output: "",
      error: "weight=70 (kg)\nheight=175 (cm)\nage=30\nsex=m\n(Deurenberg formula from BMI)",
    };
  }
  const hm = hCm / 100;
  const bmi = w / (hm * hm);
  const s = female ? 0 : 1;
  const bf = 1.2 * bmi + 0.23 * age - 10.8 * s - 5.4;
  return [
    `BMI:              ${bmi.toFixed(1)}`,
    `Body fat (est.): ${bf.toFixed(1)}%`,
    "(Deurenberg et al. approximation — not diagnostic)",
  ].join("\n");
}

export function calcDaysBetween(input: string): Result {
  const kv = parseCalcKV(input);
  let d1 = kv.from || kv.start || kv.a;
  let d2 = kv.to || kv.end || kv.b;
  if (!d1 || !d2) {
    const iso = input.match(/\d{4}-\d{2}-\d{2}/g);
    if (iso && iso.length >= 2) {
      d1 = iso[0];
      d2 = iso[1];
    }
  }
  if (!d1 || !d2) {
    return {
      output: "",
      error: "from=2024-06-01\nto=2025-01-15\n(or paste two YYYY-MM-DD dates)",
    };
  }
  const a = new Date(`${d1}T12:00:00`);
  const b = new Date(`${d2}T12:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
    return { output: "", error: "Could not parse dates — use YYYY-MM-DD" };
  }
  const days = Math.round(Math.abs(b.getTime() - a.getTime()) / 86400000);
  return [`A: ${d1}`, `B: ${d2}`, `Difference: ${days} calendar day(s)`].join("\n");
}

export function calcCountdown(input: string): Result {
  const kv = parseCalcKV(input);
  const targetRaw =
    kv.target || kv.date || kv.to || input.trim().split("\n").filter(Boolean)[0];
  if (!targetRaw) {
    return { output: "", error: "target=2026-12-31\n(or ISO date on first line)" };
  }
  const hasTime = /T\d/.test(targetRaw);
  const target = new Date(hasTime ? targetRaw : `${targetRaw}T23:59:59`);
  if (Number.isNaN(target.getTime())) return { output: "", error: "Invalid target date" };
  const now = Date.now();
  const ms = target.getTime() - now;
  if (ms <= 0) return [`Target ${targetRaw} is in the past.`].join("\n");
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hrs = Math.floor((sec % 86400) / 3600);
  const min = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [
    `Target: ${target.toLocaleString()}`,
    `Remaining: ${days}d ${hrs}h ${min}m ${s}s`,
    `(${sec.toLocaleString()} seconds)`,
  ].join("\n");
}

export function isoWeekMetadata(d: Date): { week: number; isoYear: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const isoYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week, isoYear };
}

export function calcWeekNumber(input: string): Result {
  const kv = parseCalcKV(input);
  const raw = kv.date || kv.d || input.trim().split("\n")[0];
  if (!raw) return { output: "", error: "date=2026-05-04\n(or YYYY-MM-DD on first line)" };
  const d = new Date(`${raw.trim()}T12:00:00`);
  if (Number.isNaN(d.getTime())) return { output: "", error: "Invalid date" };
  const { week, isoYear } = isoWeekMetadata(d);
  return [
    `Date:      ${raw}`,
    `ISO week:  ${week}`,
    `ISO year:  ${isoYear}`,
    `Weekday:   ${d.toLocaleDateString(undefined, { weekday: "long" })}`,
  ].join("\n");
}

export function calcDueDateFromLmp(input: string): Result {
  const kv = parseCalcKV(input);
  const lmp = kv.lmp || kv.date || input.trim().split("\n")[0];
  if (!lmp) return { output: "", error: "lmp=2026-01-15\n(Naegele rule: +280 days)" };
  const start = new Date(`${lmp}T12:00:00`);
  if (Number.isNaN(start.getTime())) return { output: "", error: "Invalid LMP date (YYYY-MM-DD)" };
  const due = new Date(start);
  due.setDate(due.getDate() + 280);
  return [
    `LMP:           ${lmp}`,
    `EDD (~40 wk): ${due.toISOString().slice(0, 10)}`,
    "",
    "Estimate only — always follow clinical guidance.",
  ].join("\n");
}

export function solveQuadraticEquation(input: string): Result {
  const kv = parseCalcKV(input);
  const a = kvNum(kv, "a");
  const b = kvNum(kv, "b");
  const c = kvNum(kv, "c");
  if (a === undefined || b === undefined || c === undefined) {
    return { output: "", error: "a=1\nb=-5\nc=6   → roots of ax²+bx+c=0" };
  }
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) < 1e-12) return { output: "", error: "Not a valid equation (a and b both ~0)" };
    const x = -c / b;
    return [`Linear: ${b}x + ${c} = 0`, `x = ${x}`].join("\n");
  }
  const disc = b * b - 4 * a * c;
  if (disc < 0) {
    const real = -b / (2 * a);
    const imag = Math.sqrt(-disc) / (2 * a);
    return [
      `Discriminant: ${disc.toFixed(6)} (complex roots)`,
      `x₁ = ${real.toFixed(6)} + ${imag.toFixed(6)}i`,
      `x₂ = ${real.toFixed(6)} - ${imag.toFixed(6)}i`,
    ].join("\n");
  }
  const s = Math.sqrt(disc);
  const x1 = (-b + s) / (2 * a);
  const x2 = (-b - s) / (2 * a);
  return [
    `Equation: (${a})x² + (${b})x + (${c}) = 0`,
    `Discriminant: ${disc}`,
    disc === 0 ? `Double root: x = ${x1}` : `x₁ = ${x1}\nx₂ = ${x2}`,
  ].join("\n");
}

export function solvePythagorean(input: string): Result {
  const kv = parseCalcKV(input);
  const a = kvNum(kv, "a");
  const b = kvNum(kv, "b");
  const c = kvNum(kv, "c");
  const count = [a, b, c].filter((x) => x !== undefined).length;
  if (count !== 2) {
    return {
      output: "",
      error: "Provide exactly two sides (cm/units):\na=3\nb=4\n(leaves c blank)\nor a=3 c=5 (find b)",
    };
  }
  const sq = (x: number) => x * x;
  if (c === undefined && a !== undefined && b !== undefined) {
    const h = Math.sqrt(sq(a) + sq(b));
    return [`Legs a=${a}, b=${b}`, `Hypotenuse c = ${h.toFixed(6)}`].join("\n");
  }
  if (a === undefined && b !== undefined && c !== undefined) {
    if (c <= b) return { output: "", error: "Hypotenuse must be greater than leg b" };
    const leg = Math.sqrt(sq(c) - sq(b));
    return [`Leg b=${b}, hypotenuse c=${c}`, `Other leg a = ${leg.toFixed(6)}`].join("\n");
  }
  if (b === undefined && a !== undefined && c !== undefined) {
    if (c <= a) return { output: "", error: "Hypotenuse must be greater than leg a" };
    const leg = Math.sqrt(sq(c) - sq(a));
    return [`Leg a=${a}, hypotenuse c=${c}`, `Other leg b = ${leg.toFixed(6)}`].join("\n");
  }
  return { output: "", error: "Specify exactly one unknown among a, b, c" };
}

export function calcGcdLcmPair(input: string): Result {
  const kv = parseCalcKV(input);
  let x = kvNum(kv, "a", "x", "m");
  let y = kvNum(kv, "b", "y", "n");
  if (x === undefined || y === undefined) {
    const nums = input
      .trim()
      .split(/[\s,]+/)
      .map((s) => parseFloat(s))
      .filter((n) => Number.isFinite(n));
    if (nums.length >= 2) {
      x = nums[0];
      y = nums[1];
    }
  }
  if (x === undefined || y === undefined) {
    return { output: "", error: "a=12\nb=18\n(or two integers on one line)" };
  }
  const g = gcdTwo(x, y);
  const l = Math.abs(Math.round(x) * Math.round(y)) / g;
  return [`GCD(${x}, ${y}) = ${g}`, `LCM(${x}, ${y}) = ${l}`].join("\n");
}

export function convertUnits(value: number, from: string, to: string, category: string): Result {
  try {
    type UnitMap = Record<string, number>;
    const tables: Record<string, UnitMap> = {
      length: {
        mm: 0.001, cm: 0.01, m: 1, km: 1000,
        inch: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
        nm: 1852, "ly": 9.461e15,
      },
      weight: {
        mg: 1e-6, g: 0.001, kg: 1, t: 1000,
        oz: 0.028349523, lb: 0.453592, st: 6.35029,
      },
      area: {
        "mm²": 1e-6, "cm²": 0.0001, "m²": 1, "km²": 1e6,
        "in²": 6.4516e-4, "ft²": 0.092903, "yd²": 0.836127, "mi²": 2.58999e6,
        ha: 10000, ac: 4046.86,
      },
      volume: {
        ml: 0.001, cl: 0.01, dl: 0.1, l: 1, "m³": 1000,
        tsp: 0.00492892, tbsp: 0.0147868, "fl oz": 0.0295735,
        cup: 0.236588, pt: 0.473176, qt: 0.946353, gal: 3.78541,
        "in³": 0.016387, "ft³": 28.3168,
      },
      speed: {
        "m/s": 1, "km/h": 1 / 3.6, mph: 0.44704, knot: 0.514444,
        "ft/s": 0.3048, mach: 340.29,
      },
      temperature: { C: 1, F: 1, K: 1 },
    };

    if (category === "temperature") {
      let celsius: number;
      if (from === "C") celsius = value;
      else if (from === "F") celsius = (value - 32) * 5 / 9;
      else celsius = value - 273.15;
      let result: number;
      if (to === "C") result = celsius;
      else if (to === "F") result = celsius * 9 / 5 + 32;
      else result = celsius + 273.15;
      return `${value} ${from} = ${+result.toFixed(6)} ${to}`;
    }

    const table = tables[category];
    if (!table) return { output: "", error: `Unknown category: ${category}` };
    const fromFactor = table[from];
    const toFactor = table[to];
    if (fromFactor === undefined) return { output: "", error: `Unknown unit: ${from}` };
    if (toFactor === undefined) return { output: "", error: `Unknown unit: ${to}` };
    const base = value * fromFactor;
    const result = base / toFactor;
    return `${value} ${from} = ${+result.toPrecision(8)} ${to}`;
  } catch (e) {
    return { output: "", error: (e as Error).message };
  }
}
