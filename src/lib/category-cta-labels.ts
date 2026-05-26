// Copyright (c) 2026 DevBench contributors. MIT License.
import type { ToolCategory } from "@/lib/tools-registry";

/** Short benefit line shown on homepage category filter buttons. */
export const CATEGORY_CTA_LABELS: Record<
  ToolCategory,
  { headline: string; benefit: string }
> = {
  json: { headline: "JSON", benefit: "Formatter & Validator" },
  encoding: { headline: "Encoding", benefit: "Base64, URL, Hex" },
  text: { headline: "Text", benefit: "Diff, Regex, Markdown" },
  dev: { headline: "Dev", benefit: "JWT, API, Cron" },
  image: { headline: "Image", benefit: "Resize, Convert, QR" },
  pdf: { headline: "PDF", benefit: "Merge, Split, Compress" },
  conversion: { headline: "Conversion", benefit: "Units & Formats" },
  finance: { headline: "Finance", benefit: "Loan, EMI, Currency" },
  health: { headline: "Health", benefit: "BMI, Calories, Age" },
  math: { headline: "Math", benefit: "Calc, Percent, Prime" },
  datetime: { headline: "Date & time", benefit: "Zones, Epoch, Age" },
};

export function allToolsCategoryLabel(toolCount: number): {
  headline: string;
  benefit: string;
} {
  return {
    headline: "All tools",
    benefit: `Explore ${toolCount}+ tools`,
  };
}
