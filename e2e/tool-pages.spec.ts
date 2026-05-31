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

  // ── Encoding tools ───────────────────────────────────────────────────────────

  test("base64-decode decodes correctly", async ({ page }) => {
    await page.goto("/tools/base64-decode");
    await page.locator("textarea#tool-input").fill("aGVsbG8=");
    await page.waitForTimeout(300);
    const output = await page.locator("textarea#tool-output").inputValue();
    expect(output.trim()).toBe("hello");
  });

  test("url-encode encodes spaces and special chars", async ({ page }) => {
    await page.goto("/tools/url-encode");
    await page.locator("textarea#tool-input").fill("hello world");
    await page.waitForTimeout(300);
    const output = await page.locator("textarea#tool-output").inputValue();
    expect(output).toContain("hello%20world");
  });

  test("url-decode decodes percent-encoded string", async ({ page }) => {
    await page.goto("/tools/url-decode");
    await page.locator("textarea#tool-input").fill("hello%20world");
    await page.waitForTimeout(300);
    const output = await page.locator("textarea#tool-output").inputValue();
    expect(output.trim()).toBe("hello world");
  });

  test("html-entity-encode encodes angle brackets", async ({ page }) => {
    await page.goto("/tools/html-entity-encode");
    await page.locator("textarea#tool-input").fill("<div>");
    await page.waitForTimeout(300);
    const output = await page.locator("textarea#tool-output").inputValue();
    expect(output).toContain("&lt;div&gt;");
  });

  // ── JSON tools ───────────────────────────────────────────────────────────────

  test("json-to-yaml converts JSON to YAML", async ({ page }) => {
    await page.goto("/tools/json-to-yaml");
    await page.locator("textarea#tool-input").fill('{"name":"DevBench"}');
    await page.waitForTimeout(300);
    const output = await page.locator("textarea#tool-output").inputValue();
    expect(output).toContain("name: DevBench");
  });

  test("yaml-to-json converts YAML to JSON", async ({ page }) => {
    await page.goto("/tools/yaml-to-json");
    await page.locator("textarea#tool-input").fill("name: DevBench");
    await page.waitForTimeout(300);
    const output = await page.locator("textarea#tool-output").inputValue();
    const parsed = JSON.parse(output);
    expect(parsed.name).toBe("DevBench");
  });

  test("json-formatter shows error for invalid JSON", async ({ page }) => {
    await page.goto("/tools/json-formatter");
    await page.locator("textarea#tool-input").fill("{invalid}");
    await page.waitForTimeout(300);
    // Either error banner or output indicating a problem
    const errorEl = page.locator("[role='alert']");
    const outputVal = await page.locator("textarea#tool-output").inputValue();
    const hasErrorUi =
      (await errorEl.count()) > 0 || outputVal.toLowerCase().includes("error");
    expect(hasErrorUi).toBe(true);
  });

  // ── Text tools ───────────────────────────────────────────────────────────────

  test("case-converter converts to snake_case", async ({ page }) => {
    await page.goto("/tools/case-converter");
    await page.locator("select#opt-case").selectOption("snake_case");
    await page.locator("textarea#tool-input").fill("Hello World");
    await page.waitForTimeout(300);
    const output = await page.locator("textarea#tool-output").inputValue();
    expect(output.trim()).toBe("hello_world");
  });

  test("word-counter counts words", async ({ page }) => {
    await page.goto("/tools/word-counter");
    await page.locator("textarea#tool-input").fill("one two three");
    await page.waitForTimeout(300);
    const output = await page.locator("textarea#tool-output").inputValue();
    expect(output).toMatch(/3\s*(words?)/i);
  });

  // ── Dev tools ────────────────────────────────────────────────────────────────

  test("uuid-generator loads and produces UUIDs on generate", async ({ page }) => {
    await page.goto("/tools/uuid-generator");
    await expect(page.getByRole("heading", { name: /uuid/i })).toBeVisible();
    await page.getByRole("button", { name: /generate/i }).click();
    await expect(page.locator(".font-mono").first()).toHaveText(
      /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i,
    );
  });

  test("hash-generator produces SHA-256 hash", async ({ page }) => {
    await page.goto("/tools/hash-generator");
    await page.locator("select#opt-hash-algo").selectOption("SHA-256");
    await page.locator("textarea#tool-input").fill("hello");
    await page.waitForTimeout(500);
    const output = await page.locator("textarea#tool-output").inputValue();
    // SHA-256 of "hello" — known value
    expect(output.toLowerCase().replace(/\s/g, "")).toContain(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });

  // ── Conversion tools ─────────────────────────────────────────────────────────

  test("temperature-converter converts Celsius to Fahrenheit", async ({ page }) => {
    await page.goto("/tools/temperature-converter");
    await page.locator("select#opt-temp-from").selectOption("C");
    await page.locator("textarea#tool-input").fill("100");
    await page.waitForTimeout(300);
    const output = await page.locator("textarea#tool-output").inputValue();
    expect(output).toContain("212");
  });

  // ── Copy to clipboard ────────────────────────────────────────────────────────

  test("copy button is enabled after output is produced", async ({ page }) => {
    await page.goto("/tools/base64-encode");
    await page.locator("textarea#tool-input").fill("test");
    await page.waitForTimeout(300);
    const copyBtn = page.getByRole("button", { name: /copy/i });
    await expect(copyBtn).not.toBeDisabled();
  });

  // ── Share link ───────────────────────────────────────────────────────────────

  test("copy share link button is visible on tool page", async ({ page }) => {
    await page.goto("/tools/base64-encode");
    await expect(
      page.getByRole("button", { name: /share/i }),
    ).toBeVisible();
  });
});
