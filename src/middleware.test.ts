import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { localeCookieName } from "./i18n/config";
import { localeRedirectResponse } from "./middleware";

type RequestOptions = {
  acceptLanguage?: string;
  cookie?: string;
};

function request(pathname: string, options: RequestOptions = {}) {
  return new NextRequest(`http://localhost${pathname}`, {
    headers: {
      ...(options.acceptLanguage ? { "accept-language": options.acceptLanguage } : {}),
      ...(options.cookie ? { cookie: options.cookie } : {}),
    },
  });
}

function redirectLocation(pathname: string, options: RequestOptions = {}) {
  const response = localeRedirectResponse(request(pathname, options));
  assert.ok(response, `${pathname} should redirect`);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("vary"), "Accept-Language, Cookie");
  return {
    location: new URL(response.headers.get("location")!),
    source: response.headers.get("x-locale-source"),
  };
}

test("redirects every requested language-neutral path while preserving it", () => {
  const paths = [
    "/",
    "/pricing",
    "/services",
    "/subscriptions",
    "/areas",
    "/faq",
    "/contact",
    "/early-access",
    "/missionandvision",
  ];

  for (const path of paths) {
    const { location, source } = redirectLocation(path, {
      acceptLanguage: "nl-NL,nl;q=0.9",
    });
    assert.equal(location.pathname, `/nl${path === "/" ? "" : path}`);
    assert.equal(source, "browser");
  }
});

test("saved preference wins over Accept-Language and survives future requests", () => {
  const options = {
    cookie: `${localeCookieName}=fr`,
    acceptLanguage: "de-DE,de;q=0.9",
  };
  assert.equal(redirectLocation("/pricing", options).location.pathname, "/fr/pricing");
  assert.equal(redirectLocation("/contact", options).location.pathname, "/fr/contact");
  assert.equal(redirectLocation("/contact", options).source, "saved");
});

test("supports regional browser languages for every configured locale", () => {
  const cases = [
    ["en-US", "en"],
    ["nl-NL", "nl"],
    ["fr-FR", "fr"],
    ["de-DE", "de"],
    ["es-ES", "es"],
    ["pt-BR", "pt"],
    ["ar-MA", "ar"],
  ] as const;

  for (const [header, locale] of cases) {
    assert.equal(
      redirectLocation("/early-access", { acceptLanguage: header }).location.pathname,
      `/${locale}/early-access`,
    );
  }
});

test("falls back to English and preserves query parameters", () => {
  const { location, source } = redirectLocation(
    "/services?plan=premium&utm_source=test",
    { acceptLanguage: "ja-JP,zh-CN;q=0.8" },
  );
  assert.equal(location.pathname, "/en/services");
  assert.equal(location.search, "?plan=premium&utm_source=test");
  assert.equal(source, "default");
});

test("never redirects localized URLs, exempt application routes, or public files", () => {
  for (const locale of ["en", "nl", "fr", "de", "es", "pt", "ar"]) {
    assert.equal(localeRedirectResponse(request(`/${locale}`)), null);
    assert.equal(localeRedirectResponse(request(`/${locale}/pricing`)), null);
  }

  for (const path of [
    "/api/health",
    "/auth/callback",
    "/login",
    "/account",
    "/admin",
    "/icon.svg",
  ]) {
    assert.equal(localeRedirectResponse(request(path)), null);
  }
});
