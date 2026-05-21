"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCopy, Route } from "lucide-react";
import {
  JSON_PATH_EXAMPLES,
  queryJsonPath,
  type JsonPathQueryResult,
} from "@/lib/json-path-query";

type Props = {
  input: string;
};

export default function JsonPathTab({ input }: Props) {
  const [pathExpr, setPathExpr] = useState("$.responses[0].type");
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    try {
      return { data: JSON.parse(input) as unknown, error: null as string | null };
    } catch (e) {
      return { data: null, error: (e as Error).message };
    }
  }, [input]);

  const result: JsonPathQueryResult = useMemo(() => {
    if (parsed.error || parsed.data === null) {
      return { matches: [], matchCount: 0, error: "Fix or format the main JSON first — Path runs on valid JSON." };
    }
    return queryJsonPath(parsed.data, pathExpr);
  }, [parsed.data, parsed.error, pathExpr]);

  const outputText = useMemo(() => {
    if (result.error) return "";
    if (result.matchCount === 0) return "[]";
    if (result.matchCount === 1) return JSON.stringify(result.matches[0], null, 2);
    return JSON.stringify(result.matches, null, 2);
  }, [result]);

  async function copyOutput() {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 p-4 gap-4">
      <div className="flex items-start gap-2 shrink-0">
        <Route size={18} className="text-accent shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">JSONPath Query</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Query the document in the main editor — same idea as{" "}
            <a
              href="https://jsonlint.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              JSONLint Path
            </a>
            , with RFC 9535 expressions and live results.
          </p>
        </div>
      </div>

      <label className="block shrink-0 space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Expression</span>
        <input
          value={pathExpr}
          onChange={(e) => setPathExpr(e.target.value)}
          spellCheck={false}
          className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-ring/40"
          placeholder="$.store.book[*].author"
        />
      </label>

      <div className="flex flex-wrap gap-1.5 shrink-0">
        {JSON_PATH_EXAMPLES.map((ex) => (
          <button
            key={ex.path}
            type="button"
            onClick={() => setPathExpr(ex.path)}
            className="rounded-full border border-border bg-muted/80 px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 shrink-0 text-xs">
        {result.error ? (
          <span className="text-destructive font-mono">{result.error}</span>
        ) : (
          <span className="text-muted-foreground">
            <span className="text-success font-medium">{result.matchCount}</span> match
            {result.matchCount === 1 ? "" : "es"}
          </span>
        )}
        <button
          type="button"
          disabled={!outputText}
          onClick={() => void copyOutput()}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          {copied ? <Check size={12} className="text-success" /> : <ClipboardCopy size={12} />}
          Copy result
        </button>
      </div>

      <pre className="flex-1 min-h-[8rem] overflow-auto scrollbar-thin rounded-lg border border-border bg-muted/40 p-3 text-xs font-mono text-foreground whitespace-pre-wrap break-words">
        {outputText || (parsed.error ? `Main JSON invalid:\n${parsed.error}` : "—")}
      </pre>
    </div>
  );
}
