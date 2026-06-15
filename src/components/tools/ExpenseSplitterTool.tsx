"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Trash2, Users, Receipt, ArrowRight, Check, Copy } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Expense {
  id: string;
  description: string;
  amount: string;
  paidBy: string;
  splitAmong: string[];
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

// ─── Settlement algorithm ────────────────────────────────────────────────────

function computeSettlements(
  participants: string[],
  expenses: Expense[],
  currency: string
): { balances: Record<string, number>; settlements: Settlement[] } {
  const balances: Record<string, number> = {};
  for (const p of participants) balances[p] = 0;

  for (const exp of expenses) {
    const amount = parseFloat(exp.amount);
    if (!isFinite(amount) || amount <= 0) continue;
    if (!exp.paidBy || exp.splitAmong.length === 0) continue;
    const share = amount / exp.splitAmong.length;
    balances[exp.paidBy] = (balances[exp.paidBy] ?? 0) + amount;
    for (const p of exp.splitAmong) {
      balances[p] = (balances[p] ?? 0) - share;
    }
  }

  // Greedy algorithm — minimise number of transactions
  const creditors: { name: string; amount: number }[] = [];
  const debtors: { name: string; amount: number }[] = [];
  for (const [name, bal] of Object.entries(balances)) {
    if (bal > 0.005) creditors.push({ name, amount: bal });
    else if (bal < -0.005) debtors.push({ name, amount: -bal });
  }

  const settlements: Settlement[] = [];
  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci];
    const d = debtors[di];
    const transfer = Math.min(c.amount, d.amount);
    settlements.push({ from: d.name, to: c.name, amount: parseFloat(transfer.toFixed(2)) });
    c.amount -= transfer;
    d.amount -= transfer;
    if (c.amount < 0.005) ci++;
    if (d.amount < 0.005) di++;
  }

  const _ = currency; // used in render
  return { balances, settlements };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const btnBase =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-40";
const inp =
  "rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" },
  { code: "JPY", symbol: "¥" },
  { code: "AUD", symbol: "A$" },
  { code: "CAD", symbol: "CA$" },
  { code: "SGD", symbol: "S$" },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "participants" | "expenses" | "settlement";

function TabBar({
  active,
  onChange,
  settlementCount,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  settlementCount: number;
}) {
  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "participants", label: "Participants" },
    { id: "expenses", label: "Expenses" },
    { id: "settlement", label: "Settle Up", badge: settlementCount },
  ];
  return (
    <div className="flex gap-1 rounded-xl bg-muted/50 p-1 mb-6">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            active === t.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.label}
          {t.badge != null && t.badge > 0 && (
            <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExpenseSplitterTool({ tool }: { tool: Tool }) {
  const [tab, setTab] = useState<Tab>("participants");
  const [participants, setParticipants] = useState<string[]>(["Alice", "Bob"]);
  const [newName, setNewName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [copied, setCopied] = useState(false);

  // Expense form state
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expPaidBy, setExpPaidBy] = useState("");
  const [expSplitAmong, setExpSplitAmong] = useState<string[]>([]);

  const sym = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$";

  // ── Participants tab ────────────────────────────────────────────────────────

  const addParticipant = useCallback(() => {
    const name = newName.trim();
    if (!name || participants.includes(name)) return;
    setParticipants((p) => [...p, name]);
    setNewName("");
  }, [newName, participants]);

  const removeParticipant = useCallback(
    (name: string) => {
      setParticipants((p) => p.filter((x) => x !== name));
      // Remove from expenses too
      setExpenses((list) =>
        list
          .map((e) => ({
            ...e,
            paidBy: e.paidBy === name ? "" : e.paidBy,
            splitAmong: e.splitAmong.filter((x) => x !== name),
          }))
          .filter((e) => e.paidBy !== "" || e.splitAmong.length > 0)
      );
    },
    []
  );

  // ── Expenses tab ────────────────────────────────────────────────────────────

  const toggleSplit = (name: string) => {
    setExpSplitAmong((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  const addExpense = useCallback(() => {
    const amount = parseFloat(expAmount);
    if (!expDesc.trim() || !isFinite(amount) || amount <= 0) return;
    if (!expPaidBy) return;
    if (expSplitAmong.length === 0) return;
    setExpenses((list) => [
      ...list,
      {
        id: uid(),
        description: expDesc.trim(),
        amount: expAmount,
        paidBy: expPaidBy,
        splitAmong: expSplitAmong,
      },
    ]);
    setExpDesc("");
    setExpAmount("");
    // keep paidBy and splitAmong for convenience
  }, [expDesc, expAmount, expPaidBy, expSplitAmong]);

  const removeExpense = useCallback((id: string) => {
    setExpenses((list) => list.filter((e) => e.id !== id));
  }, []);

  // ── Settlement tab ──────────────────────────────────────────────────────────

  const { balances, settlements } = useMemo(
    () => computeSettlements(participants, expenses, currency),
    [participants, expenses, currency]
  );

  const totalSpent = useMemo(
    () =>
      expenses.reduce((s, e) => {
        const a = parseFloat(e.amount);
        return s + (isFinite(a) ? a : 0);
      }, 0),
    [expenses]
  );

  const settlementText = useMemo(() => {
    if (settlements.length === 0) return "Everyone is settled up!";
    return settlements
      .map((s) => `${s.from} → ${s.to}: ${sym}${s.amount.toFixed(2)}`)
      .join("\n");
  }, [settlements, sym]);

  const copySettlement = useCallback(async () => {
    await navigator.clipboard.writeText(settlementText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [settlementText]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      {/* Currency selector */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium">Currency:</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className={inp}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground ml-auto">
          {participants.length} participant{participants.length !== 1 ? "s" : ""} ·{" "}
          {expenses.length} expense{expenses.length !== 1 ? "s" : ""} ·{" "}
          Total: {sym}{totalSpent.toFixed(2)}
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <TabBar
          active={tab}
          onChange={setTab}
          settlementCount={settlements.length}
        />

        {/* ── Participants ── */}
        {tab === "participants" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addParticipant()}
                placeholder="Name (e.g. Charlie)"
                className={`${inp} flex-1`}
                maxLength={40}
              />
              <button
                type="button"
                onClick={addParticipant}
                disabled={!newName.trim() || participants.includes(newName.trim())}
                className={`${btnBase} bg-accent text-accent-foreground hover:bg-accent/90`}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {participants.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                Add at least two participants to get started.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                {participants.map((name) => (
                  <li
                    key={name}
                    className="flex items-center justify-between px-4 py-3 bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                        {name[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParticipant(name)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title={`Remove ${name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {participants.length >= 2 && (
              <button
                type="button"
                onClick={() => setTab("expenses")}
                className={`${btnBase} w-full justify-center bg-accent text-accent-foreground hover:bg-accent/90 mt-2`}
              >
                Next: Add Expenses
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ── Expenses ── */}
        {tab === "expenses" && (
          <div className="space-y-5">
            {participants.length < 2 ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                Add at least two participants first.
              </p>
            ) : (
              <>
                {/* Add expense form */}
                <div className="rounded-xl border border-border bg-muted/25 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    New Expense
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Description</label>
                      <input
                        type="text"
                        value={expDesc}
                        onChange={(e) => setExpDesc(e.target.value)}
                        placeholder="e.g. Dinner, Hotel, Taxi"
                        className={`${inp} w-full`}
                        maxLength={80}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Amount ({sym})
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={expAmount}
                        onChange={(e) => setExpAmount(e.target.value)}
                        placeholder="0.00"
                        className={`${inp} w-full`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Paid by</label>
                    <select
                      value={expPaidBy}
                      onChange={(e) => setExpPaidBy(e.target.value)}
                      className={`${inp} w-full`}
                    >
                      <option value="">— Select payer —</option>
                      {participants.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5">Split among</label>
                    <div className="flex flex-wrap gap-2">
                      {participants.map((p) => {
                        const checked = expSplitAmong.includes(p);
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => toggleSplit(p)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                              checked
                                ? "bg-accent text-accent-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {checked && <Check className="w-3 h-3 inline mr-1" />}
                            {p}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setExpSplitAmong([...participants])}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                      >
                        Select all
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addExpense}
                    disabled={
                      !expDesc.trim() ||
                      !expAmount ||
                      parseFloat(expAmount) <= 0 ||
                      !expPaidBy ||
                      expSplitAmong.length === 0
                    }
                    className={`${btnBase} bg-accent text-accent-foreground hover:bg-accent/90 w-full justify-center`}
                  >
                    <Receipt className="w-4 h-4" />
                    Add Expense
                  </button>
                </div>

                {/* Expense list */}
                {expenses.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No expenses yet. Add one above.
                  </p>
                ) : (
                  <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                    {expenses.map((e) => {
                      const amount = parseFloat(e.amount);
                      const share =
                        e.splitAmong.length > 0
                          ? amount / e.splitAmong.length
                          : 0;
                      return (
                        <li key={e.id} className="px-4 py-3 bg-background">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {e.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Paid by <strong>{e.paidBy}</strong> ·{" "}
                                {sym}{isFinite(amount) ? amount.toFixed(2) : "?"} ÷{" "}
                                {e.splitAmong.length} = {sym}
                                {isFinite(share) ? share.toFixed(2) : "?"} each ·{" "}
                                {e.splitAmong.join(", ")}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm font-semibold tabular-nums">
                                {sym}{isFinite(amount) ? amount.toFixed(2) : "?"}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeExpense(e.id)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title="Remove expense"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {expenses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTab("settlement")}
                    className={`${btnBase} w-full justify-center bg-accent text-accent-foreground hover:bg-accent/90`}
                  >
                    See Settlement
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Settlement ── */}
        {tab === "settlement" && (
          <div className="space-y-5">
            {expenses.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                Add expenses first to calculate who owes what.
              </p>
            ) : (
              <>
                {/* Balance summary */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Balances
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {participants.map((name) => {
                      const bal = balances[name] ?? 0;
                      const isPos = bal > 0.005;
                      const isNeg = bal < -0.005;
                      return (
                        <div
                          key={name}
                          className={`rounded-xl border p-3 ${
                            isPos
                              ? "border-emerald-500/30 bg-emerald-500/5"
                              : isNeg
                              ? "border-red-500/30 bg-red-500/5"
                              : "border-border bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">
                              {name[0].toUpperCase()}
                            </div>
                            <p className="text-xs font-medium truncate">{name}</p>
                          </div>
                          <p
                            className={`text-base font-bold tabular-nums ${
                              isPos
                                ? "text-emerald-600 dark:text-emerald-400"
                                : isNeg
                                ? "text-red-600 dark:text-red-400"
                                : "text-muted-foreground"
                            }`}
                          >
                            {isPos ? "+" : ""}
                            {sym}{Math.abs(bal).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {isPos ? "gets back" : isNeg ? "owes" : "settled"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Transactions */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Minimum Transactions to Settle Up
                  </p>
                  {settlements.length === 0 ? (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                      Everyone is already settled up!
                    </div>
                  ) : (
                    <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                      {settlements.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 px-4 py-3 bg-background"
                        >
                          <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-[10px] font-bold text-red-600 dark:text-red-400 shrink-0">
                            {s.from[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-medium flex-1">
                            {s.from}
                          </span>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <span className="text-xs">pays</span>
                            <span className="font-semibold text-sm text-foreground tabular-nums">
                              {sym}{s.amount.toFixed(2)}
                            </span>
                            <span className="text-xs">to</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                              {s.to[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{s.to}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Copy summary */}
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/25 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Export Summary</p>
                    <p className="text-xs text-muted-foreground">
                      Copy the settlement plan as plain text
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copySettlement}
                    className={`${btnBase} bg-accent/10 text-accent hover:bg-accent/20`}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <span>Total spent: <strong className="text-foreground">{sym}{totalSpent.toFixed(2)}</strong></span>
                  <span>{expenses.length} expense{expenses.length !== 1 ? "s" : ""} · {participants.length} people</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        <Users className="w-3.5 h-3.5 inline mr-1" />
        All calculations happen in your browser — no data is sent anywhere.
      </p>
    </main>
  );
}
