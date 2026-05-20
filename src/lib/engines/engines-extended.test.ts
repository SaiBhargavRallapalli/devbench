// Copyright (c) 2026 DevBench contributors. MIT License.
import { describe, it, expect } from "vitest";

// dev.ts
import {
  parseCron,
  curlToFetch,
  compareSemverVersions,
  chmodCalculator,
  parseDotenv,
  generatePassword,
  escapeString,
  convertBase,
  mimeLookup,
} from "@/lib/engines/dev";

// json.ts
import {
  jsonToYaml,
  yamlToJson,
  jsonToCsv,
  csvToJson,
  jsonToTsv,
  tsvToJson,
  jsonToTypescript,
  jsonToXml,
  xmlToJson,
  tomlToJson,
} from "@/lib/engines/json";

function out(r: string | { output: string; error?: string }): string {
  return typeof r === "string" ? r : r.output;
}
function err(r: string | { output: string; error?: string }): string {
  return typeof r === "string" ? "" : (r.error ?? "");
}

// ──────────────────────────────────────────────
// dev.ts
// ──────────────────────────────────────────────

describe("parseCron", () => {
  it("every minute", () => {
    expect(out(parseCron("* * * * *"))).toContain("minute");
  });
  it("daily at midnight", () => {
    const result = out(parseCron("0 0 * * *"));
    expect(result.toLowerCase()).toMatch(/midnight|00:00|day/);
  });
  it("invalid expression returns error", () => {
    expect(err(parseCron("not-a-cron"))).not.toBe("");
  });
});

describe("curlToFetch", () => {
  it("simple GET", () => {
    const result = out(curlToFetch("curl https://example.com"));
    expect(result).toContain("fetch(");
    expect(result).toContain("example.com");
  });
  it("POST with header and body", () => {
    const result = out(
      curlToFetch(
        `curl -X POST https://api.example.com/data -H "Content-Type: application/json" -d '{"key":"value"}'`,
      ),
    );
    expect(result).toContain("POST");
    expect(result).toContain("Content-Type");
  });
  it("empty input returns error", () => {
    expect(err(curlToFetch(""))).not.toBe("");
  });
});

describe("compareSemverVersions", () => {
  it("newer version", () => {
    const result = out(compareSemverVersions("1.2.0", "1.1.0"));
    expect(result).toContain("1.2.0");
  });
  it("same versions", () => {
    const result = out(compareSemverVersions("2.0.0", "2.0.0"));
    expect(result.toLowerCase()).toContain("equal");
  });
  it("invalid semver returns error", () => {
    expect(err(compareSemverVersions("not-semver", "1.0.0"))).not.toBe("");
  });
});

describe("chmodCalculator", () => {
  it("octal 755 to symbolic", () => {
    const result = out(chmodCalculator("755"));
    expect(result).toContain("rwxr-xr-x");
  });
  it("symbolic to octal", () => {
    const result = out(chmodCalculator("rwxr-xr-x"));
    expect(result).toContain("755");
  });
  it("octal 644", () => {
    expect(out(chmodCalculator("644"))).toContain("rw-r--r--");
  });
});

describe("parseDotenv", () => {
  // Output format: "Keys parsed: N\n\nJSON:\n{...}"
  function extractJson(result: string): Record<string, string> {
    const jsonPart = result.slice(result.indexOf("JSON:\n") + 6);
    return JSON.parse(jsonPart) as Record<string, string>;
  }
  it("parses basic key=value pairs", () => {
    const parsed = extractJson(out(parseDotenv("FOO=bar\nBAZ=qux")));
    expect(parsed["FOO"]).toBe("bar");
    expect(parsed["BAZ"]).toBe("qux");
  });
  it("ignores comments", () => {
    const result = out(parseDotenv("# comment\nKEY=value"));
    const parsed = extractJson(result);
    expect(parsed["KEY"]).toBe("value");
    expect(Object.keys(parsed)).not.toContain("# comment");
  });
  it("detects duplicate keys", () => {
    const result = out(parseDotenv("KEY=first\nKEY=second"));
    expect(result.toLowerCase()).toContain("duplicate");
  });
});

describe("generatePassword", () => {
  it("generates at requested length", () => {
    const result = out(generatePassword(20, { uppercase: true, lowercase: true, digits: true, symbols: false }));
    expect(result.length).toBe(20);
  });
  it("only digits", () => {
    const result = out(generatePassword(10, { uppercase: false, lowercase: false, digits: true, symbols: false }));
    expect(result).toMatch(/^\d{10}$/);
  });
  it("no character classes selected returns error", () => {
    expect(err(generatePassword(10, { uppercase: false, lowercase: false, digits: false, symbols: false }))).not.toBe("");
  });
});

describe("escapeString", () => {
  it("json mode escapes double quotes", () => {
    const result = out(escapeString(`He said "hello"`, "json"));
    expect(result).toContain('\\"');
  });
  it("regex mode escapes dots and stars", () => {
    const result = out(escapeString("1.2.*", "regex"));
    expect(result).toContain("\\.");
    expect(result).toContain("\\*");
  });
});

describe("convertBase", () => {
  it("decimal to hex", () => {
    expect(out(convertBase("255", 10, 16))).toMatch(/ff/i);
  });
  it("binary to decimal", () => {
    expect(out(convertBase("1010", 2, 10))).toContain("10");
  });
  it("invalid input returns error", () => {
    expect(err(convertBase("xyz", 10, 16))).not.toBe("");
  });
});

describe("mimeLookup", () => {
  it("pdf extension", () => {
    expect(out(mimeLookup(".pdf"))).toContain("application/pdf");
  });
  it("json extension", () => {
    expect(out(mimeLookup("json"))).toContain("application/json");
  });
});

// ──────────────────────────────────────────────
// json.ts
// ──────────────────────────────────────────────

const SIMPLE_JSON = '{"name":"Alice","age":30,"active":true}';
const JSON_ARRAY = '[{"id":1,"val":"a"},{"id":2,"val":"b"}]';

describe("JSON ↔ YAML round-trip", () => {
  it("encodes and decodes back to same structure", () => {
    const yaml = out(jsonToYaml(SIMPLE_JSON));
    expect(yaml).toContain("name:");
    const json = out(yamlToJson(yaml));
    expect(JSON.parse(json)).toEqual(JSON.parse(SIMPLE_JSON));
  });
  it("invalid JSON returns error", () => {
    expect(err(jsonToYaml("{bad json}"))).not.toBe("");
  });
  it("invalid YAML returns error", () => {
    expect(err(yamlToJson("key: [\nbad"))).not.toBe("");
  });
});

describe("JSON ↔ CSV round-trip", () => {
  it("encodes array to csv", () => {
    const csv = out(jsonToCsv(JSON_ARRAY));
    expect(csv).toContain("id");
    expect(csv).toContain("val");
  });
  it("csv decodes back to original rows", () => {
    const csv = out(jsonToCsv(JSON_ARRAY));
    const back = JSON.parse(out(csvToJson(csv))) as { id: string; val: string }[];
    expect(back).toHaveLength(2);
    expect(back[0].val).toBe("a");
  });
  it("non-array JSON returns error", () => {
    expect(err(jsonToCsv(SIMPLE_JSON))).not.toBe("");
  });
});

describe("JSON ↔ TSV round-trip", () => {
  it("encodes array to tsv", () => {
    const tsv = out(jsonToTsv(JSON_ARRAY));
    expect(tsv).toContain("\t");
    expect(tsv).toContain("id");
  });
  it("tsv decodes back to original rows", () => {
    const tsv = out(jsonToTsv(JSON_ARRAY));
    const back = JSON.parse(out(tsvToJson(tsv))) as { id: string; val: string }[];
    expect(back).toHaveLength(2);
    expect(back[1].val).toBe("b");
  });
});

describe("jsonToTypescript", () => {
  it("generates interface with correct field names", () => {
    const result = out(jsonToTypescript(SIMPLE_JSON));
    expect(result).toContain("name");
    expect(result).toContain("age");
    expect(result).toContain("active");
  });
  it("invalid JSON returns error", () => {
    expect(err(jsonToTypescript("{"))).not.toBe("");
  });
});

describe("JSON ↔ XML round-trip", () => {
  it("produces xml tags", () => {
    const xml = out(jsonToXml(SIMPLE_JSON));
    expect(xml).toContain("<");
    expect(xml).toContain(">");
  });
  it("xml decodes back to parseable JSON", () => {
    const xml = out(jsonToXml('{"root":{"item":1}}'));
    const back = out(xmlToJson(xml));
    expect(back).toBeTruthy();
    expect(() => JSON.parse(back)).not.toThrow();
  });
});

describe("tomlToJson", () => {
  it("parses basic TOML", () => {
    const toml = `title = "Test"\n[author]\nname = "Alice"`;
    const result = out(tomlToJson(toml));
    const parsed = JSON.parse(result) as { title: string; author: { name: string } };
    expect(parsed.title).toBe("Test");
    expect(parsed.author.name).toBe("Alice");
  });
  it("gracefully handles malformed TOML", () => {
    // The TOML library returns {} rather than throwing on parse failure
    const result = out(tomlToJson("[[[abc"));
    expect(() => JSON.parse(result)).not.toThrow();
  });
});
