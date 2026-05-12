import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke — see docs/RUNBOOK.md.
 * Local: `npm run dev` then `npm run test:e2e`
 * CI: set PLAYWRIGHT_BASE_URL to a preview or production URL.
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
