import { describe, it, expect } from "vitest";
import {
  base64Encode,
  base64Decode,
  urlEncode,
  urlDecode,
  htmlEntityEncode,
  htmlEntityDecode,
  textToHex,
  hexToText,
  rot13,
  formatJson,
  minifyJson,
} from "@/lib/tool-engines";

function out(r: string | { output: string; error?: string }): string {
  return typeof r === "string" ? r : r.output;
}

function err(r: string | { output: string; error?: string }): string {
  return typeof r === "string" ? "" : (r.error ?? "");
}

describe("encoder round-trips", () => {
  const sample = "Hello, 世界 — DevBench 🔧";

  it("base64", () => {
    const enc = out(base64Encode(sample));
    expect(err(base64Decode(enc))).toBe("");
    expect(out(base64Decode(enc))).toBe(sample);
  });

  it("url", () => {
    const enc = out(urlEncode(sample));
    expect(out(urlDecode(enc))).toBe(sample);
  });

  it("html entities", () => {
    const withSpecial = "<div class=\"a\">& ' \"</div>";
    const enc = out(htmlEntityEncode(withSpecial));
    expect(out(htmlEntityDecode(enc))).toBe(withSpecial);
  });

  it("hex", () => {
    const enc = out(textToHex(sample));
    expect(out(hexToText(enc))).toBe(sample);
  });

  it("rot13 is involutory", () => {
    expect(out(rot13(out(rot13(sample))))).toBe(sample);
  });

  it("json format/minify", () => {
    const min = '{"a":1,"b":[2,3]}';
    const formatted = out(formatJson(min));
    expect(formatted).toContain("\n");
    expect(out(minifyJson(formatted))).toBe(min);
  });
});
