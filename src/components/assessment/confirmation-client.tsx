"use client";

import * as React from "react";
import { CheckCircle2, Clock3, Home } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { buttonVariants } from "@/components/ui/button";

type Copy = { title:string; paid:string; pending:string; body:string; date:string; reference:string; home:string };
const copy: Record<Locale,Copy> = {
  en:{title:"Your Home Assessment",paid:"Payment confirmed",pending:"Confirming your payment",body:"We’ll review your requested date and send the confirmed appointment details by email.",date:"Requested date",reference:"Reference",home:"Return home"},
  nl:{title:"Uw woningbeoordeling",paid:"Betaling bevestigd",pending:"Uw betaling wordt bevestigd",body:"We controleren uw voorkeursdatum en sturen de bevestigde afspraak per e-mail.",date:"Gewenste datum",reference:"Referentie",home:"Terug naar home"},
  fr:{title:"Votre Évaluation du Domicile",paid:"Paiement confirmé",pending:"Confirmation de votre paiement",body:"Nous vérifierons la date demandée et enverrons les détails confirmés par e-mail.",date:"Date demandée",reference:"Référence",home:"Retour à l’accueil"},
  ar:{title:"تقييم منزلك",paid:"تم تأكيد الدفع",pending:"جارٍ تأكيد الدفع",body:"سنراجع التاريخ المطلوب ونرسل تفاصيل الموعد المؤكد عبر البريد الإلكتروني.",date:"التاريخ المطلوب",reference:"المرجع",home:"العودة للرئيسية"},
  es:{title:"Su Evaluación del Hogar",paid:"Pago confirmado",pending:"Confirmando su pago",body:"Revisaremos la fecha solicitada y enviaremos la cita confirmada por correo.",date:"Fecha solicitada",reference:"Referencia",home:"Volver al inicio"},
  de:{title:"Ihre Hauseinschätzung",paid:"Zahlung bestätigt",pending:"Zahlung wird bestätigt",body:"Wir prüfen Ihr Wunschdatum und senden die bestätigten Termindaten per E-Mail.",date:"Wunschdatum",reference:"Referenz",home:"Zur Startseite"},
  pt:{title:"A sua Avaliação da Casa",paid:"Pagamento confirmado",pending:"A confirmar o pagamento",body:"Verificaremos a data pedida e enviaremos os detalhes confirmados por e-mail.",date:"Data pedida",reference:"Referência",home:"Voltar ao início"},
};

type Status = { reference:string; status:string; payment_status:string; preferred_date:string };

export function ConfirmationClient({locale,sessionId}:{locale:Locale;sessionId:string}) {
  const c = copy[locale];
  const [data,setData] = React.useState<Status|null>(null);
  React.useEffect(() => {
    if (!sessionId) return;
    let active = true;
    let attempts = 0;
    const load = async () => {
      const response = await fetch(`/api/assessment/status?session_id=${encodeURIComponent(sessionId)}`, { cache:"no-store" });
      const next = response.ok ? await response.json() as Status : null;
      if (next && active) setData(next);
      if (active && attempts++ < 8 && next?.payment_status !== "paid") setTimeout(load, 1500);
    };
    load();
    return () => { active = false; };
  }, [sessionId]);
  const paid = data?.payment_status === "paid";
  return <main className="flex min-h-[70vh] items-center justify-center px-6 py-20"><div className="w-full max-w-xl rounded-[2rem] border border-border bg-card p-8 text-center shadow-lift sm:p-12">{paid?<CheckCircle2 className="mx-auto h-12 w-12 text-primary"/>:<Clock3 className="mx-auto h-12 w-12 animate-pulse text-accent"/>}<p className="mt-6 text-xs font-semibold uppercase tracking-[.25em] text-accent">Dar Tahara</p><h1 className="mt-3 font-serif text-4xl text-foreground">{c.title}</h1><p className="mt-3 font-medium text-foreground">{paid?c.paid:c.pending}</p><p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{c.body}</p>{data&&<dl className="mt-7 rounded-2xl bg-secondary/50 p-5 text-start"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">{c.reference}</dt><dd className="font-medium">{data.reference}</dd></div><div className="mt-2 flex justify-between gap-4"><dt className="text-muted-foreground">{c.date}</dt><dd className="font-medium">{data.preferred_date}</dd></div></dl>}<a href={`/${locale}`} className={`${buttonVariants({variant:"primary",size:"lg"})} mt-8`}><Home className="h-4 w-4"/>{c.home}</a></div></main>;
}
