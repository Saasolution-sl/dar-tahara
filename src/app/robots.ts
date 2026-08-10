import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Areas with no search value: internal dashboards, customer account
 * infrastructure, auth, APIs and one-time token URLs.
 *
 * Prefix matching in robots.txt is literal from the start of the path, so
 * `/manager` does NOT cover `/regional-manager` - both need listing.
 */
const disallow = [
  "/api/",
  "/auth/",
  "/account",
  "/account/",
  "/admin",
  "/admin/",
  "/manager",
  "/manager/",
  "/regional-manager",
  "/regional-manager/",
  "/assessment",
  "/assessment/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/*/assessment/confirmation",
  "/*/assessment/quote/",
  "/*/early-access/success",
  "/*/early-access/feedback",
  "/*/early-access/onboarding",
  "/*/subscribe/",
];

/**
 * Crawlers named explicitly so the policy is legible rather than implied.
 *
 * All of these are ALLOWED: Dar Tahara wants to be discoverable in AI answers
 * as well as classic search, and a business that publishes its screening and
 * access model benefits from those facts being retrievable.
 *
 * A named group fully replaces the `*` group for that agent, so each one
 * repeats the same private-area disallows rather than inheriting them.
 *
 * Only agents that actually honour robots.txt are listed. Naming a crawler
 * that ignores it would be a policy claim we cannot enforce.
 */
const namedCrawlers = [
  // Classic search.
  "Googlebot",
  "Googlebot-Image",
  "Bingbot",
  "Slurp",
  "DuckDuckBot",
  "Applebot",
  // AI answer engines and their retrieval crawlers.
  "Google-Extended", // Gemini / Vertex grounding
  "GPTBot", // OpenAI crawl
  "OAI-SearchBot", // ChatGPT search index
  "ChatGPT-User", // user-initiated fetch from ChatGPT
  "PerplexityBot",
  "ClaudeBot",
  "Claude-User",
  "Applebot-Extended",
  "CCBot", // Common Crawl, upstream of many models
  "meta-externalagent",
  "Amazonbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...namedCrawlers.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
