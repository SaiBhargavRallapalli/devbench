// Copyright (c) 2026 DevBench contributors. MIT License.

/** Primary header navigation — short visible labels with descriptive names for assistive tech. */
export type HeaderNavLink = {
  href: string;
  /** Compact label shown in the header bar */
  label: string;
  /** Descriptive link purpose (WCAG 2.4.4) */
  ariaLabel: string;
};

export const HEADER_NAV_LINKS: HeaderNavLink[] = [
  { href: "/json", label: "JSON", ariaLabel: "Access JSON Formatter Tool" },
  { href: "/yaml", label: "YAML", ariaLabel: "Access YAML Formatter Tool" },
  { href: "/pdf", label: "PDF", ariaLabel: "Access PDF Tools" },
  { href: "/api-tester", label: "API", ariaLabel: "Access API Tester Tool" },
  { href: "/lambda-sandbox", label: "Lambda", ariaLabel: "Access AWS Lambda Sandbox" },
  { href: "/webhook-simulator", label: "Webhook", ariaLabel: "Access Webhook Simulator" },
  { href: "/jwt-debugger", label: "JWT", ariaLabel: "Access JWT Debugger Tool" },
  { href: "/diff-checker", label: "Diff", ariaLabel: "Access Diff Checker Tool" },
  { href: "/code-beautify", label: "Beautify", ariaLabel: "Access Code Beautifier Tool" },
  { href: "/epoch", label: "Epoch", ariaLabel: "Access Unix Epoch Converter" },
  { href: "/linux-cheatsheet", label: "CLI", ariaLabel: "Access Linux CLI Cheatsheet" },
  { href: "/date-calculator", label: "Date +", ariaLabel: "Access Date Calculator Tool" },
  { href: "/astronomy", label: "Sun/Moon", ariaLabel: "Access Sun and Moon Calculator" },
  { href: "/cron-editor", label: "Cron", ariaLabel: "Access Cron Expression Editor" },
  { href: "/graph-calculator", label: "Math", ariaLabel: "Access Graph Calculator Tool" },
  { href: "/playground", label: "Playground", ariaLabel: "Access Code Playground" },
  { href: "/workflows", label: "Pipelines", ariaLabel: "Access Tool Pipelines" },
  { href: "/vault", label: "Vault", ariaLabel: "Access DevBench Vault" },
  { href: "/blog", label: "Blog", ariaLabel: "Read DevBench developer blog" },
  { href: "/contact", label: "Contact", ariaLabel: "Contact DevBench" },
];
