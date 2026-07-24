-- Publish the owner-approved assessment and access FAQs while keeping unresolved
-- commercial details visible in the Knowledge Builder.

update public.knowledge_builder_questions
set
  current_knowledge = 'All cleaning appointments are prepaid. The first appointment is the Initial Home Assessment and uses the lower assessment price. Smart-lock installation and configuration add €200.',
  missing_information = 'The exact checklist for the first paid cleaning after the assessment, its duration rule, exclusions, and whether deep cleaning is automatic.',
  internal_notes = concat_ws(E'\n', nullif(internal_notes, ''), 'Assessment prepayment and the €200 smart-lock installation/configuration charge were confirmed by the owner on 24 July 2026.'),
  updated_at = now()
where question_key = 'first-cleaning-scope';

update public.knowledge_builder_questions
set
  current_knowledge = 'A digital lock may use a unique four-digit code or a phone-based digital key and records an access log. Dar Tahara credentials work only during the scheduled time window and become unusable after the employee finishes. Installation and configuration add €200.',
  missing_information = 'Approved lock models, included hardware, warranty terms, internet requirements, and city coverage.',
  internal_notes = concat_ws(E'\n', nullif(internal_notes, ''), 'Digital-access behavior and the €200 installation/configuration charge were confirmed by the owner on 24 July 2026.'),
  updated_at = now()
where question_key = 'digital-lock-policy';

update public.knowledge_builder_questions
set
  current_knowledge = 'Dar Tahara can hold a physical key for a fee. The fee reflects secure safe storage, insurance, and transport so the key can always be returned to the safe. A smart lock is recommended where possible.',
  missing_information = 'The exact fee amount, billing frequency, detailed insurance conditions, and any city differences.',
  internal_notes = concat_ws(E'\n', nullif(internal_notes, ''), 'The physical-key safeguards and fee basis were confirmed by the owner on 24 July 2026.'),
  updated_at = now()
where question_key = 'physical-key-fee';

update public.knowledge_entries
set status = 'archived', updated_at = now()
where slug in ('initial-assessment-faq', 'property-access-faq')
  and status = 'published';

insert into public.knowledge_entries (
  slug, category, title, language, content, status, version, effective_from,
  keywords, synonyms, source, reviewed_at
) values
  (
    'initial-assessment-faq', 'assessment', 'Initial Home Assessment and prepayment', 'en',
    'The first visit is the Initial Home Assessment. You or an authorized representative must be present; if a representative attends, register them in the customer portal. The assessment normally takes 30 to 90 minutes, depending on the size of the home and your needs. We review the property, access and cleaning requirements, then prepare your personalised cleaning plan. All cleaning appointments are prepaid. The Initial Home Assessment is offered at the lower assessment price. If you choose smart-lock installation, an additional €200 is charged for installation and configuration.',
    'published', 1, now(),
    array['first visit', 'initial home assessment', 'prepaid', '30 to 90 minutes', 'smart lock', '€200'],
    array['first appointment', 'assessment price', 'authorized representative'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'initial-assessment-faq', 'assessment', 'Initiële Woningbeoordeling en vooruitbetaling', 'nl',
    'Het eerste bezoek is de Initiële Woningbeoordeling. U of een gemachtigde vertegenwoordiger moet aanwezig zijn; registreer de vertegenwoordiger vooraf in het klantenportaal. De beoordeling duurt gewoonlijk 30 tot 90 minuten, afhankelijk van de woninggrootte en uw behoeften. We beoordelen de woning, toegang en schoonmaakvereisten en stellen daarna uw persoonlijke schoonmaakplan op. Alle schoonmaakafspraken worden vooraf betaald. Voor de Initiële Woningbeoordeling geldt het lagere beoordelingstarief. Kiest u voor installatie van een slim slot, dan wordt €200 extra berekend voor installatie en configuratie.',
    'published', 1, now(),
    array['eerste bezoek', 'initiële woningbeoordeling', 'vooraf betaald', '30 tot 90 minuten', 'slim slot', '€200'],
    array['eerste afspraak', 'beoordelingstarief', 'gemachtigde vertegenwoordiger'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'initial-assessment-faq', 'assessment', 'Évaluation Initiale du Domicile et prépaiement', 'fr',
    'La première visite est l’Évaluation Initiale du Domicile. Vous ou un représentant autorisé devez être présent ; enregistrez ce représentant dans le portail client. L’évaluation dure normalement de 30 à 90 minutes selon la taille du logement et vos besoins. Nous examinons le logement, l’accès et les besoins de nettoyage, puis préparons votre plan personnalisé. Tous les rendez-vous de nettoyage sont prépayés. L’Évaluation Initiale du Domicile bénéficie du tarif d’évaluation inférieur. Si vous choisissez l’installation d’une serrure intelligente, 200 € supplémentaires sont facturés pour l’installation et la configuration.',
    'published', 1, now(),
    array['première visite', 'évaluation initiale', 'prépayé', '30 à 90 minutes', 'serrure intelligente', '200 €'],
    array['premier rendez-vous', 'tarif d’évaluation', 'représentant autorisé'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'initial-assessment-faq', 'assessment', 'Evaluación Inicial del Hogar y prepago', 'es',
    'La primera visita es la Evaluación Inicial del Hogar. Debes estar presente tú o un representante autorizado; registra al representante en el portal del cliente. La evaluación suele durar entre 30 y 90 minutos, según el tamaño de la vivienda y tus necesidades. Revisamos la propiedad, el acceso y los requisitos de limpieza y preparamos tu plan personalizado. Todas las citas de limpieza se pagan por adelantado. La Evaluación Inicial del Hogar tiene el precio de evaluación más bajo. Si eliges instalar una cerradura inteligente, se cobran 200 € adicionales por la instalación y configuración.',
    'published', 1, now(),
    array['primera visita', 'evaluación inicial', 'prepago', '30 a 90 minutos', 'cerradura inteligente', '200 €'],
    array['primera cita', 'precio de evaluación', 'representante autorizado'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'initial-assessment-faq', 'assessment', 'Ersteinschätzung und Vorauszahlung', 'de',
    'Der erste Besuch ist die Ersteinschätzung des Hauses. Sie oder eine bevollmächtigte Person müssen anwesend sein; tragen Sie die Vertretung im Kundenportal ein. Die Einschätzung dauert je nach Größe des Hauses und Ihren Bedürfnissen normalerweise 30 bis 90 Minuten. Wir prüfen Immobilie, Zugang und Reinigungsanforderungen und erstellen danach Ihren persönlichen Reinigungsplan. Alle Reinigungstermine werden im Voraus bezahlt. Für die Ersteinschätzung gilt der niedrigere Einschätzungspreis. Wenn Sie die Installation eines Smart Locks wählen, werden zusätzlich 200 € für Installation und Konfiguration berechnet.',
    'published', 1, now(),
    array['erster besuch', 'ersteinschätzung', 'vorauszahlung', '30 bis 90 minuten', 'smart lock', '200 €'],
    array['erster termin', 'einschätzungspreis', 'bevollmächtigte person'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'initial-assessment-faq', 'assessment', 'Avaliação Inicial da Casa e pré-pagamento', 'pt',
    'A primeira visita é a Avaliação Inicial da Casa. O cliente ou um representante autorizado deve estar presente; registe o representante no portal do cliente. A avaliação demora normalmente entre 30 e 90 minutos, consoante a dimensão da casa e as suas necessidades. Analisamos a propriedade, o acesso e os requisitos de limpeza e preparamos o seu plano personalizado. Todas as marcações de limpeza são pré-pagas. A Avaliação Inicial da Casa tem o preço de avaliação mais baixo. Se escolher a instalação de uma fechadura inteligente, são cobrados mais 200 € pela instalação e configuração.',
    'published', 1, now(),
    array['primeira visita', 'avaliação inicial', 'pré-pagamento', '30 a 90 minutos', 'fechadura inteligente', '200 €'],
    array['primeira marcação', 'preço de avaliação', 'representante autorizado'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'initial-assessment-faq', 'assessment', 'التقييم الأولي للمنزل والدفع المسبق', 'ar',
    'الزيارة الأولى هي التقييم الأولي للمنزل. يجب أن تكون أنت أو ممثل مفوض حاضراً، وإذا حضر ممثل فيجب تسجيله في بوابة العميل. يستغرق التقييم عادةً من 30 إلى 90 دقيقة حسب حجم المنزل واحتياجاتك. نراجع العقار وطريقة الدخول ومتطلبات التنظيف ثم نعد خطة التنظيف المخصصة. تُدفع جميع مواعيد التنظيف مسبقاً. يكون التقييم الأولي للمنزل بسعر التقييم الأقل. إذا اخترت تركيب قفل ذكي، تُضاف 200 يورو مقابل التركيب والإعداد.',
    'published', 1, now(),
    array['الزيارة الأولى', 'التقييم الأولي', 'الدفع المسبق', '30 إلى 90 دقيقة', 'قفل ذكي', '200 يورو'],
    array['الموعد الأول', 'سعر التقييم', 'ممثل مفوض'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'property-access-faq', 'access', 'Digital locks, physical keys and presence', 'en',
    'Someone must be present for the Initial Home Assessment. If you cannot attend, an authorized representative must be there and registered through the customer portal. The assessment normally takes 30 to 90 minutes. For later cleaning visits, you do not need to be home when secure access has been arranged. A digital lock can use a unique four-digit code or a digital key on a phone, and the access log records who entered. Dar Tahara issues access only for the scheduled time window. After the employee finishes, the digital key becomes unusable and access is denied outside that time slot. Dar Tahara can hold a physical key for a fee covering safeguards and costs including secure safe storage, insurance and transport so the key can always be returned to the safe. We recommend a smart lock where possible.',
    'published', 1, now(),
    array['digital lock', 'physical key', 'four-digit code', 'phone key', 'access log', 'presence'],
    array['smart lock', 'safe storage', 'authorized representative'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'property-access-faq', 'access', 'Digitale sloten, fysieke sleutels en aanwezigheid', 'nl',
    'Bij de Initiële Woningbeoordeling moet iemand aanwezig zijn. Kunt u zelf niet aanwezig zijn, dan moet een gemachtigde vertegenwoordiger komen die vooraf in het klantenportaal is geregistreerd. De beoordeling duurt gewoonlijk 30 tot 90 minuten. Bij latere schoonmaakbezoeken hoeft u niet thuis te zijn als veilige toegang is geregeld. Een digitaal slot kan werken met een unieke viercijferige code of een digitale sleutel op een telefoon; het toegangslog registreert wie binnenkomt. Dar Tahara geeft alleen toegang binnen het geplande tijdvenster. Na afronding van het werk wordt de digitale sleutel onbruikbaar en is toegang buiten het tijdslot geblokkeerd. Dar Tahara kan tegen betaling een fysieke sleutel bewaren; de vergoeding dekt onder meer veilige opslag, verzekering en vervoer zodat de sleutel steeds naar de kluis terugkeert. Wij adviseren waar mogelijk een slim slot.',
    'published', 1, now(),
    array['digitaal slot', 'fysieke sleutel', 'viercijferige code', 'telefoonsleutel', 'toegangslog', 'aanwezigheid'],
    array['slim slot', 'veilige opslag', 'gemachtigde vertegenwoordiger'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'property-access-faq', 'access', 'Serrures numériques, clés physiques et présence', 'fr',
    'Une personne doit être présente lors de l’Évaluation Initiale du Domicile. Si vous ne pouvez pas venir, un représentant autorisé doit être présent et enregistré dans le portail client. L’évaluation dure normalement de 30 à 90 minutes. Pour les nettoyages suivants, votre présence n’est pas nécessaire si un accès sécurisé a été organisé. Une serrure numérique peut utiliser un code unique à quatre chiffres ou une clé numérique sur téléphone, et le journal indique qui est entré. Dar Tahara n’accorde l’accès que pendant le créneau planifié. Une fois le travail terminé, la clé numérique devient inutilisable et l’accès est refusé hors de ce créneau. Dar Tahara peut conserver une clé physique moyennant des frais couvrant notamment le coffre sécurisé, l’assurance et le transport nécessaire pour toujours remettre la clé au coffre. Nous recommandons une serrure intelligente lorsque c’est possible.',
    'published', 1, now(),
    array['serrure numérique', 'clé physique', 'code à quatre chiffres', 'clé téléphone', 'journal d’accès', 'présence'],
    array['serrure intelligente', 'coffre sécurisé', 'représentant autorisé'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'property-access-faq', 'access', 'Cerraduras digitales, llaves físicas y presencia', 'es',
    'Alguien debe estar presente durante la Evaluación Inicial del Hogar. Si no puedes asistir, debe acudir un representante autorizado registrado en el portal del cliente. La evaluación suele durar entre 30 y 90 minutos. En las limpiezas posteriores no necesitas estar en casa si se ha organizado un acceso seguro. Una cerradura digital puede usar un código único de cuatro dígitos o una llave digital en el teléfono, y el registro muestra quién entró. Dar Tahara concede acceso únicamente durante la franja programada. Al terminar el trabajo, la llave digital deja de funcionar y el acceso queda bloqueado fuera de esa franja. Dar Tahara puede custodiar una llave física por una tarifa que cubre, entre otros costes, el almacenamiento en caja fuerte, el seguro y el transporte necesario para devolver siempre la llave a la caja fuerte. Recomendamos una cerradura inteligente cuando sea posible.',
    'published', 1, now(),
    array['cerradura digital', 'llave física', 'código de cuatro dígitos', 'llave móvil', 'registro de acceso', 'presencia'],
    array['cerradura inteligente', 'caja fuerte', 'representante autorizado'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'property-access-faq', 'access', 'Digitale Schlösser, physische Schlüssel und Anwesenheit', 'de',
    'Bei der Ersteinschätzung muss jemand anwesend sein. Wenn Sie nicht selbst kommen können, muss eine bevollmächtigte und im Kundenportal eingetragene Person anwesend sein. Die Einschätzung dauert normalerweise 30 bis 90 Minuten. Bei späteren Reinigungen müssen Sie nicht zu Hause sein, wenn ein sicherer Zugang organisiert ist. Ein digitales Schloss kann einen eindeutigen vierstelligen Code oder einen digitalen Schlüssel auf dem Telefon verwenden; das Zugangsprotokoll zeigt, wer eingetreten ist. Dar Tahara gewährt Zugang nur im geplanten Zeitfenster. Nach Abschluss der Arbeiten wird der digitale Schlüssel unbrauchbar und der Zugang außerhalb des Zeitfensters gesperrt. Dar Tahara kann gegen eine Gebühr einen physischen Schlüssel verwahren; sie deckt unter anderem sichere Tresoraufbewahrung, Versicherung und Transport, damit der Schlüssel stets in den Tresor zurückgebracht wird. Wir empfehlen nach Möglichkeit ein Smart Lock.',
    'published', 1, now(),
    array['digitales schloss', 'physischer schlüssel', 'vierstelliger code', 'telefonschlüssel', 'zugangsprotokoll', 'anwesenheit'],
    array['smart lock', 'tresoraufbewahrung', 'bevollmächtigte person'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'property-access-faq', 'access', 'Fechaduras digitais, chaves físicas e presença', 'pt',
    'Alguém deve estar presente durante a Avaliação Inicial da Casa. Se não puder comparecer, deve estar presente um representante autorizado e registado no portal do cliente. A avaliação demora normalmente entre 30 e 90 minutos. Nas limpezas seguintes, não precisa de estar em casa se tiver sido organizado um acesso seguro. Uma fechadura digital pode usar um código único de quatro dígitos ou uma chave digital no telefone, e o registo mostra quem entrou. A Dar Tahara concede acesso apenas durante o horário agendado. Depois de o funcionário concluir o trabalho, a chave digital deixa de funcionar e o acesso fica bloqueado fora desse horário. A Dar Tahara pode guardar uma chave física mediante uma taxa que cobre, entre outros custos, cofre seguro, seguro e transporte para garantir que a chave regressa sempre ao cofre. Recomendamos uma fechadura inteligente sempre que possível.',
    'published', 1, now(),
    array['fechadura digital', 'chave física', 'código de quatro dígitos', 'chave no telefone', 'registo de acesso', 'presença'],
    array['fechadura inteligente', 'cofre seguro', 'representante autorizado'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'property-access-faq', 'access', 'الأقفال الرقمية والمفاتيح الفعلية والحضور', 'ar',
    'يجب أن يكون شخص حاضرًا أثناء التقييم الأولي للمنزل. إذا لم تتمكن من الحضور، فيجب حضور ممثل مفوض ومسجل في بوابة العميل. يستغرق التقييم عادةً من 30 إلى 90 دقيقة. في زيارات التنظيف اللاحقة لا يلزم أن تكون في المنزل إذا تم ترتيب دخول آمن. يمكن استخدام رمز فريد من أربعة أرقام أو مفتاح رقمي على الهاتف، ويسجل سجل الدخول هوية من دخل. تمنح دار طهارة الدخول خلال النافذة الزمنية المجدولة فقط. بعد إنهاء الموظف للعمل يصبح المفتاح الرقمي غير صالح ويُمنع الدخول خارج ذلك الوقت. يمكن لدار طهارة حفظ مفتاح فعلي مقابل رسوم تغطي، من بين أمور أخرى، الحفظ في خزنة آمنة والتأمين والنقل لضمان إعادة المفتاح دائمًا إلى الخزنة. نوصي بقفل ذكي حيثما أمكن.',
    'published', 1, now(),
    array['قفل رقمي', 'مفتاح فعلي', 'رمز من أربعة أرقام', 'مفتاح الهاتف', 'سجل الدخول', 'الحضور'],
    array['قفل ذكي', 'خزنة آمنة', 'ممثل مفوض'],
    'owner_approved_faq_2026_07_24', now()
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
