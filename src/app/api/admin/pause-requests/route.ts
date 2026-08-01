import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, isStaffAuthorized } from "@/lib/admin-auth";
import { isServiceRoleConfigured, serviceSelect } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!adminConfigured() || !isServiceRoleConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (!(await isStaffAuthorized())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const status = req.nextUrl.searchParams.get("status");
  const filter = status && /^[a-z_]+$/.test(status) ? `&status=eq.${status}` : "";
  const rows = await serviceSelect(
    `pause_requests?select=*,customers(full_name,email),subscriptions(id,frequency,status,billed_price_cents,currency)&order=created_at.desc${filter}&limit=500`,
  );
  return NextResponse.json(rows);
}
