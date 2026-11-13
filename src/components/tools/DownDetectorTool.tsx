"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import {
  DOWN_CHECK_CATEGORIES,
  DOWN_CHECK_SERVICES,
  faviconUrl,
  type ServiceCategoryId,
  type ServiceDef,
} from "@/lib/down-check/catalog";

/** Client batch size — must match MAX_HOSTS in src/app/api/down-check/route.ts. */
const CHUNK_SIZE = 32;
const STORAGE_KEY = "devbench-down-detector.v1";

type RegionFilter = "all" | "IN" | "world";
type CategoryFilter = ServiceCategoryId | "all";

interface Probe {
  state: "up" | "degraded" | "down";
  status: number | null;
  ms: number;
}

/** What /api/down-check returns per host — Probe plus the hostname key. */
interface ApiProbe extends Probe {
  host: string;
}

interface PersistedState {
  category: CategoryFilter;
  region: RegionFilter;
  results: Record<string, Probe>;
  lastChecked: number | null;
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (typeof parsed !== "object" || parsed === null) return null;
    return {
      category: parsed.category ?? "all",
      region: parsed.region ?? "all",
      results: typeof parsed.results === "object" && parsed.results !== null ? parsed.results : {},
      lastChecked: typeof parsed.lastChecked === "number" ? parsed.lastChecked : null,
    };
  } catch {
    return null;
  }
}

const STATE_STYLE: Record<Probe["state"], { dot: string; text: string; label: string }> = {
  up: {
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "Up",
  },
  degraded: {
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    label: "Degraded",
  },
  down: {
    dot: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
    label: "Down",
  },
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function ServiceCard({
  service,
  probe,
  checking,
}: {
  service: ServiceDef;
  probe?: Probe;
  checking: boolean;
}) {
  const [faviconBroken, setFaviconBroken] = useState(false);
  const style = probe ? STATE_STYLE[probe.state] : null;

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3">
      <span className="shrink-0 overflow-hidden rounded-md border border-border bg-muted w-7 h-7 flex items-center justify-center">
        {faviconBroken ? (
          <span className="text-[10px] font-semibold text-muted-foreground">{service.name.slice(0, 1)}</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- third-party .ico favicons are not next/image-optimisable
          <img
            src={faviconUrl(service.host)}
            alt=""
            width={20}
            height={20}
            loading="lazy"
            className="w-5 h-5"
            onError={() => setFaviconBroken(true)}
          />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{service.name}</span>
        <span className="block text-xs text-muted-foreground truncate">
          {service.region === "IN" ? "India" : "Worldwide"}
          {probe?.status != null ? ` · HTTP ${probe.status}` : ""}
          {probe ? ` · ${probe.ms} ms` : ""}
        </span>
      </span>

      <span
        className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-medium ${style ? style.text : "text-muted-foreground"}`}
        role="status"
      >
        {checking && !probe ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
            Checking
          </>
        ) : style ? (
          <>
            <span className={`w-2 h-2 rounded-full ${style.dot}`} aria-hidden />
            {style.label}
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-muted-foreground/30" aria-hidden />
            Not checked
          </>
        )}
      </span>
    </li>
  );
}

export default function DownDetectorTool({ tool }: { tool: Tool }) {
  // Client-only component (loaded with ssr: false), so reading localStorage
  // during the first render is safe — there is no server HTML to disagree
  // with. One read feeds lazy initialisers for every slice of session state.
  const [saved] = useState<PersistedState | null>(loadPersisted);
  const [category, setCategory] = useState<CategoryFilter>(() => saved?.category ?? "all");
  const [region, setRegion] = useState<RegionFilter>(() => saved?.region ?? "all");
  const [results, setResults] = useState<Record<string, Probe>>(() => saved?.results ?? {});
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<number | null>(() => saved?.lastChecked ?? null);
  const [error, setError] = useState<string | null>(null);

  // Sync session state to local storage — an external system, so this belongs
  // in an effect; it only writes and never calls setState itself.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ category, region, results, lastChecked } satisfies PersistedState),
      );
    } catch {
      // Storage full or blocked — statuses just won't persist.
    }
  }, [category, region, results, lastChecked]);

  const filtered = useMemo(
    () =>
      DOWN_CHECK_SERVICES.filter(
        (s) =>
          (category === "all" || s.category === category) &&
          (region === "all" || s.region === region),
      ),
    [category, region],
  );

  const runCheck = useCallback(async (services: ServiceDef[]) => {
    if (services.length === 0) return;
    setChecking(true);
    setError(null);
    const hosts = services.map((s) => s.host);
    const chunks: string[][] = [];
    for (let i = 0; i < hosts.length; i += CHUNK_SIZE) {
      chunks.push(hosts.slice(i, i + CHUNK_SIZE));
    }
    try {
      const settled = await Promise.allSettled(
        chunks.map(async (chunk) => {
          const res = await fetch("/api/down-check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hosts: chunk }),
          });
          const body = (await res.json().catch(() => null)) as
            | { results?: ApiProbe[]; error?: string }
            | null;
          if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
          return body?.results ?? [];
        }),
      );
      const next: Record<string, Probe> = {};
      let failed = 0;
      let lastError: string | null = null;
      for (const s of settled) {
        if (s.status === "fulfilled") {
          for (const p of s.value) next[p.host] = p;
        } else {
          failed++;
          lastError = s.reason instanceof Error ? s.reason.message : "Check failed";
        }
      }
      if (Object.keys(next).length > 0) {
        setResults((prev) => ({ ...prev, ...next }));
        setLastChecked(Date.now());
      }
      if (failed > 0) {
        setError(
          failed === chunks.length
            ? (lastError ?? "Check failed.")
            : `Partial results — ${failed} batch${failed > 1 ? "es" : ""} failed (${lastError ?? "error"}).`,
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check failed.");
    } finally {
      setChecking(false);
    }
  }, []);

  // Auto-check the catalog on first load: a down-detector that needs a button
  // press before answering "is it down?" wastes the visit.
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    void runCheck(DOWN_CHECK_SERVICES);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount with the full catalog
  }, []);

  const counts = useMemo(() => {
    let up = 0;
    let degraded = 0;
    let down = 0;
    let pending = 0;
    for (const s of filtered) {
      const p = results[s.host];
      if (!p) pending++;
      else if (p.state === "up") up++;
      else if (p.state === "degraded") degraded++;
      else down++;
    }
    return { up, degraded, down, pending };
  }, [filtered, results]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up space-y-5 rounded-2xl border border-border bg-card p-6">
        {/* Filters + re-check */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                category === "all"
                  ? "bg-accent text-accent-foreground font-medium"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {DOWN_CHECK_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  category === c.id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              className="inline-flex rounded-lg border border-border bg-muted p-0.5"
              role="group"
              aria-label="Region filter"
            >
              {(
                [
                  ["all", "All regions"],
                  ["IN", "India"],
                  ["world", "Worldwide"],
                ] as [RegionFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setRegion(value)}
                  aria-pressed={region === value}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    region === value
                      ? "bg-card text-foreground font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => void runCheck(filtered)}
              disabled={checking || filtered.length === 0}
              className="px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checking ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="w-4 h-4" aria-hidden />
              )}
              {checking ? "Checking…" : "Check now"}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{counts.up} up</span>
            {" · "}
            <span className="font-medium text-amber-600 dark:text-amber-400">{counts.degraded} degraded</span>
            {" · "}
            <span className="font-medium text-red-600 dark:text-red-400">{counts.down} down</span>
            {counts.pending > 0 && <> · {counts.pending} not checked</>}
          </span>
          {lastChecked && <span>Last checked {formatTime(lastChecked)}</span>}
          <span>{filtered.length} service{filtered.length === 1 ? "" : "s"} shown</span>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        {/* Results grid */}
        <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              probe={results[service.host]}
              checking={checking}
            />
          ))}
        </ul>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Status is measured by a HEAD request from DevBench&apos;s servers with a 3-second
          timeout — it reflects reachability, not your own connection. A &quot;Degraded&quot;
          result means the site answered with a 5xx error; some sites return 403 to
          datacenter requests and still show as <strong className="text-foreground">Up</strong>,
          which is correct: they are serving. Results are cached in this browser only.
        </p>
      </div>
    </main>
  );
}
