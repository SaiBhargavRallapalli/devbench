import { describe, expect, it } from "vitest";
import {
  convertTemperature,
  convertBytes,
  numberToWords,
  toRomanNumeral,
  fromRomanNumeral,
} from "./conversion";
import { convertBase } from "./dev";

function str(r: unknown): string {
  if (typeof r === "string") return r;
  if (r && typeof r === "object" && "output" in r) return (r as { output: string }).output;
  return String(r);
}
function err(r: unknown): string | undefined {
  if (r && typeof r === "object" && "error" in r) return (r as { error: string }).error;
  return undefined;
}

describe("convertTemperature", () => {
  it("converts 0°C → 32°F and 273.15 K", () => {
    const result = str(convertTemperature(0, "C"));
    expect(result).toContain("0.00 °C");
    expect(result).toContain("32.00 °F");
    expect(result).toContain("273.15 K");
  });

  it("converts 100°C → 212°F", () => {
    const result = str(convertTemperature(100, "C"));
    expect(result).toContain("212.00 °F");
  });

  it("converts 32°F → 0°C", () => {
    const result = str(convertTemperature(32, "F"));
    expect(result).toContain("0.00 °C");
  });

  it("converts absolute zero (0 K) → -273.15°C", () => {
    const result = str(convertTemperature(0, "K"));
    expect(result).toContain("-273.15 °C");
  });
});

describe("convertBytes", () => {
  it("converts 1024 B → 1 KB", () => {
    const result = str(convertBytes(1024, "B"));
    expect(result).toContain("KB:");
    expect(result).toContain("1");
  });

  it("converts 1 MB", () => {
    const result = str(convertBytes(1, "MB"));
    expect(result).toContain("KB:");
    expect(result).toContain("1,024");
  });

  it("returns error for unknown unit", () => {
    expect(err(convertBytes(1, "ZB"))).toMatch(/unknown/i);
  });
});

describe("numberToWords", () => {
  it("converts zero", () => {
    expect(str(numberToWords(0))).toBe("zero");
  });

  it("converts single digits", () => {
    expect(str(numberToWords(5))).toBe("five");
  });

  it("converts teens", () => {
    expect(str(numberToWords(13))).toBe("thirteen");
  });

  it("converts hundreds", () => {
    expect(str(numberToWords(100))).toBe("one hundred");
  });

  it("converts thousands", () => {
    expect(str(numberToWords(1000))).toContain("thousand");
  });

  it("handles negatives", () => {
    expect(str(numberToWords(-5))).toBe("negative five");
  });
});

describe("toRomanNumeral / fromRomanNumeral", () => {
  it("converts 1 → I", () => {
    expect(str(toRomanNumeral(1))).toBe("I");
  });

  it("converts 4 → IV", () => {
    expect(str(toRomanNumeral(4))).toBe("IV");
  });

  it("converts 2024 → MMXXIV", () => {
    expect(str(toRomanNumeral(2024))).toBe("MMXXIV");
  });

  it("returns error for out-of-range", () => {
    expect(err(toRomanNumeral(0))).toBeTruthy();
    expect(err(toRomanNumeral(4000))).toBeTruthy();
  });

  it("converts XIV → 14", () => {
    expect(fromRomanNumeral("XIV")).toBe(14);
  });

  it("returns error string for invalid Roman numerals", () => {
    expect(typeof fromRomanNumeral("ABC")).toBe("string");
  });
});

describe("convertBase", () => {
  it("converts decimal 255 to hex FF", () => {
    const result = str(convertBase("255", 10, 16));
    expect(result).toContain("Result (base 16): FF");
  });

  it("converts binary 1010 to decimal 10", () => {
    const result = str(convertBase("1010", 2, 10));
    expect(result).toContain("Result (base 10): 10");
  });

  it("converts hex FF to decimal 255", () => {
    const result = str(convertBase("FF", 16, 10));
    expect(result).toContain("Decimal (10): 255");
  });

  it("includes all base representations in output", () => {
    const result = str(convertBase("10", 10, 16));
    expect(result).toContain("Binary (2):");
    expect(result).toContain("Octal (8):");
    expect(result).toContain("Decimal (10):");
    expect(result).toContain("Hex (16):");
  });

  it("returns error for invalid input", () => {
    expect(err(convertBase("ZZZ", 10, 16))).toMatch(/invalid/i);
  });
});
