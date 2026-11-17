// Copyright (c) 2026 DevBench contributors. MIT License.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BLOG_HOST, PLAYGROUND_HOST, SITE_URL } from "@/lib/site-config";

function requestHost(request: NextRequest): string {
  const raw =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "";
  return raw.split(":")[0].trim().toLowerCase();
}

function isSharedAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.includes("/opengraph-image")
  );
}

/**
 * Subdomain routing: playground.devbench.co.in (legacy; DNS removed) and
 * blog.devbench.co.in (pure 308 alias to www).
 */
export function proxy(request: NextRequest) {
  const host = requestHost(request);
  const { pathname, search } = request.nextUrl;

  if (isSharedAssetPath(pathname)) {
    return NextResponse.next();
  }

  if (host === PLAYGROUND_HOST) {
    if (pathname === "/" || pathname === "") {
      const url = request.nextUrl.clone();
      url.pathname = "/playground";
      return NextResponse.rewrite(url);
    }
    if (pathname === "/playground" || pathname === "/playground/") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = search;
      return NextResponse.redirect(url, 308);
    }
    return NextResponse.redirect(new URL(pathname + search, SITE_URL), 308);
  }

  if (host === BLOG_HOST) {
    // Pure alias: every blog-host URL permanently redirects to its www
    // equivalent. Serving a second copy here made Google arbitrate between
    // two identical pages (GSC "duplicate, Google chose different canonical")
    // and, via relative links on the served page, spawned dozens of
    // blog-host /tools/* redirect URLs (GSC "page with redirect").
    if (pathname === "/" || pathname === "" || pathname === "/blog" || pathname === "/blog/") {
      return NextResponse.redirect(new URL("/blog" + search, SITE_URL), 308);
    }
    return NextResponse.redirect(new URL(pathname + search, SITE_URL), 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
