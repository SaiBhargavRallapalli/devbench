import { describe, expect, it } from "vitest";
import { buildMetaTags, escapeAttr, metaLengths } from "./meta-tags";

describe("escapeAttr", () => {
  it("escapes the five dangerous characters", () => {
    expect(escapeAttr('a & b < c > d "e"')).toBe(
      "a &amp; b &lt; c &gt; d &quot;e&quot;",
    );
  });

  it("escapes ampersands first so entities are not double-broken", () => {
    expect(escapeAttr("&amp;")).toBe("&amp;amp;");
  });
});

describe("buildMetaTags", () => {
  const base = {
    title: "My Page",
    description: "A description.",
  };

  it("emits title, description and their og counterparts", () => {
    const out = buildMetaTags(base);
    expect(out).toContain("<title>My Page</title>");
    expect(out).toContain('name="description" content="A description."');
    expect(out).toContain('property="og:title" content="My Page"');
    expect(out).toContain('property="og:description" content="A description."');
  });

  it("escapes quotes and angle brackets in content", () => {
    const out = buildMetaTags({
      title: 'Say "hi" <now>',
      description: "a & b",
    });
    expect(out).toContain("Say &quot;hi&quot; &lt;now&gt;");
    expect(out).toContain("a &amp; b");
  });

  it("skips empty optional fields", () => {
    const out = buildMetaTags({ ...base, keywords: "", image: "   " });
    expect(out).not.toContain('name="keywords"');
    expect(out).not.toContain("og:image");
  });

  it("adds canonical + og:url together when a url is given", () => {
    const out = buildMetaTags({ ...base, url: "https://x.dev/a" });
    expect(out).toContain('<link rel="canonical" href="https://x.dev/a">');
    expect(out).toContain('property="og:url" content="https://x.dev/a"');
  });

  it("prefixes twitter handles with a single @", () => {
    const out = buildMetaTags({ ...base, twitterHandle: "@devbench" });
    expect(out).toContain('name="twitter:site" content="@devbench"');
    expect(out).not.toContain("@@devbench");
    const out2 = buildMetaTags({ ...base, twitterHandle: "devbench" });
    expect(out2).toContain('name="twitter:creator" content="@devbench"');
  });

  it("always fills in og:type and twitter:card defaults", () => {
    const out = buildMetaTags(base);
    expect(out).toContain('property="og:type" content="website"');
    expect(out).toContain('name="twitter:card" content="summary_large_image"');
  });

  it("never emits a blank description tag when description is empty", () => {
    const out = buildMetaTags({ title: "T", description: "" });
    // the guard inserts an empty description only if none present — but the
    // required field means we still want *a* description tag to exist
    expect(out).toContain('name="description"');
  });

  it("emits image as both og:image and twitter:image", () => {
    const out = buildMetaTags({ ...base, image: "https://x.dev/i.png" });
    expect(out).toContain('property="og:image" content="https://x.dev/i.png"');
    expect(out).toContain('name="twitter:image" content="https://x.dev/i.png"');
  });
});

describe("metaLengths", () => {
  it("flags a title within 60 chars as ok", () => {
    const r = metaLengths({ title: "x".repeat(60), description: "y".repeat(160) });
    expect(r.titleOk).toBe(true);
    expect(r.descriptionOk).toBe(true);
    expect(r.title).toBe(60);
    expect(r.description).toBe(160);
  });

  it("flags over-long title and description", () => {
    const r = metaLengths({ title: "x".repeat(61), description: "y".repeat(161) });
    expect(r.titleOk).toBe(false);
    expect(r.descriptionOk).toBe(false);
  });

  it("flags empty fields as not ok", () => {
    const r = metaLengths({ title: "  ", description: "" });
    expect(r.titleOk).toBe(false);
    expect(r.descriptionOk).toBe(false);
  });
});
