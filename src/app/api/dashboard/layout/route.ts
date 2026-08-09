import { NextRequest, NextResponse } from "next/server";
import { authorizeApi } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";
import { serviceSelect, serviceUpsert } from "@/lib/supabase-rpc";
import type { UserWidgetPreference } from "@/lib/dashboard/widgets";

export const runtime = "nodejs";

const DASHBOARD_KEY = "operations";

export async function GET() {
  const auth = await authorizeApi(["administrator", "regional_manager", "manager"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rows = await serviceSelect<Array<{ widgets: UserWidgetPreference[] }>>(
    `dashboard_layouts?select=widgets&user_id=eq.${auth.context.user.id}&dashboard_key=eq.${DASHBOARD_KEY}&limit=1`,
  );
  return NextResponse.json({ widgets: rows[0]?.widgets || [] });
}

export async function PUT(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  const auth = await authorizeApi(["administrator", "regional_manager", "manager"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json().catch(() => null)) as { widgets?: unknown } | null;
  if (!Array.isArray(body?.widgets)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const widgets = body.widgets.filter(
    (w): w is UserWidgetPreference => typeof w === "object" && w !== null && typeof (w as UserWidgetPreference).id === "string" && typeof (w as UserWidgetPreference).visible === "boolean",
  );

  await serviceUpsert("dashboard_layouts", { user_id: auth.context.user.id, dashboard_key: DASHBOARD_KEY, widgets, updated_at: new Date().toISOString() }, "user_id");
  return NextResponse.json({ ok: true });
}
