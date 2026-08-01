import { notFound } from "next/navigation";
import { SupportConversation } from "@/components/portal/support-portal";
import { supportCopy } from "@/i18n/support-copy";
import { requireCustomerPortal } from "@/lib/feature-flags";
import type { SupportRequestRow } from "@/lib/hospitality-support/types";
import { requireAuth } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { createClient } from "@/lib/supabase/server";

export default async function SupportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireCustomerPortal();
  const context = await requireAuth("/account/support");
  const locale = await getRequestLocale();
  const copy = supportCopy[locale];
  const { id } = await params;
  const db = await createClient();
  const customerId = context.customerId || "00000000-0000-0000-0000-000000000000";
  const [requestResult, messagesResult, attachmentsResult] = await Promise.all([
    db.from("support_requests").select("*").eq("id", id).eq("customer_id", customerId).maybeSingle(),
    db.from("support_messages").select("id,entry_type,sender_name,sender_role,body,created_at").eq("support_request_id", id).eq("customer_id", customerId).eq("visibility", "customer").order("created_at", { ascending:true }),
    db.from("support_attachments").select("id,support_message_id,safe_filename,mime_type,size_bytes").eq("support_request_id", id).eq("customer_id", customerId).eq("visibility", "customer").order("created_at", { ascending:true }),
  ]);
  if (!requestResult.data || requestResult.error) notFound();
  return <SupportConversation
    request={requestResult.data as SupportRequestRow}
    messages={(messagesResult.data || []) as Array<{ id:string; entry_type:"customer"|"support"|"system"|"call"; sender_name:string|null; sender_role:string|null; body:string; created_at:string }>}
    attachments={(attachmentsResult.data || []) as Array<{ id:string; support_message_id:string|null; safe_filename:string; mime_type:string; size_bytes:number }>}
    copy={copy}
    locale={locale}
  />;
}
