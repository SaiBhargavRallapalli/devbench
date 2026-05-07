import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YAML Formatter, Validator & Converter | DevBench",
  description:
    "Format and validate YAML with line-level error highlighting. Convert YAML to JSON and JSON to YAML instantly. Supports YAML 1.2, multi-document streams, and anchors.",
  keywords: ["yaml formatter", "yaml validator", "yaml to json", "json to yaml", "online yaml editor", "yaml checker", "yaml lint"],
  alternates: { canonical: "https://devbench.co.in/yaml" },
};

export default function YamlLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
