import type { Locale } from "@/i18n/config";

export const SERVICE_POLICY = {
  supportName: "Dar Tahara Support",
  supportChannels: ["whatsapp", "phone", "email"] as const,
  supportHours: "09:00–21:00",
  supportTimeZone: "GMT+01:00",
  supportResponseWorkingHours: 24,
  changeNoticeHours: 48,
  maximumReschedulesPerYear: 2,
  subscriptionCancellationNoticeMonths: 1,
  earlySubscriptionCancellationDays: 14,
  earlySubscriptionCancellationFeePercentOfFirstPayment: 100,
} as const;

export type ServicePolicyCopy = {
  articleTitle: string;
  articleSummary: string;
  articleContent: string;
  whatsappCancellation: string;
  whatsappReschedule: string;
  termsSchedulingHeading: string;
  termsScheduling: string[];
  termsSubscriptionHeading: string;
  termsSubscription: string[];
  termsDurationDiscountsHeading: string;
  termsDurationDiscounts: string[];
  termsPauseBenefitHeading: string;
  termsPauseBenefit: string[];
  termsSupportHeading: string;
  termsSupport: string;
};

export const SERVICE_POLICY_COPY: Record<Locale, ServicePolicyCopy> = {
  en: {
    articleTitle: "Cleaning changes, subscription cancellation and Dar Tahara Support",
    articleSummary: "Visits can be cancelled or rescheduled through the customer portal at least 48 hours ahead; subscriptions follow separate cancellation rules.",
    articleContent: "The Initial Home Assessment, scheduled cleaning visits and one-off additional services may be cancelled or rescheduled by the customer through the customer portal at least 48 hours before the scheduled start. A customer may reschedule at most twice per calendar year, subject to availability. The planned time is shown in the customer portal at least two days ahead and may occasionally shift as the customer base grows. If access is refused or unavailable, the appointment is cancelled without an extra access or late-cancellation charge, but no refund, replacement visit or credit is due because subscription cleaning is prepaid; the service continues with the next visit in the normal cycle. Smart-lock access helps Dar Tahara attend at the announced time. If Dar Tahara cannot perform a visit because of a national or Islamic holiday, the visit is rescheduled to another time or day. A pause is available only for an eligible nine- or twelve-month subscription, subject to Dar Tahara's approval and the conditions in the Subscription pause benefit section; other subscriptions cannot be paused. A subscription may be cancelled only through the customer portal with at least one month’s notice. A monthly subscription ends at the end of its paid billing period; an annual subscription ends at the end of its twelve-month term. Unused periods are not refundable, and planned visits continue until the effective end date unless the customer refuses access. All outstanding invoices and charges must be paid before cancellation can take effect; an unpaid cancellation request lapses. If a customer cancels a subscription within 14 days after the completed and accepted Home Assessment, an additional cancellation fee equal to 100% of the first subscription payment applies, subject to mandatory law. The cancellation confirmation states the effective date and final cleaning date. Dar Tahara Support is available by WhatsApp, telephone and email from 09:00 to 21:00 GMT+01:00 and may promise a response within 24 working hours. Customer-facing requests are called support requests.",
    whatsappCancellation: "Cleaning visits and the Home Assessment can be cancelled in the customer portal at least 48 hours before the scheduled start. Subscription cancellation is also completed in the customer portal with at least one month’s notice. Monthly cancellation takes effect at the end of the paid billing period; annual cancellation at the end of the twelve-month term. Unused periods are not refundable, a pause is available only for an eligible nine- or twelve-month subscription subject to approval, and outstanding payments must be settled. The Terms include an additional fee when a subscription is cancelled within 14 days after the completed and accepted Home Assessment.",
    whatsappReschedule: "You can reschedule a cleaning or Home Assessment in the customer portal at least 48 hours before it starts, up to twice per calendar year and subject to availability. Your planned time appears in the portal at least two days ahead. Visits affected by a national or Islamic holiday are moved to another time or day.",
    termsSchedulingHeading: "3. Scheduling, rescheduling and visit cancellation",
    termsScheduling: [
      "The scheduled time for an Initial Home Assessment or cleaning visit is made available in the customer portal at least two days beforehand. We try to maintain regular visit times, but operational capacity and customer growth may occasionally require a change. We will communicate changes through the customer portal or an operational message.",
      "You may cancel or request to reschedule an Initial Home Assessment, a scheduled cleaning visit or a one-off additional service through the customer portal at least 48 hours before its scheduled start. Rescheduling is subject to availability and is limited to two requests per calendar year.",
      "If safe access is unavailable, refused or cannot be provided at the announced time, the appointment is cancelled. No additional access or late-cancellation charge is added, but no refund, replacement visit or credit is due for a prepaid subscription visit; service proceeds with the next visit in the normal cycle. Providing approved smart-lock access helps ensure access at the announced time.",
      "When we cannot perform a cleaning because of a national or Islamic holiday, we will reschedule it to another reasonable time or day.",
    ],
    termsSubscriptionHeading: "4. Subscription approval, billing and cancellation",
    termsSubscription: [
      "A subscription begins only after the Home Assessment has been completed and approved, you accept the proposal and secure subscription payment succeeds. Monthly plans renew monthly. Annual plans are prepaid for twelve months and include the discount displayed at checkout.",
      "A subscription may be cancelled only through the customer portal with at least one month’s notice. Monthly cancellation takes effect at the end of the paid billing period. Annual cancellation takes effect at the end of the twelve-month term. Unused monthly or annual periods are not refundable. Planned cleaning visits continue until the effective end date unless you tell us otherwise and refuse access.",
      "Subscription pauses are addressed separately below and are available only for eligible nine- and twelve-month subscriptions. All outstanding invoices, charges and other amounts due must be paid before cancellation can take effect. If they remain unpaid, the cancellation request lapses and the amounts already due remain payable.",
      "If you cancel a subscription within 14 days after the completed and accepted Home Assessment, an additional cancellation fee equal to 100% of the first subscription payment applies. This clause does not limit rights that cannot lawfully be excluded under applicable consumer law. Your cancellation confirmation will state the effective date and final cleaning date.",
    ],
    termsDurationDiscountsHeading: "4a. Subscription duration discounts",
    termsDurationDiscounts: [
      "Dar Tahara offers fixed-term subscription agreements with initial durations of three, six, nine, or twelve months. The applicable price, discount, service frequency, contract duration, start date, and minimum contract value are presented to you before the subscription is confirmed.",
      "The standard duration discounts are: three months, no duration discount; six months, 5%; nine months, 10%; twelve months, 15%. The duration discount applies only to eligible recurring cleaning-service charges — it does not apply to one-time fees, assessments, penalties, deep-cleaning charges, key-management charges, smart locks, installation, products, or other excluded services unless explicitly stated.",
      "The pricing and discount accepted at the start of a contract remain applicable during that contract term, subject to legally required changes, taxes, or customer-approved plan modifications. Unless mandatory law provides otherwise, cancelling a fixed-term subscription before the agreed end date does not automatically release you from payment obligations relating to the remaining contract term.",
    ],
    termsPauseBenefitHeading: "4b. Subscription pause benefit",
    termsPauseBenefit: [
      "The subscription pause benefit is available only to customers with an active nine-month or twelve-month subscription. An eligible customer may request one pause per contract term for a maximum total duration of two consecutive months. The pause is not automatic and requires written approval by Dar Tahara.",
      "A pause may be approved where cleaning cannot reasonably take place due to circumstances relating to the property, including construction, major renovation, serious property damage, or temporary inaccessibility. Ordinary holidays, travel, temporary absence, low occupancy, lack of guests, reduced cleaning needs, or financial circumstances do not ordinarily qualify.",
      "During an approved pause, cleaning services and recurring billing are suspended, unused cleaning visits do not accumulate, the contract end date is extended by the approved pause period, and the subscription resumes automatically on the approved resume date. The agreed subscription price and discount remain unchanged.",
      "A pause does not cancel the subscription, shorten the contracted service period, or remove your obligations for the remaining contract. Unused pause entitlement has no monetary value, is not refundable, and does not carry over into a later contract. A renewed eligible contract receives a new pause entitlement, subject to the terms applicable at the time of renewal. Dar Tahara may request reasonable supporting information and may reject, shorten, postpone, or modify a pause request where operational, billing, scheduling, or eligibility requirements are not met.",
    ],
    termsSupportHeading: "9. Dar Tahara Support",
    termsSupport: "Dar Tahara Support is available through WhatsApp, telephone and email between 09:00 and 21:00 GMT+01:00. We aim to respond to a support request within 24 working hours. Formal notices may be sent to the contact details published on the website.",
  },
  nl: {
    articleTitle: "Wijzigingen van schoonmaakbezoeken, opzegging en Dar Tahara Support",
    articleSummary: "Bezoeken kunnen minstens 48 uur vooraf via het klantenportaal worden geannuleerd of verzet; voor abonnementen gelden aparte opzegregels.",
    articleContent: "De Initiële Woningbeoordeling, geplande schoonmaakbezoeken en eenmalige extra diensten kunnen via het klantenportaal minstens 48 uur vóór de start worden geannuleerd of verzet. Verzetten kan maximaal twee keer per kalenderjaar en is afhankelijk van beschikbaarheid. Het geplande tijdstip staat minstens twee dagen vooraf in het portaal en kan door groei soms verschuiven. Bij geweigerde of ontbrekende toegang vervalt de afspraak zonder extra kosten, maar zonder terugbetaling, vervangend bezoek of tegoed; het vooraf betaalde abonnement gaat verder met het volgende normale bezoek. Bij nationale of islamitische feestdagen wordt een gemist bezoek verzet. Een pauze is alleen mogelijk bij een in aanmerking komend abonnement van negen of twaalf maanden, na goedkeuring door Dar Tahara en volgens de voorwaarden in het onderdeel over de pauzeregeling; andere abonnementen kunnen niet worden gepauzeerd. Opzeggen kan alleen via het klantenportaal met minstens één maand opzegtermijn. Een maandabonnement eindigt aan het einde van de betaalde periode en een jaarabonnement aan het einde van de looptijd van twaalf maanden. Ongebruikte perioden worden niet terugbetaald. Openstaande bedragen moeten vóór de einddatum zijn betaald; anders vervalt het opzegverzoek. Bij opzegging binnen 14 dagen na de voltooide en geaccepteerde Woningbeoordeling geldt een extra vergoeding van 100% van de eerste abonnementsbetaling, behoudens dwingend recht. Dar Tahara Support is bereikbaar via WhatsApp, telefoon en e-mail van 09:00 tot 21:00 GMT+01:00 en reageert binnen 24 werkuren.",
    whatsappCancellation: "Een schoonmaakbezoek of Woningbeoordeling kan minstens 48 uur vóór de start via het klantenportaal worden geannuleerd. Een abonnement zegt u daar op met minstens één maand opzegtermijn. Een maandabonnement eindigt na de betaalde periode en een jaarabonnement na twaalf maanden. Ongebruikte perioden worden niet terugbetaald, een pauze is alleen mogelijk bij een in aanmerking komend abonnement van negen of twaalf maanden na goedkeuring, en openstaande bedragen moeten worden voldaan. De Voorwaarden bevatten een extra vergoeding bij opzegging binnen 14 dagen na de voltooide en geaccepteerde Woningbeoordeling.",
    whatsappReschedule: "U kunt een schoonmaakbezoek of Woningbeoordeling minstens 48 uur vooraf via het klantenportaal verzetten, maximaal twee keer per kalenderjaar en afhankelijk van beschikbaarheid. Het tijdstip staat minstens twee dagen vooraf in het portaal. Een bezoek op een nationale of islamitische feestdag wordt verplaatst.",
    termsSchedulingHeading: "3. Planning, verzetten en annulering van bezoeken",
    termsScheduling: [
      "Het tijdstip van een Initiële Woningbeoordeling of schoonmaakbezoek staat minstens twee dagen vooraf in het klantenportaal. We streven naar vaste tijden, maar capaciteit en klantengroei kunnen soms een wijziging vereisen.",
      "U kunt een Woningbeoordeling, gepland schoonmaakbezoek of eenmalige extra dienst via het klantenportaal minstens 48 uur vóór de start annuleren of verzetten. Verzetten is afhankelijk van beschikbaarheid en beperkt tot twee keer per kalenderjaar.",
      "Als veilige toegang ontbreekt of wordt geweigerd, vervalt de afspraak zonder extra toeslag. Voor een vooraf betaald abonnementsbezoek bestaat geen recht op terugbetaling, vervangend bezoek of tegoed; de dienst gaat verder met het volgende normale bezoek.",
      "Als een nationale of islamitische feestdag uitvoering verhindert, verzetten wij het bezoek naar een ander redelijk tijdstip of een andere dag.",
    ],
    termsSubscriptionHeading: "4. Goedkeuring, betaling en opzegging van het abonnement",
    termsSubscription: [
      "Een abonnement begint pas nadat de Woningbeoordeling is voltooid en goedgekeurd, u het voorstel accepteert en de betaling slaagt.",
      "Opzeggen kan uitsluitend via het klantenportaal met minstens één maand opzegtermijn. Een maandabonnement eindigt aan het einde van de betaalde periode; een jaarabonnement aan het einde van de termijn van twaalf maanden. Ongebruikte perioden worden niet terugbetaald.",
      "De pauzeregeling wordt hieronder afzonderlijk behandeld en is alleen beschikbaar voor in aanmerking komende abonnementen van negen en twaalf maanden. Alle openstaande facturen en kosten moeten vóór de opzegging ingaat zijn betaald. Anders vervalt het opzegverzoek en blijven de bedragen verschuldigd.",
      "Bij opzegging binnen 14 dagen na de voltooide en geaccepteerde Woningbeoordeling geldt een extra vergoeding van 100% van de eerste abonnementsbetaling, behoudens dwingend consumentenrecht. De bevestiging vermeldt de einddatum en laatste schoonmaakdatum.",
    ],
    termsDurationDiscountsHeading: "4a. Kortingen op abonnementsduur",
    termsDurationDiscounts: [
      "Dar Tahara biedt abonnementen met een vaste looptijd van drie, zes, negen of twaalf maanden aan. De toepasselijke prijs, korting, servicefrequentie, looptijd, startdatum en minimale contractwaarde worden u getoond voordat het abonnement wordt bevestigd.",
      "De standaardkortingen op looptijd zijn: drie maanden, geen korting; zes maanden, 5%; negen maanden, 10%; twaalf maanden, 15%. De looptijdkorting geldt alleen voor in aanmerking komende terugkerende schoonmaakkosten — niet voor eenmalige kosten, beoordelingen, boetes, dieptereinigingskosten, sleutelbeheerkosten, slimme sloten, installatie, producten of andere uitgesloten diensten, tenzij uitdrukkelijk anders vermeld.",
      "De prijs en korting die bij aanvang van een contract zijn geaccepteerd, blijven gedurende die contractperiode van toepassing, behoudens wettelijk verplichte wijzigingen, belastingen of door de klant goedgekeurde planwijzigingen. Tenzij dwingend recht anders bepaalt, ontslaat het opzeggen van een abonnement met vaste looptijd vóór de overeengekomen einddatum u niet automatisch van betalingsverplichtingen voor de resterende contractperiode.",
    ],
    termsPauseBenefitHeading: "4b. Pauzeregeling voor abonnementen",
    termsPauseBenefit: [
      "De pauzeregeling is alleen beschikbaar voor klanten met een actief abonnement van negen of twaalf maanden. Een in aanmerking komende klant kan één pauze per contractperiode aanvragen, voor een totale duur van maximaal twee aaneengesloten maanden. De pauze is niet automatisch en vereist schriftelijke goedkeuring van Dar Tahara.",
      "Een pauze kan worden goedgekeurd wanneer schoonmaak redelijkerwijs niet kan plaatsvinden vanwege omstandigheden die met de woning te maken hebben, zoals verbouwing, ingrijpende renovatie, ernstige schade aan de woning of tijdelijke ontoegankelijkheid. Gewone vakanties, reizen, tijdelijke afwezigheid, lage bezetting, gebrek aan gasten, verminderde schoonmaakbehoefte of financiële omstandigheden komen normaal gesproken niet in aanmerking.",
      "Tijdens een goedgekeurde pauze worden de schoonmaakdiensten en de terugkerende facturering opgeschort, hopen ongebruikte schoonmaakbezoeken niet op, wordt de einddatum van het contract verlengd met de goedgekeurde pauzeperiode, en wordt het abonnement automatisch hervat op de goedgekeurde hervattingsdatum. De overeengekomen abonnementsprijs en korting blijven ongewijzigd.",
      "Een pauze annuleert het abonnement niet, verkort de gecontracteerde serviceperiode niet en heft uw verplichtingen voor de resterende contractperiode niet op. Een ongebruikt pauzerecht heeft geen geldwaarde, is niet terugbetaalbaar en wordt niet overgedragen naar een later contract. Een vernieuwd in aanmerking komend contract krijgt een nieuw pauzerecht, onder de voorwaarden die op het moment van verlenging van toepassing zijn. Dar Tahara kan redelijke onderbouwing vragen en kan een pauzeverzoek weigeren, inkorten, uitstellen of wijzigen wanneer niet wordt voldaan aan operationele, facturerings-, planning- of geschiktheidsvereisten.",
    ],
    termsSupportHeading: "9. Dar Tahara Support",
    termsSupport: "Dar Tahara Support is bereikbaar via WhatsApp, telefoon en e-mail tussen 09:00 en 21:00 GMT+01:00. Wij streven ernaar binnen 24 werkuren op een supportverzoek te reageren.",
  },
  fr: {
    articleTitle: "Modification des visites, résiliation et Dar Tahara Support",
    articleSummary: "Les visites peuvent être annulées ou reportées via le portail au moins 48 heures à l’avance ; la résiliation suit des règles distinctes.",
    articleContent: "L’Évaluation Initiale du Domicile, les nettoyages planifiés et les services supplémentaires ponctuels peuvent être annulés ou reportés via le portail client au moins 48 heures avant le début. Deux reports au maximum sont autorisés par année civile, sous réserve de disponibilité. L’horaire apparaît dans le portail au moins deux jours à l’avance et peut parfois changer avec la croissance. En cas d’accès refusé ou impossible, le rendez-vous est annulé sans frais supplémentaires, mais sans remboursement, visite de remplacement ni crédit ; l’abonnement prépayé reprend au prochain passage normal. Une visite empêchée par un jour férié national ou islamique est reportée. Une suspension n'est possible que pour un abonnement éligible de neuf ou douze mois, sous réserve de l'approbation de Dar Tahara et des conditions de la section relative à l'avantage de suspension d'abonnement ; les autres abonnements ne peuvent pas être suspendus. La résiliation s’effectue uniquement dans le portail avec un préavis d’au moins un mois. Le mensuel se termine à la fin de la période payée et l’annuel à la fin des douze mois. Les périodes inutilisées ne sont pas remboursées. Les sommes dues doivent être réglées, sinon la demande de résiliation devient caduque. Une résiliation dans les 14 jours suivant l’Évaluation terminée et acceptée entraîne des frais supplémentaires égaux à 100 % du premier paiement d’abonnement, sous réserve du droit impératif. Dar Tahara Support est joignable par WhatsApp, téléphone et e-mail de 09:00 à 21:00 GMT+01:00 et répond sous 24 heures ouvrées.",
    whatsappCancellation: "Une visite de nettoyage ou l’Évaluation peut être annulée dans le portail client au moins 48 heures avant son début. La résiliation d’un abonnement s’y effectue avec un préavis d’au moins un mois. Le mensuel se termine à la fin de la période payée et l’annuel à la fin des douze mois. Il n’y a pas de remboursement des périodes inutilisées ; une suspension n’est possible que pour un abonnement éligible de neuf ou douze mois, sous réserve d’approbation, et les sommes dues doivent être réglées. Des frais supplémentaires s’appliquent en cas de résiliation dans les 14 jours suivant l’Évaluation terminée et acceptée.",
    whatsappReschedule: "Vous pouvez reporter une visite ou l’Évaluation via le portail au moins 48 heures à l’avance, deux fois au maximum par année civile et sous réserve de disponibilité. L’horaire est affiché au moins deux jours avant. Une visite touchée par un jour férié national ou islamique est replanifiée.",
    termsSchedulingHeading: "3. Planification, report et annulation des visites",
    termsScheduling: [
      "L’horaire de l’Évaluation ou du nettoyage est publié dans le portail client au moins deux jours à l’avance. Nous recherchons la régularité, mais la capacité et la croissance peuvent parfois imposer un changement.",
      "Vous pouvez annuler ou reporter l’Évaluation, un nettoyage planifié ou un service ponctuel dans le portail au moins 48 heures avant son début. Les reports dépendent des disponibilités et sont limités à deux par année civile.",
      "Si l’accès sécurisé est refusé ou impossible, le rendez-vous est annulé sans frais supplémentaires. Une visite d’abonnement prépayée ne donne alors lieu à aucun remboursement, remplacement ni crédit ; le service reprend au prochain passage normal.",
      "Si un jour férié national ou islamique nous empêche d’intervenir, la visite est reportée à une autre heure ou un autre jour raisonnable.",
    ],
    termsSubscriptionHeading: "4. Approbation, facturation et résiliation",
    termsSubscription: [
      "L’abonnement ne commence qu’après l’Évaluation terminée et approuvée, l’acceptation de l’offre et la réussite du paiement.",
      "La résiliation se fait uniquement via le portail avec un préavis d’au moins un mois. Le mensuel prend fin à la fin de la période payée et l’annuel à la fin de la période de douze mois. Les périodes inutilisées ne sont pas remboursables.",
      "La suspension d’abonnement est traitée séparément ci-dessous et n’est disponible que pour les abonnements éligibles de neuf et douze mois. Toutes les factures et sommes dues doivent être réglées avant la prise d’effet ; sinon la demande devient caduque.",
      "Une résiliation dans les 14 jours suivant l’Évaluation terminée et acceptée entraîne des frais supplémentaires égaux à 100 % du premier paiement d’abonnement, sous réserve des droits impératifs. La confirmation indique la date d’effet et la dernière date de nettoyage.",
    ],
    termsDurationDiscountsHeading: "4a. Remises liées à la durée de l'abonnement",
    termsDurationDiscounts: [
      "Dar Tahara propose des abonnements à durée déterminée de trois, six, neuf ou douze mois. Le prix applicable, la remise, la fréquence du service, la durée du contrat, la date de début et la valeur minimale du contrat vous sont présentés avant la confirmation de l'abonnement.",
      "Les remises standard liées à la durée sont : trois mois, aucune remise ; six mois, 5 % ; neuf mois, 10 % ; douze mois, 15 %. La remise de durée s'applique uniquement aux frais de nettoyage récurrents éligibles — elle ne s'applique pas aux frais ponctuels, aux évaluations, aux pénalités, aux frais de nettoyage en profondeur, aux frais de gestion des clés, aux serrures intelligentes, à l'installation, aux produits ou à d'autres services exclus, sauf mention contraire explicite.",
      "Le prix et la remise acceptés au début d'un contrat restent applicables pendant cette période contractuelle, sous réserve de modifications légalement requises, de taxes ou de modifications de plan approuvées par le client. Sauf disposition contraire du droit impératif, la résiliation d'un abonnement à durée déterminée avant la date de fin convenue ne vous libère pas automatiquement des obligations de paiement relatives à la période contractuelle restante.",
    ],
    termsPauseBenefitHeading: "4b. Avantage de suspension d'abonnement",
    termsPauseBenefit: [
      "L'avantage de suspension d'abonnement est réservé aux clients disposant d'un abonnement actif de neuf ou douze mois. Un client éligible peut demander une suspension par période contractuelle, pour une durée totale maximale de deux mois consécutifs. La suspension n'est pas automatique et nécessite l'approbation écrite de Dar Tahara.",
      "Une suspension peut être approuvée lorsque le nettoyage ne peut raisonnablement avoir lieu en raison de circonstances liées au bien, notamment des travaux de construction, une rénovation majeure, des dommages importants au bien ou une inaccessibilité temporaire. Les vacances ordinaires, les voyages, l'absence temporaire, la faible occupation, l'absence d'invités, la réduction des besoins de nettoyage ou les circonstances financières ne sont normalement pas éligibles.",
      "Pendant une suspension approuvée, les services de nettoyage et la facturation récurrente sont suspendus, les visites de nettoyage inutilisées ne s'accumulent pas, la date de fin du contrat est prolongée de la période de suspension approuvée, et l'abonnement reprend automatiquement à la date de reprise approuvée. Le prix et la remise convenus de l'abonnement restent inchangés.",
      "Une suspension n'annule pas l'abonnement, ne raccourcit pas la période de service contractée et ne supprime pas vos obligations pour la période contractuelle restante. Un droit de suspension inutilisé n'a aucune valeur monétaire, n'est pas remboursable et ne se reporte pas sur un contrat ultérieur. Un contrat éligible renouvelé bénéficie d'un nouveau droit de suspension, sous réserve des conditions applicables au moment du renouvellement. Dar Tahara peut demander des informations justificatives raisonnables et peut rejeter, raccourcir, reporter ou modifier une demande de suspension lorsque les exigences opérationnelles, de facturation, de planification ou d'éligibilité ne sont pas remplies.",
    ],
    termsSupportHeading: "9. Dar Tahara Support",
    termsSupport: "Dar Tahara Support est disponible par WhatsApp, téléphone et e-mail entre 09:00 et 21:00 GMT+01:00. Nous visons une réponse à toute demande de support sous 24 heures ouvrées.",
  },
  es: {
    articleTitle: "Cambios de visitas, cancelación de suscripción y Dar Tahara Support",
    articleSummary: "Las visitas se cancelan o reprograman en el portal con al menos 48 horas; la suscripción tiene reglas de cancelación separadas.",
    articleContent: "La Evaluación Inicial, las limpiezas programadas y los servicios adicionales puntuales pueden cancelarse o reprogramarse en el portal del cliente al menos 48 horas antes del inicio. Se permiten como máximo dos cambios por año natural, sujetos a disponibilidad. El horario aparece en el portal al menos dos días antes y puede variar ocasionalmente por el crecimiento. Si se rechaza o no hay acceso, la cita se cancela sin coste adicional, pero sin reembolso, visita sustitutiva ni crédito; la suscripción prepagada continúa con la siguiente visita normal. Las visitas afectadas por festivos nacionales o islámicos se reprograman. Una pausa solo es posible en una suscripción elegible de nueve o doce meses, sujeta a la aprobación de Dar Tahara y a las condiciones de la sección sobre el beneficio de pausa de suscripción; las demás suscripciones no pueden pausarse. Solo pueden cancelarse en el portal con al menos un mes de preaviso. La mensual termina al final del periodo pagado y la anual al final de los doce meses. No se reembolsan periodos no utilizados. Los importes pendientes deben pagarse o la solicitud caduca. Cancelar dentro de los 14 días posteriores a la Evaluación completada y aceptada conlleva un cargo adicional del 100 % del primer pago de la suscripción, sujeto a la ley imperativa. Dar Tahara Support atiende por WhatsApp, teléfono y correo de 09:00 a 21:00 GMT+01:00 y responde en 24 horas laborables.",
    whatsappCancellation: "La limpieza o Evaluación puede cancelarse en el portal al menos 48 horas antes. La suscripción se cancela allí con un mes de preaviso. La mensual termina al final del periodo pagado y la anual al finalizar los doce meses. No hay reembolso de periodos no usados; una pausa solo es posible en una suscripción elegible de nueve o doce meses sujeta a aprobación, y deben pagarse los importes pendientes. Los Términos prevén un cargo adicional si se cancela dentro de los 14 días posteriores a la Evaluación completada y aceptada.",
    whatsappReschedule: "Puede reprogramar una limpieza o Evaluación en el portal al menos 48 horas antes, como máximo dos veces por año natural y sujeto a disponibilidad. El horario aparece al menos dos días antes. Las visitas afectadas por festivos nacionales o islámicos se reprograman.",
    termsSchedulingHeading: "3. Programación, cambios y cancelación de visitas",
    termsScheduling: [
      "El horario de la Evaluación o limpieza se publica en el portal al menos dos días antes. Intentamos mantener regularidad, aunque la capacidad y el crecimiento pueden exigir cambios.",
      "Puede cancelar o reprogramar la Evaluación, una limpieza programada o un servicio puntual en el portal al menos 48 horas antes. La reprogramación depende de la disponibilidad y se limita a dos veces por año natural.",
      "Si se rechaza o no existe acceso seguro, la cita se cancela sin cargo adicional. Una visita prepagada no genera reembolso, sustitución ni crédito; el servicio continúa con la siguiente visita normal.",
      "Las visitas que no podamos realizar por un festivo nacional o islámico se trasladarán a otra hora o día razonable.",
    ],
    termsSubscriptionHeading: "4. Aprobación, facturación y cancelación de la suscripción",
    termsSubscription: [
      "La suscripción comienza después de completar y aprobar la Evaluación, aceptar la propuesta y completar el pago.",
      "Solo puede cancelarse en el portal con un mes de preaviso. La mensual termina al final del periodo pagado y la anual al final de los doce meses. Los periodos no usados no se reembolsan.",
      "El beneficio de pausa se trata por separado más abajo y solo está disponible para suscripciones elegibles de nueve y doce meses. Todas las facturas y cargos pendientes deben pagarse antes de que la cancelación sea efectiva; de lo contrario, la solicitud caduca.",
      "La cancelación dentro de los 14 días posteriores a la Evaluación completada y aceptada conlleva un cargo adicional del 100 % del primer pago, sujeto a los derechos legales obligatorios. La confirmación muestra la fecha efectiva y la última limpieza.",
    ],
    termsDurationDiscountsHeading: "4a. Descuentos por duración de la suscripción",
    termsDurationDiscounts: [
      "Dar Tahara ofrece contratos de suscripción de duración fija con periodos iniciales de tres, seis, nueve o doce meses. El precio aplicable, el descuento, la frecuencia del servicio, la duración del contrato, la fecha de inicio y el valor mínimo del contrato se le muestran antes de confirmar la suscripción.",
      "Los descuentos estándar por duración son: tres meses, sin descuento; seis meses, 5 %; nueve meses, 10 %; doce meses, 15 %. El descuento por duración se aplica únicamente a los cargos recurrentes de limpieza elegibles; no se aplica a cargos puntuales, evaluaciones, penalizaciones, cargos de limpieza profunda, cargos de gestión de llaves, cerraduras inteligentes, instalación, productos u otros servicios excluidos, salvo que se indique expresamente lo contrario.",
      "El precio y el descuento aceptados al inicio de un contrato siguen siendo aplicables durante ese periodo contractual, sujeto a cambios legalmente requeridos, impuestos o modificaciones del plan aprobadas por el cliente. Salvo que la ley imperativa disponga lo contrario, cancelar una suscripción de duración fija antes de la fecha de finalización acordada no le exime automáticamente de las obligaciones de pago relativas al periodo contractual restante.",
    ],
    termsPauseBenefitHeading: "4b. Beneficio de pausa de suscripción",
    termsPauseBenefit: [
      "El beneficio de pausa de suscripción está disponible únicamente para clientes con una suscripción activa de nueve o doce meses. Un cliente elegible puede solicitar una pausa por periodo contractual, por una duración total máxima de dos meses consecutivos. La pausa no es automática y requiere la aprobación por escrito de Dar Tahara.",
      "Una pausa puede aprobarse cuando la limpieza no pueda realizarse razonablemente debido a circunstancias relacionadas con la propiedad, incluidas obras de construcción, reformas importantes, daños graves a la propiedad o inaccesibilidad temporal. Las vacaciones habituales, los viajes, la ausencia temporal, la baja ocupación, la falta de huéspedes, la reducción de las necesidades de limpieza o las circunstancias financieras normalmente no son elegibles.",
      "Durante una pausa aprobada, los servicios de limpieza y la facturación recurrente se suspenden, las visitas de limpieza no utilizadas no se acumulan, la fecha de finalización del contrato se amplía según el periodo de pausa aprobado, y la suscripción se reanuda automáticamente en la fecha de reanudación aprobada. El precio y el descuento acordados de la suscripción permanecen sin cambios.",
      "Una pausa no cancela la suscripción, no acorta el periodo de servicio contratado ni elimina sus obligaciones respecto al periodo contractual restante. El derecho de pausa no utilizado no tiene valor monetario, no es reembolsable y no se traslada a un contrato posterior. Un contrato elegible renovado recibe un nuevo derecho de pausa, sujeto a los términos aplicables en el momento de la renovación. Dar Tahara puede solicitar información justificativa razonable y puede rechazar, acortar, posponer o modificar una solicitud de pausa cuando no se cumplan los requisitos operativos, de facturación, de programación o de elegibilidad.",
    ],
    termsSupportHeading: "9. Dar Tahara Support",
    termsSupport: "Dar Tahara Support atiende por WhatsApp, teléfono y correo electrónico entre las 09:00 y las 21:00 GMT+01:00. El objetivo de respuesta es de 24 horas laborables.",
  },
  de: {
    articleTitle: "Terminänderungen, Abo-Kündigung und Dar Tahara Support",
    articleSummary: "Besuche können mindestens 48 Stunden vorher im Kundenportal storniert oder verschoben werden; für Abos gelten eigene Kündigungsregeln.",
    articleContent: "Die Ersteinschätzung, geplante Reinigungen und einmalige Zusatzleistungen können mindestens 48 Stunden vor Beginn im Kundenportal storniert oder verschoben werden. Verschiebungen sind höchstens zweimal pro Kalenderjahr und nach Verfügbarkeit möglich. Der Termin steht mindestens zwei Tage vorher im Portal und kann sich durch Wachstum gelegentlich ändern. Wird der Zugang verweigert oder ist er nicht möglich, entfällt der Termin ohne Zusatzkosten, jedoch ohne Erstattung, Ersatzbesuch oder Gutschrift; das vorausbezahlte Abo läuft mit dem nächsten regulären Besuch weiter. Von nationalen oder islamischen Feiertagen betroffene Besuche werden verschoben. Eine Pause ist nur bei einem berechtigten Abo mit neun oder zwölf Monaten Laufzeit möglich, vorbehaltlich der Genehmigung durch Dar Tahara und der Bedingungen im Abschnitt zur Abo-Pausenregelung; andere Abos können nicht pausiert werden. Die Kündigung erfolgt nur im Portal mit mindestens einem Monat Frist. Monatsabos enden am Ende des bezahlten Zeitraums, Jahresabos am Ende der zwölf Monate. Ungenutzte Zeiten werden nicht erstattet. Offene Beträge müssen bezahlt werden, sonst verfällt der Kündigungsantrag. Bei Kündigung innerhalb von 14 Tagen nach abgeschlossener und akzeptierter Ersteinschätzung fällt vorbehaltlich zwingenden Rechts eine zusätzliche Gebühr von 100 % der ersten Abozahlung an. Dar Tahara Support ist per WhatsApp, Telefon und E-Mail von 09:00 bis 21:00 GMT+01:00 erreichbar und antwortet innerhalb von 24 Arbeitsstunden.",
    whatsappCancellation: "Eine Reinigung oder Ersteinschätzung kann mindestens 48 Stunden vorher im Kundenportal storniert werden. Das Abo wird dort mit mindestens einem Monat Frist gekündigt. Das Monatsabo endet nach dem bezahlten Zeitraum, das Jahresabo nach zwölf Monaten. Ungenutzte Zeiten werden nicht erstattet; eine Pause ist nur bei einem berechtigten Abo mit neun oder zwölf Monaten Laufzeit vorbehaltlich Genehmigung möglich, und offene Beträge müssen bezahlt werden. Bei Kündigung innerhalb von 14 Tagen nach der abgeschlossenen und akzeptierten Ersteinschätzung gilt eine zusätzliche Gebühr.",
    whatsappReschedule: "Sie können eine Reinigung oder Ersteinschätzung mindestens 48 Stunden vorher im Portal verschieben, höchstens zweimal pro Kalenderjahr und nach Verfügbarkeit. Der Termin steht mindestens zwei Tage vorher im Portal. Besuche an nationalen oder islamischen Feiertagen werden verlegt.",
    termsSchedulingHeading: "3. Planung, Verschiebung und Stornierung von Besuchen",
    termsScheduling: [
      "Der Termin für die Ersteinschätzung oder Reinigung wird mindestens zwei Tage vorher im Portal angezeigt. Wir streben Regelmäßigkeit an, können Termine wegen Kapazität und Wachstum aber gelegentlich ändern.",
      "Sie können die Ersteinschätzung, eine geplante Reinigung oder eine einmalige Zusatzleistung mindestens 48 Stunden vorher im Portal stornieren oder verschieben. Verschiebungen sind nach Verfügbarkeit zweimal pro Kalenderjahr möglich.",
      "Ist sicherer Zugang nicht möglich oder wird er verweigert, entfällt der Termin ohne Zusatzgebühr. Für einen vorausbezahlten Abo-Besuch gibt es keine Erstattung, keinen Ersatztermin und keine Gutschrift; der nächste reguläre Besuch bleibt bestehen.",
      "Kann ein Besuch wegen eines nationalen oder islamischen Feiertags nicht stattfinden, wird er auf eine andere angemessene Zeit oder einen anderen Tag verschoben.",
    ],
    termsSubscriptionHeading: "4. Freigabe, Abrechnung und Kündigung",
    termsSubscription: [
      "Das Abo beginnt erst nach abgeschlossener und genehmigter Ersteinschätzung, Annahme des Angebots und erfolgreicher Zahlung.",
      "Die Kündigung erfolgt ausschließlich im Kundenportal mit mindestens einem Monat Frist. Das Monatsabo endet am Ende des bezahlten Zeitraums, das Jahresabo nach zwölf Monaten. Ungenutzte Zeiten werden nicht erstattet.",
      "Die Pausenregelung wird unten gesondert behandelt und steht nur berechtigten Abos mit neun und zwölf Monaten Laufzeit zur Verfügung. Offene Rechnungen und Gebühren müssen vor Wirksamwerden bezahlt sein; andernfalls verfällt der Kündigungsantrag.",
      "Bei Kündigung innerhalb von 14 Tagen nach der abgeschlossenen und akzeptierten Ersteinschätzung fällt vorbehaltlich zwingenden Verbraucherrechts eine zusätzliche Gebühr von 100 % der ersten Abozahlung an. Die Bestätigung nennt Enddatum und letzten Reinigungstermin.",
    ],
    termsDurationDiscountsHeading: "4a. Rabatte je nach Abo-Laufzeit",
    termsDurationDiscounts: [
      "Dar Tahara bietet Abo-Verträge mit fester Laufzeit von drei, sechs, neun oder zwölf Monaten an. Der geltende Preis, der Rabatt, die Servicehäufigkeit, die Vertragslaufzeit, das Startdatum und der Mindestvertragswert werden Ihnen vor Bestätigung des Abos angezeigt.",
      "Die Standardrabatte je nach Laufzeit sind: drei Monate, kein Laufzeitrabatt; sechs Monate, 5 %; neun Monate, 10 %; zwölf Monate, 15 %. Der Laufzeitrabatt gilt nur für berechtigte wiederkehrende Reinigungskosten — er gilt nicht für einmalige Gebühren, Bewertungen, Vertragsstrafen, Grundreinigungskosten, Schlüsselverwaltungskosten, smarte Schlösser, Installation, Produkte oder andere ausgeschlossene Leistungen, sofern nicht ausdrücklich anders angegeben.",
      "Der zu Vertragsbeginn akzeptierte Preis und Rabatt bleiben während dieser Vertragslaufzeit anwendbar, vorbehaltlich gesetzlich vorgeschriebener Änderungen, Steuern oder vom Kunden genehmigter Planänderungen. Sofern zwingendes Recht nichts anderes vorsieht, entbindet die Kündigung eines Abos mit fester Laufzeit vor dem vereinbarten Enddatum Sie nicht automatisch von Zahlungsverpflichtungen für die verbleibende Vertragslaufzeit.",
    ],
    termsPauseBenefitHeading: "4b. Abo-Pausenregelung",
    termsPauseBenefit: [
      "Die Abo-Pausenregelung steht nur Kunden mit einem aktiven Abo von neun oder zwölf Monaten Laufzeit zur Verfügung. Ein berechtigter Kunde kann pro Vertragslaufzeit eine Pause von insgesamt höchstens zwei aufeinanderfolgenden Monaten beantragen. Die Pause erfolgt nicht automatisch und erfordert die schriftliche Genehmigung von Dar Tahara.",
      "Eine Pause kann genehmigt werden, wenn die Reinigung aus Gründen, die mit der Immobilie zusammenhängen, vernünftigerweise nicht stattfinden kann, etwa bei Bauarbeiten, größeren Renovierungen, erheblichen Schäden an der Immobilie oder vorübergehender Unzugänglichkeit. Gewöhnliche Urlaube, Reisen, vorübergehende Abwesenheit, geringe Belegung, fehlende Gäste, verringerter Reinigungsbedarf oder finanzielle Umstände berechtigen in der Regel nicht.",
      "Während einer genehmigten Pause werden die Reinigungsleistungen und die wiederkehrende Abrechnung ausgesetzt, ungenutzte Reinigungsbesuche sammeln sich nicht an, das Vertragsende verlängert sich um den genehmigten Pausenzeitraum, und das Abo wird am genehmigten Wiederaufnahmedatum automatisch fortgesetzt. Der vereinbarte Abo-Preis und Rabatt bleiben unverändert.",
      "Eine Pause kündigt das Abo nicht, verkürzt den vertraglich vereinbarten Leistungszeitraum nicht und hebt Ihre Verpflichtungen für die restliche Vertragslaufzeit nicht auf. Ein ungenutzter Pausenanspruch hat keinen Geldwert, ist nicht erstattungsfähig und wird nicht auf einen späteren Vertrag übertragen. Ein verlängerter berechtigter Vertrag erhält einen neuen Pausenanspruch, vorbehaltlich der zum Zeitpunkt der Verlängerung geltenden Bedingungen. Dar Tahara kann angemessene Nachweise verlangen und einen Pausenantrag ablehnen, verkürzen, verschieben oder ändern, wenn betriebliche, abrechnungstechnische, terminliche oder Berechtigungsanforderungen nicht erfüllt sind.",
    ],
    termsSupportHeading: "9. Dar Tahara Support",
    termsSupport: "Dar Tahara Support ist per WhatsApp, Telefon und E-Mail zwischen 09:00 und 21:00 GMT+01:00 erreichbar. Wir antworten auf Supportanfragen innerhalb von 24 Arbeitsstunden.",
  },
  pt: {
    articleTitle: "Alterações de visitas, cancelamento da subscrição e Dar Tahara Support",
    articleSummary: "As visitas podem ser canceladas ou reagendadas no portal com 48 horas de antecedência; a subscrição tem regras próprias.",
    articleContent: "A Avaliação Inicial, as limpezas agendadas e os serviços adicionais pontuais podem ser cancelados ou reagendados no portal do cliente pelo menos 48 horas antes. O reagendamento é permitido no máximo duas vezes por ano civil e depende da disponibilidade. O horário aparece no portal pelo menos dois dias antes e pode mudar ocasionalmente com o crescimento. Se o acesso for recusado ou impossível, a marcação é cancelada sem custo extra, mas sem reembolso, visita de substituição ou crédito; a subscrição pré-paga continua na visita normal seguinte. As visitas afetadas por feriados nacionais ou islâmicos são reagendadas. Uma pausa só é possível numa subscrição elegível de nove ou doze meses, sujeita à aprovação da Dar Tahara e às condições da secção sobre o benefício de pausa de subscrição; as restantes subscrições não podem ser pausadas. O cancelamento é feito apenas no portal com pelo menos um mês de aviso. A mensal termina no fim do período pago e a anual no fim dos doze meses. Períodos não usados não são reembolsados. Valores em dívida devem ser pagos ou o pedido caduca. O cancelamento nos 14 dias após a Avaliação concluída e aceite implica uma taxa adicional de 100% do primeiro pagamento, sem prejuízo da lei imperativa. Dar Tahara Support atende por WhatsApp, telefone e e-mail das 09:00 às 21:00 GMT+01:00 e responde em 24 horas úteis.",
    whatsappCancellation: "Uma limpeza ou Avaliação pode ser cancelada no portal com pelo menos 48 horas de antecedência. A subscrição é cancelada ali com aviso mínimo de um mês. A mensal termina no fim do período pago e a anual ao fim dos doze meses. Não há reembolso de períodos não usados; uma pausa só é possível numa subscrição elegível de nove ou doze meses sujeita a aprovação, e os valores em dívida devem ser pagos. Os Termos preveem uma taxa adicional se cancelar nos 14 dias após a Avaliação concluída e aceite.",
    whatsappReschedule: "Pode reagendar uma limpeza ou Avaliação no portal com pelo menos 48 horas de antecedência, no máximo duas vezes por ano civil e sujeito a disponibilidade. O horário aparece pelo menos dois dias antes. Visitas afetadas por feriados nacionais ou islâmicos são reagendadas.",
    termsSchedulingHeading: "3. Planeamento, reagendamento e cancelamento de visitas",
    termsScheduling: [
      "O horário da Avaliação ou limpeza é publicado no portal pelo menos dois dias antes. Procuramos manter regularidade, mas a capacidade e o crescimento podem exigir alterações.",
      "Pode cancelar ou reagendar a Avaliação, uma limpeza agendada ou um serviço pontual no portal pelo menos 48 horas antes. O reagendamento depende da disponibilidade e limita-se a duas vezes por ano civil.",
      "Se o acesso seguro for impossível ou recusado, a marcação é cancelada sem custo adicional. Uma visita pré-paga não dá direito a reembolso, substituição ou crédito; o serviço continua na visita normal seguinte.",
      "Se um feriado nacional ou islâmico impedir a visita, esta será reagendada para outra hora ou dia razoável.",
    ],
    termsSubscriptionHeading: "4. Aprovação, faturação e cancelamento da subscrição",
    termsSubscription: [
      "A subscrição começa após a Avaliação concluída e aprovada, a aceitação da proposta e o pagamento bem-sucedido.",
      "O cancelamento é feito apenas no portal com um mês de aviso. A mensal termina no fim do período pago e a anual no fim dos doze meses. Os períodos não usados não são reembolsáveis.",
      "O benefício de pausa é tratado separadamente abaixo e está disponível apenas para subscrições elegíveis de nove e doze meses. Todas as faturas e encargos pendentes devem ser pagos antes da data efetiva; caso contrário, o pedido caduca.",
      "O cancelamento nos 14 dias após a Avaliação concluída e aceite implica uma taxa adicional de 100% do primeiro pagamento, sem prejuízo dos direitos legais obrigatórios. A confirmação indica a data efetiva e a última limpeza.",
    ],
    termsDurationDiscountsHeading: "4a. Descontos por duração da subscrição",
    termsDurationDiscounts: [
      "A Dar Tahara oferece contratos de subscrição de prazo fixo com durações iniciais de três, seis, nove ou doze meses. O preço aplicável, o desconto, a frequência do serviço, a duração do contrato, a data de início e o valor mínimo do contrato são-lhe apresentados antes da confirmação da subscrição.",
      "Os descontos padrão por duração são: três meses, sem desconto; seis meses, 5%; nove meses, 10%; doze meses, 15%. O desconto por duração aplica-se apenas aos encargos de limpeza recorrentes elegíveis — não se aplica a taxas pontuais, avaliações, penalizações, encargos de limpeza profunda, encargos de gestão de chaves, fechaduras inteligentes, instalação, produtos ou outros serviços excluídos, salvo indicação expressa em contrário.",
      "O preço e o desconto aceites no início de um contrato mantêm-se aplicáveis durante esse período contratual, sujeito a alterações legalmente exigidas, impostos ou modificações do plano aprovadas pelo cliente. Salvo disposição em contrário da lei imperativa, cancelar uma subscrição de prazo fixo antes da data de término acordada não o isenta automaticamente das obrigações de pagamento relativas ao período contratual remanescente.",
    ],
    termsPauseBenefitHeading: "4b. Benefício de pausa de subscrição",
    termsPauseBenefit: [
      "O benefício de pausa de subscrição está disponível apenas para clientes com uma subscrição ativa de nove ou doze meses. Um cliente elegível pode solicitar uma pausa por período contratual, com uma duração total máxima de dois meses consecutivos. A pausa não é automática e requer aprovação por escrito da Dar Tahara.",
      "Uma pausa pode ser aprovada quando a limpeza não puder razoavelmente ter lugar devido a circunstâncias relacionadas com o imóvel, incluindo obras de construção, renovação significativa, danos graves no imóvel ou inacessibilidade temporária. Férias comuns, viagens, ausência temporária, baixa ocupação, falta de hóspedes, redução das necessidades de limpeza ou circunstâncias financeiras normalmente não são elegíveis.",
      "Durante uma pausa aprovada, os serviços de limpeza e a faturação recorrente são suspensos, as visitas de limpeza não utilizadas não se acumulam, a data de término do contrato é prolongada pelo período de pausa aprovado, e a subscrição é retomada automaticamente na data de retoma aprovada. O preço e o desconto acordados da subscrição mantêm-se inalterados.",
      "Uma pausa não cancela a subscrição, não encurta o período de serviço contratado nem remove as suas obrigações relativas ao período contratual remanescente. O direito de pausa não utilizado não tem valor monetário, não é reembolsável e não transita para um contrato posterior. Um contrato elegível renovado recebe um novo direito de pausa, sujeito aos termos aplicáveis no momento da renovação. A Dar Tahara pode solicitar informação justificativa razoável e pode rejeitar, encurtar, adiar ou modificar um pedido de pausa quando não estejam reunidos os requisitos operacionais, de faturação, de agendamento ou de elegibilidade.",
    ],
    termsSupportHeading: "9. Dar Tahara Support",
    termsSupport: "Dar Tahara Support está disponível por WhatsApp, telefone e e-mail entre as 09:00 e as 21:00 GMT+01:00. Respondemos a pedidos de suporte dentro de 24 horas úteis.",
  },
  ar: {
    articleTitle: "تغيير مواعيد التنظيف وإلغاء الاشتراك ودعم دار طهارة",
    articleSummary: "يمكن إلغاء الزيارات أو تغيير موعدها عبر بوابة العميل قبل 48 ساعة على الأقل، بينما يخضع إلغاء الاشتراك لقواعد منفصلة.",
    articleContent: "يمكن للعميل إلغاء أو تغيير موعد تقييم المنزل الأولي وزيارات التنظيف المجدولة والخدمات الإضافية لمرة واحدة عبر بوابة العميل قبل 48 ساعة على الأقل من البداية. يُسمح بتغيير الموعد مرتين كحد أقصى في السنة الميلادية وحسب التوفر. يظهر الموعد في البوابة قبل يومين على الأقل وقد يتغير أحياناً مع نمو عدد العملاء. إذا رُفض الدخول أو تعذر، يُلغى الموعد دون رسوم إضافية، ولكن دون استرداد أو زيارة بديلة أو رصيد؛ ويستمر الاشتراك المدفوع مسبقاً مع الزيارة العادية التالية. تُعاد جدولة الزيارات المتأثرة بالعطل الوطنية أو الإسلامية. لا يمكن الإيقاف المؤقت إلا لاشتراك مؤهل مدته تسعة أو اثنا عشر شهراً، رهناً بموافقة دار طهارة والشروط الواردة في قسم ميزة الإيقاف المؤقت للاشتراك؛ ولا يمكن إيقاف الاشتراكات الأخرى مؤقتاً. لا يُلغى الاشتراك إلا عبر البوابة مع إشعار قبل شهر على الأقل. ينتهي الشهري بنهاية الفترة المدفوعة والسنوي بنهاية الاثني عشر شهراً. لا تُرد الفترات غير المستخدمة. يجب دفع المبالغ المستحقة وإلا يسقط طلب الإلغاء. يترتب على الإلغاء خلال 14 يوماً بعد اكتمال تقييم المنزل وقبوله رسم إضافي يساوي 100٪ من أول دفعة اشتراك، مع مراعاة الحقوق القانونية الإلزامية. يتوفر Dar Tahara Support عبر واتساب والهاتف والبريد من 09:00 إلى 21:00 بتوقيت GMT+01:00 ويرد خلال 24 ساعة عمل.",
    whatsappCancellation: "يمكن إلغاء زيارة التنظيف أو تقييم المنزل عبر بوابة العميل قبل 48 ساعة على الأقل. ويُلغى الاشتراك من البوابة مع إشعار قبل شهر. ينتهي الشهري بنهاية الفترة المدفوعة والسنوي بنهاية الاثني عشر شهراً. لا يوجد استرداد للفترات غير المستخدمة؛ ولا يمكن الإيقاف المؤقت إلا لاشتراك مؤهل مدته تسعة أو اثنا عشر شهراً رهناً بالموافقة، ويجب دفع المبالغ المستحقة. تنص الشروط على رسم إضافي عند الإلغاء خلال 14 يوماً بعد اكتمال التقييم وقبوله.",
    whatsappReschedule: "يمكن تغيير موعد التنظيف أو تقييم المنزل عبر البوابة قبل 48 ساعة على الأقل، مرتين كحد أقصى في السنة وحسب التوفر. يظهر الموعد قبل يومين على الأقل. وتُعاد جدولة الزيارات المتأثرة بالعطل الوطنية أو الإسلامية.",
    termsSchedulingHeading: "3. الجدولة وتغيير الموعد وإلغاء الزيارات",
    termsScheduling: [
      "يظهر موعد تقييم المنزل أو التنظيف في بوابة العميل قبل يومين على الأقل. نحاول الحفاظ على الانتظام، لكن القدرة التشغيلية والنمو قد يفرضان تغييراً أحياناً.",
      "يمكنك إلغاء أو تغيير موعد التقييم أو التنظيف المجدول أو الخدمة الإضافية عبر البوابة قبل 48 ساعة على الأقل. يخضع تغيير الموعد للتوفر ويقتصر على مرتين في السنة.",
      "إذا تعذر الدخول الآمن أو رُفض، يُلغى الموعد دون رسوم إضافية. ولا يترتب على زيارة الاشتراك المدفوعة مسبقاً استرداد أو زيارة بديلة أو رصيد؛ وتستمر الخدمة في الزيارة العادية التالية.",
      "إذا منعت عطلة وطنية أو إسلامية تنفيذ الزيارة، فستُعاد جدولتها إلى وقت أو يوم مناسب آخر.",
    ],
    termsSubscriptionHeading: "4. اعتماد الاشتراك والفوترة والإلغاء",
    termsSubscription: [
      "يبدأ الاشتراك بعد إكمال تقييم المنزل واعتماده وقبول العرض ونجاح الدفع.",
      "لا يتم الإلغاء إلا عبر بوابة العميل مع إشعار قبل شهر على الأقل. ينتهي الشهري بنهاية الفترة المدفوعة والسنوي بنهاية الاثني عشر شهراً. لا تُرد الفترات غير المستخدمة.",
      "تُعالج ميزة الإيقاف المؤقت بشكل منفصل أدناه، وهي متاحة فقط للاشتراكات المؤهلة لمدة تسعة واثني عشر شهراً. يجب دفع جميع الفواتير والرسوم المستحقة قبل سريان الإلغاء، وإلا يسقط الطلب.",
      "يترتب على الإلغاء خلال 14 يوماً بعد اكتمال التقييم وقبوله رسم إضافي يعادل 100٪ من أول دفعة اشتراك، مع مراعاة الحقوق القانونية الإلزامية. يوضح التأكيد تاريخ السريان وآخر موعد تنظيف.",
    ],
    termsDurationDiscountsHeading: "4a. خصومات مدة الاشتراك",
    termsDurationDiscounts: [
      "تقدم دار طهارة عقود اشتراك بمدة محددة تبدأ من ثلاثة أو ستة أو تسعة أو اثني عشر شهراً. يتم عرض السعر المطبق والخصم وتكرار الخدمة ومدة العقد وتاريخ البدء والحد الأدنى لقيمة العقد عليك قبل تأكيد الاشتراك.",
      "خصومات المدة القياسية هي: ثلاثة أشهر، بدون خصم مدة؛ ستة أشهر، 5٪؛ تسعة أشهر، 10٪؛ اثنا عشر شهراً، 15٪. يُطبَّق خصم المدة فقط على رسوم التنظيف المتكررة المؤهلة — ولا يُطبَّق على الرسوم لمرة واحدة أو التقييمات أو الغرامات أو رسوم التنظيف العميق أو رسوم إدارة المفاتيح أو الأقفال الذكية أو التركيب أو المنتجات أو الخدمات الأخرى المستثناة، ما لم يُذكر صراحةً خلاف ذلك.",
      "يظل السعر والخصم المقبولان عند بداية العقد ساريين خلال مدة ذلك العقد، مع مراعاة التغييرات المطلوبة قانوناً أو الضرائب أو تعديلات الخطة الموافق عليها من العميل. ما لم ينص القانون الإلزامي على خلاف ذلك، فإن إلغاء اشتراك ذي مدة محددة قبل تاريخ الانتهاء المتفق عليه لا يُعفيك تلقائياً من التزامات الدفع المتعلقة بالمدة المتبقية من العقد.",
    ],
    termsPauseBenefitHeading: "4b. ميزة الإيقاف المؤقت للاشتراك",
    termsPauseBenefit: [
      "تتوفر ميزة الإيقاف المؤقت للاشتراك فقط للعملاء الذين لديهم اشتراك نشط مدته تسعة أو اثنا عشر شهراً. يجوز للعميل المؤهل طلب إيقاف مؤقت واحد لكل مدة عقد، لمدة إجمالية أقصاها شهران متتاليان. الإيقاف المؤقت ليس تلقائياً ويتطلب موافقة خطية من دار طهارة.",
      "يجوز الموافقة على الإيقاف المؤقت عندما يتعذر إجراء التنظيف بشكل معقول بسبب ظروف متعلقة بالعقار، بما في ذلك أعمال البناء أو التجديد الكبير أو الأضرار الجسيمة بالعقار أو تعذر الوصول المؤقت. لا تُعد العطلات العادية أو السفر أو الغياب المؤقت أو انخفاض الإشغال أو عدم وجود ضيوف أو انخفاض الحاجة إلى التنظيف أو الظروف المالية أسباباً مؤهلة عادةً.",
      "أثناء الإيقاف المؤقت المعتمد، تُعلَّق خدمات التنظيف والفوترة المتكررة، ولا تتراكم زيارات التنظيف غير المستخدمة، ويُمدَّد تاريخ انتهاء العقد بمقدار فترة الإيقاف المؤقت المعتمدة، ويُستأنف الاشتراك تلقائياً في تاريخ الاستئناف المعتمد. يظل سعر الاشتراك والخصم المتفق عليهما دون تغيير.",
      "لا يُلغي الإيقاف المؤقت الاشتراك، ولا يُقصِّر فترة الخدمة المتعاقد عليها، ولا يُزيل التزاماتك عن المدة المتبقية من العقد. ليس لاستحقاق الإيقاف المؤقت غير المستخدم أي قيمة نقدية، وهو غير قابل للاسترداد، ولا يُرحَّل إلى عقد لاحق. يحصل العقد المؤهل المجدَّد على استحقاق إيقاف مؤقت جديد، وفقاً للشروط المطبقة وقت التجديد. يجوز لدار طهارة طلب معلومات داعمة معقولة، ويجوز لها رفض طلب الإيقاف المؤقت أو تقصيره أو تأجيله أو تعديله عند عدم استيفاء المتطلبات التشغيلية أو المتعلقة بالفوترة أو الجدولة أو الأهلية.",
    ],
    termsSupportHeading: "9. Dar Tahara Support",
    termsSupport: "يتوفر Dar Tahara Support عبر واتساب والهاتف والبريد الإلكتروني من 09:00 إلى 21:00 بتوقيت GMT+01:00. نهدف إلى الرد على طلب الدعم خلال 24 ساعة عمل.",
  },
};
