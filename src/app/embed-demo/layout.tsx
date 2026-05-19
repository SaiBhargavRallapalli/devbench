import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Embed API Demo",
  description: "Live demo of the DevBench embed postMessage API for controlling tool iframes.",
};

export default function EmbedDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
