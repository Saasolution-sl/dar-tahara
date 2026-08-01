import "server-only";
import type { Locale } from "@/i18n/config";

export type TransactionalTemplate =
  | "booking_confirmation"
  | "payment_confirmation"
  | "appointment_reminder"
  | "assessment_completed"
  | "subscription_activated"
  | "subscription_proposal"
  | "subscription_declined"
  | "invoice"
  | "annual_renewal_reminder"
  | "monthly_renewal_reminder"
  | "pause_request_confirmation"
  | "pause_request_approved"
  | "pause_request_rejected"
  | "pause_starting_reminder"
  | "subscription_resumption_reminder"
  | "subscription_resumed_confirmation"
  | "deep_clean_request_confirmation"
  | "deep_clean_request_approved"
  | "deep_clean_request_rejected"
  | "payment_required_suspended"
  | "payment_required_final_notice"
  | "cancellation_request_received"
  | "final_settlement_generated"
  | "final_settlement_reminder"
  | "cancellation_completed"
  | "cancellation_voided";

type TemplateCopy = { subject: string; heading: string; body: string; cta: string; secondaryCta?: string };
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
      subscription_proposal: { subject: "Your subscription proposal is ready", heading: "Your personalised proposal is ready", body: "The assessment identified details that affect the service plan. Your recommended recurring amount is {amount}. Sign in to review the proposal and choose whether to proceed.", cta: "Review proposal" },
      subscription_declined: { subject: "Update following your Home Assessment", heading: "Assessment outcome", body: "After careful review, we are unable to offer an ongoing subscription for this property at present. Your assessment record remains available and our team can answer any questions.", cta: "Contact our team" },
      invoice: { subject: "Dar Tahara invoice {reference}", heading: "Your invoice is ready", body: "Your invoice for {amount} is available. Stripe securely provides the hosted invoice and downloadable PDF.", cta: "View invoice" },
      annual_renewal_reminder: { subject: "Advance payment requested for your next prepaid term", heading: "Prepaid renewal payment", body: "Your current paid subscription remains active through {date}. To begin the next prepaid term, complete the advance payment of {amount} using the secure link below. If payment is not completed, the next term will not begin and services will end when the current paid term expires.", cta: "Pay renewal securely" },
      monthly_renewal_reminder: { subject: "Your monthly subscription renews soon", heading: "Monthly renewal reminder", body: "Your monthly Dar Tahara subscription will renew on {date} for {amount}, unless cancellation has already been scheduled through the customer portal in accordance with the Terms.", cta: "Manage subscription" },
      pause_request_confirmation: { subject: "We received your pause request", heading: "Your pause request is being reviewed", body: "We received your subscription pause request for {date} to {details}. Our team will review it and confirm shortly.", cta: "View request" },
      pause_request_approved: { subject: "Your subscription pause is approved", heading: "Your pause is confirmed", body: "Your subscription will be paused from {date} to {details}. Billing is suspended for this period and your contract end date has been extended accordingly.", cta: "View subscription" },
      pause_request_rejected: { subject: "Update on your pause request", heading: "Pause request not approved", body: "After review, we are unable to approve this pause request at this time. Our team can answer any questions about eligible reasons.", cta: "Contact our team" },
      pause_starting_reminder: { subject: "Your subscription pause starts today", heading: "Your pause has begun", body: "Your subscription pause is now in effect from {date} to {details}. No visits or billing will occur during this period.", cta: "View subscription" },
      subscription_resumption_reminder: { subject: "Your subscription resumes soon", heading: "Your pause is ending", body: "Your subscription pause is ending and regular visits and billing will resume shortly. No action is required.", cta: "View subscription" },
      subscription_resumed_confirmation: { subject: "Your subscription is active again", heading: "Welcome back", body: "Your subscription has resumed and billing is active again at {amount}. Thank you for your patience.", cta: "View subscription" },
      deep_clean_request_confirmation: { subject: "We received your deep-clean request", heading: "Your deep-clean request is being reviewed", body: "We received your deep cleaning request for {date}. Our team will review it and confirm shortly.", cta: "View request" },
      deep_clean_request_approved: { subject: "Your deep clean is scheduled", heading: "Your deep clean is confirmed", body: "Your deep cleaning visit is scheduled for {date}. Our team will arrive as planned.", cta: "View subscription" },
      deep_clean_request_rejected: { subject: "Update on your deep-clean request", heading: "Deep-clean request not approved", body: "After review, we are unable to schedule this deep-clean request at this time. Our team can answer any questions.", cta: "Contact our team" },
      payment_required_suspended: { subject: "Payment required for {reference} — your services are temporarily suspended", heading: "Services temporarily suspended", body: "We were unable to process payment for invoice {reference} ({amount}). Your cleaning services have been suspended until this is resolved. Please complete payment by {date} to restore your services.", cta: "Pay now" },
      payment_required_final_notice: { subject: "Final notice — invoice {reference} is still unpaid", heading: "Your payment window is closing", body: "Invoice {reference} for {amount} remains unpaid. You have until {date} to complete payment and restore your services. If you no longer wish to continue your subscription, you may request early termination instead — this does not remove amounts you already owe, and may result in an additional final settlement.", cta: "Pay now", secondaryCta: "Request early termination" },
      cancellation_request_received: { subject: "We received your cancellation request", heading: "Your cancellation request is being processed", body: "We received your request to end subscription {reference} early. Based on your contract, the calculated amount is {amount}. This does not cancel any amounts you already owe. We will confirm the next steps shortly.", cta: "View subscription" },
      final_settlement_generated: { subject: "Early-termination settlement invoice — {reference}", heading: "Early-Termination Settlement Invoice", body: "Your original {originalTerm}-month contract has been recalculated to the applicable {replacementTerm}-month minimum term because it is ending early. Amount already paid: {amountPaid}. Price adjustment: {priceAdjustment}. Remaining minimum-term amount: {remainingTermAmount}. Final outstanding amount: {amount}. Please pay by {date}. Non-payment is handled under the approved Terms and may cause the cancellation request to lapse.", cta: "Pay settlement securely" },
      final_settlement_reminder: { subject: "Reminder: final settlement {reference} is still unpaid", heading: "Your settlement payment deadline is approaching", body: "Your final settlement of {amount} for subscription {reference} remains unpaid. Please complete payment by {date} to finalise the cancellation and avoid it being voided.", cta: "Pay settlement" },
      cancellation_completed: { subject: "Your subscription has been cancelled", heading: "Cancellation complete", body: "Subscription {reference} has been cancelled and future services have been stopped. Thank you for being a Dar Tahara customer.", cta: "View account" },
      cancellation_voided: { subject: "Your cancellation request has been voided", heading: "Cancellation voided — settlement unpaid", body: "The final settlement for subscription {reference} was not paid by the deadline, so the cancellation request has been voided and your original contract continues. Services remain suspended until the outstanding balance is resolved.", cta: "View invoices" },
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
      subscription_proposal: { subject: "Uw abonnementsvoorstel staat klaar", heading: "Uw persoonlijke voorstel staat klaar", body: "De beoordeling bracht details aan het licht die het serviceplan beïnvloeden. Het aanbevolen bedrag is {amount}.", cta: "Voorstel bekijken" },
      subscription_declined: { subject: "Update na uw Woningbeoordeling", heading: "Uitkomst van de beoordeling", body: "Na zorgvuldige beoordeling kunnen wij momenteel geen doorlopend abonnement voor deze woning aanbieden. Ons team beantwoordt graag uw vragen.", cta: "Contact opnemen" },
      invoice: { subject: "Dar Tahara-factuur {reference}", heading: "Uw factuur staat klaar", body: "Uw factuur van {amount} is beschikbaar via de beveiligde Stripe-factuurpagina.", cta: "Factuur bekijken" },
      annual_renewal_reminder: { subject: "Uw jaarabonnement wordt binnenkort verlengd", heading: "Herinnering jaarlijkse verlenging", body: "Uw jaarabonnement wordt op {date} verlengd voor {amount}, tenzij u vooraf opzegt volgens de Voorwaarden.", cta: "Abonnement beheren" },
      monthly_renewal_reminder: { subject: "Uw maandabonnement wordt binnenkort verlengd", heading: "Herinnering maandelijkse verlenging", body: "Uw maandabonnement wordt op {date} verlengd voor {amount}, tenzij de opzegging volgens de Voorwaarden al via het klantenportaal is gepland.", cta: "Abonnement beheren" },
      pause_request_confirmation: { subject: "We hebben uw pauzeverzoek ontvangen", heading: "Uw pauzeverzoek wordt beoordeeld", body: "We hebben uw verzoek ontvangen om uw abonnement te pauzeren van {date} tot {details}. Ons team beoordeelt dit en bevestigt binnenkort.", cta: "Verzoek bekijken" },
      pause_request_approved: { subject: "Uw abonnementspauze is goedgekeurd", heading: "Uw pauze is bevestigd", body: "Uw abonnement wordt gepauzeerd van {date} tot {details}. De facturering wordt voor deze periode opgeschort en uw contracteinddatum is dienovereenkomstig verlengd.", cta: "Abonnement bekijken" },
      pause_request_rejected: { subject: "Update over uw pauzeverzoek", heading: "Pauzeverzoek niet goedgekeurd", body: "Na beoordeling kunnen wij dit pauzeverzoek op dit moment niet goedkeuren. Ons team beantwoordt graag vragen over geldige redenen.", cta: "Contact opnemen" },
      pause_starting_reminder: { subject: "Uw abonnementspauze begint vandaag", heading: "Uw pauze is begonnen", body: "Uw abonnementspauze is nu van kracht van {date} tot {details}. Er vinden geen bezoeken of facturering plaats in deze periode.", cta: "Abonnement bekijken" },
      subscription_resumption_reminder: { subject: "Uw abonnement wordt binnenkort hervat", heading: "Uw pauze eindigt", body: "Uw abonnementspauze eindigt binnenkort en de reguliere bezoeken en facturering worden hervat. Geen actie vereist.", cta: "Abonnement bekijken" },
      subscription_resumed_confirmation: { subject: "Uw abonnement is weer actief", heading: "Welkom terug", body: "Uw abonnement is hervat en de facturering is weer actief voor {amount}. Bedankt voor uw geduld.", cta: "Abonnement bekijken" },
      deep_clean_request_confirmation: { subject: "We hebben uw verzoek voor een grondige schoonmaak ontvangen", heading: "Uw verzoek wordt beoordeeld", body: "We hebben uw verzoek voor een grondige schoonmaak op {date} ontvangen. Ons team beoordeelt dit en bevestigt binnenkort.", cta: "Verzoek bekijken" },
      deep_clean_request_approved: { subject: "Uw grondige schoonmaak is gepland", heading: "Uw afspraak is bevestigd", body: "Uw grondige schoonmaakbeurt is gepland op {date}. Ons team komt zoals gepland langs.", cta: "Abonnement bekijken" },
      deep_clean_request_rejected: { subject: "Update over uw verzoek voor een grondige schoonmaak", heading: "Verzoek niet goedgekeurd", body: "Na beoordeling kunnen wij dit verzoek op dit moment niet inplannen. Ons team beantwoordt graag uw vragen.", cta: "Contact opnemen" },
      payment_required_suspended: { subject: "Betaling vereist voor {reference} — uw diensten zijn tijdelijk opgeschort", heading: "Diensten tijdelijk opgeschort", body: "We konden de betaling voor factuur {reference} ({amount}) niet verwerken. Uw schoonmaakdiensten zijn opgeschort totdat dit is opgelost. Betaal vóór {date} om uw diensten te herstellen.", cta: "Nu betalen" },
      payment_required_final_notice: { subject: "Laatste herinnering — factuur {reference} is nog onbetaald", heading: "Uw betalingstermijn loopt af", body: "Factuur {reference} van {amount} staat nog open. U heeft tot {date} om te betalen en uw diensten te herstellen. Wilt u uw abonnement niet voortzetten, dan kunt u in plaats daarvan vroegtijdige beëindiging aanvragen — dit verwijdert geen reeds verschuldigde bedragen en kan leiden tot een aanvullende eindafrekening.", cta: "Nu betalen", secondaryCta: "Vroegtijdige beëindiging aanvragen" },
      cancellation_request_received: { subject: "We hebben uw opzeggingsverzoek ontvangen", heading: "Uw opzeggingsverzoek wordt verwerkt", body: "We hebben uw verzoek ontvangen om abonnement {reference} vroegtijdig te beëindigen. Op basis van uw contract bedraagt het berekende bedrag {amount}. Dit annuleert geen reeds verschuldigde bedragen. We bevestigen de volgende stappen binnenkort.", cta: "Abonnement bekijken" },
      final_settlement_generated: { subject: "Uw eindafrekening is klaar — {reference}", heading: "Eindafrekening gegenereerd", body: "Uw eindafrekening voor vroegtijdige beëindiging van abonnement {reference} bedraagt {amount}. Voltooi de betaling vóór {date} om de opzegging af te ronden.", cta: "Afrekening betalen" },
      final_settlement_reminder: { subject: "Herinnering: eindafrekening {reference} is nog onbetaald", heading: "Uw betalingstermijn voor de afrekening nadert", body: "Uw eindafrekening van {amount} voor abonnement {reference} staat nog open. Voltooi de betaling vóór {date} om de opzegging af te ronden en te voorkomen dat deze vervalt.", cta: "Afrekening betalen" },
      cancellation_completed: { subject: "Uw abonnement is opgezegd", heading: "Opzegging voltooid", body: "Abonnement {reference} is opgezegd en toekomstige diensten zijn stopgezet. Bedankt dat u klant was bij Dar Tahara.", cta: "Account bekijken" },
      cancellation_voided: { subject: "Uw opzeggingsverzoek is vervallen", heading: "Opzegging vervallen — afrekening onbetaald", body: "De eindafrekening voor abonnement {reference} is niet vóór de deadline betaald, waardoor het opzeggingsverzoek is vervallen en uw oorspronkelijke contract wordt voortgezet. De diensten blijven opgeschort totdat het openstaande bedrag is voldaan.", cta: "Facturen bekijken" },
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
      subscription_proposal: { subject: "Votre proposition d’abonnement est prête", heading: "Votre proposition personnalisée est prête", body: "L’évaluation a révélé des éléments ayant une incidence sur le service. Le montant recommandé est de {amount}.", cta: "Consulter la proposition" },
      subscription_declined: { subject: "Suite à votre Évaluation du Domicile", heading: "Résultat de l’évaluation", body: "Après examen attentif, nous ne pouvons pas proposer d’abonnement continu pour ce bien actuellement. Notre équipe reste disponible pour répondre à vos questions.", cta: "Contacter l’équipe" },
      invoice: { subject: "Facture Dar Tahara {reference}", heading: "Votre facture est disponible", body: "Votre facture de {amount} est disponible sur la page sécurisée Stripe.", cta: "Voir la facture" },
      annual_renewal_reminder: { subject: "Votre abonnement annuel sera bientôt renouvelé", heading: "Rappel de renouvellement annuel", body: "Votre abonnement annuel sera renouvelé le {date} pour {amount}, sauf résiliation préalable conformément aux Conditions.", cta: "Gérer l’abonnement" },
      monthly_renewal_reminder: { subject: "Votre abonnement mensuel sera bientôt renouvelé", heading: "Rappel de renouvellement mensuel", body: "Votre abonnement mensuel sera renouvelé le {date} pour {amount}, sauf si la résiliation a déjà été programmée dans le portail client conformément aux Conditions.", cta: "Gérer l’abonnement" },
      pause_request_confirmation: { subject: "Nous avons reçu votre demande de pause", heading: "Votre demande de pause est en cours d’examen", body: "Nous avons reçu votre demande de mise en pause de l’abonnement du {date} au {details}. Notre équipe l’examinera et vous confirmera sous peu.", cta: "Voir la demande" },
      pause_request_approved: { subject: "Votre pause d’abonnement est approuvée", heading: "Votre pause est confirmée", body: "Votre abonnement sera mis en pause du {date} au {details}. La facturation est suspendue pendant cette période et la date de fin de votre contrat a été prolongée en conséquence.", cta: "Voir l’abonnement" },
      pause_request_rejected: { subject: "Mise à jour concernant votre demande de pause", heading: "Demande de pause non approuvée", body: "Après examen, nous ne pouvons pas approuver cette demande de pause pour le moment. Notre équipe reste disponible pour toute question sur les motifs éligibles.", cta: "Contacter l’équipe" },
      pause_starting_reminder: { subject: "Votre pause d’abonnement commence aujourd’hui", heading: "Votre pause a commencé", body: "Votre pause d’abonnement est désormais effective du {date} au {details}. Aucune visite ni facturation n’aura lieu pendant cette période.", cta: "Voir l’abonnement" },
      subscription_resumption_reminder: { subject: "Votre abonnement reprend bientôt", heading: "Votre pause touche à sa fin", body: "Votre pause d’abonnement touche à sa fin et les visites et la facturation habituelles reprendront prochainement. Aucune action requise.", cta: "Voir l’abonnement" },
      subscription_resumed_confirmation: { subject: "Votre abonnement est de nouveau actif", heading: "Bon retour", body: "Votre abonnement a repris et la facturation est de nouveau active pour {amount}. Merci de votre patience.", cta: "Voir l’abonnement" },
      deep_clean_request_confirmation: { subject: "Nous avons reçu votre demande de nettoyage en profondeur", heading: "Votre demande est en cours d’examen", body: "Nous avons reçu votre demande de nettoyage en profondeur pour le {date}. Notre équipe l’examinera et vous confirmera sous peu.", cta: "Voir la demande" },
      deep_clean_request_approved: { subject: "Votre nettoyage en profondeur est programmé", heading: "Votre rendez-vous est confirmé", body: "Votre nettoyage en profondeur est programmé pour le {date}. Notre équipe se présentera comme prévu.", cta: "Voir l’abonnement" },
      deep_clean_request_rejected: { subject: "Mise à jour concernant votre demande de nettoyage en profondeur", heading: "Demande non approuvée", body: "Après examen, nous ne pouvons pas programmer cette demande pour le moment. Notre équipe reste disponible pour toute question.", cta: "Contacter l’équipe" },
      payment_required_suspended: { subject: "Paiement requis pour {reference} — vos services sont temporairement suspendus", heading: "Services temporairement suspendus", body: "Nous n’avons pas pu traiter le paiement de la facture {reference} ({amount}). Vos services de ménage ont été suspendus jusqu’à résolution. Merci de régler avant le {date} pour rétablir vos services.", cta: "Payer maintenant" },
      payment_required_final_notice: { subject: "Dernier avis — la facture {reference} reste impayée", heading: "Votre délai de paiement touche à sa fin", body: "La facture {reference} de {amount} reste impayée. Vous avez jusqu’au {date} pour régler et rétablir vos services. Si vous ne souhaitez plus poursuivre votre abonnement, vous pouvez demander une résiliation anticipée — cela ne supprime pas les montants déjà dus et peut donner lieu à un décompte final supplémentaire.", cta: "Payer maintenant", secondaryCta: "Demander une résiliation anticipée" },
      cancellation_request_received: { subject: "Nous avons reçu votre demande de résiliation", heading: "Votre demande de résiliation est en cours de traitement", body: "Nous avons reçu votre demande de résiliation anticipée de l’abonnement {reference}. Selon votre contrat, le montant calculé est de {amount}. Cela n’annule pas les montants déjà dus. Nous confirmerons les prochaines étapes sous peu.", cta: "Voir l’abonnement" },
      final_settlement_generated: { subject: "Votre facture de décompte final est prête — {reference}", heading: "Décompte final généré", body: "Votre décompte de résiliation anticipée pour l’abonnement {reference} s’élève à {amount}. Merci de régler avant le {date} pour finaliser la résiliation.", cta: "Payer le décompte" },
      final_settlement_reminder: { subject: "Rappel : le décompte final {reference} reste impayé", heading: "Votre délai de paiement du décompte approche", body: "Votre décompte final de {amount} pour l’abonnement {reference} reste impayé. Merci de régler avant le {date} pour finaliser la résiliation et éviter son annulation.", cta: "Payer le décompte" },
      cancellation_completed: { subject: "Votre abonnement a été résilié", heading: "Résiliation terminée", body: "L’abonnement {reference} a été résilié et les services futurs ont été arrêtés. Merci d’avoir été client chez Dar Tahara.", cta: "Voir le compte" },
      cancellation_voided: { subject: "Votre demande de résiliation a été annulée", heading: "Résiliation annulée — décompte impayé", body: "Le décompte final de l’abonnement {reference} n’a pas été payé avant l’échéance ; la demande de résiliation est donc annulée et votre contrat initial se poursuit. Les services restent suspendus jusqu’au règlement du solde dû.", cta: "Voir les factures" },
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
      subscription_proposal: { subject: "مقترح اشتراكك جاهز", heading: "مقترحك المخصص جاهز", body: "كشف التقييم تفاصيل تؤثر في خطة الخدمة. المبلغ المقترح هو {amount}.", cta: "مراجعة المقترح" },
      subscription_declined: { subject: "تحديث بعد تقييم المنزل", heading: "نتيجة التقييم", body: "بعد مراجعة دقيقة، لا يمكننا تقديم اشتراك مستمر لهذا العقار حالياً. فريقنا متاح للإجابة عن أسئلتكم.", cta: "التواصل مع الفريق" },
      invoice: { subject: "فاتورة دار طهارة {reference}", heading: "فاتورتك جاهزة", body: "فاتورتك بقيمة {amount} متاحة عبر صفحة Stripe الآمنة.", cta: "عرض الفاتورة" },
      annual_renewal_reminder: { subject: "سيُجدّد اشتراكك السنوي قريباً", heading: "تذكير بالتجديد السنوي", body: "سيُجدّد اشتراكك السنوي بتاريخ {date} مقابل {amount} ما لم يتم الإلغاء مسبقاً وفق الشروط.", cta: "إدارة الاشتراك" },
      monthly_renewal_reminder: { subject: "سيُجدّد اشتراكك الشهري قريباً", heading: "تذكير بالتجديد الشهري", body: "سيُجدّد اشتراكك الشهري بتاريخ {date} مقابل {amount} ما لم يكن الإلغاء قد جُدول مسبقاً عبر بوابة العميل وفق الشروط.", cta: "إدارة الاشتراك" },
      pause_request_confirmation: { subject: "استلمنا طلب إيقاف اشتراكك مؤقتاً", heading: "طلب الإيقاف المؤقت قيد المراجعة", body: "استلمنا طلبك لإيقاف الاشتراك مؤقتاً من {date} إلى {details}. سيراجعه فريقنا ويؤكده قريباً.", cta: "عرض الطلب" },
      pause_request_approved: { subject: "تمت الموافقة على إيقاف اشتراكك مؤقتاً", heading: "تم تأكيد الإيقاف المؤقت", body: "سيتم إيقاف اشتراكك مؤقتاً من {date} إلى {details}. تُعلَّق الفوترة خلال هذه الفترة وتم تمديد تاريخ نهاية عقدك وفقاً لذلك.", cta: "عرض الاشتراك" },
      pause_request_rejected: { subject: "تحديث بخصوص طلب الإيقاف المؤقت", heading: "لم تتم الموافقة على طلب الإيقاف", body: "بعد المراجعة، لا يمكننا الموافقة على طلب الإيقاف هذا حالياً. فريقنا متاح للإجابة عن أي أسئلة حول الأسباب المقبولة.", cta: "التواصل مع الفريق" },
      pause_starting_reminder: { subject: "يبدأ إيقاف اشتراكك اليوم", heading: "بدأ إيقافك المؤقت", body: "أصبح إيقاف اشتراكك سارياً الآن من {date} إلى {details}. لن تحدث أي زيارات أو فوترة خلال هذه الفترة.", cta: "عرض الاشتراك" },
      subscription_resumption_reminder: { subject: "سيُستأنف اشتراكك قريباً", heading: "إيقافك المؤقت يقترب من نهايته", body: "يقترب إيقاف اشتراكك المؤقت من نهايته، وستُستأنف الزيارات والفوترة المعتادة قريباً. لا حاجة لأي إجراء.", cta: "عرض الاشتراك" },
      subscription_resumed_confirmation: { subject: "اشتراكك نشط من جديد", heading: "مرحباً بعودتك", body: "استؤنف اشتراكك وأصبحت الفوترة نشطة من جديد بقيمة {amount}. شكراً لصبركم.", cta: "عرض الاشتراك" },
      deep_clean_request_confirmation: { subject: "استلمنا طلب التنظيف العميق", heading: "طلبك قيد المراجعة", body: "استلمنا طلبك للتنظيف العميق بتاريخ {date}. سيراجعه فريقنا ويؤكده قريباً.", cta: "عرض الطلب" },
      deep_clean_request_approved: { subject: "تم جدولة التنظيف العميق", heading: "تم تأكيد موعدك", body: "تم جدولة زيارة التنظيف العميق بتاريخ {date}. سيصل فريقنا في الموعد المحدد.", cta: "عرض الاشتراك" },
      deep_clean_request_rejected: { subject: "تحديث بخصوص طلب التنظيف العميق", heading: "لم تتم الموافقة على الطلب", body: "بعد المراجعة، لا يمكننا جدولة هذا الطلب حالياً. فريقنا متاح للإجابة عن أي أسئلة.", cta: "التواصل مع الفريق" },
      payment_required_suspended: { subject: "الدفع مطلوب للفاتورة {reference} — تم إيقاف خدماتك مؤقتاً", heading: "تم إيقاف الخدمات مؤقتاً", body: "لم نتمكن من معالجة الدفع للفاتورة {reference} ({amount}). تم إيقاف خدمات التنظيف لديك مؤقتاً حتى يتم حل هذا الأمر. يرجى إتمام الدفع قبل {date} لاستعادة خدماتك.", cta: "الدفع الآن" },
      payment_required_final_notice: { subject: "إشعار أخير — الفاتورة {reference} لا تزال غير مدفوعة", heading: "مهلة الدفع توشك على الانتهاء", body: "لا تزال الفاتورة {reference} بقيمة {amount} غير مدفوعة. أمامك مهلة حتى {date} لإتمام الدفع واستعادة خدماتك. إذا كنت لا ترغب في الاستمرار في اشتراكك، يمكنك بدلاً من ذلك طلب الإنهاء المبكر — لا يؤدي هذا إلى إلغاء المبالغ المستحقة عليك بالفعل، وقد يترتب عليه فاتورة تسوية نهائية إضافية.", cta: "الدفع الآن", secondaryCta: "طلب الإنهاء المبكر" },
      cancellation_request_received: { subject: "استلمنا طلب إلغاء اشتراكك", heading: "طلب الإلغاء قيد المعالجة", body: "استلمنا طلبك لإنهاء الاشتراك {reference} مبكراً. بناءً على عقدك، المبلغ المحسوب هو {amount}. هذا لا يلغي أي مبالغ مستحقة عليك بالفعل. سنؤكد الخطوات التالية قريباً.", cta: "عرض الاشتراك" },
      final_settlement_generated: { subject: "فاتورة التسوية النهائية جاهزة — {reference}", heading: "تم إصدار فاتورة التسوية النهائية", body: "تبلغ تسوية الإنهاء المبكر لاشتراكك {reference} {amount}. يرجى إتمام الدفع قبل {date} لإتمام الإلغاء.", cta: "دفع التسوية" },
      final_settlement_reminder: { subject: "تذكير: التسوية النهائية {reference} لا تزال غير مدفوعة", heading: "موعد دفع التسوية يقترب", body: "لا تزال تسويتك النهائية البالغة {amount} لاشتراك {reference} غير مدفوعة. يرجى إتمام الدفع قبل {date} لإتمام الإلغاء وتجنب إبطاله.", cta: "دفع التسوية" },
      cancellation_completed: { subject: "تم إلغاء اشتراكك", heading: "اكتمل الإلغاء", body: "تم إلغاء الاشتراك {reference} وتم إيقاف الخدمات المستقبلية. شكراً لكونك عميلاً لدى دار طهارة.", cta: "عرض الحساب" },
      cancellation_voided: { subject: "تم إبطال طلب إلغاء اشتراكك", heading: "تم إبطال الإلغاء — التسوية غير مدفوعة", body: "لم تُدفع التسوية النهائية لاشتراك {reference} قبل الموعد النهائي، لذا تم إبطال طلب الإلغاء واستمرار عقدك الأصلي. تبقى الخدمات موقوفة حتى يتم تسوية الرصيد المستحق.", cta: "عرض الفواتير" },
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
      subscription_proposal: { subject: "Tu propuesta de suscripción está lista", heading: "Tu propuesta personalizada está lista", body: "La evaluación identificó aspectos que afectan al servicio. El importe recomendado es de {amount}.", cta: "Revisar propuesta" },
      subscription_declined: { subject: "Actualización tras tu Evaluación del Hogar", heading: "Resultado de la evaluación", body: "Tras una revisión cuidadosa, actualmente no podemos ofrecer una suscripción continua para esta vivienda. Nuestro equipo responderá tus preguntas.", cta: "Contactar al equipo" },
      invoice: { subject: "Factura Dar Tahara {reference}", heading: "Tu factura está lista", body: "Tu factura de {amount} está disponible en la página segura de Stripe.", cta: "Ver factura" },
      annual_renewal_reminder: { subject: "Tu suscripción anual se renovará pronto", heading: "Recordatorio de renovación anual", body: "Tu suscripción anual se renovará el {date} por {amount}, salvo cancelación previa según las Condiciones.", cta: "Gestionar suscripción" },
      monthly_renewal_reminder: { subject: "Tu suscripción mensual se renovará pronto", heading: "Recordatorio de renovación mensual", body: "Tu suscripción mensual se renovará el {date} por {amount}, salvo que la cancelación ya se haya programado en el portal según las Condiciones.", cta: "Gestionar suscripción" },
      pause_request_confirmation: { subject: "Hemos recibido tu solicitud de pausa", heading: "Tu solicitud de pausa está en revisión", body: "Hemos recibido tu solicitud para pausar la suscripción del {date} al {details}. Nuestro equipo la revisará y confirmará en breve.", cta: "Ver solicitud" },
      pause_request_approved: { subject: "Tu pausa de suscripción está aprobada", heading: "Tu pausa está confirmada", body: "Tu suscripción se pausará del {date} al {details}. La facturación se suspende durante este período y la fecha de fin de tu contrato se ha ampliado en consecuencia.", cta: "Ver suscripción" },
      pause_request_rejected: { subject: "Actualización sobre tu solicitud de pausa", heading: "Solicitud de pausa no aprobada", body: "Tras la revisión, no podemos aprobar esta solicitud de pausa en este momento. Nuestro equipo puede responder cualquier pregunta sobre los motivos válidos.", cta: "Contactar al equipo" },
      pause_starting_reminder: { subject: "Tu pausa de suscripción comienza hoy", heading: "Tu pausa ha comenzado", body: "Tu pausa de suscripción ya está vigente del {date} al {details}. No habrá visitas ni facturación durante este período.", cta: "Ver suscripción" },
      subscription_resumption_reminder: { subject: "Tu suscripción se reanuda pronto", heading: "Tu pausa está terminando", body: "Tu pausa de suscripción está terminando y las visitas y la facturación habituales se reanudarán pronto. No se requiere ninguna acción.", cta: "Ver suscripción" },
      subscription_resumed_confirmation: { subject: "Tu suscripción está activa de nuevo", heading: "Bienvenido de nuevo", body: "Tu suscripción se ha reanudado y la facturación está activa de nuevo por {amount}. Gracias por tu paciencia.", cta: "Ver suscripción" },
      deep_clean_request_confirmation: { subject: "Hemos recibido tu solicitud de limpieza profunda", heading: "Tu solicitud está en revisión", body: "Hemos recibido tu solicitud de limpieza profunda para el {date}. Nuestro equipo la revisará y confirmará en breve.", cta: "Ver solicitud" },
      deep_clean_request_approved: { subject: "Tu limpieza profunda está programada", heading: "Tu cita está confirmada", body: "Tu visita de limpieza profunda está programada para el {date}. Nuestro equipo llegará según lo previsto.", cta: "Ver suscripción" },
      deep_clean_request_rejected: { subject: "Actualización sobre tu solicitud de limpieza profunda", heading: "Solicitud no aprobada", body: "Tras la revisión, no podemos programar esta solicitud en este momento. Nuestro equipo puede responder cualquier pregunta.", cta: "Contactar al equipo" },
      payment_required_suspended: { subject: "Pago requerido para {reference} — tus servicios están temporalmente suspendidos", heading: "Servicios temporalmente suspendidos", body: "No pudimos procesar el pago de la factura {reference} ({amount}). Tus servicios de limpieza se han suspendido hasta resolver esto. Completa el pago antes del {date} para restablecer tus servicios.", cta: "Pagar ahora" },
      payment_required_final_notice: { subject: "Aviso final — la factura {reference} sigue sin pagarse", heading: "Tu plazo de pago está por terminar", body: "La factura {reference} de {amount} sigue pendiente de pago. Tienes hasta el {date} para completar el pago y restablecer tus servicios. Si ya no deseas continuar con tu suscripción, puedes solicitar la terminación anticipada en su lugar — esto no elimina los importes ya adeudados y puede generar una liquidación final adicional.", cta: "Pagar ahora", secondaryCta: "Solicitar terminación anticipada" },
      cancellation_request_received: { subject: "Hemos recibido tu solicitud de cancelación", heading: "Tu solicitud de cancelación está siendo procesada", body: "Hemos recibido tu solicitud para finalizar anticipadamente la suscripción {reference}. Según tu contrato, el importe calculado es de {amount}. Esto no cancela los importes ya adeudados. Confirmaremos los siguientes pasos en breve.", cta: "Ver suscripción" },
      final_settlement_generated: { subject: "Tu factura de liquidación final está lista — {reference}", heading: "Liquidación final generada", body: "Tu liquidación por terminación anticipada de la suscripción {reference} asciende a {amount}. Completa el pago antes del {date} para finalizar la cancelación.", cta: "Pagar liquidación" },
      final_settlement_reminder: { subject: "Recordatorio: la liquidación final {reference} sigue sin pagarse", heading: "Tu plazo de pago de la liquidación se acerca", body: "Tu liquidación final de {amount} para la suscripción {reference} sigue pendiente de pago. Completa el pago antes del {date} para finalizar la cancelación y evitar que se anule.", cta: "Pagar liquidación" },
      cancellation_completed: { subject: "Tu suscripción ha sido cancelada", heading: "Cancelación completada", body: "La suscripción {reference} ha sido cancelada y los servicios futuros se han detenido. Gracias por ser cliente de Dar Tahara.", cta: "Ver cuenta" },
      cancellation_voided: { subject: "Tu solicitud de cancelación ha sido anulada", heading: "Cancelación anulada — liquidación impagada", body: "La liquidación final de la suscripción {reference} no se pagó antes del plazo, por lo que la solicitud de cancelación ha sido anulada y tu contrato original continúa. Los servicios permanecen suspendidos hasta que se resuelva el saldo pendiente.", cta: "Ver facturas" },
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
      subscription_proposal: { subject: "Ihr Abonnementvorschlag ist bereit", heading: "Ihr persönlicher Vorschlag ist bereit", body: "Die Einschätzung ergab Punkte mit Einfluss auf den Service. Der empfohlene Betrag ist {amount}.", cta: "Vorschlag prüfen" },
      subscription_declined: { subject: "Update nach Ihrer Hauseinschätzung", heading: "Ergebnis der Einschätzung", body: "Nach sorgfältiger Prüfung können wir derzeit kein laufendes Abonnement für diese Immobilie anbieten. Unser Team beantwortet Ihre Fragen gern.", cta: "Team kontaktieren" },
      invoice: { subject: "Dar Tahara-Rechnung {reference}", heading: "Ihre Rechnung ist bereit", body: "Ihre Rechnung über {amount} ist auf der sicheren Stripe-Seite verfügbar.", cta: "Rechnung ansehen" },
      annual_renewal_reminder: { subject: "Ihr Jahresabonnement verlängert sich bald", heading: "Erinnerung an die Jahresverlängerung", body: "Ihr Jahresabonnement verlängert sich am {date} für {amount}, sofern es nicht vorher gemäß den Bedingungen gekündigt wird.", cta: "Abonnement verwalten" },
      monthly_renewal_reminder: { subject: "Ihr Monatsabonnement verlängert sich bald", heading: "Erinnerung an die Monatsverlängerung", body: "Ihr Monatsabonnement verlängert sich am {date} für {amount}, sofern die Kündigung nicht bereits gemäß den Bedingungen im Kundenportal geplant wurde.", cta: "Abonnement verwalten" },
      pause_request_confirmation: { subject: "Wir haben Ihren Pausenantrag erhalten", heading: "Ihr Pausenantrag wird geprüft", body: "Wir haben Ihren Antrag erhalten, das Abonnement vom {date} bis {details} zu pausieren. Unser Team prüft dies und bestätigt in Kürze.", cta: "Antrag ansehen" },
      pause_request_approved: { subject: "Ihre Abonnementpause ist genehmigt", heading: "Ihre Pause ist bestätigt", body: "Ihr Abonnement wird vom {date} bis {details} pausiert. Die Abrechnung wird für diesen Zeitraum ausgesetzt und Ihr Vertragsende wurde entsprechend verlängert.", cta: "Abonnement ansehen" },
      pause_request_rejected: { subject: "Update zu Ihrem Pausenantrag", heading: "Pausenantrag nicht genehmigt", body: "Nach Prüfung können wir diesen Pausenantrag derzeit nicht genehmigen. Unser Team beantwortet gerne Fragen zu zulässigen Gründen.", cta: "Team kontaktieren" },
      pause_starting_reminder: { subject: "Ihre Abonnementpause beginnt heute", heading: "Ihre Pause hat begonnen", body: "Ihre Abonnementpause gilt nun vom {date} bis {details}. In diesem Zeitraum finden keine Besuche oder Abrechnungen statt.", cta: "Abonnement ansehen" },
      subscription_resumption_reminder: { subject: "Ihr Abonnement wird bald fortgesetzt", heading: "Ihre Pause endet bald", body: "Ihre Abonnementpause endet bald und die regulären Besuche und Abrechnungen werden fortgesetzt. Es ist keine Handlung erforderlich.", cta: "Abonnement ansehen" },
      subscription_resumed_confirmation: { subject: "Ihr Abonnement ist wieder aktiv", heading: "Willkommen zurück", body: "Ihr Abonnement wurde fortgesetzt und die Abrechnung ist wieder aktiv für {amount}. Vielen Dank für Ihre Geduld.", cta: "Abonnement ansehen" },
      deep_clean_request_confirmation: { subject: "Wir haben Ihre Anfrage für eine Grundreinigung erhalten", heading: "Ihre Anfrage wird geprüft", body: "Wir haben Ihre Anfrage für eine Grundreinigung am {date} erhalten. Unser Team prüft dies und bestätigt in Kürze.", cta: "Anfrage ansehen" },
      deep_clean_request_approved: { subject: "Ihre Grundreinigung ist geplant", heading: "Ihr Termin ist bestätigt", body: "Ihre Grundreinigung ist für den {date} geplant. Unser Team kommt wie geplant vorbei.", cta: "Abonnement ansehen" },
      deep_clean_request_rejected: { subject: "Update zu Ihrer Anfrage für eine Grundreinigung", heading: "Anfrage nicht genehmigt", body: "Nach Prüfung können wir diese Anfrage derzeit nicht einplanen. Unser Team beantwortet gerne Fragen.", cta: "Team kontaktieren" },
      payment_required_suspended: { subject: "Zahlung erforderlich für {reference} — Ihre Leistungen sind vorübergehend ausgesetzt", heading: "Leistungen vorübergehend ausgesetzt", body: "Wir konnten die Zahlung für Rechnung {reference} ({amount}) nicht verarbeiten. Ihre Reinigungsleistungen wurden bis zur Klärung ausgesetzt. Bitte zahlen Sie bis {date}, um Ihre Leistungen wiederherzustellen.", cta: "Jetzt bezahlen" },
      payment_required_final_notice: { subject: "Letzte Mahnung — Rechnung {reference} ist weiterhin unbezahlt", heading: "Ihre Zahlungsfrist läuft bald ab", body: "Rechnung {reference} über {amount} ist weiterhin unbezahlt. Sie haben bis {date} Zeit, die Zahlung abzuschließen und Ihre Leistungen wiederherzustellen. Falls Sie Ihr Abonnement nicht fortsetzen möchten, können Sie stattdessen eine vorzeitige Kündigung beantragen — dies entbindet Sie nicht von bereits geschuldeten Beträgen und kann zu einer zusätzlichen Endabrechnung führen.", cta: "Jetzt bezahlen", secondaryCta: "Vorzeitige Kündigung beantragen" },
      cancellation_request_received: { subject: "Wir haben Ihre Kündigungsanfrage erhalten", heading: "Ihre Kündigungsanfrage wird bearbeitet", body: "Wir haben Ihre Anfrage zur vorzeitigen Beendigung des Abonnements {reference} erhalten. Gemäß Ihrem Vertrag beträgt der berechnete Betrag {amount}. Dies entbindet Sie nicht von bereits geschuldeten Beträgen. Wir bestätigen die nächsten Schritte in Kürze.", cta: "Abonnement ansehen" },
      final_settlement_generated: { subject: "Ihre Endabrechnung ist bereit — {reference}", heading: "Endabrechnung erstellt", body: "Ihre Endabrechnung für die vorzeitige Kündigung des Abonnements {reference} beträgt {amount}. Bitte zahlen Sie bis {date}, um die Kündigung abzuschließen.", cta: "Abrechnung bezahlen" },
      final_settlement_reminder: { subject: "Erinnerung: Endabrechnung {reference} ist weiterhin unbezahlt", heading: "Ihre Zahlungsfrist für die Abrechnung läuft bald ab", body: "Ihre Endabrechnung über {amount} für Abonnement {reference} ist weiterhin unbezahlt. Bitte zahlen Sie bis {date}, um die Kündigung abzuschließen und eine Aufhebung zu vermeiden.", cta: "Abrechnung bezahlen" },
      cancellation_completed: { subject: "Ihr Abonnement wurde gekündigt", heading: "Kündigung abgeschlossen", body: "Abonnement {reference} wurde gekündigt und zukünftige Leistungen wurden eingestellt. Vielen Dank, dass Sie Kunde bei Dar Tahara waren.", cta: "Konto ansehen" },
      cancellation_voided: { subject: "Ihre Kündigungsanfrage wurde aufgehoben", heading: "Kündigung aufgehoben — Abrechnung unbezahlt", body: "Die Endabrechnung für Abonnement {reference} wurde nicht fristgerecht bezahlt, daher wurde die Kündigungsanfrage aufgehoben und Ihr ursprünglicher Vertrag wird fortgesetzt. Die Leistungen bleiben ausgesetzt, bis der ausstehende Betrag beglichen ist.", cta: "Rechnungen ansehen" },
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
      subscription_proposal: { subject: "A sua proposta de subscrição está pronta", heading: "A sua proposta personalizada está pronta", body: "A avaliação identificou aspetos com impacto no serviço. O montante recomendado é de {amount}.", cta: "Rever proposta" },
      subscription_declined: { subject: "Atualização após a Avaliação da Casa", heading: "Resultado da avaliação", body: "Após análise cuidadosa, não podemos oferecer atualmente uma subscrição contínua para este imóvel. A nossa equipa está disponível para esclarecer dúvidas.", cta: "Contactar a equipa" },
      invoice: { subject: "Fatura Dar Tahara {reference}", heading: "A sua fatura está pronta", body: "A sua fatura de {amount} está disponível na página segura da Stripe.", cta: "Ver fatura" },
      annual_renewal_reminder: { subject: "A sua subscrição anual será renovada em breve", heading: "Lembrete de renovação anual", body: "A sua subscrição anual será renovada em {date} por {amount}, salvo cancelamento prévio nos termos das Condições.", cta: "Gerir subscrição" },
      monthly_renewal_reminder: { subject: "A sua subscrição mensal será renovada em breve", heading: "Lembrete de renovação mensal", body: "A sua subscrição mensal será renovada em {date} por {amount}, salvo se o cancelamento já tiver sido agendado no portal segundo as Condições.", cta: "Gerir subscrição" },
      pause_request_confirmation: { subject: "Recebemos o seu pedido de pausa", heading: "O seu pedido de pausa está em análise", body: "Recebemos o seu pedido para pausar a subscrição de {date} a {details}. A nossa equipa irá analisá-lo e confirmar em breve.", cta: "Ver pedido" },
      pause_request_approved: { subject: "A sua pausa de subscrição foi aprovada", heading: "A sua pausa está confirmada", body: "A sua subscrição será pausada de {date} a {details}. A faturação é suspensa durante este período e a data de fim do contrato foi prolongada em conformidade.", cta: "Ver subscrição" },
      pause_request_rejected: { subject: "Atualização sobre o seu pedido de pausa", heading: "Pedido de pausa não aprovado", body: "Após análise, não podemos aprovar este pedido de pausa neste momento. A nossa equipa está disponível para esclarecer dúvidas sobre motivos válidos.", cta: "Contactar a equipa" },
      pause_starting_reminder: { subject: "A sua pausa de subscrição começa hoje", heading: "A sua pausa começou", body: "A sua pausa de subscrição está agora em vigor de {date} a {details}. Não haverá visitas nem faturação durante este período.", cta: "Ver subscrição" },
      subscription_resumption_reminder: { subject: "A sua subscrição será retomada em breve", heading: "A sua pausa está a terminar", body: "A sua pausa de subscrição está a terminar e as visitas e faturação habituais serão retomadas em breve. Não é necessária qualquer ação.", cta: "Ver subscrição" },
      subscription_resumed_confirmation: { subject: "A sua subscrição está ativa novamente", heading: "Bem-vindo de volta", body: "A sua subscrição foi retomada e a faturação está ativa novamente por {amount}. Obrigado pela sua paciência.", cta: "Ver subscrição" },
      deep_clean_request_confirmation: { subject: "Recebemos o seu pedido de limpeza profunda", heading: "O seu pedido está em análise", body: "Recebemos o seu pedido de limpeza profunda para {date}. A nossa equipa irá analisá-lo e confirmar em breve.", cta: "Ver pedido" },
      deep_clean_request_approved: { subject: "A sua limpeza profunda está agendada", heading: "O seu agendamento está confirmado", body: "A sua visita de limpeza profunda está agendada para {date}. A nossa equipa chegará conforme previsto.", cta: "Ver subscrição" },
      deep_clean_request_rejected: { subject: "Atualização sobre o seu pedido de limpeza profunda", heading: "Pedido não aprovado", body: "Após análise, não podemos agendar este pedido neste momento. A nossa equipa está disponível para esclarecer dúvidas.", cta: "Contactar a equipa" },
      payment_required_suspended: { subject: "Pagamento necessário para {reference} — os seus serviços estão temporariamente suspensos", heading: "Serviços temporariamente suspensos", body: "Não conseguimos processar o pagamento da fatura {reference} ({amount}). Os seus serviços de limpeza foram suspensos até esta situação ser resolvida. Efetue o pagamento até {date} para restabelecer os seus serviços.", cta: "Pagar agora" },
      payment_required_final_notice: { subject: "Aviso final — a fatura {reference} continua por pagar", heading: "O seu prazo de pagamento está a terminar", body: "A fatura {reference} de {amount} continua por pagar. Tem até {date} para concluir o pagamento e restabelecer os seus serviços. Se já não pretende continuar com a sua subscrição, pode em alternativa solicitar a rescisão antecipada — isto não remove os montantes já devidos e pode originar um acerto final adicional.", cta: "Pagar agora", secondaryCta: "Solicitar rescisão antecipada" },
      cancellation_request_received: { subject: "Recebemos o seu pedido de cancelamento", heading: "O seu pedido de cancelamento está a ser processado", body: "Recebemos o seu pedido para terminar antecipadamente a subscrição {reference}. Com base no seu contrato, o montante calculado é de {amount}. Isto não cancela quaisquer montantes já devidos. Confirmaremos os próximos passos em breve.", cta: "Ver subscrição" },
      final_settlement_generated: { subject: "A sua fatura de acerto final está pronta — {reference}", heading: "Acerto final gerado", body: "O seu acerto de rescisão antecipada para a subscrição {reference} totaliza {amount}. Efetue o pagamento até {date} para finalizar o cancelamento.", cta: "Pagar acerto" },
      final_settlement_reminder: { subject: "Lembrete: o acerto final {reference} continua por pagar", heading: "O seu prazo de pagamento do acerto está a aproximar-se", body: "O seu acerto final de {amount} para a subscrição {reference} continua por pagar. Efetue o pagamento até {date} para finalizar o cancelamento e evitar que seja anulado.", cta: "Pagar acerto" },
      cancellation_completed: { subject: "A sua subscrição foi cancelada", heading: "Cancelamento concluído", body: "A subscrição {reference} foi cancelada e os serviços futuros foram interrompidos. Obrigado por ser cliente Dar Tahara.", cta: "Ver conta" },
      cancellation_voided: { subject: "O seu pedido de cancelamento foi anulado", heading: "Cancelamento anulado — acerto por pagar", body: "O acerto final da subscrição {reference} não foi pago dentro do prazo, pelo que o pedido de cancelamento foi anulado e o seu contrato original continua. Os serviços permanecem suspensos até que o saldo em dívida seja resolvido.", cta: "Ver faturas" },
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
  originalTerm?: string;
  replacementTerm?: string;
  amountPaid?: string;
  priceAdjustment?: string;
  remainingTermAmount?: string;
  actionUrl?: string;
  /** A second, less prominent link — e.g. an early-termination request link alongside the primary payment button. Only rendered when both this and `copy.secondaryCta` are present. */
  secondaryActionUrl?: string;
}): { subject: string; html: string } {
  const localeCopy = COPY[input.locale] ?? COPY.en;
  const copy = localeCopy.templates[input.template];
  const data = Object.fromEntries(Object.entries({
    name: input.name,
    reference: input.reference ?? "",
    date: input.date ?? "",
    amount: input.amount ?? "",
    details: input.details ?? "",
    originalTerm: input.originalTerm ?? "",
    replacementTerm: input.replacementTerm ?? "",
    amountPaid: input.amountPaid ?? "",
    priceAdjustment: input.priceAdjustment ?? "",
    remainingTermAmount: input.remainingTermAmount ?? "",
  }).map(([key, value]) => [key, escapeHtml(value)]));
  const dir = input.locale === "ar" ? "rtl" : "ltr";
  const button = input.actionUrl
    ? `<a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;margin-top:24px;padding:13px 24px;border-radius:999px;background:#2f4a29;color:#fffaf0;text-decoration:none;font-weight:600;">${escapeHtml(copy.cta)}</a>`
    : "";
  const secondaryLink = input.secondaryActionUrl && copy.secondaryCta
    ? `<p style="margin:16px 0 0;"><a href="${escapeHtml(input.secondaryActionUrl)}" style="color:#806b4c;text-decoration:underline;font-size:14px;">${escapeHtml(copy.secondaryCta)}</a></p>`
    : "";
  const html = `<!doctype html><html lang="${input.locale}" dir="${dir}"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f6f1e8;color:#25231f;font-family:Arial,Helvetica,sans-serif;"><div style="padding:32px 16px;"><div style="max-width:600px;margin:auto;background:#fffdf8;border:1px solid #e7ddca;border-radius:24px;overflow:hidden;"><div style="height:6px;background:#b8924f"></div><div style="padding:36px 32px;"><div style="font-family:Georgia,serif;font-size:22px;color:#2f4a29">Dar Tahara</div><p style="margin:28px 0 0;font-size:14px;color:#806b4c">${interpolate(localeCopy.greeting, data)}</p><h1 style="font-family:Georgia,serif;font-size:30px;line-height:1.2;margin:12px 0 16px;color:#25231f">${escapeHtml(copy.heading)}</h1><p style="font-size:16px;line-height:1.7;margin:0;color:#5d5549">${interpolate(copy.body, data)}</p>${button}${secondaryLink}</div><div style="padding:20px 32px;background:#f8f4ec;color:#8b7a62;font-size:12px;line-height:1.5">${escapeHtml(localeCopy.footer)}</div></div></div></body></html>`;
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
