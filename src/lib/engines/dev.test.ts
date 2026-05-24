import { describe, expect, it } from "vitest";
import {
  decodeJwt,
  parseUrl,
  convertBase,
  minifyCss,
  minifyHtml,
  escapeString,
  compareSemverVersions,
  chmodCalculator,
  parseDotenv,
  mimeLookup,
} from "./dev";

function str(r: unknown): string {
  if (typeof r === "string") return r;
  if (r && typeof r === "object" && "output" in r) return (r as { output: string }).output;
  return String(r);
}
function err(r: unknown): string | undefined {
  if (r && typeof r === "object" && "error" in r) return (r as { error: string }).error;
  return undefined;
}

// ── decodeJwt ───────────────────────────────────────────────────────────────

describe("decodeJwt", () => {
  const SAMPLE =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
    ".eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ" +
    ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  it("decodes header correctly", () => {
    const r = decodeJwt(SAMPLE);
    expect(r.header).toMatchObject({ alg: "HS256", typ: "JWT" });
  });

  it("decodes payload correctly", () => {
    const r = decodeJwt(SAMPLE);
    expect(r.payload).toMatchObject({ sub: "1234567890", name: "John Doe" });
  });

  it("returns signature segment", () => {
    const r = decodeJwt(SAMPLE);
    expect(typeof r.signature).toBe("string");
    expect(r.signature.length).toBeGreaterThan(0);
  });

  it("returns error for non-3-part token", () => {
    expect(decodeJwt("not.a.valid.jwt.token").error).toBeTruthy();
  });

  it("returns error for malformed base64", () => {
    expect(decodeJwt("!!!.!!.!!").error).toBeTruthy();
  });
});

// ── parseUrl ────────────────────────────────────────────────────────────────

describe("parseUrl", () => {
  it("parses protocol and host", () => {
    const out = str(parseUrl("https://example.com/path?a=1"));
    expect(out).toContain("https:");
    expect(out).toContain("example.com");
  });

  it("lists query parameters", () => {
    const out = str(parseUrl("https://example.com/?foo=bar&baz=qux"));
    expect(out).toContain("foo = bar");
    expect(out).toContain("baz = qux");
  });

  it("returns error for invalid URL", () => {
    expect(err(parseUrl("not-a-url"))).toBeTruthy();
  });
});

// ── convertBase ─────────────────────────────────────────────────────────────

describe("convertBase", () => {
  it("converts decimal 255 to hex FF", () => {
    expect(str(convertBase("255", 10, 16))).toContain("FF");
  });

  it("converts hex FF to decimal 255", () => {
    expect(str(convertBase("FF", 16, 10))).toContain("255");
  });

  it("converts decimal to binary", () => {
    expect(str(convertBase("10", 10, 2))).toContain("1010");
  });

  it("returns error for invalid number", () => {
    expect(err(convertBase("xyz", 10, 16))).toBeTruthy();
  });
});

// ── minifyCss ───────────────────────────────────────────────────────────────

describe("minifyCss", () => {
  it("strips comments", () => {
    expect(str(minifyCss("/* comment */ .a { color: red; }"))).not.toContain("comment");
  });

  it("collapses whitespace", () => {
    const out = str(minifyCss(".a   {   color :   red   ;   }"));
    expect(out).toContain(".a{color:red}");
  });

  it("includes size savings header", () => {
    expect(str(minifyCss(".a { color: red; }"))).toContain("Saved");
  });
});

// ── minifyHtml ──────────────────────────────────────────────────────────────

describe("minifyHtml", () => {
  it("strips HTML comments", () => {
    expect(str(minifyHtml("<!-- foo --><p>hi</p>"))).not.toContain("foo");
  });

  it("collapses whitespace between tags", () => {
    const out = str(minifyHtml("<p>  hello  </p>   <p>  world  </p>"));
    expect(out).toContain("><");
  });

  it("includes size savings header", () => {
    expect(str(minifyHtml("<p>  hello  </p>"))).toContain("Saved");
  });
});

// ── escapeString ────────────────────────────────────────────────────────────

describe("escapeString", () => {
  it('escapes double quotes in json mode', () => {
    expect(str(escapeString('say "hello"', "json"))).toContain('\\"hello\\"');
  });

  it("escapes newline in js mode", () => {
    expect(str(escapeString("line1\nline2", "js"))).toContain("\\n");
  });

  it("escapes single quotes in sql mode", () => {
    expect(str(escapeString("it's fine", "sql"))).toBe("it''s fine");
  });

  it("escapes regex special chars", () => {
    const out = str(escapeString("a.b*c", "regex"));
    expect(out).toContain("\\.");
    expect(out).toContain("\\*");
  });
});

// ── compareSemverVersions ───────────────────────────────────────────────────

describe("compareSemverVersions", () => {
  it("detects A older than B", () => {
    expect(str(compareSemverVersions("1.0.0", "2.0.0"))).toContain("A < B");
  });

  it("detects A newer than B", () => {
    expect(str(compareSemverVersions("2.0.0", "1.0.0"))).toContain("A > B");
  });

  it("detects equal versions", () => {
    expect(str(compareSemverVersions("1.2.3", "1.2.3"))).toContain("A === B");
  });

  it("handles v-prefix", () => {
    expect(str(compareSemverVersions("v1.0.0", "v2.0.0"))).toContain("A < B");
  });

  it("returns error for invalid input", () => {
    expect(err(compareSemverVersions("not-a-ver", "1.0.0"))).toBeTruthy();
  });
});

// ── chmodCalculator ─────────────────────────────────────────────────────────

describe("chmodCalculator", () => {
  it("converts octal 755 to rwxr-xr-x", () => {
    expect(str(chmodCalculator("755"))).toContain("rwxr-xr-x");
  });

  it("converts octal 644 to rw-r--r--", () => {
    expect(str(chmodCalculator("644"))).toContain("rw-r--r--");
  });

  it("converts symbolic rwxr-xr-x to octal 755", () => {
    expect(str(chmodCalculator("rwxr-xr-x"))).toContain("755");
  });

  it("detects setuid in 4755", () => {
    expect(str(chmodCalculator("4755"))).toContain("setuid");
  });

  it("returns error for empty input", () => {
    expect(err(chmodCalculator(""))).toBeTruthy();
  });
});

// ── parseDotenv ─────────────────────────────────────────────────────────────

describe("parseDotenv", () => {
  it("parses basic KEY=value pairs", () => {
    const out = str(parseDotenv("FOO=bar\nBAZ=qux"));
    expect(out).toContain('"FOO": "bar"');
    expect(out).toContain('"BAZ": "qux"');
  });

  it("skips comments and blank lines", () => {
    const out = str(parseDotenv("# comment\n\nFOO=bar"));
    expect(out).toContain("Keys parsed: 1");
  });

  it("strips quotes from values", () => {
    const out = str(parseDotenv('KEY="quoted value"'));
    expect(out).toContain('"KEY": "quoted value"');
  });

  it("handles export prefix", () => {
    const out = str(parseDotenv("export MY_VAR=hello"));
    expect(out).toContain('"MY_VAR": "hello"');
  });

  it("flags duplicate keys", () => {
    const out = str(parseDotenv("FOO=first\nFOO=second"));
    expect(out).toContain("Duplicate");
    expect(out).toContain('"FOO": "second"');
  });
});

// ── mimeLookup ──────────────────────────────────────────────────────────────

describe("mimeLookup", () => {
  it("looks up .json", () => {
    expect(str(mimeLookup("json"))).toContain("application/json");
  });

  it("looks up .png", () => {
    expect(str(mimeLookup("png"))).toContain("image/png");
  });

  it("strips leading dot", () => {
    expect(str(mimeLookup(".svg"))).toContain("image/svg+xml");
  });

  it("returns error for unknown extension", () => {
    expect(err(mimeLookup("xyzunknownext"))).toBeTruthy();
  });
});
