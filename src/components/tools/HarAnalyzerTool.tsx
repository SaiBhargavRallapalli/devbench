"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import {
  MAX_HAR_BYTES,
  SAMPLE_HAR,
  buildSummaryText,
  endOf,
  formatBytes,
  formatMs,
  groupBytes,
  isFailed,
  parseHar,
  summarize,
  type HarRow,
} from "@/lib/har-analyzer";

const MAX_ROWS = 500;

type StatusFilter = "" | "ok" | "fail";
type SortKey = "start" | "time" | "size";

export default function HarAnalyzerTool({ tool }: { tool: Tool }) {
  const [rows, setRows] = useState<HarRow[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [sort, setSort] = useState<SortKey>("start");
  const [showQuery, setShowQuery] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy summary");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback((text: string) => {
    try {
      setRows(parseHar(text));
      setError("");
    } catch (e) {
      setRows(null);
      setError(`Could not read file: ${e instanceof Error ? e.message : "unknown error"}`);
    }
  }, []);

  const readFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (file.size > MAX_HAR_BYTES) {
        setRows(null);
        setError("File is over 300 MB; too large to analyze in the browser.");
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => setError("Could not read the file.");
      reader.onload = () => load(String(reader.result ?? ""));
      reader.readAsText(file);
    },
    [load],
  );

  const summary = useMemo(() => (rows ? summarize(rows) : null), [rows]);
  const end = useMemo(() => (rows ? endOf(rows) : 1), [rows]);
  const types = useMemo(() => (rows ? [...new Set(rows.map((r) => r.type))].sort() : []), [rows]);

  const visible = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    const list = rows.filter((r) => {
      if (q && !`${r.host}${r.path}`.toLowerCase().includes(q)) return false;
      if (type && r.type !== type) return false;
      if (status === "fail" && !isFailed(r)) return false;
      if (status === "ok" && isFailed(r)) return false;
      return true;
    });
    if (sort === "time") list.sort((a, b) => b.totalMs - a.totalMs);
    if (sort === "size") list.sort((a, b) => b.size - a.size);
    return list;
  }, [rows, query, type, status, sort]);

  const summaryText = useMemo(() => (rows ? buildSummaryText(rows) : ""), [rows]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopyLabel("Copied");
    } catch {
      setCopyLabel("Copy failed - select the text manually");
    }
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([summaryText], { type: "text/plain" }));
    a.download = "har-summary.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const pct = (v: number) => `${((v / end) * 100).toFixed(2)}%`;
  const btn =
    "rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted/40 transition-colors";
  const card = "rounded-2xl border border-border bg-card p-5";

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up space-y-6">
        <div className={card}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              readFile(e.dataTransfer.files[0]);
            }}
            className={`rounded-xl border-2 border-dashed p-8 text-center text-sm text-muted-foreground ${dragging ? "border-ring text-foreground" : "border-border"}`}
          >
            Drop a .har file here, or{" "}
            <button type="button" className={btn} onClick={() => fileRef.current?.click()}>
              choose a file
            </button>{" "}
            or{" "}
            <button type="button" className={btn} onClick={() => load(SAMPLE_HAR)}>
              try a sample
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".har,.json,application/json"
              className="hidden"
              aria-label="Choose a HAR file"
              onChange={(e) => {
                readFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            The file is read in your browser and not uploaded, saved, or replayed by this page. Only URLs,
            status, sizes, MIME types and timings are used; header, cookie and body contents are not
            displayed. DevBench does not sanitize the original file: HAR files can hold tokens and personal
            data, and host and path can still contain sensitive IDs. Review before sharing.
          </p>
          {error && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        {rows && summary && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ["Requests", String(summary.count)],
                ["Total time", formatMs(summary.totalMs)],
                ["Transferred", formatBytes(summary.bytes)],
                ["Failed", String(summary.failed.length)],
                ["Domains", String(summary.domains)],
                ["Slowest", summary.slowest ? formatMs(summary.slowest.totalMs) : "-"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-card p-3">
                  <div className="text-xl font-semibold tabular-nums">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            <div className={card}>
              <h2 className="mb-3 text-base font-semibold">Request waterfall</h2>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <input
                  aria-label="Filter by URL or domain"
                  placeholder="Filter by URL or domain"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
                />
                <select aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value)} className={btn}>
                  <option value="">All types</option>
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className={btn}>
                  <option value="">All statuses</option>
                  <option value="ok">2xx/3xx</option>
                  <option value="fail">Failed (4xx/5xx/0)</option>
                </select>
                <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={btn}>
                  <option value="start">Sort: start time</option>
                  <option value="time">Sort: slowest</option>
                  <option value="size">Sort: largest</option>
                </select>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input type="checkbox" checked={showQuery} onChange={(e) => setShowQuery(e.target.checked)} />
                  show query strings
                </label>
              </div>
              <p className="mb-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-slate-400" />connection setup</span>
                <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-amber-500" />wait (TTFB)</span>
                <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" />download</span>
              </p>
              <div className="max-h-[420px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="p-1.5">#</th>
                      <th className="p-1.5">Status</th>
                      <th className="p-1.5">URL</th>
                      <th className="p-1.5">Type</th>
                      <th className="p-1.5 text-right">Size</th>
                      <th className="p-1.5 text-right">Time</th>
                      <th className="p-1.5">Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.slice(0, MAX_ROWS).map((r) => {
                      const label = `${r.host}${r.path}${showQuery ? r.search : ""}`;
                      return (
                        <tr key={r.index} className="border-t border-border">
                          <td className="p-1.5 tabular-nums">{r.index}</td>
                          <td className={`p-1.5 tabular-nums ${isFailed(r) ? "text-destructive" : "text-emerald-700 dark:text-emerald-400"}`}>{r.status}</td>
                          <td className="max-w-[340px] truncate p-1.5" title={label}>{label}</td>
                          <td className="p-1.5">{r.type}</td>
                          <td className="whitespace-nowrap p-1.5 text-right tabular-nums">{formatBytes(r.size)}</td>
                          <td className="whitespace-nowrap p-1.5 text-right tabular-nums">{formatMs(r.totalMs)}</td>
                          <td className="p-1.5">
                            <div className="relative h-3 min-w-[200px] rounded-sm bg-muted/40">
                              <div className="absolute top-0 h-full rounded-sm bg-slate-400" style={{ left: pct(r.startMs), width: pct(r.preMs) }} />
                              <div className="absolute top-0 h-full rounded-sm bg-amber-500" style={{ left: pct(r.startMs + r.preMs), width: pct(r.waitMs) }} />
                              <div className="absolute top-0 h-full rounded-sm bg-blue-500" style={{ left: pct(r.startMs + r.preMs + r.waitMs), width: pct(Math.max(r.receiveMs, end * 0.002)) }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Showing {Math.min(visible.length, MAX_ROWS)} of {visible.length} matching requests
                {visible.length > MAX_ROWS ? " (first 500; the summary covers all)" : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className={card}>
                <h2 className="mb-2 text-base font-semibold">Slowest requests</h2>
                <ul className="space-y-1 text-sm">
                  {[...rows].sort((a, b) => b.totalMs - a.totalMs).slice(0, 8).map((r) => (
                    <li key={r.index} className="flex justify-between gap-3">
                      <span className="truncate" title={`${r.method} ${r.host}${r.path}`}>{r.method} {r.host}{r.path}</span>
                      <span className="whitespace-nowrap tabular-nums">{formatMs(r.totalMs)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={card}>
                <h2 className="mb-2 text-base font-semibold">Failed requests</h2>
                {summary.failed.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No failed requests</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {summary.failed.slice(0, 10).map((r) => (
                      <li key={r.index} className="flex gap-3">
                        <span className="tabular-nums text-destructive">{r.status}</span>
                        <span className="truncate" title={`${r.method} ${r.host}${r.path}`}>{r.method} {r.host}{r.path}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {(["host", "type"] as const).map((key) => (
                <div key={key} className={card}>
                  <h2 className="mb-2 text-base font-semibold">Bytes by {key === "host" ? "domain" : "type"}</h2>
                  <ul className="space-y-1 text-sm">
                    {groupBytes(rows, key).slice(0, 8).map((g) => (
                      <li key={g.name} className="flex justify-between gap-3">
                        <span className="truncate" title={g.name}>{g.name}</span>
                        <span className="whitespace-nowrap tabular-nums text-muted-foreground">{g.count} req - {formatBytes(g.bytes)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className={card}>
              <h2 className="mb-2 text-base font-semibold">Diagnostic summary</h2>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <button type="button" className={btn} onClick={copy}>{copyLabel}</button>
                <button type="button" className={btn} onClick={download}>Download .txt</button>
                <span className="text-xs text-muted-foreground">
                  Host and path only, query strings removed. Paths may still contain IDs, so review before sharing.
                </span>
              </div>
              <pre className="whitespace-pre-wrap rounded-xl border border-border bg-muted/20 p-3 text-xs">{summaryText}</pre>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
