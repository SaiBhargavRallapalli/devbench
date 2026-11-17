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
          // Search/referral query-param variants of the homepage —
          // duplicates of / with no unique content (GSC "alternative page").
          // `?category=` is deliberately NOT blocked: tool heroes, the footer
          // and the share bar all link to /?category=x, and the homepage
          // self-canonicalizes to / — blocking a URL we link to hides that
          // canonical from Google (GSC "blocked by robots.txt").
          "/*?q=",
          "/*?ref=",
        ],
      },
    ],
    sitemap: "https://www.devbench.co.in/sitemap.xml",
  };
}
