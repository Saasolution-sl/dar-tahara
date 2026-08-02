import { NextResponse } from "next/server";
import { adminConfigured, isStaffAuthorized } from "@/lib/admin-auth";
import { isServiceRoleConfigured, serviceSelect } from "@/lib/supabase-rpc";

export const runtime = "nodejs";

export async function GET() {
  if (!adminConfigured() || !isServiceRoleConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (!(await isStaffAuthorized())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [calculations, auditLogs] = await Promise.all([
    serviceSelect<({ subscription_id: string } & Record<string, unknown>)[]>(
      "early_termination_calculations?select=id,subscription_id,customer_id,original_term_code,replacement_term_code,completed_months,current_contract_month,original_monthly_amount_cents,replacement_monthly_amount_cents,amount_previously_paid_cents,recalculated_consumed_amount_cents,discount_correction_cents,remaining_minimum_months,remaining_minimum_term_amount_cents,payments_allocated_to_remaining_term_cents,included_invoice_outstanding_cents,included_invoice_ids,additional_charges_cents,deep_clean_recovery_cents,credits_cents,settlement_payments_received_cents,raw_total_cents,total_cents,credit_review_required,currency,status,expires_at,confirmed_at,settlement_invoice_id,created_at,customers(full_name,email),subscriptions!early_termination_calculations_subscription_id_fkey(billing_interval,contract_duration_months,termination_reason)&order=created_at.desc&limit=500",
    ),
    serviceSelect<{
      resource_id: string;
      actor_user_id: string | null;
      action: string;
      previous_value: unknown;
      new_value: unknown;
      created_at: string;
    }[]>(
      "audit_logs?resource_type=eq.subscription&or=(action.like.*termination*,action.like.*cancellation*,action.like.*settlement*)&select=resource_id,actor_user_id,action,previous_value,new_value,created_at&order=created_at.desc&limit=2000",
    ),
  ]);
  return NextResponse.json(calculations.map((calculation) => ({
    ...calculation,
    audit_history: auditLogs.filter((entry) => entry.resource_id === calculation.subscription_id),
  })));
}
