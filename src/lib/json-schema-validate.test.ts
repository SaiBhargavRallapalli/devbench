import { describe, expect, it } from "vitest";
import { validateJsonSchema } from "./json-schema-validate";

describe("validateJsonSchema (Ajv)", () => {
  it("passes valid data", () => {
    const errs = validateJsonSchema(
      { name: "Ada", age: 30 },
      {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string" }, age: { type: "integer" } },
      },
    );
    expect(errs).toHaveLength(0);
  });

  it("reports missing required property", () => {
    const errs = validateJsonSchema(
      { age: 1 },
      { type: "object", required: ["name"], properties: { name: { type: "string" } } },
    );
    expect(errs.length).toBeGreaterThan(0);
    expect(errs.some((e) => e.message.includes("required") || e.path.includes("name"))).toBe(true);
  });

  it("reports invalid schema", () => {
    const errs = validateJsonSchema({}, { type: "not-a-real-type" } as object);
    expect(errs[0]?.path).toBe("/");
    expect(errs[0]?.message).toMatch(/invalid/i);
  });
});
