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
  termsSupportHeading: string;
  termsSupport: string;
};

export const SERVICE_POLICY_COPY: Record<Locale, ServicePolicyCopy> = {
  en: {
    articleTitle: "Cleaning changes, subscription cancellation and Dar Tahara Support",
    articleSummary: "Visits can be cancelled or rescheduled through the customer portal at least 48 hours ahead; subscriptions follow separate cancellation rules.",
    articleContent: "The Initial Home Assessment, scheduled cleaning visits and one-off additional services may be cancelled or rescheduled by the customer through the customer portal at least 48 hours before the scheduled start. A customer may reschedule at most twice per calendar year, subject to availability. The planned time is shown in the customer portal at least two days ahead and may occasionally shift as the customer base grows. If access is refused or unavailable, the appointment is cancelled without an extra access or late-cancellation charge, but no refund, replacement visit or credit is due because subscription cleaning is prepaid; the service continues with the next visit in the normal cycle. Smart-lock access helps Dar Tahara attend at the announced time. If Dar Tahara cannot perform a visit because of a national or Islamic holiday, the visit is rescheduled to another time or day. Subscriptions cannot be paused. A subscription may be cancelled only through the customer portal with at least one month’s notice. A monthly subscription ends at the end of its paid billing period; an annual subscription ends at the end of its twelve-month term. Unused periods are not refundable, and planned visits continue until the effective end date unless the customer refuses access. All outstanding invoices and charges must be paid before cancellation can take effect; an unpaid cancellation request lapses. If a customer cancels a subscription within 14 days after the completed and accepted Home Assessment, an additional cancellation fee equal to 100% of the first subscription payment applies, subject to mandatory law. The cancellation confirmation states the effective date and final cleaning date. Dar Tahara Support is available by WhatsApp, telephone and email from 09:00 to 21:00 GMT+01:00 and may promise a response within 24 working hours. Customer-facing requests are called support requests.",
    whatsappCancellation: "Cleaning visits and the Home Assessment can be cancelled in the customer portal at least 48 hours before the scheduled start. Subscription cancellation is also completed in the customer portal with at least one month’s notice. Monthly cancellation takes effect at the end of the paid billing period; annual cancellation at the end of the twelve-month term. Unused periods are not refundable, subscriptions cannot be paused, and outstanding payments must be settled. The Terms include an additional fee when a subscription is cancelled within 14 days after the completed and accepted Home Assessment.",
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
      "Subscriptions cannot be paused. All outstanding invoices, charges and other amounts due must be paid before cancellation can take effect. If they remain unpaid, the cancellation request lapses and the amounts already due remain payable.",
      "If you cancel a subscription within 14 days after the completed and accepted Home Assessment, an additional cancellation fee equal to 100% of the first subscription payment applies. This clause does not limit rights that cannot lawfully be excluded under applicable consumer law. Your cancellation confirmation will state the effective date and final cleaning date.",
    ],
    termsSupportHeading: "9. Dar Tahara Support",
    termsSupport: "Dar Tahara Support is available through WhatsApp, telephone and email between 09:00 and 21:00 GMT+01:00. We aim to respond to a support request within 24 working hours. Formal notices may be sent to the contact details published on the website.",
  },
  nl: {
    articleTitle: "Wijzigingen van schoonmaakbezoeken, opzegging en Dar Tahara Support",
    articleSummary: "Bezoeken kunnen minstens 48 uur vooraf via het klantenportaal worden geannuleerd of verzet; voor abonnementen gelden aparte opzegregels.",
    articleContent: "De Initiële Woningbeoordeling, geplande schoonmaakbezoeken en eenmalige extra diensten kunnen via het klantenportaal minstens 48 uur vóór de start worden geannuleerd of verzet. Verzetten kan maximaal twee keer per kalenderjaar en is afhankelijk van beschikbaarheid. Het geplande tijdstip staat minstens twee dagen vooraf in het portaal en kan door groei soms verschuiven. Bij geweigerde of ontbrekende toegang vervalt de afspraak zonder extra kosten, maar zonder terugbetaling, vervangend bezoek of tegoed; het vooraf betaalde abonnement gaat verder met het volgende normale bezoek. Bij nationale of islamitische feestdagen wordt een gemist bezoek verzet. Abonnementen kunnen niet worden gepauzeerd. Opzeggen kan alleen via het klantenportaal met minstens één maand opzegtermijn. Een maandabonnement eindigt aan het einde van de betaalde periode en een jaarabonnement aan het einde van de looptijd van twaalf maanden. Ongebruikte perioden worden niet terugbetaald. Openstaande bedragen moeten vóór de einddatum zijn betaald; anders vervalt het opzegverzoek. Bij opzegging binnen 14 dagen na de voltooide en geaccepteerde Woningbeoordeling geldt een extra vergoeding van 100% van de eerste abonnementsbetaling, behoudens dwingend recht. Dar Tahara Support is bereikbaar via WhatsApp, telefoon en e-mail van 09:00 tot 21:00 GMT+01:00 en reageert binnen 24 werkuren.",
    whatsappCancellation: "Een schoonmaakbezoek of Woningbeoordeling kan minstens 48 uur vóór de start via het klantenportaal worden geannuleerd. Een abonnement zegt u daar op met minstens één maand opzegtermijn. Een maandabonnement eindigt na de betaalde periode en een jaarabonnement na twaalf maanden. Ongebruikte perioden worden niet terugbetaald, pauzeren is niet mogelijk en openstaande bedragen moeten worden voldaan. De Voorwaarden bevatten een extra vergoeding bij opzegging binnen 14 dagen na de voltooide en geaccepteerde Woningbeoordeling.",
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
      "Een abonnement kan niet worden gepauzeerd. Alle openstaande facturen en kosten moeten vóór de opzegging ingaat zijn betaald. Anders vervalt het opzegverzoek en blijven de bedragen verschuldigd.",
      "Bij opzegging binnen 14 dagen na de voltooide en geaccepteerde Woningbeoordeling geldt een extra vergoeding van 100% van de eerste abonnementsbetaling, behoudens dwingend consumentenrecht. De bevestiging vermeldt de einddatum en laatste schoonmaakdatum.",
    ],
    termsSupportHeading: "9. Dar Tahara Support",
    termsSupport: "Dar Tahara Support is bereikbaar via WhatsApp, telefoon en e-mail tussen 09:00 en 21:00 GMT+01:00. Wij streven ernaar binnen 24 werkuren op een supportverzoek te reageren.",
  },
  fr: {
    articleTitle: "Modification des visites, résiliation et Dar Tahara Support",
    articleSummary: "Les visites peuvent être annulées ou reportées via le portail au moins 48 heures à l’avance ; la résiliation suit des règles distinctes.",
    articleContent: "L’Évaluation Initiale du Domicile, les nettoyages planifiés et les services supplémentaires ponctuels peuvent être annulés ou reportés via le portail client au moins 48 heures avant le début. Deux reports au maximum sont autorisés par année civile, sous réserve de disponibilité. L’horaire apparaît dans le portail au moins deux jours à l’avance et peut parfois changer avec la croissance. En cas d’accès refusé ou impossible, le rendez-vous est annulé sans frais supplémentaires, mais sans remboursement, visite de remplacement ni crédit ; l’abonnement prépayé reprend au prochain passage normal. Une visite empêchée par un jour férié national ou islamique est reportée. Les abonnements ne peuvent pas être suspendus. La résiliation s’effectue uniquement dans le portail avec un préavis d’au moins un mois. Le mensuel se termine à la fin de la période payée et l’annuel à la fin des douze mois. Les périodes inutilisées ne sont pas remboursées. Les sommes dues doivent être réglées, sinon la demande de résiliation devient caduque. Une résiliation dans les 14 jours suivant l’Évaluation terminée et acceptée entraîne des frais supplémentaires égaux à 100 % du premier paiement d’abonnement, sous réserve du droit impératif. Dar Tahara Support est joignable par WhatsApp, téléphone et e-mail de 09:00 à 21:00 GMT+01:00 et répond sous 24 heures ouvrées.",
    whatsappCancellation: "Une visite de nettoyage ou l’Évaluation peut être annulée dans le portail client au moins 48 heures avant son début. La résiliation d’un abonnement s’y effectue avec un préavis d’au moins un mois. Le mensuel se termine à la fin de la période payée et l’annuel à la fin des douze mois. Il n’y a pas de remboursement des périodes inutilisées ni de suspension, et les sommes dues doivent être réglées. Des frais supplémentaires s’appliquent en cas de résiliation dans les 14 jours suivant l’Évaluation terminée et acceptée.",
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
      "L’abonnement ne peut pas être suspendu. Toutes les factures et sommes dues doivent être réglées avant la prise d’effet ; sinon la demande devient caduque.",
      "Une résiliation dans les 14 jours suivant l’Évaluation terminée et acceptée entraîne des frais supplémentaires égaux à 100 % du premier paiement d’abonnement, sous réserve des droits impératifs. La confirmation indique la date d’effet et la dernière date de nettoyage.",
    ],
    termsSupportHeading: "9. Dar Tahara Support",
    termsSupport: "Dar Tahara Support est disponible par WhatsApp, téléphone et e-mail entre 09:00 et 21:00 GMT+01:00. Nous visons une réponse à toute demande de support sous 24 heures ouvrées.",
  },
  es: {
    articleTitle: "Cambios de visitas, cancelación de suscripción y Dar Tahara Support",
    articleSummary: "Las visitas se cancelan o reprograman en el portal con al menos 48 horas; la suscripción tiene reglas de cancelación separadas.",
    articleContent: "La Evaluación Inicial, las limpiezas programadas y los servicios adicionales puntuales pueden cancelarse o reprogramarse en el portal del cliente al menos 48 horas antes del inicio. Se permiten como máximo dos cambios por año natural, sujetos a disponibilidad. El horario aparece en el portal al menos dos días antes y puede variar ocasionalmente por el crecimiento. Si se rechaza o no hay acceso, la cita se cancela sin coste adicional, pero sin reembolso, visita sustitutiva ni crédito; la suscripción prepagada continúa con la siguiente visita normal. Las visitas afectadas por festivos nacionales o islámicos se reprograman. Las suscripciones no pueden pausarse. Solo pueden cancelarse en el portal con al menos un mes de preaviso. La mensual termina al final del periodo pagado y la anual al final de los doce meses. No se reembolsan periodos no utilizados. Los importes pendientes deben pagarse o la solicitud caduca. Cancelar dentro de los 14 días posteriores a la Evaluación completada y aceptada conlleva un cargo adicional del 100 % del primer pago de la suscripción, sujeto a la ley imperativa. Dar Tahara Support atiende por WhatsApp, teléfono y correo de 09:00 a 21:00 GMT+01:00 y responde en 24 horas laborables.",
    whatsappCancellation: "La limpieza o Evaluación puede cancelarse en el portal al menos 48 horas antes. La suscripción se cancela allí con un mes de preaviso. La mensual termina al final del periodo pagado y la anual al finalizar los doce meses. No hay reembolso de periodos no usados ni pausas, y deben pagarse los importes pendientes. Los Términos prevén un cargo adicional si se cancela dentro de los 14 días posteriores a la Evaluación completada y aceptada.",
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
      "No se permiten pausas. Todas las facturas y cargos pendientes deben pagarse antes de que la cancelación sea efectiva; de lo contrario, la solicitud caduca.",
      "La cancelación dentro de los 14 días posteriores a la Evaluación completada y aceptada conlleva un cargo adicional del 100 % del primer pago, sujeto a los derechos legales obligatorios. La confirmación muestra la fecha efectiva y la última limpieza.",
    ],
    termsSupportHeading: "9. Dar Tahara Support",
    termsSupport: "Dar Tahara Support atiende por WhatsApp, teléfono y correo electrónico entre las 09:00 y las 21:00 GMT+01:00. El objetivo de respuesta es de 24 horas laborables.",
  },
  de: {
    articleTitle: "Terminänderungen, Abo-Kündigung und Dar Tahara Support",
    articleSummary: "Besuche können mindestens 48 Stunden vorher im Kundenportal storniert oder verschoben werden; für Abos gelten eigene Kündigungsregeln.",
    articleContent: "Die Ersteinschätzung, geplante Reinigungen und einmalige Zusatzleistungen können mindestens 48 Stunden vor Beginn im Kundenportal storniert oder verschoben werden. Verschiebungen sind höchstens zweimal pro Kalenderjahr und nach Verfügbarkeit möglich. Der Termin steht mindestens zwei Tage vorher im Portal und kann sich durch Wachstum gelegentlich ändern. Wird der Zugang verweigert oder ist er nicht möglich, entfällt der Termin ohne Zusatzkosten, jedoch ohne Erstattung, Ersatzbesuch oder Gutschrift; das vorausbezahlte Abo läuft mit dem nächsten regulären Besuch weiter. Von nationalen oder islamischen Feiertagen betroffene Besuche werden verschoben. Abos können nicht pausiert werden. Die Kündigung erfolgt nur im Portal mit mindestens einem Monat Frist. Monatsabos enden am Ende des bezahlten Zeitraums, Jahresabos am Ende der zwölf Monate. Ungenutzte Zeiten werden nicht erstattet. Offene Beträge müssen bezahlt werden, sonst verfällt der Kündigungsantrag. Bei Kündigung innerhalb von 14 Tagen nach abgeschlossener und akzeptierter Ersteinschätzung fällt vorbehaltlich zwingenden Rechts eine zusätzliche Gebühr von 100 % der ersten Abozahlung an. Dar Tahara Support ist per WhatsApp, Telefon und E-Mail von 09:00 bis 21:00 GMT+01:00 erreichbar und antwortet innerhalb von 24 Arbeitsstunden.",
    whatsappCancellation: "Eine Reinigung oder Ersteinschätzung kann mindestens 48 Stunden vorher im Kundenportal storniert werden. Das Abo wird dort mit mindestens einem Monat Frist gekündigt. Das Monatsabo endet nach dem bezahlten Zeitraum, das Jahresabo nach zwölf Monaten. Ungenutzte Zeiten werden nicht erstattet, Pausen sind nicht möglich und offene Beträge müssen bezahlt werden. Bei Kündigung innerhalb von 14 Tagen nach der abgeschlossenen und akzeptierten Ersteinschätzung gilt eine zusätzliche Gebühr.",
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
      "Abos können nicht pausiert werden. Offene Rechnungen und Gebühren müssen vor Wirksamwerden bezahlt sein; andernfalls verfällt der Kündigungsantrag.",
      "Bei Kündigung innerhalb von 14 Tagen nach der abgeschlossenen und akzeptierten Ersteinschätzung fällt vorbehaltlich zwingenden Verbraucherrechts eine zusätzliche Gebühr von 100 % der ersten Abozahlung an. Die Bestätigung nennt Enddatum und letzten Reinigungstermin.",
    ],
    termsSupportHeading: "9. Dar Tahara Support",
    termsSupport: "Dar Tahara Support ist per WhatsApp, Telefon und E-Mail zwischen 09:00 und 21:00 GMT+01:00 erreichbar. Wir antworten auf Supportanfragen innerhalb von 24 Arbeitsstunden.",
  },
  pt: {
    articleTitle: "Alterações de visitas, cancelamento da subscrição e Dar Tahara Support",
    articleSummary: "As visitas podem ser canceladas ou reagendadas no portal com 48 horas de antecedência; a subscrição tem regras próprias.",
    articleContent: "A Avaliação Inicial, as limpezas agendadas e os serviços adicionais pontuais podem ser cancelados ou reagendados no portal do cliente pelo menos 48 horas antes. O reagendamento é permitido no máximo duas vezes por ano civil e depende da disponibilidade. O horário aparece no portal pelo menos dois dias antes e pode mudar ocasionalmente com o crescimento. Se o acesso for recusado ou impossível, a marcação é cancelada sem custo extra, mas sem reembolso, visita de substituição ou crédito; a subscrição pré-paga continua na visita normal seguinte. As visitas afetadas por feriados nacionais ou islâmicos são reagendadas. As subscrições não podem ser pausadas. O cancelamento é feito apenas no portal com pelo menos um mês de aviso. A mensal termina no fim do período pago e a anual no fim dos doze meses. Períodos não usados não são reembolsados. Valores em dívida devem ser pagos ou o pedido caduca. O cancelamento nos 14 dias após a Avaliação concluída e aceite implica uma taxa adicional de 100% do primeiro pagamento, sem prejuízo da lei imperativa. Dar Tahara Support atende por WhatsApp, telefone e e-mail das 09:00 às 21:00 GMT+01:00 e responde em 24 horas úteis.",
    whatsappCancellation: "Uma limpeza ou Avaliação pode ser cancelada no portal com pelo menos 48 horas de antecedência. A subscrição é cancelada ali com aviso mínimo de um mês. A mensal termina no fim do período pago e a anual ao fim dos doze meses. Não há reembolso de períodos não usados nem pausas, e os valores em dívida devem ser pagos. Os Termos preveem uma taxa adicional se cancelar nos 14 dias após a Avaliação concluída e aceite.",
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
      "A subscrição não pode ser pausada. Todas as faturas e encargos pendentes devem ser pagos antes da data efetiva; caso contrário, o pedido caduca.",
      "O cancelamento nos 14 dias após a Avaliação concluída e aceite implica uma taxa adicional de 100% do primeiro pagamento, sem prejuízo dos direitos legais obrigatórios. A confirmação indica a data efetiva e a última limpeza.",
    ],
    termsSupportHeading: "9. Dar Tahara Support",
    termsSupport: "Dar Tahara Support está disponível por WhatsApp, telefone e e-mail entre as 09:00 e as 21:00 GMT+01:00. Respondemos a pedidos de suporte dentro de 24 horas úteis.",
  },
  ar: {
    articleTitle: "تغيير مواعيد التنظيف وإلغاء الاشتراك ودعم دار طهارة",
    articleSummary: "يمكن إلغاء الزيارات أو تغيير موعدها عبر بوابة العميل قبل 48 ساعة على الأقل، بينما يخضع إلغاء الاشتراك لقواعد منفصلة.",
    articleContent: "يمكن للعميل إلغاء أو تغيير موعد تقييم المنزل الأولي وزيارات التنظيف المجدولة والخدمات الإضافية لمرة واحدة عبر بوابة العميل قبل 48 ساعة على الأقل من البداية. يُسمح بتغيير الموعد مرتين كحد أقصى في السنة الميلادية وحسب التوفر. يظهر الموعد في البوابة قبل يومين على الأقل وقد يتغير أحياناً مع نمو عدد العملاء. إذا رُفض الدخول أو تعذر، يُلغى الموعد دون رسوم إضافية، ولكن دون استرداد أو زيارة بديلة أو رصيد؛ ويستمر الاشتراك المدفوع مسبقاً مع الزيارة العادية التالية. تُعاد جدولة الزيارات المتأثرة بالعطل الوطنية أو الإسلامية. لا يمكن إيقاف الاشتراك مؤقتاً. لا يُلغى الاشتراك إلا عبر البوابة مع إشعار قبل شهر على الأقل. ينتهي الشهري بنهاية الفترة المدفوعة والسنوي بنهاية الاثني عشر شهراً. لا تُرد الفترات غير المستخدمة. يجب دفع المبالغ المستحقة وإلا يسقط طلب الإلغاء. يترتب على الإلغاء خلال 14 يوماً بعد اكتمال تقييم المنزل وقبوله رسم إضافي يساوي 100٪ من أول دفعة اشتراك، مع مراعاة الحقوق القانونية الإلزامية. يتوفر Dar Tahara Support عبر واتساب والهاتف والبريد من 09:00 إلى 21:00 بتوقيت GMT+01:00 ويرد خلال 24 ساعة عمل.",
    whatsappCancellation: "يمكن إلغاء زيارة التنظيف أو تقييم المنزل عبر بوابة العميل قبل 48 ساعة على الأقل. ويُلغى الاشتراك من البوابة مع إشعار قبل شهر. ينتهي الشهري بنهاية الفترة المدفوعة والسنوي بنهاية الاثني عشر شهراً. لا يوجد استرداد للفترات غير المستخدمة ولا يمكن الإيقاف المؤقت، ويجب دفع المبالغ المستحقة. تنص الشروط على رسم إضافي عند الإلغاء خلال 14 يوماً بعد اكتمال التقييم وقبوله.",
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
      "لا يمكن إيقاف الاشتراك مؤقتاً. يجب دفع جميع الفواتير والرسوم المستحقة قبل سريان الإلغاء، وإلا يسقط الطلب.",
      "يترتب على الإلغاء خلال 14 يوماً بعد اكتمال التقييم وقبوله رسم إضافي يعادل 100٪ من أول دفعة اشتراك، مع مراعاة الحقوق القانونية الإلزامية. يوضح التأكيد تاريخ السريان وآخر موعد تنظيف.",
    ],
    termsSupportHeading: "9. Dar Tahara Support",
    termsSupport: "يتوفر Dar Tahara Support عبر واتساب والهاتف والبريد الإلكتروني من 09:00 إلى 21:00 بتوقيت GMT+01:00. نهدف إلى الرد على طلب الدعم خلال 24 ساعة عمل.",
  },
};
