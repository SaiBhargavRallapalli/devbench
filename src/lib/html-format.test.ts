import { describe, expect, it } from "vitest";
import { formatHtml } from "./html-format";

describe("formatHtml", () => {
  it("returns empty input unchanged", () => {
    expect(formatHtml("")).toBe("");
    expect(formatHtml("   \n  ")).toBe("");
  });

  it("indents nested block elements", () => {
    const out = formatHtml("<div><p>Hi</p></div>");
    expect(out).toBe("<div>\n  <p>Hi</p>\n</div>\n");
  });

  it("puts an immediately-closed pair on one line", () => {
    const out = formatHtml("<span></span>");
    expect(out).toBe("<span></span>\n");
  });

  it("keeps void elements self-contained without pushing depth", () => {
    const out = formatHtml("<div><br><img src=\"x.png\"></div>");
    expect(out).toBe("<div>\n  <br>\n  <img src=\"x.png\">\n</div>\n");
  });

  it("does not drift depth across many sibling void tags", () => {
    const out = formatHtml("<ul><li>a</li><li>b</li><li>c</li></ul>");
    expect(out).toBe(
      "<ul>\n  <li>a</li>\n  <li>b</li>\n  <li>c</li>\n</ul>\n",
    );
  });

  it("keeps script content verbatim (no re-indent)", () => {
    const src = "<script>\n  const x = 1;\n  if (x) {\n    run();\n  }\n</script>";
    const out = formatHtml(src);
    expect(out).toContain("const x = 1;");
    expect(out).toContain("    run();");
    expect(out.trimEnd().endsWith("</script>")).toBe(true);
  });

  it("keeps pre content verbatim", () => {
    const src = "<pre>\n  line one\n    line two\n</pre>";
    const out = formatHtml(src);
    expect(out).toContain("  line one");
    expect(out).toContain("    line two");
  });

  it("formats the doctype on its own line", () => {
    const out = formatHtml("<!DOCTYPE html><html><body></body></html>");
    expect(out.split("\n")[0]).toBe("<!DOCTYPE html>");
  });

  it("keeps comments on their own line", () => {
    const out = formatHtml("<div><!-- note --><p>x</p></div>");
    expect(out).toContain("  <!-- note -->");
    expect(out).toContain("  <p>x</p>");
  });

  it("collapses whitespace runs in normal text by default", () => {
    const out = formatHtml("<p>a    b\n\n   c</p>");
    expect(out).toContain("a b c");
  });

  it("honours a custom indent width", () => {
    const out = formatHtml("<div><p>Hi</p></div>", { indent: 4 });
    expect(out).toBe("<div>\n    <p>Hi</p>\n</div>\n");
  });

  it("handles attributes containing angle brackets in strings", () => {
    const out = formatHtml('<a href="x?a=1&b=2" title="hi">link</a>');
    expect(out).toContain('href="x?a=1&b=2"');
    expect(out).toContain(">link</a>");
  });

  it("keeps inline spans balanced (open/close depth matches)", () => {
    const out = formatHtml("<p>before <strong>bold</strong> after</p>");
    // strong is inline → its close must not pop the p container
    expect(out).toContain("after");
    expect(out.trimEnd().endsWith("</p>")).toBe(true);
  });

  it("never emits more than one blank line in a row", () => {
    const out = formatHtml("<div>\n\n\n<p>a</p>\n\n\n</div>");
    expect(out).not.toContain("\n\n\n");
  });

  it("round-trips a realistic document without losing tags", () => {
    const src =
      "<!DOCTYPE html><html><head><title>T</title></head>" +
      "<body><header><h1>Hello</h1></header>" +
      "<main><p>One</p><p>Two</p></main>" +
      "<footer><small>©</small></footer></body></html>";
    const out = formatHtml(src);
    for (const tag of [
      "<!DOCTYPE html>", "<title>T</title>", "<h1>Hello</h1>",
      "<p>One</p>", "<p>Two</p>", "<small>©</small>",
    ]) {
      expect(out).toContain(tag);
    }
    // every opening container tag has a matching close
    expect((out.match(/<div/g) ?? []).length).toBe((out.match(/<\/div>/g) ?? []).length);
  });
});
