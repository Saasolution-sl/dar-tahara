import type { ReactNode } from "react";
import { PortalShell } from "@/components/portal/portal-shell";
import { portalCopy } from "@/i18n/portal-copy";
import { getRequestLocale } from "@/lib/request-locale";
import { requireRole } from "@/lib/portal-auth";

export const metadata={title:"My Account · Dar Tahara",robots:{index:false,follow:false}};
export default async function AccountLayout({children}:{children:ReactNode}){const context=await requireRole(["applicant","customer","customer_company"]);const locale=await getRequestLocale();const copy=portalCopy[locale];return <PortalShell copy={copy} email={context.user.email||""} locale={locale}>{children}</PortalShell>}
