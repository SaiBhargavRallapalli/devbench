"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CalendarDays, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";

const inp =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";
const btn =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const btnMuted = `${btn} bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80`;

type SectionKey = "events" | "births" | "deaths" | "holidays";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "events", label: "Events" },
  { key: "births", label: "Births" },
  { key: "deaths", label: "Deaths" },
  { key: "holidays", label: "Holidays" },
];

interface WikiItem {
  text: string;
  year?: number;
  pages?: {
    titles?: { canonical?: string };
    thumbnail?: { source?: string };
  }[];
}

interface FetchState {
  loading: boolean;
  error?: string;
}

const PAGE_SIZE = 30;

function localTodayIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function OnThisDayTool({ tool }: { tool: Tool }) {
  const [date, setDate] = useState(localTodayIso);
  const [active, setActive] = useState<SectionKey>("events");
  const [items, setItems] = useState<Record<string, WikiItem[]>>({});
  const [fetchState, setFetchState] = useState<Record<string, FetchState>>({});
  const [visible, setVisible] = useState(PAGE_SIZE);
  const inFlight = useRef<Set<string>>(new Set());

  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const cacheKey = `${date}|${active}`;

  const load = useCallback(async (d: string, key: SectionKey) => {
    const ck = `${d}|${key}`;
    if (inFlight.current.has(ck)) return;
    inFlight.current.add(ck);
    setFetchState((s) => ({ ...s, [ck]: { loading: true } }));
    try {
      const res = await fetch(
        `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/${key}/${d.slice(5, 7)}/${d.slice(8, 10)}`,
        { headers: { Accept: "application/json" } },
      );
      if (!res.ok) throw new Error(`Wikipedia returned HTTP ${res.status}`);
      const body = (await res.json()) as Record<string, unknown>;
      const list = Array.isArray(body[key]) ? (body[key] as WikiItem[]) : [];
      setItems((prev) => ({ ...prev, [ck]: list }));
      setFetchState((s) => {
        const next = { ...s };
        delete next[ck];
        return next;
      });
    } catch (e) {
      setFetchState((s) => ({
        ...s,
        [ck]: {
          loading: false,
          error: e instanceof Error ? e.message : "Could not reach Wikipedia.",
        },
      }));
    } finally {
      inFlight.current.delete(ck);
    }
  }, []);

  // Fetch the active section for the selected date when it isn't cached yet.
  useEffect(() => {
    if (!dateOk || items[cacheKey]) return;
    void load(date, active);
  }, [date, active, dateOk, items, cacheKey, load]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [date, active]);

  const current = items[cacheKey];
  const state = fetchState[cacheKey];

  // Chronological order (year ascending) for the year-stamped sections.
  const sorted = useMemo(() => {
    if (!current) return null;
    const list = [...current];
    if (active !== "holidays") {
      list.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
    }
    return list;
  }, [current, active]);

  const shown = sorted?.slice(0, visible) ?? [];
  const remaining = (sorted?.length ?? 0) - shown.length;

  const wikiUrl = (item: WikiItem): string | null => {
    const canonical = item.pages?.[0]?.titles?.canonical;
    if (!canonical) return null;
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(canonical)}`;
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 space-y-5">
        {/* Date controls */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-52">
            <label htmlFor="otd-date" className="mb-1.5 block text-sm font-medium">
              Date
            </label>
            <input
              id="otd-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inp}
            />
          </div>
          <button
            onClick={() => setDate(localTodayIso())}
            className={btnMuted}
            disabled={date === localTodayIso()}
          >
            <CalendarDays className="w-4 h-4" aria-hidden />
            Today
          </button>
          <p className="ml-auto text-xs text-muted-foreground">
            {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Section tabs */}
        <div role="tablist" aria-label="On this day sections" className="flex flex-wrap gap-1.5">
          {SECTIONS.map((s) => {
            const count = items[`${date}|${s.key}`]?.length;
            const selected = active === s.key;
            return (
              <button
                key={s.key}
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(s.key)}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
                {count !== undefined && (
                  <span className="ml-1.5 text-xs opacity-70">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <section role="tabpanel" aria-label={active} className="space-y-3">
          {!dateOk && (
            <p className="text-sm text-destructive">Pick a valid date.</p>
          )}

          {dateOk && state?.loading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              Loading {SECTIONS.find((s) => s.key === active)?.label.toLowerCase()}…
            </p>
          )}

          {dateOk && state?.error && (
            <div
              className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm"
              role="alert"
            >
              <p className="flex items-center gap-2 font-medium text-destructive">
                <AlertCircle className="w-4 h-4" aria-hidden />
                Could not load this section
              </p>
              <p className="mt-1 text-muted-foreground">{state.error}</p>
              <button onClick={() => void load(date, active)} className={`${btnMuted} mt-3`}>
                <RefreshCw className="w-4 h-4" aria-hidden />
                Try again
              </button>
            </div>
          )}

          {dateOk && sorted && sorted.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nothing recorded in this section for that date.
            </p>
          )}

          {dateOk && shown.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground" aria-live="polite">
                Showing {shown.length} of {sorted?.length} entries, oldest first
              </p>
              <ul className="space-y-2">
                {shown.map((item, i) => {
                  const link = wikiUrl(item);
                  const thumb = item.pages?.[0]?.thumbnail?.source;
                  return (
                    <li
                      key={`${item.year ?? "x"}-${i}`}
                      className="flex gap-3 rounded-xl border border-border bg-muted/30 p-3"
                    >
                      {thumb && (
                        // eslint-disable-next-line @next/next/no-img-element -- third-party Wikimedia thumbnails are not next/image-optimisable
                        <img
                          src={thumb}
                          alt=""
                          width={56}
                          height={56}
                          loading="lazy"
                          className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        {item.year !== undefined && (
                          <span className="mr-2 inline-block rounded bg-accent/10 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-accent">
                            {item.year}
                          </span>
                        )}
                        <span className="text-sm text-foreground">{item.text}</span>
                        {link && (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                          >
                            Wikipedia
                            <ExternalLink className="w-3 h-3" aria-hidden />
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {remaining > 0 && (
                <button onClick={() => setVisible((v) => v + PAGE_SIZE)} className={btnMuted}>
                  Show {Math.min(PAGE_SIZE, remaining)} more ({remaining} left)
                </button>
              )}
            </>
          )}
        </section>

        <p className="text-xs text-muted-foreground">
          Historical entries come from{" "}
          <a
            href="https://api.wikimedia.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            the Wikimedia On This Day API
          </a>{" "}
          and Wikipedia, subject to their licences. Birth and death counts are large —
          use the tabs to switch sections, and the page loads 30 entries at a time.
        </p>
      </div>
    </main>
  );
}
