import { type Page, expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Pages that are primarily static/SSR — highest value a11y targets.
const STATIC_PAGES = ["/", "/blog", "/about", "/privacy"];

// Tool pages: generic I/O tools that render the full textarea UI.
const TOOL_PAGES = [
  "/tools/base64-encode",
  "/tools/json-formatter",
  "/tools/hash-generator",
  "/tools/case-converter",
  "/tools/url-encode",
];

// Workspace / custom-UI pages.
const WORKSPACE_PAGES = ["/json", "/pdf"];

function makeAxe(page: Page) {
  return new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .exclude("[data-testid='monaco-editor']") // Monaco has its own a11y story
    .exclude(".mermaid"); // Mermaid SVG output — third-party
}

test.describe("accessibility — static pages", () => {
  for (const url of STATIC_PAGES) {
    test(`${url} has no critical a11y violations`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      const results = await makeAxe(page).analyze();
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Found ${critical.length} critical/serious violations on ${url}:\n` +
          critical.map((v) => `  [${v.impact}] ${v.id}: ${v.description}`).join("\n"),
      ).toHaveLength(0);
    });
  }
});

test.describe("accessibility — tool pages", () => {
  for (const url of TOOL_PAGES) {
    test(`${url} has no critical a11y violations`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      const results = await makeAxe(page).analyze();
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Found ${critical.length} critical/serious violations on ${url}:\n` +
          critical.map((v) => `  [${v.impact}] ${v.id}: ${v.description}`).join("\n"),
      ).toHaveLength(0);
    });
  }
});

test.describe("accessibility — workspace pages", () => {
  for (const url of WORKSPACE_PAGES) {
    test(`${url} has no critical a11y violations`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      const results = await makeAxe(page).analyze();
      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(
        critical,
        `Found ${critical.length} critical/serious violations on ${url}:\n` +
          critical.map((v) => `  [${v.impact}] ${v.id}: ${v.description}`).join("\n"),
      ).toHaveLength(0);
    });
  }
});

test.describe("accessibility — keyboard navigation", () => {
  test("home page skip link is visible on focus", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: /skip/i });
    await expect(skipLink).toBeVisible();
  });

  test("tool page input is reachable by keyboard", async ({ page }) => {
    await page.goto("/tools/base64-encode");
    await page.waitForLoadState("networkidle");
    const input = page.locator("textarea#tool-input");
    await input.focus();
    await expect(input).toBeFocused();
  });

  test("command palette opens with keyboard shortcut", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("Meta+k");
    // Allow render time for lazy-loaded palette
    await page.waitForTimeout(400);
    const palette = page.getByRole("dialog").or(
      page.getByPlaceholder(/search/i),
    );
    await expect(palette.first()).toBeVisible();
  });
});
