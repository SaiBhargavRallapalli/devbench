import { describe, expect, it } from "vitest";
import { runJsonWorkspaceOpSync } from "@/lib/json-workspace-ops-sync";

describe("runJsonWorkspaceOpSync", () => {
  it("formats JSON", () => {
    const r = runJsonWorkspaceOpSync({ op: "format", input: '{"a":1}' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.output).toContain('"a"');
  });

  it("repairs trailing commas", () => {
    const r = runJsonWorkspaceOpSync({ op: "repair", input: '{ "a": 1, }' });
    expect(r.ok).toBe(true);
    if (r.ok && r.fixResult) expect(r.fixResult.success).toBe(true);
  });

  it("sorts keys", () => {
    const r = runJsonWorkspaceOpSync({ op: "sortKeys", input: '{"b":1,"a":2}' });
    expect(r.ok).toBe(true);
    if (r.ok && r.output) {
      expect(r.output.indexOf('"a"')).toBeLessThan(r.output.indexOf('"b"'));
    }
  });
});
