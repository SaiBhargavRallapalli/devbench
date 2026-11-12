import type { Metadata } from "next";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";

const title = "Terms & Conditions";
const description =
  "DevBench terms and conditions — free use, acceptable use, intellectual property, open-source licenses, warranties, and liability.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/terms` },
  ...socialMetadata({ title, description, canonicalPath: "/terms" }),
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Terms", path: "/terms" }])} />
      {children}
    </>
  );
}
