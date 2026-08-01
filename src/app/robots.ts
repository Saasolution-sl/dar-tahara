import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/account",
          "/account/",
          "/admin",
          "/admin/",
          "/manager",
          "/manager/",
          "/assessment",
          "/assessment/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/*/assessment/confirmation",
          "/*/assessment/quote/",
          "/*/early-access/success",
          "/*/subscribe/",
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
