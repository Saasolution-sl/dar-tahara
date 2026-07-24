import type { Locale } from "@/i18n/config";

export type ApprovedFaqKey =
  | "first_visit"
  | "first_cleaning_prepaid"
  | "digital_locks"
  | "physical_key"
  | "presence"
  | "location"
  | "cleaning_products"
  | "visit_scheduling";

type ApprovedFaqCopy = Record<ApprovedFaqKey, string>;

export const APPROVED_FAQ_COPY: Record<Locale, ApprovedFaqCopy> = {
  en: {
    first_visit: "The first visit is the Initial Home Assessment. You or an authorized representative must be present; if a representative attends, register them in the customer portal. The assessment normally takes 30 to 90 minutes, depending on the size of the home and your needs. We review the property, access and cleaning requirements, then prepare your personalised cleaning plan.",
    first_cleaning_prepaid: "Yes. All cleaning appointments are prepaid. The first appointment—the Initial Home Assessment—is offered at the lower assessment price. If you choose smart-lock installation, an additional €200 is charged for installation and configuration.",
    digital_locks: "A digital lock works like a normal lock, but without a physical key. Entry can use a unique four-digit code or a digital key on a phone, and the access log records who entered. Dar Tahara issues access only for the scheduled time window. After the employee finishes the assigned work, the digital key becomes unusable and access is denied outside that time slot.",
    physical_key: "Yes, Dar Tahara can hold a physical key for a fee. The fee reflects the safeguards and costs involved, including secure safe storage, insurance and transport so the key can always be returned to the safe. Because physical-key handling carries additional risk and cost, we recommend a smart lock where possible.",
    presence: "Someone must be present for the Initial Home Assessment. If you cannot attend, an authorized representative must be there and must be registered through the customer portal. The assessment normally takes 30 to 90 minutes, depending on the size of the home and your needs. For later cleaning visits, you do not need to be home when secure access has been arranged.",
    location: "Dar Tahara operates in Morocco and currently focuses on Tetouan, Tangier, Meknes, and Casablanca, with coverage expanding over time. Share your city so Dar Tahara Support can confirm current availability.",
    cleaning_products: "We strive to use only organic cleaning products. In some cases this is not feasible, such as chemical deep cleaning. Wherever chemical products can be avoided, we are happy to do so.",
    visit_scheduling: "Appointments are scheduled based on availability. For the first visit, you receive an invitation by email and in the customer portal, where you can confirm a time that works for both you and the employee. Subsequent visits are scheduled automatically for you. This helps us plan efficient routes and assign available staff for your specific location.",
  },
  nl: {
    first_visit: "Het eerste bezoek is de Initiële Woningbeoordeling. U of een gemachtigde vertegenwoordiger moet aanwezig zijn; registreer de vertegenwoordiger vooraf in het klantenportaal. De beoordeling duurt gewoonlijk 30 tot 90 minuten, afhankelijk van de woninggrootte en uw behoeften. We beoordelen de woning, toegang en schoonmaakvereisten en stellen daarna uw persoonlijke schoonmaakplan op.",
    first_cleaning_prepaid: "Ja. Alle schoonmaakafspraken worden vooraf betaald. Voor de eerste afspraak, de Initiële Woningbeoordeling, geldt het lagere beoordelingstarief. Kiest u voor installatie van een slim slot, dan wordt €200 extra berekend voor installatie en configuratie.",
    digital_locks: "Een digitaal slot werkt als een gewoon slot, maar zonder fysieke sleutel. Toegang kan met een unieke viercijferige code of een digitale sleutel op een telefoon; het toegangslog registreert wie binnenkomt. Dar Tahara geeft alleen toegang binnen het geplande tijdvenster. Na afronding van het werk wordt de digitale sleutel onbruikbaar en is toegang buiten het tijdslot geblokkeerd.",
    physical_key: "Ja, Dar Tahara kan tegen betaling een fysieke sleutel bewaren. De vergoeding dekt de veiligheidsmaatregelen en kosten, waaronder veilige opslag, verzekering en vervoer zodat de sleutel steeds naar de kluis terugkeert. Vanwege de extra risico’s en kosten adviseren wij waar mogelijk een slim slot.",
    presence: "Bij de Initiële Woningbeoordeling moet iemand aanwezig zijn. Kunt u zelf niet aanwezig zijn, dan moet een gemachtigde vertegenwoordiger komen die vooraf in het klantenportaal is geregistreerd. De beoordeling duurt gewoonlijk 30 tot 90 minuten, afhankelijk van de woninggrootte en uw behoeften. Bij latere schoonmaakbezoeken hoeft u niet thuis te zijn als veilige toegang is geregeld.",
    location: "Dar Tahara is actief in Marokko en richt zich momenteel op Tetouan, Tanger, Meknes en Casablanca. De dekking wordt verder uitgebreid. Deel uw stad zodat Dar Tahara Support de actuele beschikbaarheid kan bevestigen.",
    cleaning_products: "We streven ernaar uitsluitend biologische schoonmaakproducten te gebruiken. In sommige gevallen is dat helaas niet haalbaar, bijvoorbeeld bij een chemische dieptereiniging. Waar we chemische producten kunnen vermijden, doen we dat graag.",
    visit_scheduling: "Afspraken worden ingepland op basis van beschikbaarheid. Voor het eerste bezoek ontvangt u per e-mail en in het klantenportaal een uitnodiging, waar u een tijd kunt bevestigen die voor u en de medewerker past. Vervolgbezoeken worden automatisch voor u ingepland. Zo kunnen we efficiënte routes plannen en beschikbare medewerkers voor uw locatie inzetten.",
  },
  fr: {
    first_visit: "La première visite est l’Évaluation Initiale du Domicile. Vous ou un représentant autorisé devez être présent ; enregistrez ce représentant dans le portail client. L’évaluation dure normalement de 30 à 90 minutes selon la taille du logement et vos besoins. Nous examinons le logement, l’accès et les besoins de nettoyage, puis préparons votre plan personnalisé.",
    first_cleaning_prepaid: "Oui. Tous les rendez-vous de nettoyage sont prépayés. Le premier rendez-vous, l’Évaluation Initiale du Domicile, bénéficie du tarif d’évaluation inférieur. Si vous choisissez l’installation d’une serrure intelligente, 200 € supplémentaires sont facturés pour l’installation et la configuration.",
    digital_locks: "Une serrure numérique fonctionne comme une serrure normale, mais sans clé physique. L’accès utilise un code unique à quatre chiffres ou une clé numérique sur téléphone, et le journal indique qui est entré. Dar Tahara n’accorde l’accès que pendant le créneau planifié. Une fois le travail terminé, la clé numérique devient inutilisable et l’accès est refusé hors de ce créneau.",
    physical_key: "Oui, Dar Tahara peut conserver une clé physique moyennant des frais. Ceux-ci couvrent les mesures de sécurité et les coûts, notamment le coffre sécurisé, l’assurance et le transport nécessaire pour toujours remettre la clé au coffre. En raison des risques et coûts supplémentaires, nous recommandons une serrure intelligente lorsque c’est possible.",
    presence: "Une personne doit être présente lors de l’Évaluation Initiale du Domicile. Si vous ne pouvez pas venir, un représentant autorisé doit être présent et enregistré dans le portail client. L’évaluation dure normalement de 30 à 90 minutes selon la taille du logement et vos besoins. Pour les nettoyages suivants, votre présence n’est pas nécessaire si un accès sécurisé a été organisé.",
    location: "Dar Tahara opère au Maroc et intervient actuellement principalement à Tétouan, Tanger, Meknès et Casablanca, avec une couverture en expansion. Indiquez votre ville afin que Dar Tahara Support confirme la disponibilité actuelle.",
    cleaning_products: "Nous nous efforçons d’utiliser uniquement des produits de nettoyage biologiques. Dans certains cas, cela n’est malheureusement pas possible, notamment lors d’un nettoyage approfondi chimique. Lorsque nous pouvons éviter les produits chimiques, nous le faisons volontiers.",
    visit_scheduling: "Les rendez-vous sont planifiés selon les disponibilités. Pour la première visite, vous recevez une invitation par e-mail et dans le portail client afin de confirmer un horaire convenant au client et à l’employé. Les visites suivantes sont planifiées automatiquement pour vous. Cela permet d’optimiser les itinéraires et d’affecter le personnel disponible à votre secteur.",
  },
  es: {
    first_visit: "La primera visita es la Evaluación Inicial del Hogar. Debes estar presente tú o un representante autorizado; registra al representante en el portal del cliente. La evaluación suele durar entre 30 y 90 minutos, según el tamaño de la vivienda y tus necesidades. Revisamos la propiedad, el acceso y los requisitos de limpieza y preparamos tu plan personalizado.",
    first_cleaning_prepaid: "Sí. Todas las citas de limpieza se pagan por adelantado. La primera cita, la Evaluación Inicial del Hogar, tiene el precio de evaluación más bajo. Si eliges instalar una cerradura inteligente, se cobran 200 € adicionales por la instalación y configuración.",
    digital_locks: "Una cerradura digital funciona como una cerradura normal, pero sin llave física. El acceso puede hacerse con un código único de cuatro dígitos o una llave digital en el teléfono, y el registro muestra quién entró. Dar Tahara concede acceso únicamente durante la franja programada. Al terminar el trabajo, la llave digital deja de funcionar y el acceso queda bloqueado fuera de esa franja.",
    physical_key: "Sí, Dar Tahara puede custodiar una llave física por una tarifa. La tarifa cubre las medidas de seguridad y los costes, incluidos el almacenamiento en caja fuerte, el seguro y el transporte necesario para devolver siempre la llave a la caja fuerte. Por el riesgo y coste adicionales, recomendamos una cerradura inteligente cuando sea posible.",
    presence: "Alguien debe estar presente durante la Evaluación Inicial del Hogar. Si no puedes asistir, debe acudir un representante autorizado registrado en el portal del cliente. La evaluación suele durar entre 30 y 90 minutos, según el tamaño de la vivienda y tus necesidades. En las limpiezas posteriores no necesitas estar en casa si se ha organizado un acceso seguro.",
    location: "Dar Tahara opera en Marruecos y actualmente se centra en Tetuán, Tánger, Mequinez y Casablanca, con una cobertura en expansión. Indica tu ciudad para que Dar Tahara Support confirme la disponibilidad actual.",
    cleaning_products: "Nos esforzamos por utilizar únicamente productos de limpieza orgánicos. Lamentablemente, en algunos casos no es posible, como en una limpieza profunda química. Siempre que podamos evitar los productos químicos, lo hacemos con gusto.",
    visit_scheduling: "Las citas se programan según la disponibilidad. Para la primera visita, recibirás una invitación por correo electrónico y en el portal del cliente, donde podrás confirmar una hora adecuada para ti y para el empleado. Las visitas posteriores se programan automáticamente para ti. Esto nos permite optimizar las rutas y asignar el personal disponible en tu ubicación.",
  },
  de: {
    first_visit: "Der erste Besuch ist die Ersteinschätzung des Hauses. Sie oder eine bevollmächtigte Person müssen anwesend sein; tragen Sie die Vertretung im Kundenportal ein. Die Einschätzung dauert je nach Größe des Hauses und Ihren Bedürfnissen normalerweise 30 bis 90 Minuten. Wir prüfen Immobilie, Zugang und Reinigungsanforderungen und erstellen danach Ihren persönlichen Reinigungsplan.",
    first_cleaning_prepaid: "Ja. Alle Reinigungstermine werden im Voraus bezahlt. Für den ersten Termin, die Ersteinschätzung, gilt der niedrigere Einschätzungspreis. Wenn Sie die Installation eines Smart Locks wählen, werden zusätzlich 200 € für Installation und Konfiguration berechnet.",
    digital_locks: "Ein digitales Schloss funktioniert wie ein normales Schloss, jedoch ohne physischen Schlüssel. Der Zugang erfolgt über einen eindeutigen vierstelligen Code oder einen digitalen Schlüssel auf dem Telefon; das Zugangsprotokoll zeigt, wer eingetreten ist. Dar Tahara gewährt Zugang nur im geplanten Zeitfenster. Nach Abschluss der Arbeiten wird der digitale Schlüssel unbrauchbar und der Zugang außerhalb des Zeitfensters gesperrt.",
    physical_key: "Ja, Dar Tahara kann gegen eine Gebühr einen physischen Schlüssel verwahren. Die Gebühr deckt Schutzmaßnahmen und Kosten wie sichere Tresoraufbewahrung, Versicherung und Transport, damit der Schlüssel stets in den Tresor zurückgebracht wird. Wegen der zusätzlichen Risiken und Kosten empfehlen wir nach Möglichkeit ein Smart Lock.",
    presence: "Bei der Ersteinschätzung muss jemand anwesend sein. Wenn Sie nicht selbst kommen können, muss eine bevollmächtigte und im Kundenportal eingetragene Person anwesend sein. Die Einschätzung dauert je nach Größe des Hauses und Ihren Bedürfnissen normalerweise 30 bis 90 Minuten. Bei späteren Reinigungen müssen Sie nicht zu Hause sein, wenn ein sicherer Zugang organisiert ist.",
    location: "Dar Tahara ist in Marokko tätig und konzentriert sich derzeit auf Tétouan, Tanger, Meknès und Casablanca. Die Abdeckung wird laufend erweitert. Teilen Sie uns Ihre Stadt mit, damit Dar Tahara Support die aktuelle Verfügbarkeit bestätigen kann.",
    cleaning_products: "Wir bemühen uns, ausschließlich biologische Reinigungsprodukte zu verwenden. In manchen Fällen ist dies leider nicht möglich, etwa bei einer chemischen Tiefenreinigung. Wo wir chemische Produkte vermeiden können, tun wir das gerne.",
    visit_scheduling: "Termine werden nach Verfügbarkeit geplant. Für den ersten Besuch erhalten Sie per E-Mail und im Kundenportal eine Einladung, über die Sie eine passende Zeit für sich und den Mitarbeiter bestätigen können. Folgebesuche werden automatisch für Sie geplant. Dadurch können wir effiziente Routen erstellen und verfügbares Personal für Ihren Standort einteilen.",
  },
  pt: {
    first_visit: "A primeira visita é a Avaliação Inicial da Casa. O cliente ou um representante autorizado deve estar presente; registe o representante no portal do cliente. A avaliação demora normalmente entre 30 e 90 minutos, consoante a dimensão da casa e as suas necessidades. Analisamos a propriedade, o acesso e os requisitos de limpeza e preparamos o seu plano personalizado.",
    first_cleaning_prepaid: "Sim. Todas as marcações de limpeza são pré-pagas. A primeira marcação, a Avaliação Inicial da Casa, tem o preço de avaliação mais baixo. Se escolher a instalação de uma fechadura inteligente, são cobrados mais 200 € pela instalação e configuração.",
    digital_locks: "Uma fechadura digital funciona como uma fechadura normal, mas sem chave física. O acesso pode usar um código único de quatro dígitos ou uma chave digital no telefone, e o registo mostra quem entrou. A Dar Tahara concede acesso apenas durante o horário agendado. Depois de o funcionário concluir o trabalho, a chave digital deixa de funcionar e o acesso fica bloqueado fora desse horário.",
    physical_key: "Sim, a Dar Tahara pode guardar uma chave física mediante uma taxa. A taxa cobre as medidas de segurança e os custos, incluindo cofre seguro, seguro e transporte para garantir que a chave regressa sempre ao cofre. Devido ao risco e custo adicionais, recomendamos uma fechadura inteligente sempre que possível.",
    presence: "Alguém deve estar presente durante a Avaliação Inicial da Casa. Se não puder comparecer, deve estar presente um representante autorizado e registado no portal do cliente. A avaliação demora normalmente entre 30 e 90 minutos, consoante a dimensão da casa e as suas necessidades. Nas limpezas seguintes, não precisa de estar em casa se tiver sido organizado um acesso seguro.",
    location: "A Dar Tahara opera em Marrocos e concentra-se atualmente em Tetuão, Tânger, Meknès e Casablanca, com cobertura em expansão. Indique a sua cidade para que a Dar Tahara Support confirme a disponibilidade atual.",
    cleaning_products: "Procuramos utilizar apenas produtos de limpeza orgânicos. Infelizmente, em alguns casos isso não é possível, como numa limpeza profunda química. Sempre que pudermos evitar produtos químicos, teremos todo o gosto em fazê-lo.",
    visit_scheduling: "As marcações são agendadas de acordo com a disponibilidade. Para a primeira visita, recebe um convite por e-mail e no portal do cliente, onde pode confirmar um horário adequado para si e para o funcionário. As visitas seguintes são agendadas automaticamente para si. Isto permite planear rotas eficientes e atribuir o pessoal disponível à sua localização.",
  },
  ar: {
    first_visit: "الزيارة الأولى هي التقييم الأولي للمنزل. يجب أن تكون أنت أو ممثل مفوض حاضراً، وإذا حضر ممثل فيجب تسجيله في بوابة العميل. يستغرق التقييم عادةً من 30 إلى 90 دقيقة حسب حجم المنزل واحتياجاتك. نراجع العقار وطريقة الدخول ومتطلبات التنظيف ثم نعد خطة التنظيف المخصصة.",
    first_cleaning_prepaid: "نعم. تُدفع جميع مواعيد التنظيف مسبقاً. الموعد الأول، وهو التقييم الأولي للمنزل، يكون بسعر التقييم الأقل. إذا اخترت تركيب قفل ذكي، تُضاف 200 يورو مقابل التركيب والإعداد.",
    digital_locks: "يعمل القفل الرقمي مثل القفل العادي ولكن من دون مفتاح فعلي. يمكن الدخول برمز فريد من أربعة أرقام أو بمفتاح رقمي على الهاتف، ويسجل سجل الدخول هوية من دخل. تمنح دار طهارة الدخول خلال النافذة الزمنية المجدولة فقط. بعد إنهاء الموظف للعمل يصبح المفتاح الرقمي غير صالح ويُمنع الدخول خارج ذلك الوقت.",
    physical_key: "نعم، يمكن لدار طهارة حفظ مفتاح فعلي مقابل رسوم. تغطي الرسوم إجراءات الأمان والتكاليف، بما فيها الحفظ في خزنة آمنة والتأمين والنقل لضمان إعادة المفتاح دائماً إلى الخزنة. وبسبب المخاطر والتكاليف الإضافية، نوصي بقفل ذكي حيثما أمكن.",
    presence: "يجب أن يكون شخص حاضرًا أثناء التقييم الأولي للمنزل. إذا لم تتمكن من الحضور، فيجب حضور ممثل مفوض ومسجل في بوابة العميل. يستغرق التقييم عادةً من 30 إلى 90 دقيقة حسب حجم المنزل واحتياجاتك. في زيارات التنظيف اللاحقة لا يلزم أن تكون في المنزل إذا تم ترتيب دخول آمن.",
    location: "تعمل دار طهارة في المغرب وتركز حالياً على تطوان وطنجة ومكناس والدار البيضاء، مع توسع التغطية بمرور الوقت. شارك مدينتك لكي يؤكد Dar Tahara Support توفر الخدمة حالياً.",
    cleaning_products: "نسعى إلى استخدام منتجات تنظيف عضوية فقط. للأسف لا يكون ذلك ممكناً في بعض الحالات، مثل التنظيف العميق الكيميائي. وحيثما يمكننا تجنب المنتجات الكيميائية، يسعدنا القيام بذلك.",
    visit_scheduling: "تُجدول المواعيد حسب التوفر. للزيارة الأولى، تتلقى دعوة عبر البريد الإلكتروني وفي بوابة العميل، حيث يمكنك تأكيد وقت يناسبك ويناسب الموظف. تُجدول الزيارات اللاحقة تلقائياً من أجلك. يساعدنا ذلك على تخطيط مسارات فعالة وتعيين الموظفين المتاحين لموقعك.",
  },
};

const FAQ_BY_SUGGESTION_ID: Partial<Record<string, ApprovedFaqKey>> = {
  "general-assessment": "first_visit",
  "next-first-clean": "first_cleaning_prepaid",
  "access-digital-lock": "digital_locks",
  "access-physical-key": "physical_key",
  "access-home": "presence",
  "access-schedule": "visit_scheduling",
};

const FAQ_PATTERNS: Array<{ key: ApprovedFaqKey; pattern: RegExp }> = [
  {
    key: "location",
    pattern: /(?:where|waar|où|ou|dónde|donde|wo|onde|أين).{0,35}(?:located|based|operate|gevestigd|actief|situ[ée]|interven|ubicad|operan|ansässig|tätig|localizad|atuam|تقع|تعمل)/iu,
  },
  {
    key: "cleaning_products",
    pattern: /(?:what|which|wat|welke|quels?|qué|que|welche|quais|ما|أي).{0,35}(?:cleaning products?|schoonmaakproducten?|produits? de nettoyage|productos? de limpieza|reinigungsprodukte?|produtos? de limpeza|منتجات التنظيف)|(?:organic|biological|biologisch|biologique|orgánico|biologisch|orgânico|عضوي).{0,25}(?:product|clean|schoonmaak|nettoyage|limpieza|reinigung|limpeza|تنظيف)/iu,
  },
  {
    key: "visit_scheduling",
    pattern: /(?:how|hoe|comment|cómo|como|wie|كيف).{0,35}(?:visits?|appointments?|bezoeken|afspraken|visites?|rendez-vous|visitas?|citas?|besuche|termine|marcações|visitas|الزيارات|المواعيد).{0,35}(?:scheduled|planned|ingepland|gepland|planifi|programad|geplant|agendad|تُ?جدول|مجدول)/iu,
  },
  {
    key: "first_cleaning_prepaid",
    pattern: /(?:first|eerste|premier|première|primera|erste|primeira|الأول).{0,35}(?:clean|schoonmaak|nettoyage|limpieza|reinigung|limpeza|تنظيف).{0,35}(?:prepaid|paid|vooraf|prépay|prepag|voraus|pré-pag|مدفوع|الدفع)|(?:prepaid|vooraf|prépay|prepag|voraus|pré-pag|مدفوع).{0,35}(?:first|eerste|premier|primera|erste|primeira|الأول)/iu,
  },
  {
    key: "digital_locks",
    pattern: /(?:how|hoe|comment|cómo|wie|como|كيف).{0,30}(?:digital|numérique|digitale|digitales|رقمي).{0,20}(?:lock|slot|serrure|cerradura|schloss|fechadura|قفل)/iu,
  },
  {
    key: "physical_key",
    pattern: /(?:can|kun|pouvez|pueden|können|podem|هل يمكن).{0,35}(?:hold|store|keep|give|provide|bewaar|geven|garder|confier|guardar|dar|aufbewahr|geben|guardar|entregar|حفظ|تسليم).{0,25}(?:physical key|fysieke sleutel|clé physique|llave física|physischen? schlüssel|chave física|مفتاح فعلي)/iu,
  },
  {
    key: "presence",
    pattern: /(?:need|must|moet|dois|debo|muss|preciso|يجب).{0,25}(?:home|present|thuis|présent|casa|anwesend|zu hause|المنزل|حاضر)/iu,
  },
  {
    key: "first_visit",
    pattern: /(?:how|hoe|comment|cómo|wie|como|كيف).{0,30}(?:first visit|home assessment|eerste bezoek|woningbeoordeling|première visite|évaluation initiale|primera visita|evaluación inicial|erster besuch|ersteinschätzung|primeira visita|avaliação inicial|الزيارة الأولى|التقييم الأولي).{0,20}(?:work|werkt|fonctionne|déroule|funciona|funktioniert|trabalha|تعمل|يتم)?/iu,
  },
];

export function approvedFaqKey(input: {
  message: string;
  selectedSuggestionId?: string | null;
}): ApprovedFaqKey | null {
  const suggestionKey = input.selectedSuggestionId
    ? FAQ_BY_SUGGESTION_ID[input.selectedSuggestionId]
    : null;
  if (suggestionKey) return suggestionKey;
  return FAQ_PATTERNS.find(({ pattern }) => pattern.test(input.message))?.key || null;
}

export function approvedFaqAnswer(input: {
  message: string;
  locale: Locale;
  selectedSuggestionId?: string | null;
}): string | null {
  const key = approvedFaqKey(input);
  return key ? APPROVED_FAQ_COPY[input.locale][key] : null;
}
