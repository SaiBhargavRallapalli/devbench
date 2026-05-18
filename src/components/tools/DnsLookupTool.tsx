"use client";

import { useState, useCallback } from "react";
import { Search, Loader2, Copy, Check, Globe } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";

type RecordType = "A" | "AAAA" | "MX" | "TXT" | "CNAME" | "NS" | "SOA" | "PTR" | "CAA";

const RECORD_TYPES: RecordType[] = ["A", "AAAA", "MX", "TXT", "CNAME", "NS", "SOA", "PTR", "CAA"];

const TYPE_NUM_TO_NAME: Record<number, string> = {
  1: "A",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  12: "PTR",
  15: "MX",
  16: "TXT",
  28: "AAAA",
  257: "CAA",
};

const POPULAR_DOMAINS = ["github.com", "google.com", "cloudflare.com", "npmjs.com"];

interface DnsAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DnsResult {
  recordType: string;
  answers: DnsAnswer[];
  error?: string;
}

function formatTtl(seconds: number): string {
  if (seconds > 3600) {
    const h = Math.round(seconds / 3600);
    return `${h}h`;
  }
  return `${seconds}s`;
}

async function fetchDns(domain: string, type: string): Promise<DnsResult> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`;
  const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
  if (!res.ok) {
    return { recordType: type, answers: [], error: `HTTP ${res.status}: ${res.statusText}` };
  }
  const json = await res.json();
  if (json.Status === 3) {
    return { recordType: type, answers: [], error: "No records found for this domain/type" };
  }
  if (json.Status !== 0) {
    return { recordType: type, answers: [], error: `DNS error: SERVFAIL (status ${json.Status})` };
  }
  if (!json.Answer || json.Answer.length === 0) {
    return { recordType: type, answers: [], error: "No records found" };
  }
  return { recordType: type, answers: json.Answer as DnsAnswer[] };
}

function ResultsTable({ results }: { results: DnsResult[] }) {
  return (
    <div className="space-y-6">
      {results.map((result) => (
        <div key={result.recordType}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase tracking-wide">
              {result.recordType}
            </span>
          </div>
          {result.error ? (
            <p className="text-sm text-muted-foreground italic px-1">{result.error}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-xs text-muted-foreground uppercase tracking-wide px-4 py-2.5 font-medium border-b border-border">
                      Name
                    </th>
                    <th className="text-left text-xs text-muted-foreground uppercase tracking-wide px-4 py-2.5 font-medium border-b border-border">
                      Type
                    </th>
                    <th className="text-left text-xs text-muted-foreground uppercase tracking-wide px-4 py-2.5 font-medium border-b border-border">
                      TTL
                    </th>
                    <th className="text-left text-xs text-muted-foreground uppercase tracking-wide px-4 py-2.5 font-medium border-b border-border">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.answers.map((answer, i) => {
                    const typeName = TYPE_NUM_TO_NAME[answer.type] ?? String(answer.type);
                    return (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-xs text-foreground/80 max-w-[160px] truncate">
                          {answer.name}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                          {typeName}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {formatTtl(answer.TTL)}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-foreground break-all">
                          {answer.data}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function resultsToText(results: DnsResult[]): string {
  return results
    .map((r) => {
      if (r.error) return `[${r.recordType}]\n${r.error}`;
      return (
        `[${r.recordType}]\n` +
        r.answers
          .map((a) => {
            const typeName = TYPE_NUM_TO_NAME[a.type] ?? String(a.type);
            return `${a.name}\t${typeName}\t${formatTtl(a.TTL)}\t${a.data}`;
          })
          .join("\n")
      );
    })
    .join("\n\n");
}

export default function DnsLookupTool({ tool }: { tool: Tool }) {
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState<RecordType>("A");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DnsResult[] | null>(null);
  const [lookedUpDomain, setLookedUpDomain] = useState("");
  const [copied, setCopied] = useState(false);
  const [additionalLoading, setAdditionalLoading] = useState(false);

  const handleLookup = useCallback(
    async (domainOverride?: string, typeOverride?: RecordType) => {
      const target = (domainOverride ?? domain).trim();
      const type = typeOverride ?? recordType;
      if (!target) return;
      setLoading(true);
      setResults(null);
      setLookedUpDomain(target);
      try {
        const result = await fetchDns(target, type);
        setResults([result]);
      } finally {
        setLoading(false);
      }
    },
    [domain, recordType],
  );

  const handleAdditionalLookup = useCallback(async () => {
    if (!lookedUpDomain) return;
    setAdditionalLoading(true);
    try {
      const [aaaaResult, mxResult, txtResult] = await Promise.all([
        fetchDns(lookedUpDomain, "AAAA"),
        fetchDns(lookedUpDomain, "MX"),
        fetchDns(lookedUpDomain, "TXT"),
      ]);
      setResults((prev) => {
        const existing = prev ?? [];
        const existingTypes = new Set(existing.map((r) => r.recordType));
        const toAdd = [aaaaResult, mxResult, txtResult].filter(
          (r) => !existingTypes.has(r.recordType),
        );
        return [...existing, ...toAdd];
      });
    } finally {
      setAdditionalLoading(false);
    }
  }, [lookedUpDomain]);

  const handleCopy = useCallback(async () => {
    if (!results) return;
    try {
      await navigator.clipboard.writeText(resultsToText(results));
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [results]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleLookup();
    },
    [handleLookup],
  );

  const showAdditionalButton =
    results !== null &&
    !loading &&
    recordType === "A" &&
    !results.some((r) => r.recordType === "AAAA");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <div className="space-y-4">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. github.com"
                className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 flex-1"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Record type</label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as RecordType)}
                className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                {RECORD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleLookup()}
              disabled={loading || !domain.trim()}
              className="px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              Look up
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">Popular:</span>
            {POPULAR_DOMAINS.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDomain(d);
                  handleLookup(d);
                }}
                className="px-3 py-1 rounded-lg bg-muted text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Looking up...
          </div>
        )}

        {!loading && results !== null && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-muted-foreground">
                Results for{" "}
                <span className="font-mono font-medium text-foreground">{lookedUpDomain}</span>
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {showAdditionalButton && (
                  <button
                    onClick={handleAdditionalLookup}
                    disabled={additionalLoading}
                    className="px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {additionalLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    Also check AAAA, MX, TXT
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied" : "Copy results"}
                </button>
              </div>
            </div>
            <ResultsTable results={results} />
          </div>
        )}
      </div>
    </main>
  );
}
