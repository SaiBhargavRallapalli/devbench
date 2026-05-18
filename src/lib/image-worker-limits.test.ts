import { describe, expect, it } from "vitest";
import {
  IMAGE_WORKER_MAX_PIXELS,
  IMAGE_WORKER_MAX_SIDE,
  rejectInputImageDimensions,
  rejectOutputDimensions,
} from "./image-worker-limits";

describe("image-worker-limits", () => {
  it("exports sane constants", () => {
    expect(IMAGE_WORKER_MAX_SIDE).toBe(16384);
    expect(IMAGE_WORKER_MAX_PIXELS).toBe(50_000_000);
  });

  it("rejectInputImageDimensions allows typical photo sizes", () => {
    expect(rejectInputImageDimensions(4000, 3000)).toBeNull();
  });

  it("rejectInputImageDimensions rejects oversized side", () => {
    const err = rejectInputImageDimensions(IMAGE_WORKER_MAX_SIDE + 1, 100);
    expect(err).toMatch(/exceeds safe limits/i);
  });

  it("rejectInputImageDimensions rejects too many pixels", () => {
    const w = 10000;
    const h = Math.ceil(IMAGE_WORKER_MAX_PIXELS / w) + 1;
    const err = rejectInputImageDimensions(w, h);
    expect(err).toMatch(/too many pixels/i);
  });

  it("rejectOutputDimensions matches worker policy", () => {
    expect(rejectOutputDimensions(800, 600)).toBeNull();
    expect(rejectOutputDimensions(IMAGE_WORKER_MAX_SIDE + 1, 1)).toMatch(/too large/i);
  });
});
