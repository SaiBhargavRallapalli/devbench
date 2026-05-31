// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Batch raster image conversion — shared by /image hub and format converter.
 */
import { rejectInputImageDimensions } from "@/lib/image-worker-limits";

export type ImageOutputFormat = "image/png" | "image/jpeg" | "image/webp";

export const IMAGE_OUTPUT_EXT: Record<ImageOutputFormat, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export type ImageBatchItem = {
  name: string;
  file: File;
};

export type ImageBatchProgress = {
  index: number;
  total: number;
  name: string;
  phase: "loading" | "converting" | "done" | "error";
  error?: string;
};

const HEIC_MIMES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

function isHeicFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "heic" || ext === "heif") return true;
  return HEIC_MIMES.has(file.type.toLowerCase());
}

function isSvgFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase();
  return file.type === "image/svg+xml" || ext === "svg";
}

function isRasterImageFile(file: File): boolean {
  if (isHeicFile(file) || isSvgFile(file)) return true;
  return file.type.startsWith("image/");
}

export function isBatchConvertibleImage(file: File): boolean {
  return isRasterImageFile(file);
}

async function decodeHeicToPng(file: File): Promise<Blob> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({ blob: file, toType: "image/png" });
  return Array.isArray(result) ? result[0] : result;
}

function parseSvgDimensions(svgText: string): { w: number; h: number } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return { w: 800, h: 600 };

  const wAttr = svg.getAttribute("width");
  const hAttr = svg.getAttribute("height");
  const vb = svg.getAttribute("viewBox");

  if (wAttr && hAttr) {
    const w = parseFloat(wAttr);
    const h = parseFloat(hAttr);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) return { w, h };
  }
  if (vb) {
    const parts = vb.trim().split(/[\s,]+/).map(Number);
    if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
      return { w: parts[2], h: parts[3] };
    }
  }
  return { w: 800, h: 600 };
}

async function loadDisplayBlob(file: File): Promise<{ blob: Blob; svgDims?: { w: number; h: number } }> {
  if (isHeicFile(file)) {
    return { blob: await decodeHeicToPng(file) };
  }
  if (isSvgFile(file)) {
    const text = await file.text();
    return { blob: file, svgDims: parseSvgDimensions(text) };
  }
  return { blob: file };
}

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode image"));
    };
    img.src = url;
  });
}

export async function convertImageFile(
  file: File,
  outFormat: ImageOutputFormat,
  quality: number,
): Promise<Blob> {
  const { blob, svgDims } = await loadDisplayBlob(file);
  const img = await loadImageFromBlob(blob);

  const w = img.naturalWidth || svgDims?.w || 800;
  const h = img.naturalHeight || svgDims?.h || 600;
  const dimErr = rejectInputImageDimensions(w, h);
  if (dimErr) throw new Error(dimErr);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  if (outFormat === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.clearRect(0, 0, w, h);
  }
  ctx.drawImage(img, 0, 0, w, h);

  const q = outFormat === "image/png" ? undefined : quality / 100;
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Conversion failed"))),
      outFormat,
      q,
    );
  });
}

export async function batchConvertImages(
  items: ImageBatchItem[],
  outFormat: ImageOutputFormat,
  quality: number,
  onProgress?: (p: ImageBatchProgress) => void,
): Promise<{ name: string; blob: Blob }[]> {
  const results: { name: string; blob: Blob }[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    onProgress?.({ index: i, total: items.length, name: item.name, phase: "loading" });
    try {
      onProgress?.({ index: i, total: items.length, name: item.name, phase: "converting" });
      const blob = await convertImageFile(item.file, outFormat, quality);
      const base = item.name.replace(/\.[^.]+$/, "") || "image";
      const ext = IMAGE_OUTPUT_EXT[outFormat];
      results.push({ name: `${base}.${ext}`, blob });
      onProgress?.({ index: i, total: items.length, name: item.name, phase: "done" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Conversion failed";
      onProgress?.({
        index: i,
        total: items.length,
        name: item.name,
        phase: "error",
        error: msg,
      });
      throw e;
    }
  }
  return results;
}
