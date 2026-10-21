import { describe, expect, it } from "vitest";
import { friendlyError } from "./friendly-error";

const FALLBACK = "Something went wrong. Please try again.";

describe("friendlyError", () => {
  it("maps WinAnsi encoding failures to actionable copy", () => {
    const msg = friendlyError(new Error('WinAnsi cannot encode "日" (0x65e5)'), FALLBACK);
    expect(msg).toMatch(/characters/i);
    expect(msg).not.toMatch(/WinAnsi/);
  });

  it("maps JSON parse failures without leaking position details", () => {
    const e = new SyntaxError("Unexpected token < in JSON at position 23");
    const msg = friendlyError(e, FALLBACK);
    expect(msg).toMatch(/valid JSON/i);
    expect(msg).not.toMatch(/position 23/);
  });

  it("maps invalid/damaged PDF errors", () => {
    expect(friendlyError(new Error("Invalid PDF structure (xref)"), FALLBACK)).toMatch(/damaged|PDF/i);
  });

  it("maps encrypted PDF errors", () => {
    expect(friendlyError(new Error("Password required to decrypt document"), FALLBACK)).toMatch(/password/i);
  });

  it("maps network failures", () => {
    expect(friendlyError(new TypeError("Failed to fetch"), FALLBACK)).toMatch(/network/i);
  });

  it("NEVER leaks raw TypeError internals (JS bugs)", () => {
    const e = new TypeError("Cannot read properties of undefined (reading 'remove')");
    expect(friendlyError(e, FALLBACK)).toBe(FALLBACK);
  });

  it("maps canvas SecurityError via DOMException name", () => {
    const e = new DOMException("The canvas has been tainted by cross-origin data.", "SecurityError");
    expect(friendlyError(e, FALLBACK)).toMatch(/browser blocked/i);
  });

  it("maps timeouts", () => {
    expect(friendlyError(new Error("The operation timed out"), FALLBACK)).toMatch(/timed out/i);
  });

  it("returns fallback for unknown Error messages", () => {
    expect(friendlyError(new Error("some obscure library failure"), FALLBACK)).toBe(FALLBACK);
  });

  it("returns fallback for non-Error thrown values", () => {
    expect(friendlyError("a string", FALLBACK)).toBe(FALLBACK);
    expect(friendlyError(undefined, FALLBACK)).toBe(FALLBACK);
    expect(friendlyError(null, FALLBACK)).toBe(FALLBACK);
    expect(friendlyError({ weird: true }, FALLBACK)).toBe(FALLBACK);
  });
});
