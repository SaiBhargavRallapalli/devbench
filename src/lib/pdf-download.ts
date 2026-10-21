/** Browser-safe download helpers for PDF toolkit tools. */

import { trackToolDownload } from "@/lib/analytics-events";
import { notify } from "@/lib/notify";

export function downloadUint8(
  bytes: Uint8Array,
  filename: string,
  mimeType = "application/pdf",
  tool?: string,
): void {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy], { type: mimeType });
  downloadBlob(blob, filename, tool);
}

export function downloadBlob(
  blob: Blob,
  filename: string,
  tool?: string,
): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  // Attach to the DOM before clicking. Safari (and some Firefox builds) ignore
  // programmatic clicks on a detached <a>, which silently produced "converted
  // but nothing downloaded" even though the PDF bytes were valid.
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Defer the revoke. Revoking synchronously right after click() can cancel an
  // in-flight blob-URL fetch before the download has actually started.
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  if (tool) {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
    trackToolDownload(tool, ext);
  }
  // Downloads used to fire with zero feedback — users on slow devices couldn't
  // tell if anything happened. Announce it (also reaches screen readers).
  notify.success(`Downloaded ${filename}`);
}
