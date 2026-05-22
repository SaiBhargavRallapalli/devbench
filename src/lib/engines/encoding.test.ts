import { describe, expect, it } from "vitest";
import {
  base64Encode,
  base64Decode,
  urlEncode,
  urlDecode,
  htmlEntityEncode,
  htmlEntityDecode,
  textToHex,
  hexToText,
  textToBinary,
  binaryToText,
  rot13,
} from "./encoding";

function str(r: unknown): string {
  if (typeof r === "string") return r;
  if (r && typeof r === "object" && "output" in r) return (r as { output: string }).output;
  return String(r);
}
function err(r: unknown): string | undefined {
  if (r && typeof r === "object" && "error" in r) return (r as { error: string }).error;
  return undefined;
}

describe("base64Encode / base64Decode", () => {
  it("encodes plain ASCII", () => {
    expect(str(base64Encode("hello"))).toBe("aGVsbG8=");
  });

  it("round-trips UTF-8", () => {
    const original = "héllo wörld 🚀";
    expect(str(base64Decode(str(base64Encode(original))))).toBe(original);
  });

  it("decode returns error for invalid input", () => {
    expect(err(base64Decode("!!!not-base64!!!"))).toMatch(/invalid/i);
  });

  it("empty string encodes and decodes", () => {
    expect(str(base64Encode(""))).toBe("");
    expect(str(base64Decode(""))).toBe("");
  });
});

describe("urlEncode / urlDecode", () => {
  it("encodes spaces as %20", () => {
    expect(str(urlEncode("hello world"))).toBe("hello%20world");
  });

  it("encodes special chars", () => {
    const encoded = str(urlEncode("a=1&b=2"));
    expect(encoded).toContain("%3D");
    expect(encoded).toContain("%26");
  });

  it("decodes back to original", () => {
    const original = "hello world & more";
    expect(str(urlDecode(str(urlEncode(original))))).toBe(original);
  });

  it("decode returns error for malformed sequence", () => {
    expect(err(urlDecode("%ZZ"))).toMatch(/invalid/i);
  });
});

describe("htmlEntityEncode / htmlEntityDecode", () => {
  it("encodes <, >, &, quotes", () => {
    const result = str(htmlEntityEncode('<script>alert("xss")</script>'));
    expect(result).toContain("&lt;");
    expect(result).toContain("&gt;");
    expect(result).toContain("&quot;");
    expect(result).not.toContain("<");
  });

  it("round-trips HTML entities", () => {
    const original = "<div class=\"test\">&</div>";
    expect(str(htmlEntityDecode(str(htmlEntityEncode(original))))).toBe(original);
  });
});

describe("textToHex / hexToText", () => {
  it("converts ASCII to hex bytes", () => {
    expect(str(textToHex("AB"))).toBe("41 42");
  });

  it("round-trips UTF-8 text", () => {
    const original = "hello";
    expect(str(hexToText(str(textToHex(original))))).toBe(original);
  });

  it("returns error for odd-length hex", () => {
    expect(err(hexToText("abc"))).toMatch(/even/i);
  });

  it("accepts hex with or without spaces", () => {
    expect(str(hexToText("68656c6c6f"))).toBe("hello");
    expect(str(hexToText("68 65 6c 6c 6f"))).toBe("hello");
  });
});

describe("textToBinary / binaryToText", () => {
  it("converts 'A' to 8-bit binary", () => {
    expect(str(textToBinary("A"))).toBe("01000001");
  });

  it("round-trips ASCII text", () => {
    const original = "hi";
    expect(str(binaryToText(str(textToBinary(original))))).toBe(original);
  });
});

describe("rot13", () => {
  it("shifts letters by 13", () => {
    expect(str(rot13("Hello"))).toBe("Uryyb");
  });

  it("is its own inverse", () => {
    const original = "The quick brown fox";
    expect(str(rot13(str(rot13(original))))).toBe(original);
  });

  it("leaves non-alpha chars unchanged", () => {
    expect(str(rot13("123!@#"))).toBe("123!@#");
  });
});
