import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { SITE_URL } from "@/lib/site-config";

// Vercel cron (see vercel.json) — submits every URL in the live sitemap to the
// IndexNow pool (Bing, Naver, Yandex, Seznam …). Google ignores IndexNow, but
// Bing alone powers DuckDuckGo and Copilot search. New pages get discovered in
// minutes instead of days. The ~215-URL sitemap fits inside IndexNow's
// 10,000-URL per-request cap, so one request covers the whole site.
export const maxDuration = 60;

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS = 10_000;
// Must match public/<KEY_FILENAME> (IndexNow verifies ownership by fetching it).
const KEY = "b9c19ce85f077529305bc5f675e2e438";
const KEY_FILENAME = `${KEY}.txt`;
const HOSTNAME = new URL(SITE_URL).hostname;

export async function GET(request: Request) {
  // Vercel sends `Authorization: Bearer ${CRON_SECRET}` when CRON_SECRET is
  // configured as an env var; enforce it when present. Without it the route
  // stays callable, which is acceptable by design: it can only submit URLs
  // from our own sitemap, and IndexNow re-verifies key ownership anyway.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // Submit the live sitemap so brand-new pages ride along automatically.
    const sitemapRes = await fetch(`${SITE_URL}/sitemap.xml`, {
      headers: { "User-Agent": "DevBench-IndexNow/1.0 (+https://www.devbench.co.in)" },
    });
    if (!sitemapRes.ok) {
      logger.error("cron/indexnow", "sitemap fetch failed", { status: sitemapRes.status });
      return NextResponse.json({ error: `sitemap fetch failed: ${sitemapRes.status}` }, { status: 502 });
    }
    const xml = await sitemapRes.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => m[1])
      .slice(0, MAX_URLS);
    if (urls.length === 0) {
      logger.error("cron/indexnow", "no <loc> URLs found in sitemap");
      return NextResponse.json({ error: "no URLs in sitemap" }, { status: 502 });
    }

    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOSTNAME,
        key: KEY,
        keyLocation: `${SITE_URL}/${KEY_FILENAME}`,
        urlList: urls,
      }),
    });
    logger.info("cron/indexnow", "submission result", { status: res.status, submitted: urls.length });
    if (!res.ok) {
      // 400/403/422/429 from upstream — surface as failure so the cron run
      // shows up as errored in Vercel logs.
      return NextResponse.json({ error: `indexnow responded ${res.status}`, submitted: urls.length }, { status: 502 });
    }
    return NextResponse.json({ ok: true, submitted: urls.length });
  } catch (err) {
    logger.error("cron/indexnow", "submission threw", { err: String(err) });
    return NextResponse.json({ error: "submission failed" }, { status: 500 });
  }
}
