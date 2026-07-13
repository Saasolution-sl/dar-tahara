import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, isAdminAuthorized } from "@/lib/admin-auth";
import { isServiceRoleConfigured, serviceSelect } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!adminConfigured() || !isServiceRoleConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const status = req.nextUrl.searchParams.get("status");
  const filter = status && /^[a-z_]+$/.test(status) ? `&status=eq.${status}` : "";
  const rows = await serviceSelect(`home_assessments?select=*,customers(id,full_name,email,phone,preferred_language,stripe_customer_id),properties(address_line1,city,declared_size_m2,declared_bedrooms,declared_bathrooms,pets,smoking,declared_condition),subscriptions(id,status,stripe_subscription_id)&order=preferred_date.asc${filter}&limit=500`);
  return NextResponse.json(rows);
}
