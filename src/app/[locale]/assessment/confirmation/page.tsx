import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { ConfirmationClient } from "@/components/assessment/confirmation-client";

export default async function ConfirmationPage({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{session_id?:string}>}){
  const [{locale},{session_id=""}]=await Promise.all([params,searchParams]);
  if(!isLocale(locale))notFound();
  return <ConfirmationClient locale={locale as Locale} sessionId={session_id}/>;
}
