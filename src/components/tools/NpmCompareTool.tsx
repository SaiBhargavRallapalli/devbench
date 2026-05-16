"use client";
import { useState, useCallback } from "react";
import { Loader2, ExternalLink, Plus, Package, X } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";

interface PackageData {
  name: string;
  description: string;
  latestVersion: string;
  lastPublished: string;
  license: string;
  depCount: number | null;
  devDepCount: number | null;
  unpackedSize: number | null;
  fileCount: number | null;
  homepage: string;
  repository: string;
  weeklyDownloads: number | null;
  error?: string;
}

type FetchState = "idle" | "loading" | "done";

const PRESETS = [
  { label: "React vs Vue vs Svelte", packages: ["react", "vue", "svelte"] },
  { label: "axios vs node-fetch", packages: ["axios", "node-fetch"] },
  { label: "lodash vs ramda", packages: ["lodash", "ramda"] },
  { label: "moment vs date-fns vs dayjs", packages: ["moment", "date-fns", "dayjs"] },
];

const METRICS = [
  "Latest version",
  "Weekly downloads",
  "License",
  "Dependencies",
  "Dev dependencies",
  "Unpacked size",
  "Last published",
  "Homepage",
] as const;

function formatDownloads(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function formatSize(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(0)} KB`;
  return `${bytes.toLocaleString()} B`;
}

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

function truncate(str: string, max: number): string {
  return str.length <= max ? str : `${str.slice(0, max)}…`;
}

async function fetchPackage(pkg: string): Promise<PackageData> {
  const [regRes, dlRes] = await Promise.allSettled([
    fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`),
    fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(pkg)}`),
  ]);

  if (regRes.status === "rejected" || !regRes.value.ok) {
    if (regRes.status === "fulfilled" && regRes.value.status === 404) {
      return { name: pkg, description: "", latestVersion: "", lastPublished: "", license: "", depCount: null, devDepCount: null, unpackedSize: null, fileCount: null, homepage: "", repository: "", weeklyDownloads: null, error: "Package not found" };
    }
    return { name: pkg, description: "", latestVersion: "", lastPublished: "", license: "", depCount: null, devDepCount: null, unpackedSize: null, fileCount: null, homepage: "", repository: "", weeklyDownloads: null, error: "Fetch error" };
  }

  let regData: Record<string, unknown>;
  try {
    regData = await regRes.value.json();
  } catch {
    return { name: pkg, description: "", latestVersion: "", lastPublished: "", license: "", depCount: null, devDepCount: null, unpackedSize: null, fileCount: null, homepage: "", repository: "", weeklyDownloads: null, error: "Fetch error" };
  }

  const distTags = regData["dist-tags"] as Record<string, string> | undefined;
  const latest = distTags?.latest ?? "";
  const versions = regData["versions"] as Record<string, Record<string, unknown>> | undefined;
  const latestVersion = versions?.[latest] ?? {};
  const time = regData["time"] as Record<string, string> | undefined;
  const lastPublished = (latest && time?.[latest]) ? time[latest] : "";
  const license = (latestVersion["license"] as string) ?? (regData["license"] as string) ?? "";
  const deps = latestVersion["dependencies"] as Record<string, string> | undefined;
  const devDeps = latestVersion["devDependencies"] as Record<string, string> | undefined;
  const dist = latestVersion["dist"] as Record<string, unknown> | undefined;
  const repo = regData["repository"] as { url?: string } | undefined;

  let weeklyDownloads: number | null = null;
  if (dlRes.status === "fulfilled" && dlRes.value.ok) {
    try {
      const dlData = await dlRes.value.json() as { downloads?: number };
      weeklyDownloads = dlData.downloads ?? null;
    } catch {
      weeklyDownloads = null;
    }
  }

  return {
    name: regData["name"] as string ?? pkg,
    description: (regData["description"] as string) ?? "",
    latestVersion: latest,
    lastPublished,
    license,
    depCount: deps ? Object.keys(deps).length : 0,
    devDepCount: devDeps ? Object.keys(devDeps).length : 0,
    unpackedSize: dist ? (dist["unpackedSize"] as number ?? null) : null,
    fileCount: dist ? (dist["fileCount"] as number ?? null) : null,
    homepage: (regData["homepage"] as string) ?? "",
    repository: repo?.url ?? "",
    weeklyDownloads,
  };
}

function winnerIndices(values: (number | null)[], higher: boolean): Set<number> {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return new Set();
  const target = higher ? Math.max(...valid) : Math.min(...valid);
  const result = new Set<number>();
  values.forEach((v, i) => { if (v === target) result.add(i); });
  return result;
}

export default function NpmCompareTool({ tool }: { tool: Tool }) {
  const [inputs, setInputs] = useState<string[]>(["", ""]);
  const [results, setResults] = useState<(PackageData | null)[]>([]);
  const [loadingIndices, setLoadingIndices] = useState<Set<number>>(new Set());
  const [fetchState, setFetchState] = useState<FetchState>("idle");

  const handleCompare = useCallback(async () => {
    const pkgs = inputs.map((s) => s.trim()).filter(Boolean);
    if (pkgs.length === 0) return;
    setFetchState("loading");
    setLoadingIndices(new Set(pkgs.map((_, i) => i)));
    setResults(pkgs.map(() => null));

    const fetches = pkgs.map((pkg, i) =>
      fetchPackage(pkg).then((data) => {
        setResults((prev) => {
          const next = [...prev];
          next[i] = data;
          return next;
        });
        setLoadingIndices((prev) => {
          const next = new Set(prev);
          next.delete(i);
          return next;
        });
        return data;
      })
    );

    await Promise.all(fetches);
    setFetchState("done");
  }, [inputs]);

  const setInput = (index: number, value: string) => {
    setInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const removeInput = (index: number) => {
    setInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const applyPreset = (packages: string[]) => {
    setInputs(packages);
    setResults([]);
    setFetchState("idle");
  };

  const activePkgs = inputs.map((s) => s.trim()).filter(Boolean);
  const showTable = fetchState !== "idle" && activePkgs.length > 0;

  const dlWinners = winnerIndices(results.map((r) => r?.weeklyDownloads ?? null), true);
  const depWinners = winnerIndices(results.map((r) => r?.depCount ?? null), false);
  const sizeWinners = winnerIndices(results.map((r) => r?.unpackedSize ?? null), false);

  function getCellClass(metric: string, colIndex: number): string {
    const base = "px-4 py-3 border-b border-border";
    const winner = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium";
    if (metric === "Weekly downloads" && dlWinners.has(colIndex)) return `${base} ${winner}`;
    if (metric === "Dependencies" && depWinners.has(colIndex)) return `${base} ${winner}`;
    if (metric === "Unpacked size" && sizeWinners.has(colIndex)) return `${base} ${winner}`;
    return base;
  }

  function getCellValue(metric: string, data: PackageData | null, colIndex: number): React.ReactNode {
    if (loadingIndices.has(colIndex)) return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    if (!data) return null;
    if (data.error) return <span className="text-destructive text-xs">{data.error}</span>;

    switch (metric) {
      case "Latest version": return data.latestVersion || "—";
      case "Weekly downloads": return data.weeklyDownloads !== null ? formatDownloads(data.weeklyDownloads) : "—";
      case "License": return data.license || "—";
      case "Dependencies": return data.depCount !== null ? String(data.depCount) : "—";
      case "Dev dependencies": return data.devDepCount !== null ? String(data.devDepCount) : "—";
      case "Unpacked size": return data.unpackedSize !== null ? formatSize(data.unpackedSize) : "—";
      case "Last published": return data.lastPublished ? relativeTime(data.lastPublished) : "—";
      case "Homepage": {
        const url = data.homepage;
        if (!url) return "—";
        const clean = url.replace(/^https?:\/\//, "");
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
            {truncate(clean, 30)}
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        );
      }
      default: return "—";
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Quick compare:</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset.packages)}
                className="px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          {inputs.map((val, i) => (
            <div key={i} className="relative flex items-center flex-1 min-w-[140px]">
              <Package className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={val}
                onChange={(e) => setInput(i, e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCompare(); }}
                placeholder={`Package ${i + 1}`}
                className="pl-9 pr-8 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 w-full"
              />
              {inputs.length > 2 && (
                <button
                  onClick={() => removeInput(i)}
                  className="absolute right-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {inputs.length < 3 && (
            <button
              onClick={() => setInputs((prev) => [...prev, ""])}
              className="px-3 py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add another
            </button>
          )}

          <button
            onClick={handleCompare}
            disabled={fetchState === "loading" || activePkgs.length === 0}
            className="px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fetchState === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Compare
          </button>
        </div>

        {showTable && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold border-b border-border sticky left-0 bg-muted/50 min-w-[160px]">
                    Metric
                  </th>
                  {activePkgs.map((pkg, i) => (
                    <th key={i} className="px-4 py-3 text-left font-semibold border-b border-border min-w-[160px]">
                      <span className="inline-flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-muted-foreground" />
                        {results[i]?.name ?? pkg}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map((metric) => (
                  <tr key={metric} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 border-b border-border text-muted-foreground font-medium sticky left-0 bg-card">
                      {metric}
                    </td>
                    {activePkgs.map((_, i) => (
                      <td key={i} className={getCellClass(metric, i)}>
                        {getCellValue(metric, results[i] ?? null, i)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
