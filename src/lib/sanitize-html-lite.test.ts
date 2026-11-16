// @vitest-environment node
import { describe, expect, it } from "vitest";
import { sanitizeHtmlLite, sanitizeSvgLite } from "./sanitize-html-lite";

describe("sanitizeHtmlLite", () => {
  it("strips script tags", () => {
    const html = sanitizeHtmlLite('<p>ok</p><script>alert(1)</script>');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert");
    expect(html).toContain("<p>ok</p>");
  });

  it("strips event handlers", () => {
    const html = sanitizeHtmlLite('<img src="https://example.com/a.png" onerror="alert(1)">');
    expect(html).not.toContain("onerror");
    expect(html).toContain("example.com");
  });

  it("neutralizes javascript: hrefs", () => {
    expect(sanitizeHtmlLite('<a href="javascript:alert(1)">x</a>')).not.toContain("javascript:");
  });
});

describe("sanitizeSvgLite", () => {
  it("strips script from SVG", () => {
    const svg = sanitizeSvgLite(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><circle cx="1" cy="1" r="1"/></svg>',
    );
    expect(svg).not.toContain("<script");
    expect(svg).toContain("circle");
  });
});

describe("sanitizeHtmlLite hardening", () => {
  it("defeats tag reassembly across passes", () => {
    const html = sanitizeHtmlLite("<scri<script>pt>alert(1)</scri</script>pt>");
    expect(html.toLowerCase()).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
  });

  it("strips lone unclosed script tags", () => {
    const html = sanitizeHtmlLite('<script src="https://evil.example/x.js">');
    expect(html.toLowerCase()).not.toContain("<script");
  });

  it("removes dangerous container tags", () => {
    for (const tag of ["iframe", "object", "embed", "base", "meta", "link", "form"]) {
      const html = sanitizeHtmlLite(`<${tag} src="https://evil.example" href="https://evil.example">x</${tag}>`);
      expect(html.toLowerCase()).not.toContain(`<${tag}`);
    }
  });

  it("neutralizes whitespace-obfuscated javascript: schemes", () => {
    const html = sanitizeHtmlLite('<a href="java\tscript:alert(1)">x</a>');
    expect(html).not.toContain("alert(1)");
  });

  it("keeps benign links and images", () => {
    const html = sanitizeHtmlLite(
      '<a href="https://example.com">ok</a><img src="data:image/png;base64,AAAA">',
    );
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("data:image/png");
  });
});
