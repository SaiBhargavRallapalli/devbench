import { describe, expect, it } from "vitest";
import { queryJsonPath } from "./json-path-query";

describe("queryJsonPath", () => {
  const data = {
    store: {
      book: [
        { title: "A", price: 8.95 },
        { title: "B", price: 12.99 },
      ],
    },
    responses: [{ type: "text" }, { type: "info" }],
  };

  it("selects nested field", () => {
    const r = queryJsonPath(data, "$.responses[0].type");
    expect(r.error).toBeUndefined();
    expect(r.matches).toEqual(["text"]);
  });

  it("returns error for invalid path prefix", () => {
    const r = queryJsonPath(data, "store.book");
    expect(r.error).toContain("$");
  });
});
