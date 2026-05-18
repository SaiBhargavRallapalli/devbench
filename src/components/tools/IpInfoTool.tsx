"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Loader2, Copy, Check, MapPin, Globe, Wifi } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";

interface IpData {
  ip: string;
  city?: string;
  region?: string;
  region_code?: string;
  country?: string;
  country_name?: string;
  country_code?: string;
  continent_code?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  utc_offset?: string;
  org?: string;
  asn?: string;
  currency?: string;
  currency_name?: string;
  languages?: string;
  error?: boolean;
  reason?: string;
}

function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "";
  return String.fromCodePoint(
    ...Array.from(code.toUpperCase()).map((c) => c.codePointAt(0)! + 127397)
  );
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="text-sm font-medium break-all">{children}</div>
    </div>
  );
}

export default function IpInfoTool({ tool }: { tool: Tool }) {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchIpData = useCallback(async (ip: string) => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`);
      if (!res.ok) throw new Error("Request failed");
      const json: IpData = await res.json();
      if (json.error) {
        setError(json.reason || "Could not fetch IP info. Check the IP address and try again.");
      } else {
        setData(json);
      }
    } catch {
      setError("Could not fetch IP info. Check the IP address and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyIp = useCallback(async () => {
    setLoading(true);
    setError("");
    setData(null);
    setQuery("");
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      if (!res.ok) throw new Error("Request failed");
      const { ip } = await res.json();
      await fetchIpData(ip);
    } catch {
      setError("Could not determine your IP address. Try again later.");
      setLoading(false);
    }
  }, [fetchIpData]);

  useEffect(() => {
    fetchMyIp();
  }, [fetchMyIp]);

  const handleLookup = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    fetchIpData(q);
  }, [query, fetchIpData]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLookup();
  };

  const handleCopy = async () => {
    if (!data?.ip) return;
    try {
      await navigator.clipboard.writeText(data.ip);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLookupAnother = () => {
    setData(null);
    setError("");
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const location = data
    ? [data.city, data.region, data.country_name]
        .filter(Boolean)
        .join(", ")
    : null;

  const flag = data?.country_code ? countryFlag(data.country_code) : "";

  const mapsUrl =
    data?.latitude != null && data?.longitude != null
      ? `https://maps.google.com/?q=${data.latitude},${data.longitude}`
      : null;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-1 gap-2 min-w-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter IP address or domain…"
                className="pl-9 px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 flex-1 w-full"
                spellCheck={false}
              />
            </div>
            <button
              type="button"
              onClick={handleLookup}
              disabled={!query.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              Look up
            </button>
          </div>
          <button
            type="button"
            onClick={fetchMyIp}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Wifi className="w-4 h-4" />
            What's my IP?
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Fetching your IP…</span>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {data && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold font-mono">{data.ip}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy IP"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-muted/40 text-xs hover:bg-muted transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <button
                type="button"
                onClick={handleLookupAnother}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Look up another IP
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {location && (
                <InfoCard label="Location">
                  <span>
                    {flag && <span className="mr-1.5">{flag}</span>}
                    {location}
                  </span>
                </InfoCard>
              )}

              {mapsUrl && (
                <InfoCard label="Coordinates">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent hover:underline"
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {data.latitude}, {data.longitude}
                  </a>
                </InfoCard>
              )}

              {data.timezone && (
                <InfoCard label="Timezone">
                  {data.timezone}
                  {data.utc_offset && (
                    <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                      (UTC{data.utc_offset})
                    </span>
                  )}
                </InfoCard>
              )}

              {data.org && (
                <InfoCard label="ISP / Organization">
                  {data.org}
                </InfoCard>
              )}

              {data.asn && (
                <InfoCard label="ASN">
                  {data.asn}
                </InfoCard>
              )}

              {data.currency_name && (
                <InfoCard label="Currency">
                  {data.currency_name}
                  {data.currency && (
                    <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                      ({data.currency})
                    </span>
                  )}
                </InfoCard>
              )}

              {data.postal && (
                <InfoCard label="Postal Code">
                  {data.postal}
                </InfoCard>
              )}

              {data.continent_code && (
                <InfoCard label="Continent">
                  {data.continent_code}
                </InfoCard>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
