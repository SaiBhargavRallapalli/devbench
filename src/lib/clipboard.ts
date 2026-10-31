// Copyright (c) 2026 DevBench contributors. MIT License.
import { notify } from "@/lib/notify";

/** Failure toast — every copy failure must explain itself (WCAG-friendly: the toast host is the site's aria-live region). */
export const COPY_FAILED_MESSAGE = "Copy failed — select the text and copy manually.";

/**
 * Copy text with a fallback AND guaranteed failure feedback.
 *
 * The standard copy primitive for tool UIs: never throws, always resolves to
 * `ok` so callers can guard their inline success state (showing "Copied!"
 * when the write actually failed is a lie the old ad-hoc handlers told).
 * On failure, emits the shared error toast — silent copy failures leave users
 * clicking a button that appears broken.
 */
export async function copyWithFeedback(text: string): Promise<boolean> {
  const ok = await safeCopyToClipboard(text);
  if (!ok) notify.error(COPY_FAILED_MESSAGE);
  return ok;
}

/**
 * Copy text to the clipboard; resolves true on success, false on failure.
 * Never throws — use this in fire-and-forget contexts.
 */
export async function safeCopyToClipboard(text: string): Promise<boolean> {
  try {
    await copyToClipboard(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy text to the clipboard with a execCommand fallback for older / non-secure contexts.
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    /* try fallback */
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard is not available.");
  }

  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  ta.style.top = "0";
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, text.length);
  try {
    const ok = document.execCommand("copy");
    if (!ok) throw new Error("Copy was blocked.");
  } finally {
    document.body.removeChild(ta);
  }
}
