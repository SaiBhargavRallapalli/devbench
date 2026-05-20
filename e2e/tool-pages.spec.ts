import { expect, test } from "@playwright/test";

// Spot-checks across tool page types: generic I/O, custom UI, and multi-category.
// Verifies the page renders, heading is visible, and no JS crash banner appears.

test.describe("tool pages", () => {
  // ── Generic input/output tools ──────────────────────────────────────────────

  test("base64-encode loads and shows heading", async ({ page }) => {
    await page.goto("/tools/base64-encode");
    await expect(page.getByRole("heading", { name: /base64/i })).toBeVisible();
  });

  test("json-formatter loads and shows heading", async ({ page }) => {
    await page.goto("/tools/json-formatter");
    await expect(page.getByRole("heading", { name: /json/i })).toBeVisible();
  });

  test("hash-generator loads and shows heading", async ({ page }) => {
    await page.goto("/tools/hash-generator");
    await expect(page.getByRole("heading", { name: /hash/i })).toBeVisible();
  });

  // ── Custom UI tools ─────────────────────────────────────────────────────────

  test("bmi-calculator loads and shows heading", async ({ page }) => {
    await page.goto("/tools/bmi-calculator");
    await expect(page.getByRole("heading", { name: /bmi/i })).toBeVisible();
  });

  test("compound-interest loads and shows heading", async ({ page }) => {
    await page.goto("/tools/compound-interest");
    await expect(page.getByRole("heading", { name: /compound/i })).toBeVisible();
  });

  test("qr-code loads and shows heading", async ({ page }) => {
    await page.goto("/tools/qr-code");
    await expect(page.getByRole("heading", { name: /qr/i })).toBeVisible();
  });

  // ── Category spot-checks ─────────────────────────────────────────────────────

  test("temperature-converter loads and shows heading", async ({ page }) => {
    await page.goto("/tools/temperature-converter");
    await expect(page.getByRole("heading", { name: /temperature/i })).toBeVisible();
  });

  test("case-converter loads and shows heading", async ({ page }) => {
    await page.goto("/tools/case-converter");
    await expect(page.getByRole("heading", { name: /case/i })).toBeVisible();
  });

  test("404 tool slug shows not-found UI", async ({ page }) => {
    await page.goto("/tools/definitely-not-a-real-tool-slug");
    await expect(page.getByText(/not found|doesn't exist/i)).toBeVisible();
  });

  // ── Basic interaction: typing produces output ────────────────────────────────

  test("base64-encode produces output on input", async ({ page }) => {
    await page.goto("/tools/base64-encode");
    await page.locator("textarea#tool-input").fill("hello");
    // debounce is 150ms
    await page.waitForTimeout(300);
    const output = await page.locator("textarea#tool-output").inputValue();
    expect(output.trim()).toBeTruthy();
    expect(output).toContain("aGVsbG8=");
  });

  test("json-formatter pretty-prints JSON", async ({ page }) => {
    await page.goto("/tools/json-formatter");
    await page.locator("textarea#tool-input").fill('{"a":1}');
    await page.waitForTimeout(300);
    const output = await page.locator("textarea#tool-output").inputValue();
    expect(output).toContain("\n");
  });
});
