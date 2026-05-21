"use client";

import { Link2, Loader2, X } from "lucide-react";

type Props = {
  url: string;
  busy: boolean;
  error: string;
  onUrlChange: (url: string) => void;
  onLoad: () => void;
  onClose: () => void;
};

export default function JsonLoadUrlPanel({ url, busy, error, onUrlChange, onLoad, onClose }: Props) {
  return (
    <div className="border-b border-border bg-card px-4 py-3 space-y-2 shrink-0 animate-fade-in">
      <div className="flex items-center gap-2">
        <Link2 size={14} className="text-muted-foreground shrink-0" />
        <span className="text-xs font-medium">Load JSON from URL</span>
        <span className="text-[10px] text-muted-foreground hidden sm:inline">
          (JSONLint <code className="font-mono">?url=</code> — fetched via secure proxy)
        </span>
        <button
          type="button"
          aria-label="Close load URL panel"
          onClick={onClose}
          className="ml-auto text-muted-foreground hover:text-foreground"
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !busy) onLoad();
          }}
          placeholder="https://example.com/data.json"
          className="flex-1 min-w-[12rem] text-xs font-mono px-3 py-2 rounded-md border border-border bg-background outline-none focus:ring-1 focus:ring-ring"
          spellCheck={false}
        />
        <button
          type="button"
          disabled={busy || !url.trim()}
          onClick={onLoad}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent hover:bg-accent/20 disabled:opacity-50 transition-colors"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
          {busy ? "Loading…" : "Fetch JSON"}
        </button>
      </div>
      {error && <p className="text-xs text-destructive font-mono">{error}</p>}
    </div>
  );
}
