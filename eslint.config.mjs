import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored minified third-party files — not our code.
    "public/pdfjs/**",
  ]),
  {
    rules: {
      // Content-heavy site: apostrophes and quotes in copy are expected.
      // Enforcing &apos; / &quot; everywhere creates noisy, unreadable JSX.
      "react/no-unescaped-entities": "warn",
    },
  },
]);

export default eslintConfig;
