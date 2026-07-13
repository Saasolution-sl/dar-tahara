import { NextRequest, NextResponse } from "next/server";
import { callRpc, isSupabaseConfigured } from "@/lib/supabase-rpc";
import { isLocale, defaultLocale } from "@/i18n/config";

export const runtime = "nodejs";

/** Unsubscribe link target (GET, from any mailing-list email footer). */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const origin = req.nextUrl.origin;

  if (!token || !isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/${defaultLocale}/subscribe/unsubscribed?status=invalid`);
  }

  try {
    const result = await callRpc<Array<{ status: string; preferred_language: string | null }>>(
      "unsubscribe_mailing_list",
      { p_token: token },
    );
    const row = result?.[0];
    const locale = row?.preferred_language && isLocale(row.preferred_language) ? row.preferred_language : defaultLocale;
    const status = row?.status === "unsubscribed" ? "unsubscribed" : "invalid";
    return NextResponse.redirect(`${origin}/${locale}/subscribe/unsubscribed?status=${status}`);
  } catch {
    console.error("[unsubscribe] failed");
    return NextResponse.redirect(`${origin}/${defaultLocale}/subscribe/unsubscribed?status=invalid`);
  }
}
