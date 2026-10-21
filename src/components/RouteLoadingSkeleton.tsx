/**
 * Shared route-level loading skeleton for heavy workspace segments.
 * Server component — no "use client" (rendered as the loading.tsx fallback).
 */
export default function RouteLoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 animate-pulse" aria-busy="true">
      {/* Header-ish bars */}
      <div className="space-y-2">
        <div className="h-3 w-24 rounded-md bg-muted" />
        <div className="h-6 w-64 max-w-full rounded-md bg-muted" />
        <div className="h-3 w-96 max-w-full rounded-md bg-muted/70" />
      </div>

      {/* Toolbar placeholder */}
      <div className="mt-6 flex items-center gap-3">
        <div className="h-9 w-28 rounded-lg border border-border bg-muted/60" />
        <div className="h-9 w-24 rounded-lg border border-border bg-muted/60" />
        <div className="h-9 w-20 rounded-lg border border-border bg-muted/60" />
      </div>

      {/* Card placeholders */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="h-56 rounded-xl border border-border bg-card p-4">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-muted/70" />
            <div className="h-3 w-5/6 rounded bg-muted/70" />
            <div className="h-3 w-2/3 rounded bg-muted/70" />
          </div>
        </div>
        <div className="h-56 rounded-xl border border-border bg-card p-4">
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-muted/70" />
            <div className="h-3 w-4/6 rounded bg-muted/70" />
            <div className="h-3 w-3/5 rounded bg-muted/70" />
          </div>
        </div>
      </div>
    </div>
  );
}
