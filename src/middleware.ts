import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { localeCookieName, locales } from "./i18n/config";
import { resolveLocale } from "./lib/geo-language";
import { site } from "./lib/site";

const PUBLIC_FILE = /\.(.*)$/;
export const requestLocaleHeader = "x-dar-tahara-locale";

function skipsLocaleRedirect(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/") ||
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    PUBLIC_FILE.test(pathname)
  );
}

/** Build the automatic locale redirect, or return null for exempt/localized URLs. */
export function localeRedirectResponse(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (skipsLocaleRedirect(pathname)) return null;

  // A locale in the URL is authoritative and must never be redirected.
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return null;

  const { locale, source } = resolveLocale({
    savedLocale: request.cookies.get(localeCookieName)?.value,
    acceptLanguage: request.headers.get("accept-language"),
  });

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(url, 302);
  response.headers.set("cache-control", "private, no-store");
  response.headers.set("vary", "Accept-Language, Cookie");
  response.headers.set("x-locale-source", source);
  return response;
}

export function localeForRequest(request: NextRequest) {
  const pathLocale = locales.find(
    (locale) =>
      request.nextUrl.pathname === `/${locale}` ||
      request.nextUrl.pathname.startsWith(`/${locale}/`),
  );
  if (pathLocale) return pathLocale;

  return resolveLocale({
    savedLocale: request.cookies.get(localeCookieName)?.value,
    acceptLanguage: request.headers.get("accept-language"),
  }).locale;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] || "";

  if (host && host !== site.domain && host !== "localhost" && host !== "127.0.0.1") {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.host = site.domain;
    return NextResponse.redirect(url, 308);
  }

  // Locale detection is entirely request-local. Return before Supabase auth
  // refresh so automatic redirects never add a network request.
  const localeRedirect = localeRedirectResponse(request);
  if (localeRedirect) return localeRedirect;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(requestLocaleHeader, localeForRequest(request));
  let authResponse = NextResponse.next({ request: { headers: requestHeaders } });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          requestHeaders.set("cookie", request.headers.get("cookie") || "");
          authResponse = NextResponse.next({ request: { headers: requestHeaders } });
          values.forEach(({ name, value, options }) => authResponse.cookies.set(name, value, options));
        },
      },
    });
    await supabase.auth.getUser();
  }

  return authResponse;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
