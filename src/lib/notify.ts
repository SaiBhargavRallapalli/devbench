/**
 * Minimal global notification bus.
 *
 * Any module (libs like pdf-download, tool components, API handlers on the
 * client) can call `notify.success(...)` / `notify.error(...)` without React
 * context. A single <StatusToastHost /> mounted in the root layout renders them
 * and exposes them to screen readers via an aria-live region.
 *
 * Implemented with DOM CustomEvents so it works from plain TS (no React import),
 * and stays SSR-safe (no-ops on the server where `window` is undefined).
 */

export type NotifyKind = "success" | "error" | "info";

export interface NotifyDetail {
  message: string;
  kind: NotifyKind;
  /** ms before auto-dismiss; 0 keeps it until dismissed. */
  duration?: number;
}

const EVENT_NAME = "devbench:notify";

function emit(message: string, kind: NotifyKind, duration?: number): void {
  if (typeof window === "undefined") return;
  const detail: NotifyDetail = {
    message,
    kind,
    duration: duration ?? (kind === "error" ? 6000 : 3500),
  };
  window.dispatchEvent(new CustomEvent<NotifyDetail>(EVENT_NAME, { detail }));
}

export const notify = {
  success: (message: string, duration?: number) => emit(message, "success", duration),
  error: (message: string, duration?: number) => emit(message, "error", duration),
  info: (message: string, duration?: number) => emit(message, "info", duration),
};

export const NOTIFY_EVENT_NAME = EVENT_NAME;
