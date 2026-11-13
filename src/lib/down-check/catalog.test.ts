import { describe, expect, it } from "vitest";
import {
  DOWN_CHECK_CATEGORIES,
  DOWN_CHECK_HOSTS,
  DOWN_CHECK_SERVICES,
  faviconUrl,
  serviceByHost,
} from "./catalog";

// Bare lowercase hostname: labels joined by dots, no scheme, path, port or
// trailing slash — the API concatenates `https://${host}/` directly.
const HOST_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
const CATEGORY_IDS = new Set(DOWN_CHECK_CATEGORIES.map((c) => c.id));

describe("down-check catalog", () => {
  it("declares at least 80 services across 10 categories", () => {
    expect(DOWN_CHECK_CATEGORIES.length).toBe(10);
    expect(DOWN_CHECK_SERVICES.length).toBeGreaterThanOrEqual(80);
  });

  it("has unique, well-formed service ids", () => {
    const ids = DOWN_CHECK_SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it("has unique hostnames", () => {
    const hosts = DOWN_CHECK_SERVICES.map((s) => s.host);
    expect(new Set(hosts).size).toBe(hosts.length);
  });

  it("hosts are bare hostnames — no scheme, path, port or uppercase", () => {
    for (const s of DOWN_CHECK_SERVICES) {
      expect(s.host, `${s.id}: ${s.host}`).toMatch(HOST_RE);
    }
  });

  it("every service uses a declared category and region", () => {
    for (const s of DOWN_CHECK_SERVICES) {
      expect(CATEGORY_IDS.has(s.category), `${s.id} has unknown category`).toBe(true);
      expect(["IN", "world"]).toContain(s.region);
      expect(s.name.length).toBeGreaterThan(0);
    }
  });

  it("every declared category has at least one service", () => {
    for (const c of DOWN_CHECK_CATEGORIES) {
      const count = DOWN_CHECK_SERVICES.filter((s) => s.category === c.id).length;
      expect(count, `category "${c.id}" is empty`).toBeGreaterThan(0);
    }
  });

  it("covers both Indian and worldwide services", () => {
    const inCount = DOWN_CHECK_SERVICES.filter((s) => s.region === "IN").length;
    const worldCount = DOWN_CHECK_SERVICES.filter((s) => s.region === "world").length;
    expect(inCount).toBeGreaterThanOrEqual(30);
    expect(worldCount).toBeGreaterThanOrEqual(30);
  });

  it("lists Indian services first inside each mixed category", () => {
    // The product promise: the primary audience checks "is Jio/Swiggy down?"
    // first — IN entries must precede world entries within a category.
    for (const c of DOWN_CHECK_CATEGORIES) {
      const regions = DOWN_CHECK_SERVICES.filter((s) => s.category === c.id).map((s) => s.region);
      const firstWorld = regions.indexOf("world");
      const lastIn = regions.lastIndexOf("IN");
      if (firstWorld !== -1 && lastIn !== -1) {
        expect(
          lastIn,
          `category "${c.id}" lists an Indian service after a worldwide one`,
        ).toBeLessThan(firstWorld);
      }
    }
  });

  it("DOWN_CHECK_HOSTS and serviceByHost match the service list exactly", () => {
    expect(DOWN_CHECK_HOSTS.size).toBe(DOWN_CHECK_SERVICES.length);
    expect(serviceByHost.size).toBe(DOWN_CHECK_SERVICES.length);
    for (const s of DOWN_CHECK_SERVICES) {
      expect(DOWN_CHECK_HOSTS.has(s.host)).toBe(true);
      expect(serviceByHost.get(s.host)).toBe(s);
    }
  });

  it("faviconUrl points at DuckDuckGo's icon service for the host", () => {
    expect(faviconUrl("www.jio.com")).toBe("https://icons.duckduckgo.com/ip3/www.jio.com.ico");
  });
});
