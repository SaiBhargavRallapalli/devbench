// Copyright (c) 2026 DevBench contributors. MIT License.
// Local-only HAR analysis: reads URL, status, size, MIME type and timings.
// Header, cookie and body contents are never read or displayed.

export interface HarRow {
  index: number;
  startMs: number;
  preMs: number;
  waitMs: number;
  receiveMs: number;
  totalMs: number;
  status: number;
  method: string;
  host: string;
  path: string;
  search: string;
  type: string;
  size: number;
}

export interface HarSummary {
  count: number;
  totalMs: number;
  bytes: number;
  failed: HarRow[];
  domains: number;
  slowest: HarRow | null;
}

export const MAX_HAR_BYTES = 300 * 1024 * 1024;

const positive = (n: unknown): number =>
  typeof n === "number" && Number.isFinite(n) && n > 0 ? n : 0;

function classify(mime: string, pathname: string): string {
  const m = mime.toLowerCase();
  const u = pathname.toLowerCase();
  if (/html/.test(m)) return "document";
  if (/javascript|ecmascript/.test(m) || /\.m?js$/.test(u)) return "script";
  if (/css/.test(m) || /\.css$/.test(u)) return "style";
  if (/^image\//.test(m) || /\.(png|jpe?g|gif|webp|svg|ico|avif)$/.test(u)) return "image";
  if (/font/.test(m) || /\.(woff2?|ttf|otf)$/.test(u)) return "font";
  if (/json|xml/.test(m)) return "api/data";
  if (/video|audio/.test(m)) return "media";
  return "other";
}

interface RawEntry {
  startedDateTime?: string;
  time?: number;
  request?: { method?: string; url?: unknown };
  response?: {
    status?: number;
    bodySize?: number;
    _transferSize?: number;
    content?: { size?: number; mimeType?: string };
  };
  timings?: Record<string, number>;
}

/** Parse HAR JSON text into rows. Throws a readable Error for invalid input. */
export function parseHar(text: string): HarRow[] {
  const json = JSON.parse(text) as { log?: { entries?: unknown } };
  if (!json || !json.log || !Array.isArray(json.log.entries)) {
    throw new Error("Not a HAR file: missing log.entries");
  }
  const entries = (json.log.entries as RawEntry[]).filter(
    (e) => e && e.request && typeof e.request.url === "string",
  );
  if (entries.length === 0) {
    throw new Error("HAR has no usable entries (each needs request.url)");
  }
  let t0 = Infinity;
  for (const e of entries) {
    const v = Date.parse(e.startedDateTime ?? "") || 0;
    if (v < t0) t0 = v;
  }
  return entries.map((e, i) => {
    const rawUrl = e.request!.url as string;
    let host = "(invalid URL)";
    let path = rawUrl.split("?")[0].split("#")[0].slice(0, 120);
    let search = "";
    try {
      const u = new URL(rawUrl);
      host = u.hostname;
      path = u.pathname;
      search = u.search;
    } catch {
      // keep fallbacks; query string is intentionally dropped
    }
    const tm = e.timings ?? {};
    // HAR 1.2: `connect` already includes `ssl`, so ssl is not added again.
    const preMs =
      positive(tm.blocked) + positive(tm.dns) + positive(tm.connect) + positive(tm.send);
    const waitMs = positive(tm.wait);
    const receiveMs = positive(tm.receive);
    const totalMs = positive(e.time) || preMs + waitMs + receiveMs;
    const res = e.response ?? {};
    const size =
      positive(res._transferSize) || positive(res.bodySize) || positive(res.content?.size);
    return {
      index: i + 1,
      startMs: (Date.parse(e.startedDateTime ?? "") || 0) - t0,
      preMs,
      waitMs,
      receiveMs,
      totalMs,
      status: typeof res.status === "number" ? res.status : 0,
      method: e.request!.method ?? "GET",
      host,
      path,
      search,
      type: classify(res.content?.mimeType ?? "", path),
      size,
    };
  });
}

export const isFailed = (r: HarRow): boolean => r.status === 0 || r.status >= 400;

export function endOf(rows: HarRow[]): number {
  let m = 1;
  for (const r of rows) {
    const v = r.startMs + r.totalMs;
    if (v > m) m = v;
  }
  return m;
}

export function summarize(rows: HarRow[]): HarSummary {
  let bytes = 0;
  let slowest: HarRow | null = null;
  const hosts = new Set<string>();
  const failed: HarRow[] = [];
  for (const r of rows) {
    bytes += r.size;
    hosts.add(r.host);
    if (isFailed(r)) failed.push(r);
    if (!slowest || r.totalMs > slowest.totalMs) slowest = r;
  }
  return { count: rows.length, totalMs: endOf(rows), bytes, failed, domains: hosts.size, slowest };
}

export function groupBytes(rows: HarRow[], key: "host" | "type") {
  const map = new Map<string, { count: number; bytes: number }>();
  for (const r of rows) {
    const o = map.get(r[key]) ?? { count: 0, bytes: 0 };
    o.count += 1;
    o.bytes += r.size;
    map.set(r[key], o);
  }
  return [...map.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.bytes - a.bytes);
}

export function formatBytes(n: number): string {
  if (n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < 3) {
    v /= 1024;
    i++;
  }
  return `${i ? v.toFixed(1) : v} ${units[i]}`;
}

export function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`;
}

/** Plain-text summary. Host and path only: query strings are never included. */
export function buildSummaryText(rows: HarRow[]): string {
  const s = summarize(rows);
  const byTime = [...rows].sort((a, b) => b.totalMs - a.totalMs);
  const bySize = [...rows].sort((a, b) => b.size - a.size);
  const L: string[] = ["HAR performance summary"];
  L.push(
    `Requests: ${s.count} | Total time: ${formatMs(s.totalMs)} | Transferred: ${formatBytes(s.bytes)} | Failed: ${s.failed.length}`,
    "",
    "Slowest requests:",
  );
  for (const r of byTime.slice(0, 5)) {
    L.push(
      `- ${formatMs(r.totalMs)}  ${r.status}  ${r.method} ${r.host}${r.path}  (wait ${formatMs(r.waitMs)}, download ${formatMs(r.receiveMs)})`,
    );
  }
  L.push("", "Largest responses:");
  for (const r of bySize.slice(0, 5)) L.push(`- ${formatBytes(r.size)}  ${r.host}${r.path}`);
  L.push("", "Failed requests:");
  if (s.failed.length === 0) L.push("- none");
  for (const r of s.failed.slice(0, 10)) L.push(`- ${r.status}  ${r.method} ${r.host}${r.path}`);
  L.push("", "Bytes by domain:");
  for (const g of groupBytes(rows, "host").slice(0, 5)) {
    L.push(`- ${g.name}: ${formatBytes(g.bytes)} in ${g.count} requests`);
  }
  const hints: string[] = [];
  for (const r of rows) {
    if (r.waitMs > 1000 && r.type !== "image") {
      hints.push(`Slow server response (${formatMs(r.waitMs)} wait): ${r.host}${r.path}`);
    }
    if (r.size > 1048576) hints.push(`Large response (${formatBytes(r.size)}): ${r.host}${r.path}`);
  }
  if (hints.length) {
    L.push("", "Things to check:");
    for (const h of hints.slice(0, 6)) L.push(`- ${h}`);
  }
  return L.join("\n");
}

export const SAMPLE_HAR = JSON.stringify({
  log: {
    version: "1.2",
    entries: [
      ["https://shop.example.com/", 200, "text/html", 42000, [5, 20, 40, 180, 30], 0],
      ["https://shop.example.com/app.js", 200, "application/javascript", 910000, [2, 0, 0, 90, 320], 280],
      ["https://shop.example.com/styles.css", 200, "text/css", 58000, [2, 0, 0, 70, 40], 280],
      ["https://cdn.example.net/hero.jpg", 200, "image/jpeg", 2400000, [3, 15, 30, 120, 900], 300],
      ["https://api.example.com/products", 200, "application/json", 31000, [1, 12, 30, 2100, 60], 700],
      ["https://api.example.com/cart", 500, "application/json", 400, [1, 0, 0, 640, 5], 720],
      ["https://analytics.example.org/collect", 0, "", 0, [1, 10, 25, 0, 0], 1300],
      ["https://cdn.example.net/logo.svg", 404, "text/html", 900, [1, 0, 0, 60, 5], 1500],
      ["https://cdn.example.net/font.woff2", 200, "font/woff2", 45000, [1, 0, 0, 80, 25], 1600],
    ].map(([url, status, mime, size, t, off]) => {
      const tm = t as number[];
      return {
        startedDateTime: new Date(Date.UTC(2026, 10, 16, 10, 0, 0) + (off as number)).toISOString(),
        time: tm.reduce((a, b) => a + b, 0) + 1,
        request: { method: "GET", url },
        response: { status, bodySize: size, content: { size, mimeType: mime } },
        timings: { blocked: tm[0], dns: tm[1], connect: tm[2], send: 1, wait: tm[3], receive: tm[4] },
      };
    }),
  },
});
