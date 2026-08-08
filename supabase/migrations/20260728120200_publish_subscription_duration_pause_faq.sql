-- Publish the owner-approved subscription-duration-discount and pause-benefit
-- FAQ into the live AI-assistant knowledge base, in every supported language.
-- Mirrors the pattern in 20260724012321_publish_initial_assessment_and_access_faq.sql.

insert into public.knowledge_entries (
  slug, category, title, language, content, status, version, effective_from,
  keywords, synonyms, source, reviewed_at
) values
  (
    'subscription-duration-pause', 'billing', 'Subscription duration discounts and the pause benefit', 'en',
    'Dar Tahara offers 3-, 6-, 9-, and 12-month subscriptions. The 6-month plan receives a 5% discount, the 9-month plan receives a 10% discount, and the 12-month plan receives a 15% discount. Customers with a 9- or 12-month subscription may request one pause of up to two consecutive months per contract, subject to Dar Tahara''s approval. The pause is intended for property-related situations such as construction, major renovation, serious damage, or temporary inaccessibility, not for holidays or travel. During an approved pause, cleaning and recurring billing are suspended, and the contract end date is extended by the approved period. 3- and 6-month subscriptions are not eligible for a pause.',
    'published', 1, now(),
    array['3 month', '6 month', '9 month', '12 month', 'duration discount', '5%', '10%', '15%', 'pause', 'construction', 'renovation'],
    array['contract length', 'fixed term', 'suspend subscription'],
    'owner_approved_faq_2026_07_28', now()
  ),
  (
    'subscription-duration-pause', 'billing', 'Kortingen op abonnementsduur en de pauzeregeling', 'nl',
    'Dar Tahara biedt abonnementen van 3, 6, 9 en 12 maanden aan. Het abonnement van 6 maanden krijgt 5% korting, dat van 9 maanden 10% korting en dat van 12 maanden 15% korting. Klanten met een abonnement van 9 of 12 maanden kunnen één pauze van maximaal twee aaneengesloten maanden per contract aanvragen, na goedkeuring door Dar Tahara. De pauze is bedoeld voor situaties rond de woning zoals verbouwing, ingrijpende renovatie, ernstige schade of tijdelijke ontoegankelijkheid, niet voor vakantie of reizen. Tijdens een goedgekeurde pauze worden schoonmaak en terugkerende facturering opgeschort, en de einddatum van het contract wordt verlengd met de goedgekeurde periode. Abonnementen van 3 en 6 maanden komen niet in aanmerking voor een pauze.',
    'published', 1, now(),
    array['3 maanden', '6 maanden', '9 maanden', '12 maanden', 'looptijdkorting', '5%', '10%', '15%', 'pauze', 'verbouwing', 'renovatie'],
    array['contractduur', 'vaste looptijd', 'abonnement opschorten'],
    'owner_approved_faq_2026_07_28', now()
  ),
  (
    'subscription-duration-pause', 'billing', 'Remises liées à la durée de l''abonnement et l''avantage de suspension', 'fr',
    'Dar Tahara propose des abonnements de 3, 6, 9 et 12 mois. La formule 6 mois bénéficie de 5 % de remise, la formule 9 mois de 10 % et la formule 12 mois de 15 %. Les clients ayant un abonnement de 9 ou 12 mois peuvent demander une suspension d''un maximum de deux mois consécutifs par contrat, sous réserve de l''approbation de Dar Tahara. Cette suspension est prévue pour des situations liées au logement telles que travaux, rénovation importante, dommages graves ou inaccessibilité temporaire, et non pour les vacances ou les voyages. Pendant une suspension approuvée, le nettoyage et la facturation récurrente sont suspendus, et la date de fin du contrat est prolongée de la période approuvée. Les abonnements de 3 et 6 mois ne sont pas éligibles à une suspension.',
    'published', 1, now(),
    array['3 mois', '6 mois', '9 mois', '12 mois', 'remise de durée', '5 %', '10 %', '15 %', 'suspension', 'travaux', 'rénovation'],
    array['durée du contrat', 'durée déterminée', 'suspendre l''abonnement'],
    'owner_approved_faq_2026_07_28', now()
  ),
  (
    'subscription-duration-pause', 'billing', 'Descuentos por duración de la suscripción y el beneficio de pausa', 'es',
    'Dar Tahara ofrece suscripciones de 3, 6, 9 y 12 meses. El plan de 6 meses recibe un 5 % de descuento, el de 9 meses un 10 % y el de 12 meses un 15 %. Los clientes con una suscripción de 9 o 12 meses pueden solicitar una pausa de hasta dos meses consecutivos por contrato, sujeta a la aprobación de Dar Tahara. Esta pausa está pensada para situaciones relacionadas con la propiedad, como obras, reformas importantes, daños graves o inaccesibilidad temporal, no para vacaciones o viajes. Durante una pausa aprobada, la limpieza y la facturación recurrente se suspenden, y la fecha de finalización del contrato se amplía según el período aprobado. Las suscripciones de 3 y 6 meses no son elegibles para una pausa.',
    'published', 1, now(),
    array['3 meses', '6 meses', '9 meses', '12 meses', 'descuento por duración', '5 %', '10 %', '15 %', 'pausa', 'obras', 'reforma'],
    array['duración del contrato', 'plazo fijo', 'suspender la suscripción'],
    'owner_approved_faq_2026_07_28', now()
  ),
  (
    'subscription-duration-pause', 'billing', 'Rabatte je nach Abo-Laufzeit und die Pausenregelung', 'de',
    'Dar Tahara bietet Abos mit 3, 6, 9 und 12 Monaten Laufzeit an. Das 6-Monats-Abo erhält 5 % Rabatt, das 9-Monats-Abo 10 % und das 12-Monats-Abo 15 %. Kunden mit einem Abo von 9 oder 12 Monaten können pro Vertrag eine Pause von bis zu zwei aufeinanderfolgenden Monaten beantragen, vorbehaltlich der Genehmigung durch Dar Tahara. Die Pause ist für Situationen rund um die Immobilie wie Bauarbeiten, größere Renovierungen, erhebliche Schäden oder vorübergehende Unzugänglichkeit vorgesehen, nicht für Urlaub oder Reisen. Während einer genehmigten Pause werden Reinigung und wiederkehrende Abrechnung ausgesetzt, und das Vertragsende verlängert sich um den genehmigten Zeitraum. Abos mit 3 und 6 Monaten Laufzeit sind nicht pausenberechtigt.',
    'published', 1, now(),
    array['3 monate', '6 monate', '9 monate', '12 monate', 'laufzeitrabatt', '5 %', '10 %', '15 %', 'pause', 'bauarbeiten', 'renovierung'],
    array['vertragslaufzeit', 'feste laufzeit', 'abo pausieren'],
    'owner_approved_faq_2026_07_28', now()
  ),
  (
    'subscription-duration-pause', 'billing', 'Descontos por duração da subscrição e o benefício de pausa', 'pt',
    'A Dar Tahara oferece subscrições de 3, 6, 9 e 12 meses. O plano de 6 meses tem 5% de desconto, o de 9 meses 10% e o de 12 meses 15%. Os clientes com uma subscrição de 9 ou 12 meses podem solicitar uma pausa de até dois meses consecutivos por contrato, sujeita à aprovação da Dar Tahara. A pausa destina-se a situações relacionadas com o imóvel, como obras, renovação significativa, danos graves ou inacessibilidade temporária, e não a férias ou viagens. Durante uma pausa aprovada, a limpeza e a faturação recorrente são suspensas, e a data de término do contrato é prolongada pelo período aprovado. As subscrições de 3 e 6 meses não são elegíveis para pausa.',
    'published', 1, now(),
    array['3 meses', '6 meses', '9 meses', '12 meses', 'desconto por duração', '5%', '10%', '15%', 'pausa', 'obras', 'renovação'],
    array['duração do contrato', 'prazo fixo', 'suspender a subscrição'],
    'owner_approved_faq_2026_07_28', now()
  ),
  (
    'subscription-duration-pause', 'billing', 'خصومات مدة الاشتراك وميزة الإيقاف المؤقت', 'ar',
    'تقدم دار طهارة اشتراكات لمدة 3 و6 و9 و12 شهراً. تحصل خطة 6 أشهر على خصم 5٪، وخطة 9 أشهر على خصم 10٪، وخطة 12 شهراً على خصم 15٪. يمكن للعملاء الذين لديهم اشتراك لمدة 9 أو 12 شهراً طلب إيقاف مؤقت واحد لمدة أقصاها شهران متتاليان لكل عقد، رهناً بموافقة دار طهارة. وهذا الإيقاف مخصص لحالات متعلقة بالعقار مثل أعمال البناء أو التجديد الكبير أو الأضرار الجسيمة أو تعذر الوصول المؤقت، وليس للعطلات أو السفر. أثناء الإيقاف المؤقت المعتمد، يُعلَّق التنظيف والفوترة المتكررة، ويُمدَّد تاريخ انتهاء العقد بمقدار الفترة المعتمدة. لا تكون اشتراكات 3 و6 أشهر مؤهلة للإيقاف المؤقت.',
    'published', 1, now(),
    array['3 أشهر', '6 أشهر', '9 أشهر', '12 شهراً', 'خصم المدة', '5٪', '10٪', '15٪', 'إيقاف مؤقت', 'بناء', 'تجديد'],
    array['مدة العقد', 'مدة محددة', 'إيقاف الاشتراك مؤقتاً'],
    'owner_approved_faq_2026_07_28', now()
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

notify pgrst, 'reload schema';
