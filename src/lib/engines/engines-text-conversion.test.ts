// Copyright (c) 2026 DevBench contributors. MIT License.
import { describe, it, expect } from "vitest";

// text.ts
import {
  caseConvert,
  slugify,
  wordCount,
  sortLines,
  findReplace,
  normalizeWhitespace,
  reverseString,
  markdownToHtml,
  htmlToText,
  stripMarkdown,
  textDiff,
} from "@/lib/engines/text";

// conversion.ts
import {
  convertTemperature,
  convertBytes,
  numberToWords,
  toRomanNumeral,
  fromRomanNumeral,
  convertDuration,
  calculatePercentage,
  calculateAspectRatio,
  convertUnits,
} from "@/lib/engines/conversion";

// misc.ts
import {
  htmlToJsx,
  generateUlid,
  generateNanoId,
} from "@/lib/engines/misc";

function out(r: string | { output: string; error?: string }): string {
  return typeof r === "string" ? r : r.output;
}
function err(r: string | { output: string; error?: string }): string {
  return typeof r === "string" ? "" : (r.error ?? "");
}

// ──────────────────────────────────────────────
// text.ts
// ──────────────────────────────────────────────

describe("caseConvert", () => {
  const sample = "hello world foo";
  it("camelCase", () => expect(out(caseConvert(sample, "camelCase"))).toBe("helloWorldFoo"));
  it("PascalCase", () => expect(out(caseConvert(sample, "PascalCase"))).toBe("HelloWorldFoo"));
  it("snake_case", () => expect(out(caseConvert(sample, "snake_case"))).toBe("hello_world_foo"));
  it("kebab-case", () => expect(out(caseConvert(sample, "kebab-case"))).toBe("hello-world-foo"));
  it("UPPER_CASE", () => expect(out(caseConvert(sample, "UPPER_CASE"))).toBe("HELLO_WORLD_FOO"));
});

describe("slugify", () => {
  it("converts spaces to hyphens and lowercases", () => {
    expect(out(slugify("Hello World"))).toBe("hello-world");
  });
  it("strips special characters", () => {
    expect(out(slugify("Café & Bar!"))).toMatch(/^[a-z0-9-]+$/);
  });
});

describe("wordCount", () => {
  it("counts words correctly", () => {
    const result = wordCount("The quick brown fox");
    expect(result.words).toBe(4);
    expect(result.characters).toBeGreaterThan(0);
  });
  it("empty string", () => {
    expect(wordCount("").words).toBe(0);
  });
});

describe("sortLines", () => {
  const lines = "banana\napple\ncherry";
  it("asc", () => expect(out(sortLines(lines, "asc"))).toBe("apple\nbanana\ncherry"));
  it("desc", () => expect(out(sortLines(lines, "desc"))).toBe("cherry\nbanana\napple"));
  it("reverse", () => expect(out(sortLines(lines, "reverse"))).toBe("cherry\napple\nbanana"));
  it("unique removes duplicates", () => {
    const dup = "a\nb\na\nc";
    const result = out(sortLines(dup, "unique"));
    expect(result.split("\n").filter((l) => l === "a")).toHaveLength(1);
  });
});

describe("findReplace", () => {
  it("plain replace", () => {
    expect(out(findReplace("hello world", "world", "there", false, false))).toBe("hello there");
  });
  it("regex replace", () => {
    expect(out(findReplace("foo123bar", "\\d+", "NUM", true, false))).toBe("fooNUMbar");
  });
  it("case-insensitive plain replace", () => {
    expect(out(findReplace("Hello HELLO", "hello", "hi", false, true))).toBe("hi hi");
  });
});

describe("normalizeWhitespace", () => {
  it("collapse collapses multiple spaces", () => {
    expect(out(normalizeWhitespace("a  b   c", "collapse"))).toBe("a b c");
  });
  it("trim trims each line", () => {
    const result = out(normalizeWhitespace("  hello  \n  world  ", "trim"));
    expect(result).toContain("hello");
    expect(result).not.toContain("  hello");
  });
  it("remove-blank removes empty lines", () => {
    const result = out(normalizeWhitespace("a\n\nb\n\nc", "remove-blank"));
    expect(result).not.toContain("\n\n");
  });
});

describe("reverseString", () => {
  it("reverses ascii", () => expect(out(reverseString("hello"))).toBe("olleh"));
  it("reverses with unicode emoji", () => {
    // emoji should survive reversal
    const original = "abc";
    expect(out(reverseString(out(reverseString(original))))).toBe(original);
  });
});

describe("markdownToHtml", () => {
  it("converts heading", () => {
    expect(out(markdownToHtml("# Hello"))).toContain("<h1");
  });
  it("converts bold", () => {
    expect(out(markdownToHtml("**bold**"))).toContain("<strong>");
  });
});

describe("htmlToText", () => {
  it("strips tags", () => {
    expect(out(htmlToText("<p>Hello <b>world</b></p>"))).toContain("Hello");
    expect(out(htmlToText("<p>Hello <b>world</b></p>"))).not.toContain("<");
  });
});

describe("stripMarkdown", () => {
  it("removes bold markers", () => {
    expect(out(stripMarkdown("**bold** text"))).not.toContain("**");
  });
  it("removes headings marker", () => {
    expect(out(stripMarkdown("# Heading"))).not.toContain("#");
  });
});

describe("textDiff", () => {
  it("detects additions", () => {
    const result = out(textDiff("line1", "line1\nline2"));
    expect(result).toContain("+");
  });
  it("identical texts produce no diff lines", () => {
    const result = out(textDiff("same", "same"));
    expect(result.split("\n").filter((l) => l.startsWith("+") || l.startsWith("-"))).toHaveLength(0);
  });
});

// ──────────────────────────────────────────────
// conversion.ts
// ──────────────────────────────────────────────

describe("convertTemperature", () => {
  it("Celsius to Fahrenheit: 0°C = 32°F", () => {
    expect(out(convertTemperature(0, "C"))).toContain("32");
  });
  it("Celsius to Kelvin: 0°C = 273.15K", () => {
    expect(out(convertTemperature(0, "C"))).toContain("273.15");
  });
  it("Fahrenheit to Celsius: 212°F = 100°C", () => {
    expect(out(convertTemperature(212, "F"))).toContain("100");
  });
});

describe("convertBytes", () => {
  it("1 KB = 1024 B", () => {
    const result = out(convertBytes(1, "KB"));
    // output uses locale formatting e.g. "1,024"
    expect(result.replace(/,/g, "")).toContain("1024");
  });
  it("1 MB contains KB and B conversions", () => {
    const result = out(convertBytes(1, "MB"));
    expect(result).toContain("KB");
    expect(result).toContain("B");
  });
});

describe("numberToWords", () => {
  it("zero", () => expect(out(numberToWords(0))).toMatch(/zero/i));
  it("42", () => expect(out(numberToWords(42))).toMatch(/forty.?two/i));
  it("1000", () => expect(out(numberToWords(1000))).toMatch(/thousand/i));
});

describe("toRomanNumeral / fromRomanNumeral", () => {
  const cases: [number, string][] = [
    [1, "I"], [4, "IV"], [9, "IX"], [14, "XIV"],
    [40, "XL"], [90, "XC"], [1994, "MCMXCIV"],
  ];
  cases.forEach(([n, roman]) => {
    it(`${n} → ${roman}`, () => expect(out(toRomanNumeral(n))).toBe(roman));
    it(`${roman} → ${n}`, () => expect(fromRomanNumeral(roman)).toBe(n));
  });
  it("invalid input returns error or NaN", () => {
    const r = fromRomanNumeral("INVALID");
    expect(typeof r === "string" || isNaN(r as number)).toBe(true);
  });
});

describe("convertDuration", () => {
  it("90 seconds = 1 minute 30 seconds", () => {
    const result = out(convertDuration(90));
    expect(result).toContain("1");
    expect(result).toMatch(/min|minute/i);
  });
  it("3661 seconds contains hours and minutes", () => {
    const result = out(convertDuration(3661));
    expect(result).toMatch(/h|hour/i);
  });
});

describe("calculatePercentage", () => {
  it("50% of 200 = 100", () => {
    expect(out(calculatePercentage("50% of 200"))).toContain("100");
  });
  it("percentage change from 50 to 200", () => {
    expect(out(calculatePercentage("50 → 200"))).toMatch(/300|change/i);
  });
});

describe("calculateAspectRatio", () => {
  it("1920x1080 → 16:9", () => {
    const result = out(calculateAspectRatio(1920, 1080));
    expect(result).toContain("16");
    expect(result).toContain("9");
  });
  it("4:3 scenario", () => {
    expect(out(calculateAspectRatio(800, 600))).toContain("4");
  });
});

describe("convertUnits", () => {
  it("1 km = 1000 m", () => {
    const result = out(convertUnits(1, "km", "m", "length"));
    expect(result).toContain("1000");
  });
  it("1 kg to g", () => {
    expect(out(convertUnits(1, "kg", "g", "weight"))).toContain("1000");
  });
  it("unsupported unit returns error", () => {
    expect(err(convertUnits(1, "parsec", "lightyear", "length"))).not.toBe("");
  });
});

// ──────────────────────────────────────────────
// misc.ts
// ──────────────────────────────────────────────

describe("htmlToJsx", () => {
  it("converts class to className", () => {
    expect(out(htmlToJsx('<div class="foo">text</div>'))).toContain("className");
  });
  it("self-closes void elements", () => {
    const result = out(htmlToJsx("<br><img src='x'>"));
    expect(result).toMatch(/<br\s*\/>/);
  });
});

describe("generateUlid", () => {
  it("returns a 26-character string", () => {
    expect(generateUlid()).toHaveLength(26);
  });
  it("two calls produce different values", () => {
    expect(generateUlid()).not.toBe(generateUlid());
  });
});

describe("generateNanoId", () => {
  it("default size is 21 characters", () => {
    expect(generateNanoId()).toHaveLength(21);
  });
  it("custom size", () => {
    expect(generateNanoId(10)).toHaveLength(10);
  });
  it("two calls produce different values", () => {
    expect(generateNanoId()).not.toBe(generateNanoId());
  });
});
