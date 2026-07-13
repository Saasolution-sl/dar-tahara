import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/i18n/config";
import { createAssessmentCheckout } from "../checkout/route";

export const runtime = "nodejs";

function fallbackUrl(req: NextRequest, body: unknown, error: string): URL {
  const locale = body && typeof body === "object" && "locale" in body && typeof body.locale === "string" && isLocale(body.locale)
    ? body.locale
    : "en";
  const url = new URL(`/${locale}`, req.nextUrl.origin);
  url.searchParams.set("assessment", error);
  url.hash = "calculator";
  return url;
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const raw = form?.get("payload");
  let body: unknown = null;
  if (typeof raw === "string") {
    try {
      body = JSON.parse(raw) as unknown;
    } catch {
      body = null;
    }
  }
  const result = await createAssessmentCheckout(body, req);
  if (!result.ok) {
    return NextResponse.redirect(fallbackUrl(req, body, result.error), { status: 303 });
  }
  return NextResponse.redirect(result.checkoutUrl, { status: 303 });
}
