import { describe, expect, it } from "vitest";
import {
  JSON_WORKER_THRESHOLD,
  shouldUseJsonWorker,
} from "@/lib/json-workspace-worker-client";

describe("json-workspace-worker-client", () => {
  it("uses worker threshold of 16KB", () => {
    expect(JSON_WORKER_THRESHOLD).toBe(16 * 1024);
  });

  it("shouldUseJsonWorker is false for small input", () => {
    expect(shouldUseJsonWorker("{}")).toBe(false);
  });

  it("shouldUseJsonWorker is true for large input when Worker exists", () => {
    const big = "x".repeat(JSON_WORKER_THRESHOLD);
    expect(shouldUseJsonWorker(big)).toBe(typeof Worker !== "undefined");
  });
});
