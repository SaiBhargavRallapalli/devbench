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
    // Desktop packaging build artifacts (gitignored). `npm run build:desktop`
    // emits a standalone Next server under here; linting its bundled output
    // produced 800+ false-positive errors and made `npm run lint` fail locally.
    "packaging/desktop/resources/server/**",
    "packaging/desktop/dist/**",
  ]),
  {
    rules: {
      // Content-heavy site: apostrophes and quotes in copy are expected.
      // Enforcing &apos; / &quot; everywhere creates noisy, unreadable JSX.
      "react/no-unescaped-entities": "warn",
      // Standard TS convention: prefix unused-but-required params/vars with _.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
