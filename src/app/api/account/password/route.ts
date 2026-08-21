import { NextRequest, NextResponse } from "next/server";
import { classifyPasswordUpdateError } from "@/lib/auth-password";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { rateLimitShared } from "@/lib/rate-limit";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { createClient } from "@/lib/supabase/server";
import { serviceInsert } from "@/lib/supabase-rpc";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  }
  const auth = await authorizeApi(["applicant", "customer"]);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }
  const limit = await rateLimitShared(
    `profile-password:${auth.context.user.id}:${clientIpFromHeaders(req.headers)}`,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword =
    typeof body.newPassword === "string" ? body.newPassword : "";
  if (
    currentPassword.length < 8 ||
    currentPassword.length > 200 ||
    newPassword.length < 12 ||
    newPassword.length > 200
  ) {
    return NextResponse.json(
      { error: "invalid_password" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    current_password: currentPassword,
  });
  if (error) {
    const failure = classifyPasswordUpdateError(error);
    return NextResponse.json(
      { error: failure },
      { status: failure === "invalid_session" ? 401 : 400 },
    );
  }

  await serviceInsert("audit_logs", {
    actor_user_id: auth.context.user.id,
    action: "customer_password_changed",
    resource_type: "customer",
    resource_id: auth.context.customerId,
    user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
  });
  return NextResponse.json({ ok: true });
}
