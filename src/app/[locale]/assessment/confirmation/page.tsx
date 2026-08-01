import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { ConfirmationClient } from "@/components/assessment/confirmation-client";
import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata("Assessment confirmation");

export default async function ConfirmationPage({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{session_id?:string;application?:string;reference?:string}>}){
  const [{locale},{session_id="",application,reference=""}]=await Promise.all([params,searchParams]);
  if(!isLocale(locale))notFound();
  return <ConfirmationClient locale={locale as Locale} sessionId={session_id} applicationSubmitted={application==="submitted"} reference={reference}/>;
}
