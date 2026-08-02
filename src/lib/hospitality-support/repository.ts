import "server-only";

import { serviceSelect } from "@/lib/supabase-rpc";
import type { SupportRequestRow } from "./types";

type SelectFn = <T = unknown>(query: string) => Promise<T>;

export async function findOwnedSupportRequest(
  customerId: string,
  requestId: string,
  select: SelectFn = serviceSelect,
): Promise<SupportRequestRow | null> {
  const rows = await select<SupportRequestRow[]>(
    `support_requests?id=eq.${encodeURIComponent(requestId)}&customer_id=eq.${encodeURIComponent(customerId)}&select=*&limit=1`,
  );
  return rows[0] || null;
}

export async function requireOwnedSupportRequest(customerId: string, requestId: string): Promise<SupportRequestRow> {
  const row = await findOwnedSupportRequest(customerId, requestId);
  if (!row) throw new Error("support_request_not_found");
  return row;
}

export async function validateRelatedOwnership(
  customerId: string,
  related: {
    propertyId?: string | null;
    subscriptionId?: string | null;
    invoiceId?: string | null;
    appointmentId?: string | null;
    paymentId?: string | null;
  },
): Promise<Record<string, string | null>> {
  const specs = [
    ["property", "properties", related.propertyId, "id,address_line1,address_line2,city"],
    ["subscription", "subscriptions", related.subscriptionId, "id,frequency,status"],
    ["invoice", "invoices", related.invoiceId, "id,invoice_number,status"],
    ["appointment", "service_bookings", related.appointmentId, "id,service_window_start,service_window_end,status"],
    ["payment", "payments", related.paymentId, "id,provider_payment_id,status"],
  ] as const;
  const result: Record<string, string | null> = {};
  await Promise.all(specs.map(async ([key, table, id, select]) => {
    if (!id) {
      result[`${key}Id`] = null;
      return;
    }
    const rows = await serviceSelect<Array<Record<string, unknown>>>(
      `${table}?id=eq.${encodeURIComponent(id)}&customer_id=eq.${encodeURIComponent(customerId)}&select=${select}&limit=1`,
    );
    if (!rows[0]) throw new Error(`related_${key}_not_owned`);
    result[`${key}Id`] = id;
    if (key === "property") {
      result.propertyAddress = [rows[0].address_line1, rows[0].address_line2, rows[0].city].filter(Boolean).join(", ");
    } else if (key === "invoice") {
      result.invoiceNumber = String(rows[0].invoice_number || rows[0].id);
    } else if (key === "appointment") {
      result.appointmentWindow = `${rows[0].service_window_start} - ${rows[0].service_window_end}`;
    }
  }));
  return result;
}
