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
 * Subdomain routing: playground.devbench.co.in and blog.devbench.co.in.
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
    if (pathname === "/" || pathname === "") {
      const url = request.nextUrl.clone();
      url.pathname = "/blog";
      return NextResponse.rewrite(url);
    }
    if (pathname === "/blog" || pathname === "/blog/") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = search;
      return NextResponse.redirect(url, 308);
    }
    if (pathname.startsWith("/blog/")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(pathname + search, SITE_URL), 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
