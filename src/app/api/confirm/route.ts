import { NextRequest, NextResponse } from "next/server";
import { callRpc, isSupabaseConfigured } from "@/lib/supabase-rpc";
import { isLocale, defaultLocale } from "@/i18n/config";

export const runtime = "nodejs";

/** Double opt-in confirmation link target (GET, from the email button). */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const origin = req.nextUrl.origin;

  if (!token || !isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/${defaultLocale}/subscribe/confirmed?status=invalid`);
  }

  try {
    const result = await callRpc<Array<{ status: string; preferred_language: string | null }>>(
      "confirm_mailing_list",
      { p_token: token },
    );
    const row = result?.[0];
    const locale = row?.preferred_language && isLocale(row.preferred_language) ? row.preferred_language : defaultLocale;
    const status = row?.status === "confirmed" ? "confirmed" : "invalid";
    return NextResponse.redirect(`${origin}/${locale}/subscribe/confirmed?status=${status}`);
  } catch {
    console.error("[confirm] failed");
    return NextResponse.redirect(`${origin}/${defaultLocale}/subscribe/confirmed?status=invalid`);
  }
}
