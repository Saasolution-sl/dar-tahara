import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { isLocale, type Locale } from "@/i18n/config";
import { detectLanguage } from "@/lib/assistant/language";
import { SERVICE_POLICY_COPY } from "@/lib/service-policy";

type Intent =
  | "included" | "price" | "subscriptions" | "frequency" | "cancel"
  | "assessment" | "presence" | "reschedule" | "payment" | "products"
  | "cities" | "duration" | "annual" | "address" | "specialist";

const KEYWORDS: Record<Locale, Partial<Record<Intent, string[]>>> = {
  en: { included: ["included", "include"], price: ["cost", "price", "how much"], subscriptions: ["subscription", "plan work"], frequency: ["change frequency", "more often", "less often"], cancel: ["cancel", "stop subscription"], assessment: ["assessment", "first visit"], presence: ["be home", "at home", "present"], reschedule: ["reschedule", "change date"], payment: ["payment method", "pay with", "apple pay", "google pay", "sepa"], products: ["products", "supplies", "materials"], cities: ["cities", "serve", "coverage"], duration: ["how long", "duration"], annual: ["annual", "yearly"], address: ["change address", "new address"], specialist: ["specialist", "human", "person", "agent"] },
  nl: { included: ["inbegrepen", "omvat"], price: ["kost", "prijs", "hoeveel"], subscriptions: ["abonnement", "plan"], frequency: ["frequentie wijzigen", "vaker", "minder vaak"], cancel: ["opzeggen", "annuleren"], assessment: ["woningbeoordeling", "eerste bezoek"], presence: ["thuis zijn", "aanwezig"], reschedule: ["verzetten", "andere datum"], payment: ["betaalmethode", "betalen"], products: ["producten", "middelen"], cities: ["steden", "werkgebied"], duration: ["hoe lang", "duur"], annual: ["jaarlijks", "jaarbetaling"], address: ["adres wijzigen"], specialist: ["specialist", "medewerker", "persoon"] },
  fr: { included: ["inclus", "compris"], price: ["coût", "prix", "combien"], subscriptions: ["abonnement", "formule"], frequency: ["changer la fréquence", "plus souvent", "moins souvent"], cancel: ["résilier", "annuler"], assessment: ["évaluation", "première visite"], presence: ["être présent", "à la maison"], reschedule: ["reporter", "changer la date"], payment: ["moyen de paiement", "payer"], products: ["produits", "matériel"], cities: ["villes", "desserv"], duration: ["combien de temps", "durée"], annual: ["annuel", "à l'année"], address: ["changer d'adresse"], specialist: ["spécialiste", "conseiller", "humain"] },
  ar: { included: ["يشمل", "متضمن"], price: ["السعر", "التكلفة", "كم"], subscriptions: ["اشتراك", "الباقة"], frequency: ["تغيير التكرار", "عدد الزيارات"], cancel: ["إلغاء", "أوقف الاشتراك"], assessment: ["تقييم المنزل", "الزيارة الأولى"], presence: ["في المنزل", "حاضراً"], reschedule: ["تغيير الموعد", "إعادة الجدولة"], payment: ["طرق الدفع", "أدفع"], products: ["مواد التنظيف", "المنتجات"], cities: ["المدن", "تخدمون"], duration: ["كم تستغرق", "المدة"], annual: ["سنوي", "سنوياً"], address: ["تغيير العنوان"], specialist: ["مختص", "موظف", "شخص"] },
  es: { included: ["incluye", "incluido"], price: ["precio", "cuánto", "coste"], subscriptions: ["suscripción", "plan"], frequency: ["cambiar frecuencia", "más veces", "menos veces"], cancel: ["cancelar", "dar de baja"], assessment: ["evaluación", "primera visita"], presence: ["estar en casa", "presente"], reschedule: ["reprogramar", "cambiar fecha"], payment: ["método de pago", "pagar"], products: ["productos", "materiales"], cities: ["ciudades", "servicio"], duration: ["cuánto dura", "duración"], annual: ["anual", "cada año"], address: ["cambiar dirección"], specialist: ["especialista", "persona", "agente"] },
  de: { included: ["inbegriffen", "enthalten"], price: ["preis", "kosten", "wie viel"], subscriptions: ["abonnement", "plan"], frequency: ["häufigkeit ändern", "öfter", "seltener"], cancel: ["kündigen", "stornieren"], assessment: ["hauseinschätzung", "erster besuch"], presence: ["zu hause sein", "anwesend"], reschedule: ["verschieben", "datum ändern"], payment: ["zahlungsmethode", "bezahlen"], products: ["produkte", "reinigungsmittel"], cities: ["städte", "servicegebiet"], duration: ["wie lange", "dauer"], annual: ["jährlich", "jahreszahlung"], address: ["adresse ändern"], specialist: ["spezialist", "mitarbeiter", "person"] },
  pt: { included: ["inclui", "incluído"], price: ["preço", "custo", "quanto"], subscriptions: ["subscrição", "plano"], frequency: ["alterar frequência", "mais vezes", "menos vezes"], cancel: ["cancelar", "terminar"], assessment: ["avaliação", "primeira visita"], presence: ["estar em casa", "presente"], reschedule: ["remarcar", "alterar data"], payment: ["método de pagamento", "pagar"], products: ["produtos", "materiais"], cities: ["cidades", "serviço"], duration: ["quanto tempo", "duração"], annual: ["anual", "por ano"], address: ["alterar morada"], specialist: ["especialista", "pessoa", "assistente"] },
};

const ANSWERS: Record<Locale, Record<Intent | "fallback", string>> = {
  en: {
    included: "Every plan includes premium cleaning, basic supplies, a documented home profile and priority support. Optional linen, laundry and concierge services can be added after your assessment.",
    price: "Your calculator estimate is based on size and frequency. The one-time Initial Home Assessment is prepaid; the final subscription price is confirmed after we verify the home.",
    subscriptions: "Choose monthly or annual billing. Visits follow your selected frequency, and annual billing saves 5%. The subscription starts only after the Initial Home Assessment is approved.",
    frequency: "Yes. Frequency changes are supported and will eventually be self-service in the customer dashboard. Our team can arrange the change now.",
    cancel: SERVICE_POLICY_COPY.en.whatsappCancellation,
    assessment: "The Initial Home Assessment is a premium onboarding visit: we verify the property details, assess its condition, deep-clean where required and create your personalised cleaning profile.",
    presence: "You do not always need to be home, but we need confirmed, secure access. For the first visit, being available is recommended if the property has special requirements.",
    reschedule: SERVICE_POLICY_COPY.en.whatsappReschedule,
    payment: "Stripe Checkout securely offers cards, debit cards, Apple Pay, Google Pay and eligible local methods such as SEPA depending on your device, bank and location.",
    products: "Yes. Basic professional cleaning materials, supplies and toilet paper are included. Surface-specific or specialist products are priced separately in the approved proposal.",
    cities: "We currently focus on Tetouan, Tangier, Meknes, and Casablanca and are expanding across Morocco. Send your city and we will confirm coverage.",
    duration: "The time depends on size and condition. The Initial Home Assessment determines the reliable duration for future visits.",
    annual: "Yes. Annual billing is paid once per year, renews automatically unless cancelled, and includes a 5% discount.",
    address: "Yes. Our team can update your service address and will confirm whether a new Home Assessment or price adjustment is needed.",
    specialist: "Of course. Reply with your name, city and preferred contact time and a Dar Tahara specialist will take over.",
    fallback: "I’m not fully certain I understood. I can help with pricing, subscriptions, payments, the Initial Home Assessment, service areas or scheduling. You can also say “specialist” to speak with our team.",
  },
  nl: {
    included: "Elk plan omvat premium schoonmaak, basismiddelen, een gedocumenteerd woningprofiel en prioriteitsondersteuning. Wasgoed en conciërgediensten kunnen na de beoordeling worden toegevoegd.",
    price: "De schatting is gebaseerd op grootte en frequentie. De eenmalige Initiële Woningbeoordeling wordt vooraf betaald; de definitieve abonnementsprijs volgt na verificatie.",
    subscriptions: "Kies maandelijkse of jaarlijkse betaling. Jaarbetaling bespaart 5%. Het abonnement start pas na goedkeuring van de Initiële Woningbeoordeling.",
    frequency: "Ja. U kunt de frequentie wijzigen; ons team regelt dit nu en later kan dit via het klantdashboard.",
    cancel: SERVICE_POLICY_COPY.nl.whatsappCancellation,
    assessment: "De Initiële Woningbeoordeling is premium onboarding: wij controleren de woninggegevens, beoordelen de staat, reinigen diep waar nodig en maken uw schoonmaakprofiel.",
    presence: "U hoeft niet altijd thuis te zijn, maar veilige toegang moet bevestigd zijn. Bij het eerste bezoek raden wij aanwezigheid aan bij bijzondere wensen.",
    reschedule: SERVICE_POLICY_COPY.nl.whatsappReschedule,
    payment: "Stripe Checkout ondersteunt veilig kaarten, Apple Pay, Google Pay en waar beschikbaar SEPA, afhankelijk van apparaat, bank en locatie.",
    products: "Ja. Basismaterialen, professionele middelen en toiletpapier zijn inbegrepen. Specialistische producten kunnen apart worden geoffreerd.",
    cities: "Wij richten ons op Tetouan, Tanger, Meknes en Casablanca en breiden uit. Stuur uw stad voor een dekkingbevestiging.",
    duration: "De duur hangt af van grootte en staat. De Initiële Woningbeoordeling bepaalt de betrouwbare duur van toekomstige bezoeken.",
    annual: "Ja. Jaarbetaling gebeurt eenmaal per jaar, verlengt automatisch tenzij opgezegd en geeft 5% korting.",
    address: "Ja. Wij kunnen uw adres wijzigen en bevestigen of een nieuwe beoordeling of prijsaanpassing nodig is.",
    specialist: "Natuurlijk. Stuur uw naam, stad en gewenst contactmoment; een Dar Tahara-specialist neemt het over.",
    fallback: "Ik weet niet zeker of ik u goed begrijp. Ik help met prijzen, abonnementen, betalingen, woningbeoordeling, werkgebied en planning. Zeg ‘specialist’ voor ons team.",
  },
  fr: {
    included: "Chaque formule comprend le ménage premium, les produits de base, un profil documenté du domicile et une assistance prioritaire. Le linge et la conciergerie peuvent être ajoutés après l’évaluation.",
    price: "L’estimation dépend de la surface et de la fréquence. L’Évaluation Initiale du Domicile est prépayée ; le prix définitif est confirmé après vérification.",
    subscriptions: "Choisissez un paiement mensuel ou annuel. L’annuel économise 5 %. L’abonnement commence uniquement après validation de l’Évaluation Initiale.",
    frequency: "Oui. La fréquence peut être modifiée ; notre équipe s’en charge aujourd’hui et le tableau de bord le permettra ensuite.",
    cancel: SERVICE_POLICY_COPY.fr.whatsappCancellation,
    assessment: "L’Évaluation Initiale du Domicile est un accueil premium : vérification des informations, état général, nettoyage approfondi si nécessaire et création du profil d’entretien.",
    presence: "Votre présence n’est pas toujours nécessaire, mais l’accès sécurisé doit être confirmé. Elle est recommandée lors de la première visite en cas de besoins particuliers.",
    reschedule: SERVICE_POLICY_COPY.fr.whatsappReschedule,
    payment: "Stripe Checkout propose de façon sécurisée cartes, Apple Pay, Google Pay et SEPA lorsqu’ils sont disponibles selon l’appareil, la banque et le pays.",
    products: "Oui. Les produits professionnels de base, le matériel et le papier toilette sont inclus. Les produits spécialisés peuvent faire l’objet d’un devis.",
    cities: "Nous intervenons principalement à Tétouan, Tanger, Meknès et Casablanca et nous étendons notre couverture. Envoyez votre ville pour confirmation.",
    duration: "La durée dépend de la surface et de l’état. L’Évaluation Initiale fixe une durée fiable pour les visites suivantes.",
    annual: "Oui. Le paiement annuel est prélevé une fois par an, renouvelé automatiquement sauf résiliation, avec 5 % de remise.",
    address: "Oui. Nous pouvons mettre à jour l’adresse et confirmer si une nouvelle évaluation ou un ajustement est nécessaire.",
    specialist: "Bien sûr. Envoyez votre nom, votre ville et l’heure souhaitée ; un spécialiste Dar Tahara prendra le relais.",
    fallback: "Je ne suis pas certain d’avoir compris. Je peux aider pour les tarifs, abonnements, paiements, l’Évaluation Initiale, les zones desservies ou les rendez-vous. Dites « spécialiste » pour notre équipe.",
  },
  ar: {
    included: "تشمل كل باقة تنظيفاً راقياً ومواد أساسية وملفاً موثقاً للمنزل ودعماً ذا أولوية. يمكن إضافة الغسيل وخدمات الكونسيرج بعد التقييم.",
    price: "يعتمد التقدير على المساحة وتكرار الزيارات. يُدفع التقييم الأولي للمنزل مسبقاً، ويُؤكد سعر الاشتراك النهائي بعد التحقق من المنزل.",
    subscriptions: "اختر الدفع الشهري أو السنوي. يوفر السنوي 5٪. لا يبدأ الاشتراك إلا بعد اعتماد التقييم الأولي.",
    frequency: "نعم. يمكن تغيير تكرار الزيارات عبر فريقنا، وسيتوفر ذلك لاحقاً في حساب العميل.",
    cancel: SERVICE_POLICY_COPY.ar.whatsappCancellation,
    assessment: "التقييم الأولي للمنزل خدمة استقبال راقية: نتحقق من المعلومات ونقيّم الحالة وننظف بعمق عند الحاجة وننشئ ملف التنظيف المخصص.",
    presence: "لا يلزم وجودك دائماً، لكن يجب تأكيد دخول آمن. يُفضّل الحضور في الزيارة الأولى عند وجود متطلبات خاصة.",
    reschedule: SERVICE_POLICY_COPY.ar.whatsappReschedule,
    payment: "يوفر Stripe Checkout بطاقات الدفع وApple Pay وGoogle Pay وSEPA عند توفرها حسب الجهاز والبنك والموقع.",
    products: "نعم. تشمل الخدمة المواد المهنية الأساسية والمستلزمات وورق الحمام. قد تُسعّر المنتجات المتخصصة بصورة منفصلة.",
    cities: "نركز حالياً على تطوان وطنجة ومكناس والدار البيضاء ونتوسع في المغرب. أرسل مدينتك لتأكيد التغطية.",
    duration: "تعتمد المدة على المساحة والحالة. يحدد التقييم الأولي المدة الموثوقة للزيارات اللاحقة.",
    annual: "نعم. يُدفع الاشتراك السنوي مرة واحدة ويتجدد تلقائياً ما لم يُلغَ، مع خصم 5٪.",
    address: "نعم. يمكننا تحديث عنوان الخدمة وتحديد ما إذا كان يلزم تقييم جديد أو تعديل السعر.",
    specialist: "بالتأكيد. أرسل اسمك ومدينتك والوقت المناسب وسيتولى مختص من دار طهارة المحادثة.",
    fallback: "لست متأكداً من فهم السؤال. يمكنني المساعدة في الأسعار والاشتراكات والدفع والتقييم الأولي والمدن والمواعيد. اكتب «مختص» للتحدث مع فريقنا.",
  },
  es: {
    included: "Cada plan incluye limpieza premium, productos básicos, perfil documentado y soporte prioritario. La lavandería y la conserjería pueden añadirse tras la evaluación.",
    price: "La estimación depende del tamaño y la frecuencia. La Evaluación Inicial se paga por adelantado; el precio final se confirma tras verificar la vivienda.",
    subscriptions: "Elige pago mensual o anual. El anual ahorra un 5 %. La suscripción empieza solo tras aprobar la Evaluación Inicial.",
    frequency: "Sí. Puedes cambiar la frecuencia con nuestro equipo y más adelante desde el panel de cliente.",
    cancel: SERVICE_POLICY_COPY.es.whatsappCancellation,
    assessment: "La Evaluación Inicial es una incorporación premium: verificamos los datos, evaluamos el estado, hacemos limpieza profunda cuando procede y creamos tu perfil.",
    presence: "No siempre necesitas estar en casa, pero debemos tener acceso seguro confirmado. En la primera visita es recomendable si hay requisitos especiales.",
    reschedule: SERVICE_POLICY_COPY.es.whatsappReschedule,
    payment: "Stripe Checkout admite de forma segura tarjetas, Apple Pay, Google Pay y SEPA cuando estén disponibles según dispositivo, banco y ubicación.",
    products: "Sí. Incluimos materiales profesionales básicos, productos y papel higiénico. Los productos especializados pueden presupuestarse aparte.",
    cities: "Nos centramos en Tetuán, Tánger, Mequinez y Casablanca y ampliamos cobertura. Envíanos tu ciudad para confirmarla.",
    duration: "La duración depende del tamaño y el estado. La Evaluación Inicial determina el tiempo fiable de futuras visitas.",
    annual: "Sí. El pago anual se cobra una vez al año, se renueva automáticamente salvo cancelación y tiene 5 % de descuento.",
    address: "Sí. Podemos actualizar la dirección y confirmar si hace falta una nueva evaluación o ajuste de precio.",
    specialist: "Por supuesto. Envía tu nombre, ciudad y hora preferida y un especialista de Dar Tahara continuará.",
    fallback: "No estoy seguro de haber entendido. Puedo ayudar con precios, suscripciones, pagos, Evaluación Inicial, cobertura o citas. Di “especialista” para hablar con el equipo.",
  },
  de: {
    included: "Jeder Plan umfasst Premium-Reinigung, Grundmaterialien, ein dokumentiertes Hausprofil und Prioritätssupport. Wäsche- und Concierge-Dienste können ergänzt werden.",
    price: "Die Schätzung basiert auf Größe und Häufigkeit. Die Ersteinschätzung wird vorausbezahlt; der endgültige Preis folgt nach der Prüfung des Hauses.",
    subscriptions: "Wählen Sie monatliche oder jährliche Zahlung. Jährlich sparen Sie 5 %. Das Abonnement startet erst nach Freigabe der Ersteinschätzung.",
    frequency: "Ja. Die Häufigkeit kann durch unser Team und später im Kundenportal geändert werden.",
    cancel: SERVICE_POLICY_COPY.de.whatsappCancellation,
    assessment: "Die Ersteinschätzung ist ein Premium-Onboarding: Wir prüfen Angaben und Zustand, reinigen bei Bedarf gründlich und erstellen Ihr persönliches Reinigungsprofil.",
    presence: "Sie müssen nicht immer zu Hause sein, aber sicherer Zugang muss bestätigt sein. Beim ersten Besuch ist Anwesenheit bei besonderen Anforderungen empfohlen.",
    reschedule: SERVICE_POLICY_COPY.de.whatsappReschedule,
    payment: "Stripe Checkout bietet sicher Karten, Apple Pay, Google Pay und verfügbares SEPA je nach Gerät, Bank und Standort.",
    products: "Ja. Professionelle Grundmaterialien, Mittel und Toilettenpapier sind enthalten. Spezialprodukte können separat berechnet werden.",
    cities: "Wir konzentrieren uns auf Tétouan, Tanger, Meknès und Casablanca und erweitern. Senden Sie Ihre Stadt zur Bestätigung.",
    duration: "Die Dauer hängt von Größe und Zustand ab. Die Ersteinschätzung legt eine verlässliche Dauer für künftige Besuche fest.",
    annual: "Ja. Jährliche Zahlung erfolgt einmal pro Jahr, verlängert sich automatisch sofern nicht gekündigt und spart 5 %.",
    address: "Ja. Wir aktualisieren Ihre Adresse und klären, ob eine neue Einschätzung oder Preisanpassung nötig ist.",
    specialist: "Gern. Senden Sie Name, Stadt und gewünschte Kontaktzeit; ein Dar Tahara-Spezialist übernimmt.",
    fallback: "Ich bin nicht sicher, ob ich Sie verstanden habe. Ich helfe zu Preisen, Abos, Zahlung, Ersteinschätzung, Gebieten oder Terminen. Schreiben Sie „Spezialist“ für unser Team.",
  },
  pt: {
    included: "Cada plano inclui limpeza premium, materiais básicos, perfil documentado e apoio prioritário. Lavandaria e concierge podem ser adicionados após a avaliação.",
    price: "A estimativa depende da área e frequência. A Avaliação Inicial é pré-paga; o preço final é confirmado após verificarmos a casa.",
    subscriptions: "Escolha pagamento mensal ou anual. O anual poupa 5 %. A subscrição começa apenas após aprovação da Avaliação Inicial.",
    frequency: "Sim. Pode alterar a frequência com a nossa equipa e futuramente no painel do cliente.",
    cancel: SERVICE_POLICY_COPY.pt.whatsappCancellation,
    assessment: "A Avaliação Inicial é um onboarding premium: verificamos dados e estado, fazemos limpeza profunda quando necessária e criamos o perfil personalizado.",
    presence: "Nem sempre precisa de estar em casa, mas o acesso seguro deve ser confirmado. Na primeira visita recomendamos presença se houver requisitos especiais.",
    reschedule: SERVICE_POLICY_COPY.pt.whatsappReschedule,
    payment: "O Stripe Checkout aceita com segurança cartões, Apple Pay, Google Pay e SEPA quando disponíveis conforme dispositivo, banco e localização.",
    products: "Sim. Materiais profissionais básicos, produtos e papel higiénico estão incluídos. Produtos especializados podem ser orçamentados à parte.",
    cities: "Focamo-nos em Tetuão, Tânger, Meknès e Casablanca e estamos a expandir. Envie a sua cidade para confirmação.",
    duration: "A duração depende da área e do estado. A Avaliação Inicial determina o tempo fiável das visitas futuras.",
    annual: "Sim. O pagamento anual é feito uma vez por ano, renova automaticamente salvo cancelamento e inclui 5 % de desconto.",
    address: "Sim. Podemos atualizar a morada e confirmar se é necessária nova avaliação ou ajuste de preço.",
    specialist: "Claro. Envie nome, cidade e horário preferido e um especialista Dar Tahara assumirá a conversa.",
    fallback: "Não tenho a certeza de ter entendido. Posso ajudar com preços, subscrições, pagamentos, Avaliação Inicial, cidades ou marcações. Diga “especialista” para falar com a equipa.",
  },
};

export function detectWhatsAppLocale(text: string): Locale {
  return detectLanguage(text).locale || "en";
}

export function answerWhatsAppQuestion(text: string, preferredLocale?: string | null): { locale: Locale; intent: Intent | "fallback"; answer: string } {
  const locale = preferredLocale && isLocale(preferredLocale) ? preferredLocale : detectWhatsAppLocale(text);
  const normalized = text.toLocaleLowerCase();
  let best: { intent: Intent | "fallback"; score: number } = { intent: "fallback", score: 0 };
  for (const [intent, keywords] of Object.entries(KEYWORDS[locale]) as Array<[Intent, string[]]>) {
    const score = keywords.reduce((total, keyword) => total + (normalized.includes(keyword) ? keyword.length : 0), 0);
    if (score > best.score) best = { intent, score };
  }
  if (KEYWORDS[locale].reschedule?.some((keyword) => normalized.includes(keyword))) {
    best = { intent: "reschedule", score: Number.MAX_SAFE_INTEGER };
  } else if (KEYWORDS[locale].cancel?.some((keyword) => normalized.includes(keyword))) {
    best = { intent: "cancel", score: Number.MAX_SAFE_INTEGER };
  }
  const answer = best.intent === "cancel"
    ? SERVICE_POLICY_COPY[locale].whatsappCancellation
    : best.intent === "reschedule"
      ? SERVICE_POLICY_COPY[locale].whatsappReschedule
      : ANSWERS[locale][best.intent];
  return { locale, intent: best.intent, answer };
}

export function verifyWhatsAppSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !signatureHeader?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const actual = signatureHeader.slice(7);
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export async function sendWhatsAppText(to: string, body: string): Promise<{ id: string | null }> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) throw new Error("whatsapp_not_configured");
  const version = process.env.WHATSAPP_API_VERSION || process.env.WHATSAPP_GRAPH_VERSION || "v25.0";
  const res = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "text", text: { preview_url: false, body } }),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { messages?: Array<{ id?: string }>; error?: { message?: string } };
  if (!res.ok) throw new Error(data.error?.message || `whatsapp_http_${res.status}`);
  return { id: data.messages?.[0]?.id ?? null };
}

export async function sendWhatsAppTemplate(input: { to: string; templateName: string; languageCode: string; parameters?: string[] }): Promise<{ id: string | null }> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) throw new Error("whatsapp_not_configured");
  const version = process.env.WHATSAPP_API_VERSION || process.env.WHATSAPP_GRAPH_VERSION || "v25.0";
  const components = input.parameters?.length
    ? [{ type: "body", parameters: input.parameters.map((text) => ({ type: "text", text })) }]
    : undefined;
  const res = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: input.to, type: "template", template: { name: input.templateName, language: { code: input.languageCode }, components } }),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { messages?: Array<{ id?: string }>; error?: { message?: string } };
  if (!res.ok) throw new Error(data.error?.message || `whatsapp_http_${res.status}`);
  return { id: data.messages?.[0]?.id ?? null };
}
