import { describe, expect, it } from "vitest";
import {
  formatJson,
  minifyJson,
  jsonToYaml,
  yamlToJson,
  jsonToCsv,
  csvToJson,
} from "./json";

function str(r: unknown): string {
  if (typeof r === "string") return r;
  if (r && typeof r === "object" && "output" in r) return (r as { output: string }).output;
  return String(r);
}
function err(r: unknown): string | undefined {
  if (r && typeof r === "object" && "error" in r) return (r as { error: string }).error;
  return undefined;
}

describe("formatJson", () => {
  it("pretty-prints compact JSON", () => {
    const result = str(formatJson('{"a":1,"b":2}'));
    expect(result).toContain("\n");
    expect(result).toContain('"a": 1');
  });

  it("returns error for invalid JSON", () => {
    expect(err(formatJson("{invalid}"))).toMatch(/invalid json/i);
  });

  it("handles arrays", () => {
    expect(str(formatJson("[1,2,3]"))).toContain("\n");
  });

  it("handles empty object", () => {
    expect(str(formatJson("{}"))).toBe("{}");
  });
});

describe("minifyJson", () => {
  it("removes whitespace from pretty JSON", () => {
    const result = str(minifyJson('{\n  "a": 1\n}'));
    expect(result).not.toContain("\n");
    expect(result).toBe('{"a":1}');
  });

  it("returns error for invalid JSON", () => {
    expect(err(minifyJson("{invalid}"))).toMatch(/invalid json/i);
  });
});

describe("jsonToYaml", () => {
  it("converts flat JSON to YAML", () => {
    const result = str(jsonToYaml('{"name":"DevBench","version":1}'));
    expect(result).toContain("name: DevBench");
    expect(result).toContain("version: 1");
  });

  it("converts nested JSON to YAML", () => {
    const result = str(jsonToYaml('{"a":{"b":1}}'));
    expect(result).toContain("a:");
    expect(result).toContain("b: 1");
  });

  it("returns error for invalid JSON input", () => {
    expect(err(jsonToYaml("{invalid}"))).toMatch(/invalid json/i);
  });
});

describe("yamlToJson", () => {
  it("converts YAML to JSON", () => {
    const result = str(yamlToJson("name: DevBench\nversion: 1"));
    const parsed = JSON.parse(result);
    expect(parsed.name).toBe("DevBench");
    expect(parsed.version).toBe(1);
  });

  it("round-trips JSON→YAML→JSON", () => {
    const original = '{"x":1,"y":[1,2,3]}';
    const yaml = str(jsonToYaml(original));
    const backToJson = str(yamlToJson(yaml));
    expect(JSON.parse(backToJson)).toEqual(JSON.parse(original));
  });

  it("returns error for invalid YAML", () => {
    expect(err(yamlToJson("key: [unclosed"))).toMatch(/invalid yaml/i);
  });
});

describe("jsonToCsv", () => {
  it("converts JSON array to CSV", () => {
    const json = '[{"name":"Alice","age":30},{"name":"Bob","age":25}]';
    const result = str(jsonToCsv(json));
    const lines = result.split("\n");
    expect(lines).toHaveLength(3); // header + 2 data rows
    expect(lines[0]).toContain("name");
    expect(lines[0]).toContain("age");
    expect(lines[1]).toContain("Alice");
  });

  it("returns error when input is not an array", () => {
    expect(err(jsonToCsv('{"a":1}'))).toMatch(/array/i);
  });

  it("handles empty array", () => {
    expect(str(jsonToCsv("[]"))).toBe("");
  });

  it("escapes double quotes in values", () => {
    const json = '[{"name":"Say \\"hi\\""}]';
    const result = str(jsonToCsv(json));
    expect(result).toContain('""');
  });
});

describe("csvToJson", () => {
  it("converts CSV to JSON array", () => {
    const csv = "name,age\nAlice,30\nBob,25";
    const result = JSON.parse(str(csvToJson(csv)));
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Alice");
    expect(result[0].age).toBe("30");
  });

  it("returns error for header-only CSV", () => {
    expect(err(csvToJson("name,age"))).toMatch(/header|data/i);
  });

  it("round-trips CSV → JSON → CSV", () => {
    const original = "a,b\n1,2\n3,4";
    const asJson = str(csvToJson(original));
    const back = str(jsonToCsv(asJson));
    // Header order may differ; just check the data is intact
    expect(back).toContain("1");
    expect(back).toContain("2");
  });
});
