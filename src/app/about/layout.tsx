import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — DevForge",
  description:
    "DevForge is a client-side developer toolkit: JSON, encoding, diff, JWT, API testing, math suite, and more.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
