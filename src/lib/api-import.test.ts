import { describe, it, expect } from "vitest";
import { parseCurlCommand, parseHar, parseOpenApi } from "@/lib/api-import";

describe("api-import", () => {
  it("parses cURL", () => {
    const r = parseCurlCommand(
      `curl -X POST "https://api.example.com/v1/items" -H "Content-Type: application/json" -d '{"id":1}'`,
    );
    expect(r.method).toBe("POST");
    expect(r.url).toBe("https://api.example.com/v1/items");
    expect(r.body).toContain("id");
    expect(r.bodyType).toBe("json");
  });

  it("parses HAR", () => {
    const har = {
      log: {
        entries: [
          {
            request: {
              method: "GET",
              url: "https://httpbin.org/get",
              headers: [{ name: "Accept", value: "application/json" }],
            },
          },
        ],
      },
    };
    const list = parseHar(JSON.stringify(har));
    expect(list).toHaveLength(1);
    expect(list[0].method).toBe("GET");
  });

  it("parses OpenAPI", () => {
    const spec = {
      openapi: "3.0.0",
      servers: [{ url: "https://api.example.com" }],
      paths: {
        "/pets": {
          get: { summary: "List pets" },
          post: { summary: "Create pet" },
        },
      },
    };
    const list = parseOpenApi(JSON.stringify(spec));
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list.some((r) => r.method === "GET")).toBe(true);
  });
});
