import "server-only";
import type { Locale } from "@/i18n/config";

export type TransactionalTemplate =
  | "booking_confirmation"
  | "payment_confirmation"
  | "appointment_reminder"
  | "assessment_completed"
  | "subscription_activated"
  | "revised_quote"
  | "subscription_declined"
  | "invoice"
  | "annual_renewal_reminder"
  | "monthly_renewal_reminder";

type TemplateCopy = { subject: string; heading: string; body: string; cta: string };
type LocaleCopy = { greeting: string; footer: string; templates: Record<TransactionalTemplate, TemplateCopy> };

const COPY: Record<Locale, LocaleCopy> = {
  en: {
    greeting: "Hello {name},",
    footer: "Dar Tahara · Premium home care in Morocco",
    templates: {
      booking_confirmation: { subject: "Your Initial Home Assessment is confirmed", heading: "Your assessment is reserved", body: "Payment is complete and your Initial Home Assessment {reference} is confirmed for {date}. We will assess your home professionally and prepare your personalised care plan.", cta: "View booking" },
      payment_confirmation: { subject: "Payment received for {reference}", heading: "Payment received", body: "We received {amount} for your Initial Home Assessment. Your receipt and booking details are securely recorded.", cta: "View payment details" },
      appointment_reminder: { subject: "Reminder: your Home Assessment is coming up", heading: "We look forward to visiting", body: "Your Premium Home Assessment is scheduled for {date}. Please ensure we can access the property and that any pets or special requirements are safely accommodated.", cta: "View appointment" },
      assessment_completed: { subject: "Your Home Assessment is complete", heading: "Assessment completed", body: "Our team has completed the assessment for {reference}. Your cleaning profile and recommended service plan are now being reviewed.", cta: "View assessment" },
      subscription_activated: { subject: "Your Dar Tahara subscription is active", heading: "Welcome to effortless home care", body: "Your {details} subscription is now active. Upcoming visits and invoices will be available in your customer account as those features are introduced.", cta: "View subscription" },
      revised_quote: { subject: "A revised care plan for your home", heading: "Your personalised quote is ready", body: "The assessment identified details that materially affect the service plan. Your revised recommendation is {amount}. Review the explanation and choose whether to proceed.", cta: "Review revised quote" },
      subscription_declined: { subject: "Update following your Home Assessment", heading: "Assessment outcome", body: "After careful review, we are unable to offer an ongoing subscription for this property at present. Your assessment record remains available and our team can answer any questions.", cta: "Contact our team" },
      invoice: { subject: "Dar Tahara invoice {reference}", heading: "Your invoice is ready", body: "Your invoice for {amount} is available. Stripe securely provides the hosted invoice and downloadable PDF.", cta: "View invoice" },
      annual_renewal_reminder: { subject: "Your annual subscription renews soon", heading: "Annual renewal reminder", body: "Your annual Dar Tahara subscription will renew on {date} for {amount}, unless cancelled beforehand in accordance with the Terms.", cta: "Manage subscription" },
      monthly_renewal_reminder: { subject: "Your monthly subscription renews soon", heading: "Monthly renewal reminder", body: "Your monthly Dar Tahara subscription will renew on {date} for {amount}, unless paused or cancelled beforehand in accordance with the Terms.", cta: "Manage subscription" },
    },
  },
  nl: {
    greeting: "Hallo {name},",
    footer: "Dar Tahara · Premium woningzorg in Marokko",
    templates: {
      booking_confirmation: { subject: "Uw Initiële Woningbeoordeling is bevestigd", heading: "Uw beoordeling is gereserveerd", body: "De betaling is voltooid en uw Initiële Woningbeoordeling {reference} is bevestigd voor {date}. Wij beoordelen uw woning professioneel en stellen uw persoonlijke zorgplan op.", cta: "Boeking bekijken" },
      payment_confirmation: { subject: "Betaling ontvangen voor {reference}", heading: "Betaling ontvangen", body: "Wij ontvingen {amount} voor uw Initiële Woningbeoordeling. Uw ontvangstbewijs en boekingsgegevens zijn veilig vastgelegd.", cta: "Betaling bekijken" },
      appointment_reminder: { subject: "Herinnering: uw Woningbeoordeling komt eraan", heading: "Wij kijken uit naar ons bezoek", body: "Uw Premium Woningbeoordeling is gepland op {date}. Zorg voor toegang en houd rekening met huisdieren of bijzondere vereisten.", cta: "Afspraak bekijken" },
      assessment_completed: { subject: "Uw Woningbeoordeling is voltooid", heading: "Beoordeling voltooid", body: "Ons team heeft beoordeling {reference} voltooid. Uw schoonmaakprofiel en aanbevolen plan worden nu beoordeeld.", cta: "Beoordeling bekijken" },
      subscription_activated: { subject: "Uw Dar Tahara-abonnement is actief", heading: "Welkom bij moeiteloze woningzorg", body: "Uw {details}-abonnement is nu actief. Komende bezoeken en facturen worden beschikbaar in uw klantaccount.", cta: "Abonnement bekijken" },
      revised_quote: { subject: "Een aangepast zorgplan voor uw woning", heading: "Uw persoonlijke offerte staat klaar", body: "De beoordeling bracht details aan het licht die het serviceplan wezenlijk beïnvloeden. Uw aangepaste voorstel bedraagt {amount}.", cta: "Offerte beoordelen" },
      subscription_declined: { subject: "Update na uw Woningbeoordeling", heading: "Uitkomst van de beoordeling", body: "Na zorgvuldige beoordeling kunnen wij momenteel geen doorlopend abonnement voor deze woning aanbieden. Ons team beantwoordt graag uw vragen.", cta: "Contact opnemen" },
      invoice: { subject: "Dar Tahara-factuur {reference}", heading: "Uw factuur staat klaar", body: "Uw factuur van {amount} is beschikbaar via de beveiligde Stripe-factuurpagina.", cta: "Factuur bekijken" },
      annual_renewal_reminder: { subject: "Uw jaarabonnement wordt binnenkort verlengd", heading: "Herinnering jaarlijkse verlenging", body: "Uw jaarabonnement wordt op {date} verlengd voor {amount}, tenzij u vooraf opzegt volgens de Voorwaarden.", cta: "Abonnement beheren" },
      monthly_renewal_reminder: { subject: "Uw maandabonnement wordt binnenkort verlengd", heading: "Herinnering maandelijkse verlenging", body: "Uw maandabonnement wordt op {date} verlengd voor {amount}, tenzij u vooraf pauzeert of opzegt.", cta: "Abonnement beheren" },
    },
  },
  fr: {
    greeting: "Bonjour {name},",
    footer: "Dar Tahara · Entretien résidentiel premium au Maroc",
    templates: {
      booking_confirmation: { subject: "Votre Évaluation Initiale du Domicile est confirmée", heading: "Votre évaluation est réservée", body: "Le paiement est finalisé et votre Évaluation Initiale du Domicile {reference} est confirmée pour le {date}. Nous évaluerons votre intérieur et préparerons votre plan personnalisé.", cta: "Voir la réservation" },
      payment_confirmation: { subject: "Paiement reçu pour {reference}", heading: "Paiement reçu", body: "Nous avons reçu {amount} pour votre Évaluation Initiale du Domicile. Votre reçu et les détails de réservation sont enregistrés en toute sécurité.", cta: "Voir le paiement" },
      appointment_reminder: { subject: "Rappel : votre Évaluation du Domicile approche", heading: "Nous avons hâte de vous rencontrer", body: "Votre Évaluation Premium du Domicile est prévue le {date}. Merci de garantir l’accès et de prévoir les dispositions nécessaires pour les animaux ou besoins particuliers.", cta: "Voir le rendez-vous" },
      assessment_completed: { subject: "Votre Évaluation du Domicile est terminée", heading: "Évaluation terminée", body: "Notre équipe a terminé l’évaluation {reference}. Votre profil d’entretien et notre recommandation sont en cours de validation.", cta: "Voir l’évaluation" },
      subscription_activated: { subject: "Votre abonnement Dar Tahara est actif", heading: "Bienvenue dans un quotidien plus serein", body: "Votre abonnement {details} est désormais actif. Vos prochaines visites et factures seront disponibles dans votre espace client.", cta: "Voir l’abonnement" },
      revised_quote: { subject: "Un plan d’entretien révisé pour votre domicile", heading: "Votre devis personnalisé est prêt", body: "L’évaluation a révélé des éléments ayant une incidence matérielle sur le service. La proposition révisée est de {amount}.", cta: "Consulter le devis" },
      subscription_declined: { subject: "Suite à votre Évaluation du Domicile", heading: "Résultat de l’évaluation", body: "Après examen attentif, nous ne pouvons pas proposer d’abonnement continu pour ce bien actuellement. Notre équipe reste disponible pour répondre à vos questions.", cta: "Contacter l’équipe" },
      invoice: { subject: "Facture Dar Tahara {reference}", heading: "Votre facture est disponible", body: "Votre facture de {amount} est disponible sur la page sécurisée Stripe.", cta: "Voir la facture" },
      annual_renewal_reminder: { subject: "Votre abonnement annuel sera bientôt renouvelé", heading: "Rappel de renouvellement annuel", body: "Votre abonnement annuel sera renouvelé le {date} pour {amount}, sauf résiliation préalable conformément aux Conditions.", cta: "Gérer l’abonnement" },
      monthly_renewal_reminder: { subject: "Votre abonnement mensuel sera bientôt renouvelé", heading: "Rappel de renouvellement mensuel", body: "Votre abonnement mensuel sera renouvelé le {date} pour {amount}, sauf suspension ou résiliation préalable.", cta: "Gérer l’abonnement" },
    },
  },
  ar: {
    greeting: "مرحباً {name}،",
    footer: "دار طهارة · عناية منزلية راقية في المغرب",
    templates: {
      booking_confirmation: { subject: "تم تأكيد التقييم الأولي لمنزلك", heading: "تم حجز موعد التقييم", body: "اكتمل الدفع وتم تأكيد التقييم الأولي للمنزل {reference} بتاريخ {date}. سنقيّم منزلك باحتراف ونعد خطة عناية مخصصة.", cta: "عرض الحجز" },
      payment_confirmation: { subject: "تم استلام دفعة {reference}", heading: "تم استلام الدفعة", body: "استلمنا {amount} مقابل التقييم الأولي للمنزل. تم حفظ الإيصال وتفاصيل الحجز بأمان.", cta: "عرض تفاصيل الدفع" },
      appointment_reminder: { subject: "تذكير: موعد تقييم منزلك يقترب", heading: "نتطلع إلى زيارتكم", body: "تقييم المنزل المميز مقرر بتاريخ {date}. يرجى ضمان إمكانية الدخول وترتيب وضع الحيوانات أو المتطلبات الخاصة.", cta: "عرض الموعد" },
      assessment_completed: { subject: "اكتمل تقييم منزلك", heading: "اكتمل التقييم", body: "أكمل فريقنا التقييم {reference}. تتم الآن مراجعة ملف التنظيف وخطة الخدمة المقترحة.", cta: "عرض التقييم" },
      subscription_activated: { subject: "تم تفعيل اشتراك دار طهارة", heading: "مرحباً بكم في عناية منزلية بلا عناء", body: "تم تفعيل اشتراك {details}. ستتوفر الزيارات والفواتير القادمة في حساب العميل.", cta: "عرض الاشتراك" },
      revised_quote: { subject: "خطة عناية معدّلة لمنزلك", heading: "عرضك المخصص جاهز", body: "كشف التقييم تفاصيل تؤثر بصورة جوهرية في خطة الخدمة. العرض المعدّل هو {amount}.", cta: "مراجعة العرض" },
      subscription_declined: { subject: "تحديث بعد تقييم المنزل", heading: "نتيجة التقييم", body: "بعد مراجعة دقيقة، لا يمكننا تقديم اشتراك مستمر لهذا العقار حالياً. فريقنا متاح للإجابة عن أسئلتكم.", cta: "التواصل مع الفريق" },
      invoice: { subject: "فاتورة دار طهارة {reference}", heading: "فاتورتك جاهزة", body: "فاتورتك بقيمة {amount} متاحة عبر صفحة Stripe الآمنة.", cta: "عرض الفاتورة" },
      annual_renewal_reminder: { subject: "سيُجدّد اشتراكك السنوي قريباً", heading: "تذكير بالتجديد السنوي", body: "سيُجدّد اشتراكك السنوي بتاريخ {date} مقابل {amount} ما لم يتم الإلغاء مسبقاً وفق الشروط.", cta: "إدارة الاشتراك" },
      monthly_renewal_reminder: { subject: "سيُجدّد اشتراكك الشهري قريباً", heading: "تذكير بالتجديد الشهري", body: "سيُجدّد اشتراكك الشهري بتاريخ {date} مقابل {amount} ما لم يتم إيقافه أو إلغاؤه مسبقاً.", cta: "إدارة الاشتراك" },
    },
  },
  es: {
    greeting: "Hola {name},",
    footer: "Dar Tahara · Cuidado premium del hogar en Marruecos",
    templates: {
      booking_confirmation: { subject: "Tu Evaluación Inicial del Hogar está confirmada", heading: "Tu evaluación está reservada", body: "El pago se ha completado y tu Evaluación Inicial del Hogar {reference} está confirmada para el {date}. Evaluaremos tu vivienda y prepararemos tu plan personalizado.", cta: "Ver reserva" },
      payment_confirmation: { subject: "Pago recibido para {reference}", heading: "Pago recibido", body: "Hemos recibido {amount} por tu Evaluación Inicial del Hogar. El recibo y los datos están guardados de forma segura.", cta: "Ver pago" },
      appointment_reminder: { subject: "Recordatorio: se acerca tu Evaluación del Hogar", heading: "Esperamos tu visita", body: "Tu Evaluación Premium del Hogar está prevista para el {date}. Asegura el acceso y las medidas necesarias para mascotas o requisitos especiales.", cta: "Ver cita" },
      assessment_completed: { subject: "Tu Evaluación del Hogar ha finalizado", heading: "Evaluación finalizada", body: "Nuestro equipo ha completado la evaluación {reference}. Estamos revisando tu perfil y el plan recomendado.", cta: "Ver evaluación" },
      subscription_activated: { subject: "Tu suscripción Dar Tahara está activa", heading: "Bienvenido al cuidado sin esfuerzo", body: "Tu suscripción {details} ya está activa. Tus próximas visitas y facturas estarán disponibles en tu cuenta.", cta: "Ver suscripción" },
      revised_quote: { subject: "Un plan de cuidado revisado para tu hogar", heading: "Tu presupuesto personalizado está listo", body: "La evaluación identificó aspectos que afectan de forma material al servicio. La propuesta revisada es de {amount}.", cta: "Revisar presupuesto" },
      subscription_declined: { subject: "Actualización tras tu Evaluación del Hogar", heading: "Resultado de la evaluación", body: "Tras una revisión cuidadosa, actualmente no podemos ofrecer una suscripción continua para esta vivienda. Nuestro equipo responderá tus preguntas.", cta: "Contactar al equipo" },
      invoice: { subject: "Factura Dar Tahara {reference}", heading: "Tu factura está lista", body: "Tu factura de {amount} está disponible en la página segura de Stripe.", cta: "Ver factura" },
      annual_renewal_reminder: { subject: "Tu suscripción anual se renovará pronto", heading: "Recordatorio de renovación anual", body: "Tu suscripción anual se renovará el {date} por {amount}, salvo cancelación previa según las Condiciones.", cta: "Gestionar suscripción" },
      monthly_renewal_reminder: { subject: "Tu suscripción mensual se renovará pronto", heading: "Recordatorio de renovación mensual", body: "Tu suscripción mensual se renovará el {date} por {amount}, salvo pausa o cancelación previa.", cta: "Gestionar suscripción" },
    },
  },
  de: {
    greeting: "Hallo {name},",
    footer: "Dar Tahara · Premium-Hausbetreuung in Marokko",
    templates: {
      booking_confirmation: { subject: "Ihre Ersteinschätzung des Zuhauses ist bestätigt", heading: "Ihre Einschätzung ist reserviert", body: "Die Zahlung ist abgeschlossen und Ihre Ersteinschätzung {reference} ist für den {date} bestätigt. Wir bewerten Ihr Zuhause professionell und erstellen Ihren persönlichen Pflegeplan.", cta: "Buchung ansehen" },
      payment_confirmation: { subject: "Zahlung für {reference} erhalten", heading: "Zahlung erhalten", body: "Wir haben {amount} für Ihre Ersteinschätzung erhalten. Beleg und Buchungsdaten wurden sicher gespeichert.", cta: "Zahlung ansehen" },
      appointment_reminder: { subject: "Erinnerung: Ihre Hauseinschätzung steht bevor", heading: "Wir freuen uns auf den Besuch", body: "Ihre Premium-Hauseinschätzung ist für den {date} geplant. Bitte gewährleisten Sie den Zugang und berücksichtigen Sie Haustiere oder besondere Anforderungen.", cta: "Termin ansehen" },
      assessment_completed: { subject: "Ihre Hauseinschätzung ist abgeschlossen", heading: "Einschätzung abgeschlossen", body: "Unser Team hat die Einschätzung {reference} abgeschlossen. Ihr Reinigungsprofil und der empfohlene Plan werden geprüft.", cta: "Einschätzung ansehen" },
      subscription_activated: { subject: "Ihr Dar Tahara-Abonnement ist aktiv", heading: "Willkommen bei müheloser Hausbetreuung", body: "Ihr {details}-Abonnement ist jetzt aktiv. Künftige Termine und Rechnungen werden in Ihrem Kundenkonto verfügbar.", cta: "Abonnement ansehen" },
      revised_quote: { subject: "Ein angepasster Pflegeplan für Ihr Zuhause", heading: "Ihr persönliches Angebot ist bereit", body: "Die Einschätzung ergab Punkte mit wesentlichem Einfluss auf den Service. Das angepasste Angebot beträgt {amount}.", cta: "Angebot prüfen" },
      subscription_declined: { subject: "Update nach Ihrer Hauseinschätzung", heading: "Ergebnis der Einschätzung", body: "Nach sorgfältiger Prüfung können wir derzeit kein laufendes Abonnement für diese Immobilie anbieten. Unser Team beantwortet Ihre Fragen gern.", cta: "Team kontaktieren" },
      invoice: { subject: "Dar Tahara-Rechnung {reference}", heading: "Ihre Rechnung ist bereit", body: "Ihre Rechnung über {amount} ist auf der sicheren Stripe-Seite verfügbar.", cta: "Rechnung ansehen" },
      annual_renewal_reminder: { subject: "Ihr Jahresabonnement verlängert sich bald", heading: "Erinnerung an die Jahresverlängerung", body: "Ihr Jahresabonnement verlängert sich am {date} für {amount}, sofern es nicht vorher gemäß den Bedingungen gekündigt wird.", cta: "Abonnement verwalten" },
      monthly_renewal_reminder: { subject: "Ihr Monatsabonnement verlängert sich bald", heading: "Erinnerung an die Monatsverlängerung", body: "Ihr Monatsabonnement verlängert sich am {date} für {amount}, sofern es nicht vorher pausiert oder gekündigt wird.", cta: "Abonnement verwalten" },
    },
  },
  pt: {
    greeting: "Olá {name},",
    footer: "Dar Tahara · Cuidado premium do lar em Marrocos",
    templates: {
      booking_confirmation: { subject: "A sua Avaliação Inicial da Casa está confirmada", heading: "A sua avaliação está reservada", body: "O pagamento foi concluído e a Avaliação Inicial {reference} está confirmada para {date}. Avaliaremos a sua casa e criaremos o plano personalizado.", cta: "Ver reserva" },
      payment_confirmation: { subject: "Pagamento recebido para {reference}", heading: "Pagamento recebido", body: "Recebemos {amount} pela sua Avaliação Inicial da Casa. O recibo e os detalhes estão guardados em segurança.", cta: "Ver pagamento" },
      appointment_reminder: { subject: "Lembrete: a sua Avaliação da Casa aproxima-se", heading: "Aguardamos a visita", body: "A sua Avaliação Premium está marcada para {date}. Garanta o acesso e as condições necessárias para animais ou requisitos especiais.", cta: "Ver marcação" },
      assessment_completed: { subject: "A sua Avaliação da Casa foi concluída", heading: "Avaliação concluída", body: "A nossa equipa concluiu a avaliação {reference}. O perfil de limpeza e o plano recomendado estão em análise.", cta: "Ver avaliação" },
      subscription_activated: { subject: "A sua subscrição Dar Tahara está ativa", heading: "Bem-vindo ao cuidado sem esforço", body: "A sua subscrição {details} está ativa. As próximas visitas e faturas estarão disponíveis na conta de cliente.", cta: "Ver subscrição" },
      revised_quote: { subject: "Um plano de cuidado revisto para a sua casa", heading: "A sua proposta personalizada está pronta", body: "A avaliação identificou aspetos com impacto material no serviço. A proposta revista é de {amount}.", cta: "Rever proposta" },
      subscription_declined: { subject: "Atualização após a Avaliação da Casa", heading: "Resultado da avaliação", body: "Após análise cuidadosa, não podemos oferecer atualmente uma subscrição contínua para este imóvel. A nossa equipa está disponível para esclarecer dúvidas.", cta: "Contactar a equipa" },
      invoice: { subject: "Fatura Dar Tahara {reference}", heading: "A sua fatura está pronta", body: "A sua fatura de {amount} está disponível na página segura da Stripe.", cta: "Ver fatura" },
      annual_renewal_reminder: { subject: "A sua subscrição anual será renovada em breve", heading: "Lembrete de renovação anual", body: "A sua subscrição anual será renovada em {date} por {amount}, salvo cancelamento prévio nos termos das Condições.", cta: "Gerir subscrição" },
      monthly_renewal_reminder: { subject: "A sua subscrição mensal será renovada em breve", heading: "Lembrete de renovação mensal", body: "A sua subscrição mensal será renovada em {date} por {amount}, salvo pausa ou cancelamento prévio.", cta: "Gerir subscrição" },
    },
  },
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[char] as string);
}

function interpolate(value: string, data: Record<string, string>): string {
  return value.replace(/\{(\w+)\}/g, (_, key: string) => data[key] ?? "");
}

export function renderTransactionalEmail(input: {
  template: TransactionalTemplate;
  locale: Locale;
  name: string;
  reference?: string;
  date?: string;
  amount?: string;
  details?: string;
  actionUrl?: string;
}): { subject: string; html: string } {
  const localeCopy = COPY[input.locale] ?? COPY.en;
  const copy = localeCopy.templates[input.template];
  const data = Object.fromEntries(Object.entries({
    name: input.name,
    reference: input.reference ?? "",
    date: input.date ?? "",
    amount: input.amount ?? "",
    details: input.details ?? "",
  }).map(([key, value]) => [key, escapeHtml(value)]));
  const dir = input.locale === "ar" ? "rtl" : "ltr";
  const button = input.actionUrl
    ? `<a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;margin-top:24px;padding:13px 24px;border-radius:999px;background:#2f4a29;color:#fffaf0;text-decoration:none;font-weight:600;">${escapeHtml(copy.cta)}</a>`
    : "";
  const html = `<!doctype html><html lang="${input.locale}" dir="${dir}"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f6f1e8;color:#25231f;font-family:Arial,Helvetica,sans-serif;"><div style="padding:32px 16px;"><div style="max-width:600px;margin:auto;background:#fffdf8;border:1px solid #e7ddca;border-radius:24px;overflow:hidden;"><div style="height:6px;background:#b8924f"></div><div style="padding:36px 32px;"><div style="font-family:Georgia,serif;font-size:22px;color:#2f4a29">Dar Tahara</div><p style="margin:28px 0 0;font-size:14px;color:#806b4c">${interpolate(localeCopy.greeting, data)}</p><h1 style="font-family:Georgia,serif;font-size:30px;line-height:1.2;margin:12px 0 16px;color:#25231f">${escapeHtml(copy.heading)}</h1><p style="font-size:16px;line-height:1.7;margin:0;color:#5d5549">${interpolate(copy.body, data)}</p>${button}</div><div style="padding:20px 32px;background:#f8f4ec;color:#8b7a62;font-size:12px;line-height:1.5">${escapeHtml(localeCopy.footer)}</div></div></div></body></html>`;
  return { subject: interpolate(copy.subject, data), html };
}

export async function sendTransactionalEmail(input: Parameters<typeof renderTransactionalEmail>[0] & { email: string }): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAILING_FROM_EMAIL;
  if (!apiKey || !from) return { sent: false, reason: "email_provider_not_configured" };
  const rendered = renderTransactionalEmail(input);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: input.email, subject: rendered.subject, html: rendered.html }),
      cache: "no-store",
    });
    return { sent: res.ok, reason: res.ok ? undefined : `provider_${res.status}` };
  } catch {
    return { sent: false, reason: "provider_error" };
  }
}
