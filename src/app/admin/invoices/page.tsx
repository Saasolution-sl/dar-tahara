import { InvoicesAdminClient } from "./invoices-admin-client";
import { requireRole } from "@/lib/portal-auth";
import { adminCopy } from "@/i18n/admin-copy";
import { getRequestLocale } from "@/lib/request-locale";

export default async function InvoicesAdminPage() {
  await requireRole(["administrator"]);
  return <InvoicesAdminClient copy={adminCopy[await getRequestLocale()]} />;
}
