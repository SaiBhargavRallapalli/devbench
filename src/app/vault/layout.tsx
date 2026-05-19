import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Project Vault — Local Drafts",
  description:
    "Save tool drafts in your browser with IndexedDB. Export and import .devbench.json bundles. No account, data stays on your device.",
};

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
