"use client";
import { useState, useMemo } from "react";
import { AlertTriangle, XCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";

const SAMPLE_ENV = `DATABASE_URL=postgresql://user:password@localhost:5432/mydb
API_KEY=abc123
SECRET_TOKEN=
NEXT_PUBLIC_APP_URL=https://example.com
invalid line here
DUPLICATE_KEY=value1
DUPLICATE_KEY=value2`;

const SENSITIVE_PATTERN = /SECRET|PASSWORD|TOKEN|KEY|PASS|AUTH|CREDENTIAL/i;

type Severity = "error" | "warning";

interface Issue {
  line: number;
  key?: string;
  message: string;
  severity: Severity;
}

interface ParsedVar {
  line: number;
  key: string;
  value: string;
  issues: Issue[];
}

interface ValidationResult {
  vars: ParsedVar[];
  issues: Issue[];
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function validate(input: string): ValidationResult {
  const lines = input.split("\n");
  const vars: ParsedVar[] = [];
  const issues: Issue[] = [];
  const keyLines: Record<string, number[]> = {};

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const lineNum = i + 1;

    if (raw.trim() === "" || raw.trimStart().startsWith("#")) {
      continue;
    }

    const eqIdx = raw.indexOf("=");
    if (eqIdx === -1) {
      issues.push({
        line: lineNum,
        message: `Unparseable line: "${raw}"`,
        severity: "error",
      });
      continue;
    }

    const rawKey = raw.slice(0, eqIdx);
    const rawValue = raw.slice(eqIdx + 1);
    const key = rawKey.trim();
    const value = stripQuotes(rawValue.trim());

    const lineIssues: Issue[] = [];

    if (rawKey !== rawKey.trim() || rawValue !== rawValue.trim()) {
      const ws: Issue = {
        line: lineNum,
        key,
        message: "Leading or trailing whitespace detected in key or value.",
        severity: "warning",
      };
      lineIssues.push(ws);
      issues.push(ws);
    }

    if (!/^[A-Z_][A-Z0-9_]*$/i.test(key)) {
      const inv: Issue = {
        line: lineNum,
        key,
        message: `Invalid key name "${key}". Keys must match /^[A-Z_][A-Z0-9_]*$/i.`,
        severity: "error",
      };
      lineIssues.push(inv);
      issues.push(inv);
    }

    if (value === "") {
      const empty: Issue = {
        line: lineNum,
        key,
        message: `Key "${key}" has an empty value.`,
        severity: "warning",
      };
      lineIssues.push(empty);
      issues.push(empty);
    }

    if (SENSITIVE_PATTERN.test(key) && value.length > 0 && value.length < 16) {
      const weak: Issue = {
        line: lineNum,
        key,
        message: `Consider using a stronger secret (at least 16 characters).`,
        severity: "warning",
      };
      lineIssues.push(weak);
      issues.push(weak);
    }

    if (!keyLines[key]) keyLines[key] = [];
    keyLines[key].push(lineNum);

    vars.push({ line: lineNum, key, value, issues: lineIssues });
  }

  for (const [key, lineNums] of Object.entries(keyLines)) {
    if (lineNums.length > 1) {
      const dup: Issue = {
        line: lineNums[lineNums.length - 1],
        key,
        message: `Duplicate key "${key}" found on lines ${lineNums.join(", ")}.`,
        severity: "warning",
      };
      issues.push(dup);
      for (const v of vars) {
        if (v.key === key) {
          v.issues.push(dup);
        }
      }
    }
  }

  return { vars, issues };
}

export default function EnvValidatorTool({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [showValues, setShowValues] = useState(false);

  const result = useMemo(() => validate(input), [input]);

  const errors = result.issues.filter((i) => i.severity === "error");
  const warnings = result.issues.filter((i) => i.severity === "warning");
  const hasInput = input.trim().length > 0;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Paste your .env contents
            </label>
            <textarea
              className="w-full font-mono text-sm p-4 rounded-xl border border-border bg-card min-h-[350px] resize-none focus:outline-none focus:ring-2 focus:ring-ring/40"
              placeholder={SAMPLE_ENV}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Validation Results
              </span>
              {hasInput && (
                <button
                  onClick={() => setShowValues((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showValues ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {showValues ? "Hide values" : "Show values"}
                </button>
              )}
            </div>

            {!hasInput ? (
              <div className="flex items-center justify-center min-h-[350px] rounded-xl border border-border bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  Paste your .env file to see validation results.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm">
                  {errors.length === 0 && warnings.length === 0 ? (
                    <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      All good! {result.vars.length} variable
                      {result.vars.length !== 1 ? "s" : ""} parsed, no issues
                      found.
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {result.vars.length} variable
                      {result.vars.length !== 1 ? "s" : ""} parsed
                      {errors.length > 0 && (
                        <>
                          ,{" "}
                          <span className="text-destructive font-medium">
                            {errors.length} error
                            {errors.length !== 1 ? "s" : ""}
                          </span>
                        </>
                      )}
                      {warnings.length > 0 && (
                        <>
                          ,{" "}
                          <span className="text-amber-700 dark:text-amber-400 font-medium">
                            {warnings.length} warning
                            {warnings.length !== 1 ? "s" : ""}
                          </span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                {(errors.length > 0 || warnings.length > 0) && (
                  <div className="flex flex-col gap-2">
                    {errors.map((issue, idx) => (
                      <div key={`e-${idx}`} className="flex items-start gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive shrink-0 mt-0.5">
                          <XCircle className="h-3 w-3" />
                          Error
                        </span>
                        <span className="text-xs text-foreground">
                          <span className="text-muted-foreground mr-1">
                            Line {issue.line}:
                          </span>
                          {issue.message}
                        </span>
                      </div>
                    ))}
                    {warnings.map((issue, idx) => (
                      <div key={`w-${idx}`} className="flex items-start gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                          <AlertTriangle className="h-3 w-3" />
                          Warning
                        </span>
                        <span className="text-xs text-foreground">
                          <span className="text-muted-foreground mr-1">
                            Line {issue.line}:
                          </span>
                          {issue.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {result.vars.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">
                            Key
                          </th>
                          <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">
                            Value
                          </th>
                          <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.vars.map((v, idx) => {
                          const isSensitive = SENSITIVE_PATTERN.test(v.key);
                          const displayValue =
                            isSensitive && !showValues ? "••••••" : v.value || "";
                          const hasErrors = v.issues.some(
                            (i) => i.severity === "error"
                          );
                          const hasWarnings = v.issues.some(
                            (i) => i.severity === "warning"
                          );
                          return (
                            <tr
                              key={idx}
                              className={idx % 2 === 1 ? "bg-muted/30" : ""}
                            >
                              <td className="px-3 py-2 font-mono text-xs break-all">
                                {v.key}
                              </td>
                              <td className="px-3 py-2 font-mono text-xs break-all text-muted-foreground">
                                {v.value === "" ? (
                                  <span className="italic text-muted-foreground/60">
                                    empty
                                  </span>
                                ) : (
                                  displayValue
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {hasErrors ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                                    <XCircle className="h-3 w-3" />
                                    Error
                                  </span>
                                ) : hasWarnings ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                    <AlertTriangle className="h-3 w-3" />
                                    Warning
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    OK
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
