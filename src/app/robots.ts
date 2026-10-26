import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          // OG-image endpoints (incl. hashed ?query variants) — images referenced
          // by social tags, never indexable pages; blocking saves crawl budget.
          "/*opengraph-image*",
          // Facet/search/referral query-param variants of the homepage —
          // duplicates of / with no unique content (GSC "alternative page").
          "/*?category=",
          "/*?q=",
          "/*?ref=",
        ],
      },
    ],
    sitemap: "https://www.devbench.co.in/sitemap.xml",
  };
}
