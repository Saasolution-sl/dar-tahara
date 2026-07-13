import {notFound} from "next/navigation";
import {isLocale,type Locale} from "@/i18n/config";
import {RevisedQuoteClient} from "@/components/assessment/revised-quote-client";
export default async function RevisedQuotePage({params}:{params:Promise<{locale:string;token:string}>}){const{locale,token}=await params;if(!isLocale(locale)||!/^[0-9a-f-]{36}$/i.test(token))notFound();return <RevisedQuoteClient locale={locale as Locale} token={token}/>}
