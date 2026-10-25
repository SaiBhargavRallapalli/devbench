import { describe, expect, it } from "vitest";
import { buildIco, squareTarget } from "./ico-builder";

/** Synthetic "PNG" — the builder only copies bytes, it never parses them. */
function fakePng(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  // PNG signature so the fixtures look plausible
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  for (let i = 8; i < length; i++) bytes[i] = i % 251;
  return bytes;
}

function readU16(bytes: Uint8Array, offset: number): number {
  return new DataView(bytes.buffer, bytes.byteOffset + offset, 2).getUint16(0, true);
}

function readU32(bytes: Uint8Array, offset: number): number {
  return new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, true);
}

describe("buildIco", () => {
  it("writes the ICONDIR magic (00 00 01 00) and entry count", () => {
    const out = buildIco([{ size: 16, pngBytes: fakePng(24) }]);
    expect(Array.from(out.slice(0, 4))).toEqual([0, 0, 1, 0]);
    expect(readU16(out, 4)).toBe(1);
  });

  it("total length math = 6 + 16·count + payload bytes", () => {
    const a = fakePng(100);
    const b = fakePng(50);
    const out = buildIco([
      { size: 16, pngBytes: a },
      { size: 32, pngBytes: b },
    ]);
    expect(out.byteLength).toBe(6 + 16 * 2 + 100 + 50);
    expect(readU16(out, 4)).toBe(2);
  });

  it("writes per-entry descriptor fields (dim, planes, bpp, size, offset)", () => {
    const png16 = fakePng(300);
    const png48 = fakePng(1200);
    const out = buildIco([
      { size: 16, pngBytes: png16 },
      { size: 48, pngBytes: png48 },
    ]);

    // Entry 0 (offset 6)
    expect(out[6]).toBe(16); // width
    expect(out[7]).toBe(16); // height
    expect(out[8]).toBe(0); // colors
    expect(out[9]).toBe(0); // reserved
    expect(readU16(out, 10)).toBe(1); // planes
    expect(readU16(out, 12)).toBe(32); // bpp
    expect(readU32(out, 14)).toBe(300); // bytes in resource
    expect(readU32(out, 18)).toBe(6 + 16 * 2); // offset = right after headers

    // Entry 1 (offset 22)
    expect(out[22]).toBe(48);
    expect(out[23]).toBe(48);
    expect(readU16(out, 26)).toBe(1);
    expect(readU16(out, 28)).toBe(32);
    expect(readU32(out, 30)).toBe(1200);
    expect(readU32(out, 34)).toBe(6 + 16 * 2 + 300); // sequential offsets
  });

  it("stores 256px images with a width/height byte of 0", () => {
    const out = buildIco([{ size: 256, pngBytes: fakePng(2048) }]);
    expect(out[6]).toBe(0);
    expect(out[7]).toBe(0);
  });

  it("offsets are sequential, valid, and payloads are copied verbatim", () => {
    const payloads = [fakePng(64), fakePng(128), fakePng(256)];
    const sizes = [16, 32, 48];
    const out = buildIco(sizes.map((size, i) => ({ size, pngBytes: payloads[i] })));

    const headerSize = 6 + 16 * payloads.length;
    let expectedOffset = headerSize;
    payloads.forEach((payload, i) => {
      const base = 6 + 16 * i;
      const offset = readU32(out, base + 12);
      expect(offset).toBe(expectedOffset);
      expect(readU32(out, base + 8)).toBe(payload.byteLength);
      // Verbatim copy
      expect(Array.from(out.slice(offset, offset + payload.byteLength))).toEqual(
        Array.from(payload),
      );
      expectedOffset += payload.byteLength;
    });
    // Last entry ends exactly at EOF
    expect(expectedOffset).toBe(out.byteLength);
  });

  it("rejects an empty entry list", () => {
    expect(() => buildIco([])).toThrow();
  });
});

describe("squareTarget", () => {
  it("handles an already-square source (no padding)", () => {
    expect(squareTarget(100, 100)).toEqual({ size: 100, offsetX: 0, offsetY: 0, scale: 1 });
  });

  it("handles a portrait source (pads left/right)", () => {
    expect(squareTarget(50, 100)).toEqual({ size: 100, offsetX: 25, offsetY: 0, scale: 1 });
  });

  it("handles a landscape source (pads top/bottom)", () => {
    expect(squareTarget(200, 80)).toEqual({ size: 200, offsetX: 0, offsetY: 60, scale: 1 });
  });

  it("centers odd remainders with fractional offsets", () => {
    expect(squareTarget(99, 100)).toEqual({ size: 100, offsetX: 0.5, offsetY: 0, scale: 1 });
  });
});
