import { describe, expect, it } from "vitest";
import { htmlToJsx, generateUlid, generateNanoId } from "./misc";

function str(r: unknown): string {
  if (typeof r === "string") return r;
  if (r && typeof r === "object" && "output" in r) return (r as { output: string }).output;
  return String(r);
}

describe("htmlToJsx", () => {
  it("renames class to className", () => {
    expect(str(htmlToJsx('<div class="foo">hi</div>'))).toContain("className=");
  });

  it("renames for to htmlFor", () => {
    expect(str(htmlToJsx('<label for="x">label</label>'))).toContain("htmlFor=");
  });

  it("self-closes void elements", () => {
    expect(str(htmlToJsx("<img src='a.png'>"))).toContain("/>");
  });

  it("converts inline styles to objects", () => {
    const out = str(htmlToJsx('<div style="color: red; font-size: 14px">'));
    expect(out).toContain("style={{");
    expect(out).toContain("color:");
  });

  it("converts HTML comments to JSX comments", () => {
    expect(str(htmlToJsx("<!-- hello -->"))).toContain("{/*");
  });

  it("converts onclick to onClick", () => {
    expect(str(htmlToJsx('<button onclick="fn()">click</button>'))).toContain("onClick=");
  });

  it("converts tabindex to tabIndex", () => {
    expect(str(htmlToJsx('<div tabindex="0">'))).toContain("tabIndex=");
  });

  it("returns empty string for empty input", () => {
    expect(str(htmlToJsx(""))).toBe("");
  });
});

describe("generateUlid", () => {
  it("returns a 26-character string", () => {
    expect(generateUlid()).toHaveLength(26);
  });

  it("uses only Crockford Base32 characters", () => {
    const CHARS = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]+$/;
    expect(CHARS.test(generateUlid())).toBe(true);
  });

  it("generates unique values", () => {
    const a = generateUlid();
    const b = generateUlid();
    expect(a).not.toBe(b);
  });
});

describe("generateNanoId", () => {
  it("returns default length of 21", () => {
    expect(generateNanoId()).toHaveLength(21);
  });

  it("respects custom size", () => {
    expect(generateNanoId(10)).toHaveLength(10);
    expect(generateNanoId(36)).toHaveLength(36);
  });

  it("generates unique values", () => {
    expect(generateNanoId()).not.toBe(generateNanoId());
  });
});
