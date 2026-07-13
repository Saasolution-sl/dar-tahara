import { NextRequest, NextResponse } from "next/server";
import { isServiceRoleConfigured, serviceSelect } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

type PublicStatus = { reference: string; status: string; payment_status: string; preferred_date: string };

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("session_id") || "";
  if (!/^cs_[A-Za-z0-9_]+$/.test(id) || !isServiceRoleConfigured()) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const rows = await serviceSelect<PublicStatus[]>(
    `home_assessments?stripe_checkout_session_id=eq.${encodeURIComponent(id)}&select=reference,status,payment_status,preferred_date&limit=1`,
  );
  return rows[0] ? NextResponse.json(rows[0]) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
