import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Tool Pipelines — Chain DevBench Tools",
  description:
    "Run multi-step tool pipelines in your browser — JSON to YAML, encode chains, and more. No signup, fully client-side.",
};

export default function WorkflowsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
