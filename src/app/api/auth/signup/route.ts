import { NextRequest, NextResponse } from "next/server";
import { buildAuthCallbackUrl } from "@/lib/auth-redirect";
import { featureEnabled } from "@/lib/feature-flags";
import { clientIpFromHeaders, rateLimit } from "@/lib/mailing-list";
import { safeNextPath } from "@/lib/portal-routing";
import { isSameOrigin } from "@/lib/request-security";
import { createClient } from "@/lib/supabase/server";
import { serviceInsert } from "@/lib/supabase-rpc";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const limit = rateLimit(`signup:${clientIpFromHeaders(req.headers)}`);
  if (!limit.allowed) return NextResponse.json({ error: "signup_failed" }, { status: 429 });
  if (!await featureEnabled("customer_registration_enabled")) return NextResponse.json({ error: "registration_disabled" }, { status: 403 });

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const next = safeNextPath(typeof body.next === "string" ? body.next : null);
  const accountType = body.accountType === "company" ? "company" : "personal";
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "signup_failed" }, { status: 400 });
  if (password.length < 12) return NextResponse.json({ error: "password_too_short" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: buildAuthCallbackUrl(req.nextUrl.origin, next, "signup"),
      data: { account_type: accountType },
    },
  });
  if (error) {
    const failure = error.code === "weak_password" ? "weak_password" : "signup_failed";
    return NextResponse.json({ error: failure }, { status: 400 });
  }
  if (accountType === "company" && data.user) {
    try {
      await serviceInsert("user_roles", {
        user_id: data.user.id,
        role: "customer_company",
      });
    } catch (roleError) {
      console.error(
        "[company-signup-role]",
        roleError instanceof Error ? roleError.message : "unknown",
      );
      return NextResponse.json({ error: "signup_failed" }, { status: 503 });
    }
  }
  if (data.session) {
    return NextResponse.json({ destination: next.startsWith("/admin") ? "/account/assessments" : next });
  }
  return NextResponse.json({ status: "check_email" });
}
