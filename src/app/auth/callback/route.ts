import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/portal-auth";
import { buildAuthErrorUrl } from "@/lib/auth-redirect";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = safeNextPath(req.nextUrl.searchParams.get("next"));
  const from = req.nextUrl.searchParams.get("from");
  const providerError = req.nextUrl.searchParams.get("error");
  if (!code || providerError) return NextResponse.redirect(buildAuthErrorUrl(req.nextUrl.origin, next, from), 303);
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(buildAuthErrorUrl(req.nextUrl.origin, next, from), 303);
  return NextResponse.redirect(new URL(next, req.nextUrl.origin), 303);
}
