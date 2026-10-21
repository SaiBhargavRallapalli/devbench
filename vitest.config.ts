import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    // Include .tsx tests too — previously only *.test.ts was collected, so
    // component tests were silently ignored (0 of 60+ tool components tested).
    include: ["src/**/*.test.{ts,tsx}"],
    passWithNoTests: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/lib/**/*.ts", "src/components/**/*.{ts,tsx}"],
      exclude: [
        "src/lib/**/*.test.ts",
        "src/lib/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
        // Route/page shells stay out of coverage scope.
        "src/app/**",
      ],
      thresholds: {
        lines: 40,
        functions: 40,
        branches: 35,
        statements: 40,
      },
    },
  },
});
