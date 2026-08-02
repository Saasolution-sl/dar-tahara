import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, isStaffAuthorized } from "@/lib/admin-auth";
import { isServiceRoleConfigured, serviceSelect } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!adminConfigured() || !isServiceRoleConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (!(await isStaffAuthorized())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const status = req.nextUrl.searchParams.get("status");
  const filter = status && /^[a-z_]+$/.test(status) ? `&or=(status.eq.${status},collection_stage.eq.${status})` : "";
  const [rows, calculations] = await Promise.all([
    serviceSelect<({ id: string; early_termination_calculation_id: string | null } & Record<string, unknown>)[]>(
      `invoices?select=id,invoice_number,stripe_invoice_id,status,collection_stage,failed_attempt_count,amount_due_cents,amount_paid_cents,currency,created_at,invoice_type,is_final_settlement,early_termination_calculation_id,invoice_details,customers(full_name,email)&order=created_at.desc${filter}&limit=500`,
    ),
    serviceSelect<({
      id: string;
      settlement_invoice_id: string | null;
    } & Record<string, unknown>)[]>(
      "early_termination_calculations?select=id,settlement_invoice_id,original_term_code,replacement_term_code,completed_months,current_contract_month,original_monthly_amount_cents,replacement_monthly_amount_cents,discount_correction_cents,remaining_minimum_months,remaining_minimum_term_amount_cents,included_invoice_ids,credits_cents,additional_charges_cents,total_cents,status,confirmed_at,created_at,subscriptions!early_termination_calculations_subscription_id_fkey(billing_interval,contract_duration_months)&order=created_at.desc&limit=500",
    ),
  ]);
  const calculationById = new Map(calculations.map((calculation) => [calculation.id, calculation]));
  return NextResponse.json(rows.map((row) => ({
    ...row,
    early_termination_calculation: row.early_termination_calculation_id
      ? calculationById.get(row.early_termination_calculation_id) ?? null
      : null,
  })));
}
