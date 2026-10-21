"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { NOTIFY_EVENT_NAME, type NotifyDetail } from "@/lib/notify";

interface Toast extends NotifyDetail {
  id: number;
}

let nextId = 0;

/**
 * Global toast renderer + the site's single aria-live region for async status.
 * Mounted once in the root layout. Any code can trigger it via `notify.*()`.
 */
export default function StatusToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const onNotify = (event: Event) => {
      const detail = (event as CustomEvent<NotifyDetail>).detail;
      if (!detail?.message) return;
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-2), { ...detail, id }]);
      const duration = detail.duration ?? (detail.kind === "error" ? 6000 : 3500);
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
    };
    window.addEventListener(NOTIFY_EVENT_NAME, onNotify);
    return () => window.removeEventListener(NOTIFY_EVENT_NAME, onNotify);
  }, [dismiss]);

  if (toasts.length === 0) return null;

  const iconFor = (kind: Toast["kind"]) => {
    if (kind === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />;
    if (kind === "error") return <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />;
    return <Info className="h-4 w-4 text-accent" aria-hidden="true" />;
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[120] flex flex-col items-center gap-2 px-4">
      {/* Single polite live region — announces async results to screen readers. */}
      <div aria-live="polite" aria-atomic="false" className="sr-only">
        {toasts.map((t) => (
          <p key={t.id}>{`${t.kind === "error" ? "Error: " : ""}${t.message}`}</p>
        ))}
      </div>
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-lg"
        >
          <span className="mt-0.5 shrink-0">{iconFor(t.kind)}</span>
          <span className="flex-1 text-foreground">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
