-- Owner-approved support, visit-change and subscription-cancellation policy.
-- This is a corrective data migration: application identifiers for the support
-- adapter remain unchanged, while published/admin-visible wording is updated.

update public.knowledge_builder_questions
set
  current_knowledge = 'Monthly and annual subscriptions cannot be paused.',
  missing_information = 'None. The owner confirmed that subscriptions cannot be paused.',
  owner_answer = 'No. A monthly or annual subscription cannot be paused.',
  normalized_short_answer = 'Subscriptions cannot be paused.',
  normalized_detailed_answer = 'Monthly and annual subscriptions cannot be paused. Customers may cancel a subscription through the customer portal under the approved cancellation terms.',
  status = 'approved',
  blocks_customer_support = false,
  answer_language = 'en',
  internal_notes = 'Owner-approved policy supplied on 24 July 2026.',
  answered_at = coalesce(answered_at, now()),
  approved_at = coalesce(approved_at, now()),
  updated_at = now()
where question_key = 'subscription-pause';

update public.knowledge_builder_questions
set
  question = 'How may a customer cancel or reschedule a Home Assessment or scheduled cleaning?',
  current_knowledge = 'The customer uses the customer portal at least 48 hours before the scheduled start. Rescheduling is limited to twice per calendar year.',
  missing_information = 'None. The owner confirmed the portal, notice period, yearly rescheduling limit and access outcome.',
  owner_answer = 'An Initial Home Assessment, scheduled cleaning or one-off additional service may be cancelled or rescheduled by the customer in the customer portal at least 48 hours before the scheduled start. Rescheduling is limited to two times per calendar year and remains subject to availability. If access is unavailable or refused, the appointment is cancelled without an extra charge, refund, replacement visit or credit; a prepaid subscription continues with the next normal visit.',
  normalized_short_answer = 'Cancel or reschedule in the customer portal at least 48 hours ahead; rescheduling is limited to twice per calendar year.',
  normalized_detailed_answer = 'The Initial Home Assessment, a scheduled cleaning and a one-off additional service can be cancelled or rescheduled through the customer portal at least 48 hours before the scheduled start. Rescheduling is limited to twice per calendar year and is subject to availability. If access is unavailable or refused, the appointment is cancelled with no extra access or late-cancellation fee, but without a refund, replacement visit or credit because subscription service is prepaid. Visits affected by national or Islamic holidays are rescheduled.',
  status = 'approved',
  blocks_customer_support = false,
  answer_language = 'en',
  internal_notes = 'Owner-approved policy supplied on 24 July 2026. Contractual wording is published in the Terms and Conditions.',
  answered_at = coalesce(answered_at, now()),
  approved_at = coalesce(approved_at, now()),
  updated_at = now()
where question_key = 'cancellation-notice';

update public.knowledge_builder_questions
set
  question = 'When is Dar Tahara Support available and what response time may be promised?',
  current_knowledge = 'Dar Tahara Support is available by WhatsApp, telephone and email from 09:00 to 21:00 GMT+01:00.',
  missing_information = 'None. The owner approved the channels, hours, timezone and response target.',
  owner_answer = 'Dar Tahara Support is available through WhatsApp, telephone and email between 09:00 and 21:00 GMT+01:00. The assistant may promise a response within 24 working hours. Customer-facing requests are called support requests.',
  normalized_short_answer = 'Dar Tahara Support: WhatsApp, telephone and email, 09:00–21:00 GMT+01:00; response within 24 working hours.',
  normalized_detailed_answer = 'Dar Tahara Support is available through WhatsApp, telephone and email between 09:00 and 21:00 GMT+01:00. The customer-facing name is Dar Tahara Support, each request is a support request, and the response target is within 24 working hours.',
  status = 'approved',
  blocks_customer_support = false,
  answer_language = 'en',
  internal_notes = 'Owner-approved policy supplied on 24 July 2026.',
  answered_at = coalesce(answered_at, now()),
  approved_at = coalesce(approved_at, now()),
  updated_at = now()
where question_key = 'human-escalation-sla';

update public.knowledge_entries
set status = 'archived', updated_at = now()
where slug in ('service-change-subscription-cancellation', 'dar-tahara-support-availability')
  and status = 'published';

insert into public.knowledge_entries (
  slug, category, title, language, content, status, version, effective_from,
  keywords, synonyms, source, reviewed_at
) values
  (
    'service-change-subscription-cancellation', 'policies',
    'Cleaning changes and subscription cancellation', 'en',
    'The Initial Home Assessment, scheduled cleanings and one-off additional services may be cancelled or rescheduled in the customer portal at least 48 hours before the scheduled start. Rescheduling is limited to twice per calendar year and is subject to availability. If access is refused or unavailable, the appointment is cancelled without an extra charge, refund, replacement visit or credit; prepaid service continues with the next normal visit. Visits affected by national or Islamic holidays are rescheduled. Subscriptions cannot be paused. Subscription cancellation is only through the portal with one month notice. A monthly subscription ends after its paid billing period and an annual subscription after its twelve-month term. Unused periods are not refundable. Outstanding amounts must be paid or the cancellation request lapses. Cancellation within 14 days after the completed and accepted Home Assessment carries an additional fee equal to 100% of the first subscription payment, subject to mandatory law.',
    'published', 1, now(),
    array['cancel', 'reschedule', 'subscription', 'assessment', '48 hours', 'portal'],
    array['change date', 'stop subscription', 'pause subscription'], 'owner_approved_policy_2026_07_24', now()
  ),
  (
    'service-change-subscription-cancellation', 'policies',
    'Schoonmaak wijzigen en abonnement opzeggen', 'nl',
    'De Initiële Woningbeoordeling, geplande schoonmaak en eenmalige extra diensten kunnen minstens 48 uur voor de start via het klantenportaal worden geannuleerd of verzet. Verzetten kan maximaal twee keer per kalenderjaar en is afhankelijk van beschikbaarheid. Bij geweigerde of ontbrekende toegang vervalt de afspraak zonder extra kosten, terugbetaling, vervangend bezoek of tegoed; de vooraf betaalde dienst gaat verder met het volgende normale bezoek. Bezoeken op nationale of islamitische feestdagen worden verzet. Een abonnement kan niet worden gepauzeerd en wordt alleen via het portaal opgezegd met één maand opzegtermijn. Een maandabonnement eindigt na de betaalde periode en een jaarabonnement na twaalf maanden. Ongebruikte perioden worden niet terugbetaald. Openstaande bedragen moeten worden betaald, anders vervalt het verzoek. Bij opzegging binnen 14 dagen na de voltooide en geaccepteerde Woningbeoordeling geldt, behoudens dwingend recht, een extra vergoeding van 100% van de eerste abonnementsbetaling.',
    'published', 1, now(),
    array['annuleren', 'verzetten', 'abonnement', 'woningbeoordeling', '48 uur', 'portaal'],
    array['datum wijzigen', 'abonnement opzeggen', 'pauzeren'], 'owner_approved_policy_2026_07_24', now()
  ),
  (
    'service-change-subscription-cancellation', 'policies',
    'Modifier une visite et résilier un abonnement', 'fr',
    'L’Évaluation Initiale, les nettoyages planifiés et les services supplémentaires ponctuels peuvent être annulés ou reportés dans le portail client au moins 48 heures avant le début. Le report est limité à deux fois par année civile et dépend des disponibilités. Si l’accès est refusé ou impossible, le rendez-vous est annulé sans frais supplémentaires, remboursement, visite de remplacement ni avoir; le service prépayé continue au prochain passage normal. Les visites touchées par une fête nationale ou islamique sont reportées. Un abonnement ne peut pas être suspendu et se résilie uniquement dans le portail avec un préavis d’un mois. Le mensuel prend fin après la période payée et l’annuel après douze mois. Les périodes inutilisées ne sont pas remboursées. Les montants dus doivent être réglés, sinon la demande devient caduque. Une résiliation dans les 14 jours après l’Évaluation achevée et acceptée entraîne, sous réserve du droit impératif, des frais supplémentaires de 100% du premier paiement.',
    'published', 1, now(),
    array['annuler', 'reporter', 'abonnement', 'évaluation', '48 heures', 'portail'],
    array['changer la date', 'résilier', 'suspendre'], 'owner_approved_policy_2026_07_24', now()
  ),
  (
    'service-change-subscription-cancellation', 'policies',
    'تغيير موعد التنظيف وإلغاء الاشتراك', 'ar',
    'يمكن إلغاء أو تغيير موعد تقييم المنزل الأولي والتنظيفات المجدولة والخدمات الإضافية لمرة واحدة عبر بوابة العميل قبل 48 ساعة على الأقل. يقتصر تغيير الموعد على مرتين في السنة وحسب التوفر. إذا رُفض الدخول أو تعذر، يُلغى الموعد دون رسوم إضافية أو استرداد أو زيارة بديلة أو رصيد، وتستمر الخدمة المدفوعة مسبقاً مع الزيارة العادية التالية. تُعاد جدولة الزيارات المتأثرة بالعطل الوطنية أو الإسلامية. لا يمكن إيقاف الاشتراك مؤقتاً، ولا يُلغى إلا عبر البوابة مع إشعار قبل شهر. ينتهي الشهري بعد الفترة المدفوعة والسنوي بعد اثني عشر شهراً. لا تُرد الفترات غير المستخدمة. يجب دفع المبالغ المستحقة وإلا يسقط الطلب. يترتب على الإلغاء خلال 14 يوماً بعد اكتمال التقييم وقبوله رسم إضافي يساوي 100% من أول دفعة، مع مراعاة القانون الإلزامي.',
    'published', 1, now(),
    array['إلغاء', 'تغيير الموعد', 'اشتراك', 'تقييم المنزل', '48 ساعة', 'البوابة'],
    array['إعادة الجدولة', 'إيقاف الاشتراك'], 'owner_approved_policy_2026_07_24', now()
  ),
  (
    'service-change-subscription-cancellation', 'policies',
    'Cambios de limpieza y cancelación de suscripción', 'es',
    'La Evaluación Inicial, las limpiezas programadas y los servicios adicionales puntuales pueden cancelarse o reprogramarse en el portal del cliente al menos 48 horas antes. La reprogramación se limita a dos veces por año natural y depende de disponibilidad. Si se deniega o no hay acceso, la cita se cancela sin cargo adicional, reembolso, visita sustitutiva ni crédito; el servicio prepagado continúa con la siguiente visita normal. Las visitas afectadas por festivos nacionales o islámicos se reprograman. La suscripción no puede pausarse y solo se cancela en el portal con un mes de preaviso. La mensual termina tras el período pagado y la anual tras doce meses. Los períodos no usados no se reembolsan. Deben pagarse los importes pendientes o la solicitud caduca. Cancelar dentro de los 14 días posteriores a la Evaluación terminada y aceptada conlleva, salvo derecho imperativo, un cargo adicional del 100% del primer pago.',
    'published', 1, now(),
    array['cancelar', 'reprogramar', 'suscripción', 'evaluación', '48 horas', 'portal'],
    array['cambiar fecha', 'dar de baja', 'pausar'], 'owner_approved_policy_2026_07_24', now()
  ),
  (
    'service-change-subscription-cancellation', 'policies',
    'Reinigung ändern und Abonnement kündigen', 'de',
    'Die Ersteinschätzung, geplante Reinigungen und einmalige Zusatzleistungen können mindestens 48 Stunden vor Beginn im Kundenportal storniert oder verschoben werden. Verschieben ist höchstens zweimal pro Kalenderjahr und nach Verfügbarkeit möglich. Wird der Zugang verweigert oder ist er nicht möglich, entfällt der Termin ohne Zusatzkosten, Erstattung, Ersatzbesuch oder Gutschrift; der vorausbezahlte Dienst wird mit dem nächsten regulären Besuch fortgesetzt. Termine an nationalen oder islamischen Feiertagen werden verschoben. Ein Abonnement kann nicht pausiert und nur im Portal mit einem Monat Frist gekündigt werden. Das Monatsabo endet nach dem bezahlten Zeitraum und das Jahresabo nach zwölf Monaten. Ungenutzte Zeiträume werden nicht erstattet. Offene Beträge müssen bezahlt werden, sonst verfällt der Antrag. Eine Kündigung innerhalb von 14 Tagen nach abgeschlossener und akzeptierter Einschätzung kostet vorbehaltlich zwingenden Rechts zusätzlich 100% der ersten Zahlung.',
    'published', 1, now(),
    array['stornieren', 'verschieben', 'abonnement', 'ersteinschätzung', '48 stunden', 'portal'],
    array['datum ändern', 'kündigen', 'pausieren'], 'owner_approved_policy_2026_07_24', now()
  ),
  (
    'service-change-subscription-cancellation', 'policies',
    'Alterar limpeza e cancelar subscrição', 'pt',
    'A Avaliação Inicial, as limpezas agendadas e os serviços adicionais pontuais podem ser cancelados ou reagendados no portal do cliente com pelo menos 48 horas de antecedência. O reagendamento está limitado a duas vezes por ano e sujeito a disponibilidade. Se o acesso for recusado ou impossível, a marcação é cancelada sem custo adicional, reembolso, visita substituta ou crédito; o serviço pré-pago continua com a visita normal seguinte. Visitas afetadas por feriados nacionais ou islâmicos são reagendadas. A subscrição não pode ser pausada e só é cancelada no portal com um mês de aviso. A mensal termina após o período pago e a anual após doze meses. Períodos não usados não são reembolsados. Os montantes pendentes devem ser pagos ou o pedido caduca. O cancelamento nos 14 dias após a Avaliação concluída e aceite implica, sem prejuízo da lei obrigatória, uma taxa adicional de 100% do primeiro pagamento.',
    'published', 1, now(),
    array['cancelar', 'reagendar', 'subscrição', 'avaliação', '48 horas', 'portal'],
    array['alterar data', 'terminar subscrição', 'pausar'], 'owner_approved_policy_2026_07_24', now()
  )
on conflict (slug, language, version) do update set
  category = excluded.category,
  title = excluded.title,
  content = excluded.content,
  status = excluded.status,
  effective_from = excluded.effective_from,
  keywords = excluded.keywords,
  synonyms = excluded.synonyms,
  source = excluded.source,
  reviewed_at = excluded.reviewed_at,
  updated_at = now();

insert into public.knowledge_entries (
  slug, category, title, language, content, status, version, effective_from,
  keywords, synonyms, source, reviewed_at
) values
  ('dar-tahara-support-availability', 'support', 'Dar Tahara Support availability', 'en', 'Dar Tahara Support is available through WhatsApp, telephone and email between 09:00 and 21:00 GMT+01:00. We respond to a support request within 24 working hours.', 'published', 1, now(), array['support', 'hours', 'whatsapp', 'telephone', 'email'], array['help', 'contact', 'response time'], 'owner_approved_policy_2026_07_24', now()),
  ('dar-tahara-support-availability', 'support', 'Bereikbaarheid Dar Tahara Support', 'nl', 'Dar Tahara Support is bereikbaar via WhatsApp, telefoon en e-mail van 09:00 tot 21:00 GMT+01:00. Wij reageren binnen 24 werkuren op een supportverzoek.', 'published', 1, now(), array['support', 'openingstijden', 'whatsapp', 'telefoon', 'e-mail'], array['hulp', 'contact', 'reactietijd'], 'owner_approved_policy_2026_07_24', now()),
  ('dar-tahara-support-availability', 'support', 'Disponibilité de Dar Tahara Support', 'fr', 'Dar Tahara Support est disponible par WhatsApp, téléphone et e-mail de 09:00 à 21:00 GMT+01:00. Nous répondons à une demande d’assistance dans un délai de 24 heures ouvrées.', 'published', 1, now(), array['support', 'horaires', 'whatsapp', 'téléphone', 'e-mail'], array['aide', 'contact', 'délai de réponse'], 'owner_approved_policy_2026_07_24', now()),
  ('dar-tahara-support-availability', 'support', 'أوقات Dar Tahara Support', 'ar', 'يتوفر Dar Tahara Support عبر واتساب والهاتف والبريد الإلكتروني من 09:00 إلى 21:00 بتوقيت GMT+01:00. نرد على طلب الدعم خلال 24 ساعة عمل.', 'published', 1, now(), array['دعم', 'ساعات', 'واتساب', 'هاتف', 'بريد'], array['مساعدة', 'تواصل', 'وقت الرد'], 'owner_approved_policy_2026_07_24', now()),
  ('dar-tahara-support-availability', 'support', 'Disponibilidad de Dar Tahara Support', 'es', 'Dar Tahara Support está disponible por WhatsApp, teléfono y correo electrónico de 09:00 a 21:00 GMT+01:00. Respondemos a una solicitud de soporte en un plazo de 24 horas laborables.', 'published', 1, now(), array['soporte', 'horario', 'whatsapp', 'teléfono', 'correo'], array['ayuda', 'contacto', 'tiempo de respuesta'], 'owner_approved_policy_2026_07_24', now()),
  ('dar-tahara-support-availability', 'support', 'Erreichbarkeit von Dar Tahara Support', 'de', 'Dar Tahara Support ist über WhatsApp, Telefon und E-Mail von 09:00 bis 21:00 GMT+01:00 erreichbar. Wir beantworten eine Supportanfrage innerhalb von 24 Arbeitsstunden.', 'published', 1, now(), array['support', 'zeiten', 'whatsapp', 'telefon', 'e-mail'], array['hilfe', 'kontakt', 'antwortzeit'], 'owner_approved_policy_2026_07_24', now()),
  ('dar-tahara-support-availability', 'support', 'Disponibilidade de Dar Tahara Support', 'pt', 'Dar Tahara Support está disponível por WhatsApp, telefone e e-mail das 09:00 às 21:00 GMT+01:00. Respondemos a um pedido de suporte no prazo de 24 horas úteis.', 'published', 1, now(), array['suporte', 'horário', 'whatsapp', 'telefone', 'e-mail'], array['ajuda', 'contacto', 'tempo de resposta'], 'owner_approved_policy_2026_07_24', now())
on conflict (slug, language, version) do update set
  category = excluded.category,
  title = excluded.title,
  content = excluded.content,
  status = excluded.status,
  effective_from = excluded.effective_from,
  keywords = excluded.keywords,
  synonyms = excluded.synonyms,
  source = excluded.source,
  reviewed_at = excluded.reviewed_at,
  updated_at = now();

notify pgrst, 'reload schema';
