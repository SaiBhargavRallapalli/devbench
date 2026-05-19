// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Off-main-thread image processing via OffscreenCanvas.
 * Uses the same Blob-URL pattern as lambda-runner.ts so no build-time worker
 * pipeline is needed and the CSP's existing `worker-src 'self' blob:` covers it.
 */

import { IMAGE_WORKER_MAX_PIXELS, IMAGE_WORKER_MAX_SIDE } from "@/lib/image-worker-limits";

const WORKER_SOURCE = `
"use strict";
var MAX_SIDE = ${IMAGE_WORKER_MAX_SIDE};
var MAX_PIXELS = ${IMAGE_WORKER_MAX_PIXELS};
self.onmessage = async function(e) {
  var d = e.data;
  try {
    var bitmap = await createImageBitmap(new Blob([d.buffer]));
    if (bitmap.width > MAX_SIDE || bitmap.height > MAX_SIDE || bitmap.width * bitmap.height > MAX_PIXELS) {
      bitmap.close();
      self.postMessage({ ok: false, error: "Image exceeds safe limits (" + MAX_SIDE + "px per side, max ~${Math.round(IMAGE_WORKER_MAX_PIXELS / 1_000_000)}MP)." });
      return;
    }
    var w = d.type === "resize" ? d.width : bitmap.width;
    var h = d.type === "resize" ? d.height : bitmap.height;
    if (w > MAX_SIDE || h > MAX_SIDE || w * h > MAX_PIXELS) {
      bitmap.close();
      self.postMessage({ ok: false, error: "Output dimensions are too large." });
      return;
    }
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
