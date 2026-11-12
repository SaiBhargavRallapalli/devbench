import type { MetadataRoute } from "next";

/**
 * PWA manifest — served at /manifest.webmanifest.
 *
 * Drives "Add to Home Screen" UX on mobile, plus app-like display on Chrome
 * desktop. Icons: rasterized PNGs (icon-192/icon-512, generated from the
 * artwork in `src/app/icon.svg`) for universal support, plus the SVG itself
 * (auto-served at `/icon.svg`) for browsers that prefer it.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DevBench — Free Online Developer Tools",
    short_name: "DevBench",
    description:
      "Free online developer tools — JSON formatter, Base64 encoder, regex tester, JWT debugger, UUID generator & more. No login or signup; runs in your browser.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    theme_color: "#4f46e5",
    background_color: "#fafafa",
    lang: "en",
    dir: "ltr",
    categories: ["productivity", "utilities", "developer"],
    // PNG first (universal support — incl. install prompts that skip SVG),
    // then the crisp SVG for browsers that take it.
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    // Highlight the most-used tools as app shortcuts (long-press on icon → menu).
    // Each shortcut deep-links straight into a workspace.
    shortcuts: [
      {
        name: "JSON Toolkit",
        short_name: "JSON",
        description: "Format, validate, and convert JSON",
        url: "/json",
      },
      {
        name: "JWT Debugger",
        short_name: "JWT",
        description: "Decode and verify JSON Web Tokens",
        url: "/jwt-debugger",
      },
      {
        name: "API Tester",
        short_name: "API",
        description: "Send HTTP requests and inspect responses",
        url: "/api-tester",
      },
      {
        name: "Diff Checker",
        short_name: "Diff",
        description: "Compare two pieces of text side by side",
        url: "/diff-checker",
      },
      {
        name: "Tool Pipelines",
        short_name: "Flow",
        description: "Chain tools in one client-side pipeline",
        url: "/workflows",
      },
      {
        name: "Project Vault",
        short_name: "Vault",
        description: "Local drafts and backup bundles",
        url: "/vault",
      },
      {
        name: "Code Playground",
        short_name: "Play",
        description: "JS, TS, Python, Go sandbox",
        url: "/playground",
      },
    ],
  };
}
