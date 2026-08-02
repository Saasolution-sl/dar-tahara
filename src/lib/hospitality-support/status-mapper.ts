import type { CustomerSupportStatus } from "./types";

export type StatusContext = {
  latestSender?: "customer" | "support" | "system" | "call" | null;
  tags?: string[];
};

export function mapHospitalitySupportStatus(
  status: string | null | undefined,
  context: StatusContext = {},
): CustomerSupportStatus {
  const normalized = (status || "").trim().toLowerCase().replaceAll("-", "_");
  const tags = new Set((context.tags || []).map((tag) => tag.toLowerCase()));
  if (tags.has("portal_closed") || tags.has("portal-closed") || normalized === "archived") return "closed";
  if (["closed", "resolved", "solved"].includes(normalized)) return "resolved";
  if (["pending_customer", "waiting_customer", "customer_pending"].includes(normalized)) return "waiting_customer";
  if (["assigned", "in_progress", "processing"].includes(normalized)) return "in_progress";
  if (["pending", "waiting_support", "support_pending"].includes(normalized)) {
    return context.latestSender === "customer" ? "waiting_support" : "waiting_customer";
  }
  if (["active", "open", "new"].includes(normalized)) {
    return context.latestSender === "customer" ? "waiting_support" : "open";
  }
  return "open";
}

export function statusAfterCustomerReply(): CustomerSupportStatus {
  return "waiting_support";
}

export function isPermanentlyClosed(status: CustomerSupportStatus): boolean {
  return status === "closed";
}
