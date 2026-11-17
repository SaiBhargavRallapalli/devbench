import type { Metadata } from "next";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";

const title = "Affiliate Disclosure";
const description =
  "DevBench affiliate disclosure - how affiliate links work on this site, that DevBench may earn a commission at no extra cost to you, and how recommendations stay editorial.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/disclosure` },
  ...socialMetadata({ title, description, canonicalPath: "/disclosure" }),
};

export default function DisclosureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Affiliate Disclosure", path: "/disclosure" }])} />
      {children}
    </>
  );
}
