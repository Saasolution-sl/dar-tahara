import { NextRequest, NextResponse } from "next/server";
import { locales } from "./i18n/config";
import { resolveLocale, countryFromHeaders } from "./lib/geo-language";
import { site } from "./lib/site";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  if (host.endsWith(".vercel.app")) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.host = site.domain;
    return NextResponse.redirect(url, 308);
  }

  // Skip internal paths, API routes and static files.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Already locale-prefixed → never redirect (lets users & crawlers open any
  // language directly; no forced redirect away from a chosen locale).
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  // Resolve: saved cookie → browser language → IP country → English.
  const { locale, source } = resolveLocale({
    savedLocale: request.cookies.get("NEXT_LOCALE")?.value,
    acceptLanguage: request.headers.get("accept-language"),
    countryCode: countryFromHeaders(request.headers),
  });

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.redirect(url);
  // Surface the detection outcome for privacy-conscious client analytics.
  res.headers.set("x-locale-source", source);
  return res;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
