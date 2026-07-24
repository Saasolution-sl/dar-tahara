-- Publish the owner-approved cleaning-product and visit-scheduling answers.

update public.knowledge_entries
set status = 'archived', updated_at = now()
where slug in ('cleaning-products', 'visit-scheduling')
  and status = 'published';

insert into public.knowledge_entries (
  slug, category, title, language, content, status, version, effective_from,
  keywords, synonyms, source, reviewed_at
) values
  (
    'cleaning-products', 'services', 'Cleaning products', 'en',
    'We strive to use only organic cleaning products. In some cases this is not feasible, such as chemical deep cleaning. Wherever chemical products can be avoided, we are happy to do so.',
    'published', 1, now(),
    array['cleaning products', 'organic', 'chemical', 'deep cleaning'],
    array['products used', 'cleaning materials'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'cleaning-products', 'services', 'Schoonmaakproducten', 'nl',
    'We streven ernaar uitsluitend biologische schoonmaakproducten te gebruiken. In sommige gevallen is dat helaas niet haalbaar, bijvoorbeeld bij een chemische dieptereiniging. Waar we chemische producten kunnen vermijden, doen we dat graag.',
    'published', 1, now(),
    array['schoonmaakproducten', 'biologisch', 'chemisch', 'dieptereiniging'],
    array['gebruikte producten', 'schoonmaakmiddelen'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'cleaning-products', 'services', 'Produits de nettoyage', 'fr',
    'Nous nous efforçons d’utiliser uniquement des produits de nettoyage biologiques. Dans certains cas, cela n’est malheureusement pas possible, notamment lors d’un nettoyage approfondi chimique. Lorsque nous pouvons éviter les produits chimiques, nous le faisons volontiers.',
    'published', 1, now(),
    array['produits de nettoyage', 'biologiques', 'chimiques', 'nettoyage approfondi'],
    array['produits utilisés', 'matériel de nettoyage'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'cleaning-products', 'services', 'Productos de limpieza', 'es',
    'Nos esforzamos por utilizar únicamente productos de limpieza orgánicos. Lamentablemente, en algunos casos no es posible, como en una limpieza profunda química. Siempre que podamos evitar los productos químicos, lo hacemos con gusto.',
    'published', 1, now(),
    array['productos de limpieza', 'orgánicos', 'químicos', 'limpieza profunda'],
    array['productos utilizados', 'materiales de limpieza'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'cleaning-products', 'services', 'Reinigungsprodukte', 'de',
    'Wir bemühen uns, ausschließlich biologische Reinigungsprodukte zu verwenden. In manchen Fällen ist dies leider nicht möglich, etwa bei einer chemischen Tiefenreinigung. Wo wir chemische Produkte vermeiden können, tun wir das gerne.',
    'published', 1, now(),
    array['reinigungsprodukte', 'biologisch', 'chemisch', 'tiefenreinigung'],
    array['verwendete produkte', 'reinigungsmittel'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'cleaning-products', 'services', 'Produtos de limpeza', 'pt',
    'Procuramos utilizar apenas produtos de limpeza orgânicos. Infelizmente, em alguns casos isso não é possível, como numa limpeza profunda química. Sempre que pudermos evitar produtos químicos, teremos todo o gosto em fazê-lo.',
    'published', 1, now(),
    array['produtos de limpeza', 'orgânicos', 'químicos', 'limpeza profunda'],
    array['produtos utilizados', 'materiais de limpeza'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'cleaning-products', 'services', 'منتجات التنظيف', 'ar',
    'نسعى إلى استخدام منتجات تنظيف عضوية فقط. للأسف لا يكون ذلك ممكناً في بعض الحالات، مثل التنظيف العميق الكيميائي. وحيثما يمكننا تجنب المنتجات الكيميائية، يسعدنا القيام بذلك.',
    'published', 1, now(),
    array['منتجات التنظيف', 'عضوية', 'كيميائية', 'تنظيف عميق'],
    array['المنتجات المستخدمة', 'مواد التنظيف'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'visit-scheduling', 'assessment', 'How visits are scheduled', 'en',
    'Appointments are scheduled based on availability. For the first visit, you receive an invitation by email and in the customer portal, where you can confirm a time that works for both you and the employee. Subsequent visits are scheduled automatically for you. This helps us plan efficient routes and assign available staff for your specific location.',
    'published', 1, now(),
    array['appointments', 'visits', 'schedule', 'availability', 'email', 'portal', 'routes', 'staff'],
    array['visit planning', 'first visit invitation'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'visit-scheduling', 'assessment', 'Hoe bezoeken worden ingepland', 'nl',
    'Afspraken worden ingepland op basis van beschikbaarheid. Voor het eerste bezoek ontvangt u per e-mail en in het klantenportaal een uitnodiging, waar u een tijd kunt bevestigen die voor u en de medewerker past. Vervolgbezoeken worden automatisch voor u ingepland. Zo kunnen we efficiënte routes plannen en beschikbare medewerkers voor uw locatie inzetten.',
    'published', 1, now(),
    array['afspraken', 'bezoeken', 'planning', 'beschikbaarheid', 'e-mail', 'portaal', 'routes', 'medewerkers'],
    array['bezoekplanning', 'uitnodiging eerste bezoek'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'visit-scheduling', 'assessment', 'Planification des visites', 'fr',
    'Les rendez-vous sont planifiés selon les disponibilités. Pour la première visite, vous recevez une invitation par e-mail et dans le portail client afin de confirmer un horaire convenant au client et à l’employé. Les visites suivantes sont planifiées automatiquement pour vous. Cela permet d’optimiser les itinéraires et d’affecter le personnel disponible à votre secteur.',
    'published', 1, now(),
    array['rendez-vous', 'visites', 'planification', 'disponibilité', 'e-mail', 'portail', 'itinéraires', 'personnel'],
    array['planning des visites', 'invitation première visite'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'visit-scheduling', 'assessment', 'Programación de las visitas', 'es',
    'Las citas se programan según la disponibilidad. Para la primera visita, recibirás una invitación por correo electrónico y en el portal del cliente, donde podrás confirmar una hora adecuada para ti y para el empleado. Las visitas posteriores se programan automáticamente para ti. Esto nos permite optimizar las rutas y asignar el personal disponible en tu ubicación.',
    'published', 1, now(),
    array['citas', 'visitas', 'programación', 'disponibilidad', 'correo', 'portal', 'rutas', 'personal'],
    array['planificación de visitas', 'invitación primera visita'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'visit-scheduling', 'assessment', 'Planung der Besuche', 'de',
    'Termine werden nach Verfügbarkeit geplant. Für den ersten Besuch erhalten Sie per E-Mail und im Kundenportal eine Einladung, über die Sie eine passende Zeit für sich und den Mitarbeiter bestätigen können. Folgebesuche werden automatisch für Sie geplant. Dadurch können wir effiziente Routen erstellen und verfügbares Personal für Ihren Standort einteilen.',
    'published', 1, now(),
    array['termine', 'besuche', 'planung', 'verfügbarkeit', 'e-mail', 'kundenportal', 'routen', 'personal'],
    array['besuchsplanung', 'einladung erster besuch'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'visit-scheduling', 'assessment', 'Agendamento das visitas', 'pt',
    'As marcações são agendadas de acordo com a disponibilidade. Para a primeira visita, recebe um convite por e-mail e no portal do cliente, onde pode confirmar um horário adequado para si e para o funcionário. As visitas seguintes são agendadas automaticamente para si. Isto permite planear rotas eficientes e atribuir o pessoal disponível à sua localização.',
    'published', 1, now(),
    array['marcações', 'visitas', 'agendamento', 'disponibilidade', 'e-mail', 'portal', 'rotas', 'pessoal'],
    array['planeamento de visitas', 'convite primeira visita'],
    'owner_approved_faq_2026_07_24', now()
  ),
  (
    'visit-scheduling', 'assessment', 'كيفية جدولة الزيارات', 'ar',
    'تُجدول المواعيد حسب التوفر. للزيارة الأولى، تتلقى دعوة عبر البريد الإلكتروني وفي بوابة العميل، حيث يمكنك تأكيد وقت يناسبك ويناسب الموظف. تُجدول الزيارات اللاحقة تلقائياً من أجلك. يساعدنا ذلك على تخطيط مسارات فعالة وتعيين الموظفين المتاحين لموقعك.',
    'published', 1, now(),
    array['المواعيد', 'الزيارات', 'الجدولة', 'التوفر', 'البريد الإلكتروني', 'بوابة العميل', 'المسارات', 'الموظفون'],
    array['تخطيط الزيارات', 'دعوة الزيارة الأولى'],
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
