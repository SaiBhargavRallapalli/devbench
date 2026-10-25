/**
 * Pure byte-level ICO (Windows icon) writer — no DOM.
 *
 * PNG-in-ICO: each image entry stores a complete PNG file. This is valid per
 * spec for 16/32/48px and is supported by every modern browser and Windows
 * Vista+, so the builder simply concatenates PNG payloads after the headers.
 */

export interface IcoEntryInput {
  /** Edge length in pixels of the (square) PNG — 16, 32, 48, 256, … */
  size: number;
  /** Complete bytes of one PNG file. Copied verbatim, never parsed. */
  pngBytes: Uint8Array;
}

const ICONDIR_SIZE = 6;
const ICONDIRENTRY_SIZE = 16;

/**
 * Build a single `.ico` file containing the given PNG images.
 *
 * Layout: ICONDIR (6 bytes) + one ICONDIRENTRY per image (16 bytes each) +
 * concatenated PNG payloads. Entry offsets point into the combined buffer.
 */
export function buildIco(entries: IcoEntryInput[]): Uint8Array<ArrayBuffer> {
  if (entries.length === 0) {
    throw new Error("buildIco requires at least one image entry.");
  }
  if (entries.length > 0xffff) {
    throw new Error("buildIco supports at most 65535 entries.");
  }

  for (const entry of entries) {
    if (!Number.isInteger(entry.size) || entry.size < 1) {
      throw new Error("Each ICO entry needs an integer pixel size >= 1.");
    }
  }

  const headerSize = ICONDIR_SIZE + ICONDIRENTRY_SIZE * entries.length;

  const offsets: number[] = [];
  let total = headerSize;
  for (const entry of entries) {
    offsets.push(total);
    total += entry.pngBytes.byteLength;
  }

  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);

  // ICONDIR: reserved (0), type (1 = icon), image count.
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, entries.length, true);

  entries.forEach((entry, i) => {
    const base = ICONDIR_SIZE + ICONDIRENTRY_SIZE * i;
    // 0 means 256 in the on-disk width/height bytes.
    const dim = entry.size >= 256 ? 0 : entry.size;
    out[base] = dim; // width
    out[base + 1] = dim; // height
    out[base + 2] = 0; // palette color count (0 = no palette)
    out[base + 3] = 0; // reserved
    view.setUint16(base + 4, 1, true); // color planes
    view.setUint16(base + 6, 32, true); // bits per pixel
    view.setUint32(base + 8, entry.pngBytes.byteLength, true); // bytes in resource
    view.setUint32(base + 12, offsets[i], true); // image data offset
    out.set(entry.pngBytes, offsets[i]);
  });

  return out;
}

export interface SquareTarget {
  /** Edge length of the square canvas (the source's longest side). */
  size: number;
  /** X offset where the source should be drawn, centered horizontally. */
  offsetX: number;
  /** Y offset where the source should be drawn, centered vertically. */
  offsetY: number;
  /** Scale factor applied to the source (1 — it already fits the square). */
  scale: number;
}

/**
 * Geometry for fitting a `w × h` source inside a square canvas, centered
 * ("contain"). The square's side is the source's longest side, so the source
 * is drawn at native resolution and the shorter axis gets transparent padding.
 */
export function squareTarget(w: number, h: number): SquareTarget {
  const size = Math.max(w, h);
  return {
    size,
    offsetX: (size - w) / 2,
    offsetY: (size - h) / 2,
    scale: 1,
  };
}
