import { AcUnitsAdminClient } from "./ac-units-admin-client";
import { adminCopy } from "@/i18n/admin-copy";
import { getRequestLocale } from "@/lib/request-locale";

export default async function AcUnitsAdminPage() {
  return <AcUnitsAdminClient copy={adminCopy[await getRequestLocale()]} />;
}
