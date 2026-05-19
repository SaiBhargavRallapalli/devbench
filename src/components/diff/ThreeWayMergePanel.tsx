"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Download, GitMerge } from "lucide-react";
import { computeThreeWayDiff, type ThreeWayLine } from "@/lib/three-way-diff";

type Resolution = "left" | "right" | "base" | "custom";

export default function ThreeWayMergePanel({
  base,
  left,
  right,
}: {
  base: string;
  left: string;
  right: string;
}) {
  const lines = useMemo(() => computeThreeWayDiff(base, left, right), [base, left, right]);
  const [resolutions, setResolutions] = useState<Record<number, Resolution>>({});
  const [customLines, setCustomLines] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState(false);

  function pickLine(i: number, row: ThreeWayLine, choice: Resolution) {
    setResolutions((r) => ({ ...r, [i]: choice }));
    if (choice !== "custom") {
      setCustomLines((c) => {
        const next = { ...c };
        delete next[i];
        return next;
      });
    }
  }

  function lineText(i: number, row: ThreeWayLine): string {
    const choice = resolutions[i];
    if (choice === "left") return row.left;
    if (choice === "right") return row.right;
    if (choice === "base") return row.base;
    if (choice === "custom" && customLines[i] !== undefined) return customLines[i];
    if (row.kind === "unchanged" || row.kind === "both-changed") return row.left || row.right;
    if (row.kind === "left-only") return row.left;
    if (row.kind === "right-only") return row.right;
    return row.left || row.right || row.base;
  }

  const merged = useMemo(
    () => lines.map((row, i) => lineText(i, row)).join("\n"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lines, resolutions, customLines],
  );

  const conflicts = lines.filter((l) => l.kind === "conflict").length;

  function resolveAll(side: Resolution) {
    const next: Record<number, Resolution> = {};
    lines.forEach((row, i) => {
      if (row.kind === "conflict" || row.kind === "left-only" || row.kind === "right-only") {
        next[i] = side;
      }
    });
    setResolutions((r) => ({ ...r, ...next }));
  }

  return (
    <div className="space-y-3 animate-slide-up">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <p className="text-sm text-muted-foreground">
          <GitMerge className="w-4 h-4 inline mr-1 text-accent" />
          {conflicts > 0 ? (
            <span>
              <strong className="text-foreground">{conflicts}</strong> conflict
              {conflicts !== 1 ? "s" : ""} — pick a side per row or resolve all.
            </span>
          ) : (
            <span>No conflicts detected. Merged preview is ready.</span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => resolveAll("left")}
            className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted"
          >
            All left
          </button>
          <button
            type="button"
            onClick={() => resolveAll("right")}
            className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted"
          >
            All right
          </button>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(merged).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            Copy merged
          </button>
          <button
            type="button"
            onClick={() => {
              const blob = new Blob([merged], { type: "text/plain" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "merged.txt";
              a.click();
              URL.revokeObjectURL(a.href);
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-auto max-h-[360px]">
        <table className="w-full text-xs font-mono">
          <thead className="sticky top-0 bg-muted/90 border-b border-border z-10">
            <tr>
              <th className="px-2 py-2 w-8">#</th>
              <th className="px-2 py-2">Base</th>
              <th className="px-2 py-2">Left</th>
              <th className="px-2 py-2">Right</th>
              <th className="px-2 py-2 w-40">Resolve</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((row, i) => (
              <tr
                key={i}
                className={
                  row.kind === "conflict"
                    ? "bg-destructive/10"
                    : row.kind !== "unchanged"
                      ? "bg-accent/5"
                      : ""
                }
              >
                <td className="px-2 py-1 text-muted-foreground align-top">{i + 1}</td>
                <td className="px-2 py-1 align-top whitespace-pre-wrap break-all">{row.base}</td>
                <td className="px-2 py-1 align-top whitespace-pre-wrap break-all">{row.left}</td>
                <td className="px-2 py-1 align-top whitespace-pre-wrap break-all">{row.right}</td>
                <td className="px-2 py-1 align-top">
                  {row.kind === "unchanged" ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap gap-0.5">
                        {(["left", "right", "base"] as const).map((side) => (
                          <button
                            key={side}
                            type="button"
                            onClick={() => pickLine(i, row, side)}
                            className={`rounded px-1.5 py-0.5 text-[10px] border ${
                              resolutions[i] === side
                                ? "border-accent bg-accent/15 text-accent"
                                : "border-border hover:bg-muted"
                            }`}
                          >
                            {side}
                          </button>
                        ))}
                      </div>
                      {row.kind === "conflict" && (
                        <input
                          className="w-full rounded border border-border bg-background px-1 py-0.5 text-[10px]"
                          placeholder="Custom line"
                          value={customLines[i] ?? ""}
                          onChange={(e) => {
                            setCustomLines((c) => ({ ...c, [i]: e.target.value }));
                            setResolutions((r) => ({ ...r, [i]: "custom" }));
                          }}
                        />
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">Merged output preview</p>
        <pre className="text-xs font-mono whitespace-pre-wrap break-words max-h-40 overflow-auto">
          {merged || "(empty)"}
        </pre>
      </div>
    </div>
  );
}
