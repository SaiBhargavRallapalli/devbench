/**
 * Off-main-thread image processing via OffscreenCanvas.
 * Uses the same Blob-URL pattern as lambda-runner.ts so no build-time worker
 * pipeline is needed and the CSP's existing `worker-src 'self' blob:` covers it.
 */

const WORKER_SOURCE = `
"use strict";
self.onmessage = async function(e) {
  var d = e.data;
  try {
    var bitmap = await createImageBitmap(new Blob([d.buffer]));
    var w = d.type === "resize" ? d.width : bitmap.width;
    var h = d.type === "resize" ? d.height : bitmap.height;
    var canvas = new OffscreenCanvas(w, h);
    var ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    var blob = await canvas.convertToBlob({ type: d.format, quality: d.quality });
    var buf = await blob.arrayBuffer();
    self.postMessage({ ok: true, buffer: buf }, [buf]);
  } catch (err) {
    self.postMessage({ ok: false, error: String(err && err.message ? err.message : err) });
  }
};
`;

let cachedUrl: string | null = null;

export function getImageWorkerUrl(): string {
  if (!cachedUrl) {
    cachedUrl = URL.createObjectURL(
      new Blob([WORKER_SOURCE], { type: "application/javascript" })
    );
  }
  return cachedUrl;
}

export interface ImageWorkerMessage {
  type: "compress" | "resize";
  buffer: ArrayBuffer;
  format: string;
  quality: number;
  width?: number;
  height?: number;
}

export type ImageWorkerResult =
  | { ok: true; buffer: ArrayBuffer }
  | { ok: false; error: string };
