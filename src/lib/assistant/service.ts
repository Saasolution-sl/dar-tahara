import "server-only";
import { randomUUID } from "node:crypto";
import { isLocale, type Locale } from "@/i18n/config";
import { ANNUAL_DISCOUNT_PERCENT, formatMoneyFromCents } from "@/lib/assessment";
import { calculatePrice, frequencyOrder, type FrequencyKey } from "@/lib/pricing";
import { isServiceRoleConfigured, serviceInsert, serviceSelect, serviceUpdate, serviceUpsert } from "@/lib/supabase-rpc";
import { generateWithConfiguredProvider } from "./provider";
import {
  LANGUAGE_CLARIFICATION,
  LANGUAGE_NAMES,
  languageLogMetadata,
  resolveConversationLanguage,
  responseMatchesConversationLanguage,
} from "./language";
import { localizeRetrievedKnowledge } from "./knowledge-localizations";
import { classifyIntent, knowledgeCategoriesForIntent, retrieveKnowledge } from "./retrieval";
import { buildHandoffSummary, evaluateHumanHandoff, guidedResponse, type HandoffEvaluation } from "./handoff";
import {
  advanceSuggestionState,
  deriveMissingInformation,
  EMPTY_SUGGESTION_STATE,
  generateConversationSuggestions,
  suggestionStateFromMetadata,
} from "./suggestions";
import type {
  AssistantInput,
  AssistantIntent,
  AssistantReply,
  AssistantSuggestion,
  AssistantSuggestionState,
  AssistantToolCall,
  RetrievedKnowledge,
} from "./types";

const RESPONSE_BY_LOCALE: Record<Locale, {
  fallback: string;
  handoff: string;
  bookingPrivate: string;
  priceNeedSize: string;
  priceCustom: string;
  priceIntro: string;
  actions: {
    firstVisit: string;
    calculate: string;
    book: string;
    specialist: string;
    annual: string;
  };
}> = {
  en: {
    fallback: "I don’t want to give you incorrect information. I can connect you with a Dar Tahara specialist who can review this for you.",
    handoff: "I can connect you with a Dar Tahara specialist who can review this personally. I’ll include a concise summary so you do not need to repeat everything.",
    bookingPrivate: "I can help with general booking questions here. For personal booking, payment or subscription details, please use a verified link or speak with a Dar Tahara specialist.",
    priceNeedSize: "I can estimate this for you. Please send the property size in m² and the preferred frequency: monthly, bi-weekly, weekly, or Airbnb & rentals.",
    priceCustom: "For this property size, Dar Tahara prepares a tailored quotation after reviewing the home details.",
    priceIntro: "Based on the shared Dar Tahara pricing engine, this is an estimate before the Initial Home Assessment:",
    actions: { firstVisit: "How does the first visit work?", calculate: "Calculate my price", book: "Book an assessment", specialist: "Speak to a specialist", annual: "Monthly or annual?" },
  },
  nl: {
    fallback: "Ik wil u geen onjuiste informatie geven. Ik kan u verbinden met een Dar Tahara-specialist die dit persoonlijk bekijkt.",
    handoff: "Ik kan u verbinden met een Dar Tahara-specialist. Ik voeg een korte samenvatting toe, zodat u niet alles hoeft te herhalen.",
    bookingPrivate: "Ik kan algemene boekingsvragen beantwoorden. Voor persoonlijke boekings-, betaal- of abonnementsgegevens is verificatie nodig.",
    priceNeedSize: "Ik kan een schatting maken. Stuur de oppervlakte in m² en de gewenste frequentie: maandelijks, tweewekelijks, wekelijks of Airbnb & verhuur.",
    priceCustom: "Voor deze woninggrootte maakt Dar Tahara een persoonlijke offerte na beoordeling van de gegevens.",
    priceIntro: "Volgens de gedeelde Dar Tahara-prijsmotor is dit een schatting vóór de Initiële Woningbeoordeling:",
    actions: { firstVisit: "Hoe werkt het eerste bezoek?", calculate: "Bereken mijn prijs", book: "Boek een beoordeling", specialist: "Spreek een specialist", annual: "Maandelijks of jaarlijks?" },
  },
  fr: {
    fallback: "Je préfère ne pas vous donner une information incorrecte. Je peux vous mettre en relation avec un spécialiste Dar Tahara.",
    handoff: "Je peux vous mettre en relation avec un spécialiste Dar Tahara qui examinera cela personnellement, avec un bref résumé de votre demande.",
    bookingPrivate: "Je peux répondre aux questions générales. Pour les informations personnelles de réservation, paiement ou abonnement, une vérification est nécessaire.",
    priceNeedSize: "Je peux faire une estimation. Envoyez la surface en m² et la fréquence souhaitée : mensuelle, bihebdomadaire, hebdomadaire ou Airbnb/location.",
    priceCustom: "Pour cette surface, Dar Tahara prépare un devis personnalisé après examen du logement.",
    priceIntro: "Selon le moteur tarifaire partagé de Dar Tahara, voici une estimation avant l’Évaluation Initiale du Domicile :",
    actions: { firstVisit: "Comment fonctionne la première visite ?", calculate: "Calculer mon prix", book: "Réserver une évaluation", specialist: "Parler à un spécialiste", annual: "Mensuel ou annuel ?" },
  },
  ar: {
    fallback: "لا أريد أن أقدّم لك معلومة غير دقيقة. يمكنني ربطك بمختص من دار طهارة لمراجعة ذلك.",
    handoff: "يمكنني ربطك بمختص من دار طهارة لمراجعة الأمر شخصياً، مع ملخص قصير حتى لا تحتاج إلى إعادة الشرح.",
    bookingPrivate: "يمكنني المساعدة في الأسئلة العامة. أما تفاصيل الحجز أو الدفع أو الاشتراك الشخصية فتحتاج إلى تحقق آمن.",
    priceNeedSize: "يمكنني تقدير السعر. أرسل مساحة العقار بالمتر المربع والتكرار المطلوب: شهري، كل أسبوعين، أسبوعي، أو Airbnb والإيجارات.",
    priceCustom: "لهذه المساحة، تُعد دار طهارة عرضاً مخصصاً بعد مراجعة تفاصيل المنزل.",
    priceIntro: "استناداً إلى محرك الأسعار المشترك لدى دار طهارة، هذا تقدير قبل التقييم الأولي للمنزل:",
    actions: { firstVisit: "كيف تعمل الزيارة الأولى؟", calculate: "احسب السعر", book: "احجز تقييماً", specialist: "تحدث إلى مختص", annual: "شهري أم سنوي؟" },
  },
  es: {
    fallback: "No quiero darle información incorrecta. Puedo conectarle con un especialista de Dar Tahara.",
    handoff: "Puedo conectarle con un especialista de Dar Tahara y compartir un resumen breve para que no tenga que repetirlo todo.",
    bookingPrivate: "Puedo ayudar con preguntas generales. Para datos personales de reserva, pago o suscripción se necesita verificación.",
    priceNeedSize: "Puedo estimarlo. Envíe los m² de la propiedad y la frecuencia: mensual, quincenal, semanal o Airbnb y alquileres.",
    priceCustom: "Para este tamaño, Dar Tahara prepara un presupuesto personalizado tras revisar los detalles de la vivienda.",
    priceIntro: "Según el motor de precios compartido de Dar Tahara, esta es una estimación antes de la Evaluación Inicial:",
    actions: { firstVisit: "¿Cómo funciona la primera visita?", calculate: "Calcular mi precio", book: "Reservar evaluación", specialist: "Hablar con especialista", annual: "¿Mensual o anual?" },
  },
  de: {
    fallback: "Ich möchte Ihnen keine falsche Auskunft geben. Ich kann Sie mit einem Dar Tahara-Spezialisten verbinden.",
    handoff: "Ich kann Sie mit einem Dar Tahara-Spezialisten verbinden und eine kurze Zusammenfassung mitgeben.",
    bookingPrivate: "Ich helfe gern mit allgemeinen Fragen. Für persönliche Buchungs-, Zahlungs- oder Abodaten ist eine Verifizierung nötig.",
    priceNeedSize: "Ich kann eine Schätzung erstellen. Senden Sie die Wohnfläche in m² und die gewünschte Häufigkeit: monatlich, zweiwöchentlich, wöchentlich oder Airbnb/Vermietung.",
    priceCustom: "Für diese Größe erstellt Dar Tahara nach Prüfung der Angaben ein individuelles Angebot.",
    priceIntro: "Auf Basis der gemeinsamen Dar Tahara-Preislogik ist dies eine Schätzung vor der Ersteinschätzung:",
    actions: { firstVisit: "Wie funktioniert der erste Besuch?", calculate: "Preis berechnen", book: "Bewertung buchen", specialist: "Spezialist sprechen", annual: "Monatlich oder jährlich?" },
  },
  pt: {
    fallback: "Não quero dar-lhe informação incorreta. Posso colocá-lo em contacto com um especialista Dar Tahara.",
    handoff: "Posso colocá-lo em contacto com um especialista Dar Tahara e incluir um breve resumo para não ter de repetir tudo.",
    bookingPrivate: "Posso ajudar com perguntas gerais. Para dados pessoais de reserva, pagamento ou subscrição, é necessária verificação.",
    priceNeedSize: "Posso estimar. Envie a área em m² e a frequência: mensal, quinzenal, semanal ou Airbnb e alugueres.",
    priceCustom: "Para esta área, a Dar Tahara prepara um orçamento personalizado após rever os detalhes da casa.",
    priceIntro: "Com base no motor de preços partilhado da Dar Tahara, esta é uma estimativa antes da Avaliação Inicial:",
    actions: { firstVisit: "Como funciona a primeira visita?", calculate: "Calcular preço", book: "Reservar avaliação", specialist: "Falar com especialista", annual: "Mensal ou anual?" },
  },
};

const GREETING_BY_LOCALE: Record<Locale, string> = {
  en: "Hello! How can I help you?",
  nl: "Goedendag! Waarmee kan ik u helpen?",
  fr: "Bonjour ! Comment puis-je vous aider ?",
  es: "¡Hola! ¿Cómo puedo ayudarte?",
  de: "Guten Tag! Wie kann ich Ihnen helfen?",
  pt: "Olá! Como posso ajudar?",
  ar: "مرحباً! كيف يمكنني مساعدتك؟",
};

const LANGUAGE_CHANGE_BY_LOCALE: Record<Locale, string> = {
  en: "Of course. We can continue in English.",
  nl: "Natuurlijk. We kunnen in het Nederlands verdergaan.",
  fr: "Bien sûr. Nous pouvons continuer en français.",
  es: "Por supuesto. Podemos continuar en español.",
  de: "Natürlich. Wir können auf Deutsch fortfahren.",
  pt: "Claro. Podemos continuar em português.",
  ar: "بالطبع. يمكننا المتابعة باللغة العربية.",
};

const PRICE_LINES_BY_LOCALE: Record<Locale, {
  monthly: string;
  annual: (discount: number) => string;
  assessment: string;
  final: string;
}> = {
  en: { monthly: "estimated monthly subscription", annual: (discount) => `estimated annual total with ${discount}% annual discount`, assessment: "one-time Initial Home Assessment", final: "The final ongoing subscription may be adjusted after the home is professionally assessed." },
  nl: { monthly: "geschat maandelijks abonnement", annual: (discount) => `geschat jaartotaal met ${discount}% jaarkorting`, assessment: "eenmalige Initiële Woningbeoordeling", final: "Het definitieve abonnement kan na de professionele woningbeoordeling worden aangepast." },
  fr: { monthly: "abonnement mensuel estimé", annual: (discount) => `total annuel estimé avec ${discount} % de remise annuelle`, assessment: "Évaluation Initiale du Domicile unique", final: "L’abonnement définitif peut être ajusté après l’évaluation professionnelle du domicile." },
  es: { monthly: "suscripción mensual estimada", annual: (discount) => `total anual estimado con un ${discount} % de descuento anual`, assessment: "Evaluación Inicial de la Vivienda, pago único", final: "La suscripción definitiva puede ajustarse tras la evaluación profesional de la vivienda." },
  de: { monthly: "geschätztes Monatsabonnement", annual: (discount) => `geschätzte Jahressumme mit ${discount} % Jahresrabatt`, assessment: "einmalige Ersteinschätzung des Hauses", final: "Das endgültige Abonnement kann nach der professionellen Bewertung des Hauses angepasst werden." },
  pt: { monthly: "subscrição mensal estimada", annual: (discount) => `total anual estimado com ${discount}% de desconto anual`, assessment: "Avaliação Inicial da Casa, pagamento único", final: "A subscrição definitiva pode ser ajustada após a avaliação profissional da casa." },
  ar: { monthly: "اشتراك شهري تقديري", annual: (discount) => `إجمالي سنوي تقديري مع خصم سنوي بنسبة ${discount}%`, assessment: "التقييم الأولي للمنزل لمرة واحدة", final: "قد يتم تعديل الاشتراك النهائي بعد التقييم المهني للمنزل." },
};

function isShortGreeting(message: string): boolean {
  return /^(hello|hi|hey|good morning|good afternoon|hoi|goedemorgen|goedemiddag|goedenavond|bonjour|salut|bonsoir|hola|buenos d[ií]as|buenas|hallo|guten tag|gutenmorgen|ol[áa]|oi|bom dia|السلام عليكم|مرحبا|أهلا|سلام)[!.?،\s]*$/iu.test(message.trim());
}

function cleanMessage(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, 2000);
}

function extractSize(message: string): number | null {
  const match = message.match(/(\d{2,4}(?:[.,]\d{1,2})?)\s*(?:m2|m²|sqm|square|meter|metre|متر)/i);
  if (!match) return null;
  const size = Number(match[1].replace(",", "."));
  return Number.isFinite(size) ? size : null;
}

function extractFrequency(message: string): FrequencyKey {
  const n = message.toLocaleLowerCase();
  if (/airbnb|rental|rentals|verhuur|location|alquiler|aluguer|إيجار/.test(n)) return "irregular";
  if (/bi.?weekly|two.?weekly|2.?week|tweewekelijks|quinzenal|كل أسبوعين/.test(n)) return "biweekly";
  if (/weekly|wekelijks|hebdomadaire|semanal|wöchentlich|أسبوعي/.test(n)) return "weekly";
  if (/monthly|maandelijks|mensuel|mensual|monatlich|شهري/.test(n)) return "monthly";
  return "biweekly";
}

function buildActions(suggestions: AssistantSuggestion[]) {
  return suggestions.map((item) => ({ label: item.label, action: "ask" as const, value: item.value }));
}

function composeGroundedAnswer(
  input: AssistantInput,
  intent: AssistantIntent,
  retrieved: RetrievedKnowledge[],
  toolCalls: AssistantToolCall[],
  evaluation: HandoffEvaluation,
): string {
  const copy = RESPONSE_BY_LOCALE[input.locale];
  if (isShortGreeting(input.message)) return GREETING_BY_LOCALE[input.locale];
  if (intent === "language_change") return LANGUAGE_CHANGE_BY_LOCALE[input.locale];
  if (evaluation.required || evaluation.nextAction === "ask_clarifying_question" || evaluation.nextAction === "guided_self_service") {
    return guidedResponse(input.locale, evaluation);
  }
  const priceTool = toolCalls.find((call) => call.name === "calculate_price" && call.status === "success");
  if (priceTool) {
    const monthlyCents = priceTool.result.monthlyCents as number | null;
    const annualCents = priceTool.result.annualCents as number | null;
    const assessmentCents = priceTool.result.assessmentCents as number;
    const priceLines = PRICE_LINES_BY_LOCALE[input.locale];
    if (monthlyCents === null) return copy.priceCustom;
    return [
      copy.priceIntro,
      `• ${formatMoneyFromCents(monthlyCents, input.locale)} ${priceLines.monthly}`,
      annualCents ? `• ${formatMoneyFromCents(annualCents, input.locale)} ${priceLines.annual(ANNUAL_DISCOUNT_PERCENT)}` : null,
      `• ${formatMoneyFromCents(assessmentCents, input.locale)} ${priceLines.assessment}`,
      priceLines.final,
    ].filter(Boolean).join("\n");
  }
  if (intent === "pricing" && !priceTool) return copy.priceNeedSize;
  if (intent === "booking_status") return copy.bookingPrivate;
  if (!retrieved.length) return copy.fallback;
  return retrieved.slice(0, 2).map((item) => item.article.content).join("\n\n");
}

function calculatePriceTool(message: string, locale: Locale): AssistantToolCall | null {
  const sizeM2 = extractSize(message);
  if (!sizeM2) return null;
  const frequency = extractFrequency(message);
  const result = calculatePrice(sizeM2, frequency);
  if (result.status === "invalid") {
    return { name: "calculate_price", input: { sizeM2, frequency }, status: "failed", result: { reason: result.reason } };
  }
  if (result.status === "custom") {
    return { name: "calculate_price", input: { sizeM2, frequency }, status: "success", result: { monthlyCents: null, annualCents: null, assessmentCents: 24900 } };
  }
  const monthlyCents = Math.round(result.monthlyTotal * 100);
  const annualBeforeDiscount = monthlyCents * 12;
  return {
    name: "calculate_price",
    input: { sizeM2, frequency },
    status: "success",
    result: {
      monthlyCents,
      annualCents: Math.round(annualBeforeDiscount * (1 - ANNUAL_DISCOUNT_PERCENT / 100)),
      assessmentCents: sizeM2 <= 75 ? 7900 : sizeM2 <= 125 ? 11900 : 16900,
      frequency,
      supportedFrequencies: frequencyOrder,
      locale,
    },
  };
}

type DatabaseKnowledgeRow = {
  id: string;
  slug: string;
  category: string;
  title: string;
  language: Locale;
  content: string;
  version: number;
  effective_from?: string | null;
};

const KNOWLEDGE_CATEGORIES = new Set([
  "company", "services", "assessment", "pricing", "billing", "payments", "policies", "access", "support",
]);

function knowledgeTokens(value: string): string[] {
  return value.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .split(/[^\p{L}\p{N}]+/u).filter((item) => item.length > 2);
}

async function retrievePublishedDatabaseKnowledge(
  message: string,
  locale: Locale,
  intent: AssistantIntent,
): Promise<RetrievedKnowledge[]> {
  if (!isServiceRoleConfigured()) return [];
  const now = encodeURIComponent(new Date().toISOString());
  const rows = await serviceSelect<DatabaseKnowledgeRow[]>(
    `knowledge_entries?status=eq.published&language=in.(${locale},en)&or=(effective_from.is.null,effective_from.lte.${now})&select=id,slug,category,title,language,content,version,effective_from&order=version.desc&limit=100`,
  ).catch(() => []);
  const query = new Set(knowledgeTokens(message));
  const preferredCategories = new Set(knowledgeCategoriesForIntent(intent));
  const scored = rows.map((row) => {
    const haystack = knowledgeTokens(`${row.slug} ${row.category} ${row.title} ${row.content}`);
    const matches = haystack.filter((token) => query.has(token));
    const languageBoost = row.language === locale ? 3 : 0;
    const intentBoost = preferredCategories.has(row.category as RetrievedKnowledge["article"]["category"]) ? 4 : 0;
    return { row, score: matches.length + languageBoost + intentBoost, relevance: matches.length + intentBoost, matches };
  }).filter((item) => item.relevance > 0)
    .sort((a, b) => b.score - a.score || b.row.version - a.row.version);
  const exact = scored.filter((item) => item.row.language === locale);
  return (exact.length ? exact : scored).slice(0, Number(process.env.ASSISTANT_RETRIEVAL_LIMIT || 4)).map(({ row, score, matches }) => ({
    article: {
      id: row.id,
      title: row.title,
      category: (KNOWLEDGE_CATEGORIES.has(row.category) ? row.category : "support") as RetrievedKnowledge["article"]["category"],
      language: row.language,
      status: "approved",
      version: row.version,
      effectiveDate: row.effective_from || new Date().toISOString(),
      lastReviewedDate: row.effective_from || new Date().toISOString(),
      source: `Supabase knowledge_entries:${row.slug}`,
      visibility: "public",
      keywords: matches,
      relatedQuestions: [],
      summary: row.content.slice(0, 240),
      content: row.content,
    },
    score,
    matchedKeywords: matches,
  }));
}

type StoredConversationState = {
  authorized: boolean;
  language: Locale | null;
  languageSelectionPending: boolean;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  suggestionState: AssistantSuggestionState;
};

async function loadWebsiteConversationState(input: AssistantInput): Promise<StoredConversationState> {
  const empty: StoredConversationState = {
    authorized: true,
    language: null,
    languageSelectionPending: false,
    history: [],
    suggestionState: input.suggestionState || EMPTY_SUGGESTION_STATE,
  };
  if (!isServiceRoleConfigured() || input.channel !== "website" || !input.conversationId || !input.sessionId) return empty;
  const rows = await serviceSelect<Array<{ language: string; metadata: Record<string, unknown> | null }>>(
    `assistant_conversations?id=eq.${encodeURIComponent(input.conversationId)}&select=language,metadata&limit=1`,
  ).catch(() => []);
  const row = rows[0];
  if (!row) return empty;
  if (row.metadata?.session_id !== input.sessionId) return { ...empty, authorized: false };

  const languageConfirmed = row.metadata?.language_confirmed !== false;
  const messageRows = await serviceSelect<Array<{ role: string; body: string }>>(
    `assistant_messages?conversation_id=eq.${encodeURIComponent(input.conversationId)}&role=in.(customer,assistant)&select=role,body,created_at&order=created_at.desc&limit=12`,
  ).catch(() => []);
  return {
    authorized: true,
    language: languageConfirmed && isLocale(row.language) ? row.language : null,
    languageSelectionPending: !languageConfirmed,
    suggestionState: suggestionStateFromMetadata(row.metadata),
    history: messageRows.reverse().map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.body,
    })),
  };
}

async function persistAssistantTurn(input: AssistantInput, reply: AssistantReply, retrieved: RetrievedKnowledge[]) {
  if (!isServiceRoleConfigured()) return;
  const nowMetadata = {
    session_id: input.sessionId || null,
    website_path: input.websitePath || null,
    contact: input.contact || null,
    sources: retrieved.map((item) => ({ id: item.article.id, score: item.score })),
    tool_calls: reply.toolCalls,
    language_confidence: reply.languageConfidence,
    language_confirmed: reply.languageConfirmed,
    language_changed: reply.languageChanged,
    shown_suggestion_ids: reply.suggestionState.shownSuggestionIds,
    selected_suggestion_ids: reply.suggestionState.selectedSuggestionIds,
    answered_topics: reply.suggestionState.answeredTopics,
    unresolved_topics: reply.suggestionState.unresolvedTopics,
    clarification_attempts: reply.suggestionState.clarificationAttempts,
    suggestions: reply.suggestions.map((item) => ({ id: item.id, intent: item.intent })),
    escalation: { required: reply.escalation.required, reason: reply.escalation.reason, next_action: reply.escalation.nextAction },
  };
  await serviceUpsert("assistant_conversations", {
    id: reply.conversationId,
    customer_id: input.customerId || null,
    channel: input.channel,
    status: reply.handoffRequired ? "handoff_requested" : "open",
    language: reply.locale,
    customer_name: input.customerName || null,
    contact_handle: input.contact || null,
    last_message_at: new Date().toISOString(),
    last_intent: reply.intent,
    handoff_reason: reply.handoffReason || null,
    metadata: nowMetadata,
  }, "id").catch(() => undefined);
  await serviceInsert("assistant_messages", [
    {
      conversation_id: reply.conversationId,
      role: "customer",
      channel: input.channel,
      language: reply.locale,
      body: cleanMessage(input.message),
      metadata: nowMetadata,
    },
    {
      conversation_id: reply.conversationId,
      role: "assistant",
      channel: input.channel,
      language: reply.locale,
      body: reply.answer,
      confidence: reply.confidence,
      intent: reply.intent,
      metadata: nowMetadata,
    },
  ]).catch(() => undefined);
  const auditEvents: Array<Record<string, unknown>> = [{
    actor_type: "system",
    actor_reference: input.channel,
    action: reply.languageChanged ? "assistant_language_changed" : "assistant_language_resolved",
    subject_table: "assistant_conversations",
    subject_id: reply.conversationId,
    metadata: {
      detected_language: reply.locale,
      confidence: reply.languageConfidence,
      current_session_language: reply.languageConfirmed ? reply.locale : null,
      language_changed: reply.languageChanged,
      language_change_detected: reply.languageChanged,
    },
  }, {
    actor_type: "assistant",
    actor_reference: input.channel,
    action: "intent_detected",
    subject_table: "assistant_conversations",
    subject_id: reply.conversationId,
    metadata: { intent: reply.intent, confidence: reply.confidence, language: reply.locale },
  }, {
    actor_type: "assistant",
    actor_reference: input.channel,
    action: "suggestions_generated",
    subject_table: "assistant_conversations",
    subject_id: reply.conversationId,
    metadata: { suggestion_ids: reply.suggestions.map((item) => item.id), count: reply.suggestions.length, language: reply.locale },
  }];
  if (input.selectedSuggestionId) auditEvents.push({
    actor_type: "customer",
    actor_reference: input.channel,
    action: "suggestion_selected",
    subject_table: "assistant_conversations",
    subject_id: reply.conversationId,
    metadata: { suggestion_id: input.selectedSuggestionId },
  });
  if (["ask_clarifying_question", "guided_self_service"].includes(reply.escalation.nextAction)) auditEvents.push({
    actor_type: "assistant",
    actor_reference: input.channel,
    action: "clarification_requested",
    subject_table: "assistant_conversations",
    subject_id: reply.conversationId,
    metadata: { intent: reply.intent, unresolved_topics: reply.suggestionState.unresolvedTopics },
  });
  if (reply.handoffRequired) {
    auditEvents.push({
      actor_type: "assistant",
      actor_reference: input.channel,
      action: "escalation_offered",
      subject_table: "assistant_conversations",
      subject_id: reply.conversationId,
      metadata: { escalation_reason: reply.handoffReason, intent: reply.intent },
    });
    if (reply.handoffReason === "customer_explicitly_requests_human") auditEvents.push({
      actor_type: "customer",
      actor_reference: input.channel,
      action: "escalation_accepted",
      subject_table: "assistant_conversations",
      subject_id: reply.conversationId,
      metadata: { escalation_reason: reply.handoffReason },
    });
  } else if (reply.escalation.nextAction === "answer") {
    auditEvents.push({
      actor_type: "assistant",
      actor_reference: input.channel,
      action: "self_service_completed",
      subject_table: "assistant_conversations",
      subject_id: reply.conversationId,
      metadata: { intent: reply.intent },
    }, {
      actor_type: "assistant",
      actor_reference: input.channel,
      action: "assistant_resolution_count",
      subject_table: "assistant_conversations",
      subject_id: reply.conversationId,
      metadata: { resolved: true, intent: reply.intent },
    });
  }
  await serviceInsert("assistant_audit_logs", auditEvents).catch(() => undefined);
  if (reply.handoffRequired) {
    const openCases = await serviceSelect<Array<{ id: string }>>(
      `support_cases?conversation_id=eq.${reply.conversationId}&status=in.(open,assigned,waiting_customer)&select=id&limit=1`,
    ).catch(() => []);
    if (!openCases.length) {
      await serviceInsert("support_cases", {
        customer_id: input.customerId || null,
        conversation_id: reply.conversationId,
        channel: input.channel,
        status: "open",
        priority: ["security_issue", "damage_claim", "missing_item_claim"].includes(reply.handoffReason || "") ? "high" : "normal",
        category: reply.handoffReason || reply.intent,
        language: reply.locale,
        subject: `Assistant handoff: ${reply.intent}`,
        summary: reply.escalation.summary?.conversationSummary || cleanMessage(input.message),
        metadata: { ...nowMetadata, handoff_summary: reply.escalation.summary || null },
      }).catch(() => undefined);
    }
  }
}

export async function answerAssistant(input: AssistantInput): Promise<AssistantReply> {
  const message = cleanMessage(input.message);
  const storedState = await loadWebsiteConversationState(input);
  const conversationId = input.conversationId && storedState.authorized ? input.conversationId : randomUUID();
  const previousLanguage = storedState.language || input.sessionLanguage || null;
  const languageDecision = input.languageDecision || resolveConversationLanguage({
    message,
    currentLanguage: previousLanguage,
    selectedLanguage: input.selectedLanguage,
    selectionPending: storedState.languageSelectionPending || input.languageSelectionPending,
  });
  const fallbackLocale = isLocale(input.locale) ? input.locale : "en";
  const locale = languageDecision.locale || fallbackLocale;
  const normalizedInput = {
    ...input,
    locale,
    message,
    conversationId,
    sessionLanguage: languageDecision.locale,
    conversationHistory: input.conversationHistory || storedState.history,
  };
  console.info(JSON.stringify({ scope: "assistant_language", ...languageLogMetadata(languageDecision, previousLanguage) }));

  if (languageDecision.needsClarification) {
    const suggestionState = storedState.suggestionState;
    const reply: AssistantReply = {
      conversationId,
      locale,
      languageConfidence: languageDecision.confidence,
      languageChanged: false,
      languageConfirmed: false,
      intent: "language_change",
      answer: LANGUAGE_CLARIFICATION,
      confidence: 1,
      handoffRequired: false,
      escalation: { required: false, reason: null, confidence: 1, nextAction: "ask_clarifying_question" },
      suggestions: [],
      suggestionState,
      sources: [],
      suggestedActions: [],
      toolCalls: [],
    };
    await persistAssistantTurn(normalizedInput, reply, []);
    return reply;
  }

  const intent = classifyIntent(message);
  const databaseKnowledge = await retrievePublishedDatabaseKnowledge(message, locale, intent);
  const retrieved = localizeRetrievedKnowledge(
    databaseKnowledge.length ? databaseKnowledge : retrieveKnowledge(message, locale, 4, intent),
    locale,
  );
  const priceTool = intent === "pricing" ? calculatePriceTool(message, locale) : null;
  const toolCalls = priceTool ? [priceTool] : [];
  const turnSuggestionState: AssistantSuggestionState = input.selectedSuggestionId
    ? {
      ...storedState.suggestionState,
      selectedSuggestionIds: [...new Set([...storedState.suggestionState.selectedSuggestionIds, input.selectedSuggestionId])],
    }
    : storedState.suggestionState;
  const evaluation = evaluateHumanHandoff({
    message,
    intent,
    retrieved,
    state: turnSuggestionState,
  });
  const generatedProviderAnswer = evaluation.required
    || evaluation.nextAction !== "answer"
    || isShortGreeting(message)
    || intent === "language_change"
    ? null
    : await generateWithConfiguredProvider(normalizedInput, retrieved);
  const providerAnswer = generatedProviderAnswer && responseMatchesConversationLanguage(generatedProviderAnswer.answer, locale)
    ? generatedProviderAnswer
    : null;
  if (generatedProviderAnswer && !providerAnswer) {
    console.warn(JSON.stringify({
      scope: "assistant_language",
      event: "provider_language_mismatch",
      currentSessionLanguage: LANGUAGE_NAMES[locale],
    }));
  }
  const answer = providerAnswer?.answer || composeGroundedAnswer(normalizedInput, intent, retrieved, toolCalls, evaluation);
  const missingInformation = deriveMissingInformation({
    conversationHistory: normalizedInput.conversationHistory || [],
    latestUserMessage: message,
    detectedIntent: intent,
    evaluation,
  });
  const suggestions = generateConversationSuggestions({
    conversationHistory: normalizedInput.conversationHistory || [],
    latestUserMessage: message,
    latestAssistantResponse: answer,
    detectedIntent: intent,
    missingInformation,
    conversationLanguage: locale,
    availableActions: ["ask", "open_calculator", "open_booking"],
    state: turnSuggestionState,
    evaluation,
  });
  const suggestionState = advanceSuggestionState({
    state: turnSuggestionState,
    selectedSuggestionId: input.selectedSuggestionId,
    suggestions,
    evaluation,
    latestUserMessage: message,
  });
  const handoffSummary = evaluation.required && evaluation.reason ? buildHandoffSummary({
    locale,
    intent,
    reason: evaluation.reason,
    message,
    history: normalizedInput.conversationHistory || [],
  }) : undefined;
  const escalation = { ...evaluation, summary: handoffSummary };
  const confidence = evaluation.required
    ? evaluation.confidence
    : providerAnswer?.confidence ?? Math.min(0.9, 0.55 + retrieved.length * 0.1 + toolCalls.length * 0.15);
  const sources = retrieved.map((item) => ({
    id: item.article.id,
    title: item.article.title,
    category: item.article.category,
    source: item.article.source,
    version: item.article.version,
  }));
  const reply: AssistantReply = {
    conversationId,
    locale,
    languageConfidence: languageDecision.confidence,
    languageChanged: languageDecision.languageChanged,
    languageConfirmed: true,
    intent,
    answer,
    confidence,
    modelName: providerAnswer?.modelName,
    tokenUsage: providerAnswer?.tokenUsage,
    handoffRequired: evaluation.required,
    handoffReason: evaluation.reason || undefined,
    escalation,
    suggestions,
    suggestionState,
    sources,
    suggestedActions: buildActions(suggestions),
    toolCalls,
  };
  await persistAssistantTurn(normalizedInput, reply, retrieved);
  return reply;
}

export async function loadAssistantAdminRows() {
  if (!isServiceRoleConfigured()) throw new Error("service_role_not_configured");
  const [assistantConversations, whatsappConversations] = await Promise.all([
    serviceSelect<Array<Record<string, unknown>>>(
      "assistant_conversations?select=*,assistant_messages(*)&order=last_message_at.desc&limit=50",
    ),
    serviceSelect<Array<Record<string, unknown>>>(
      "whatsapp_conversations?select=*,whatsapp_contacts(id,display_name,email,blocked_until),support_escalations(id,status,reason,severity,freescout_ticket_number,last_error),whatsapp_messages(id,direction,message_body_redacted,created_at)&order=last_customer_message_at.desc&limit=50",
    ).catch(() => []),
  ]);
  const dedicated = whatsappConversations.map((row) => {
    const contact = row.whatsapp_contacts as Record<string, unknown> | null;
    const escalations = row.support_escalations as Array<Record<string, unknown>> | null;
    const messages = row.whatsapp_messages as Array<Record<string, unknown>> | null;
    const escalation = escalations?.[escalations.length - 1];
    return {
      ...row,
      source: "whatsapp_support",
      channel: "whatsapp",
      language: row.detected_language,
      customer_name: contact?.display_name || "WhatsApp contact",
      contact_id: contact?.id,
      contact_blocked: Boolean(contact?.blocked_until),
      last_intent: row.current_intent,
      handoff_reason: escalation?.reason || row.escalation_status,
      last_message_at: row.last_customer_message_at,
      escalation,
      assistant_messages: (messages || []).map((message) => ({
        id: message.id,
        role: message.direction === "inbound" ? "customer" : "assistant",
        body: message.message_body_redacted || "[encrypted content]",
        created_at: message.created_at,
      })),
    };
  });
  return [...dedicated, ...assistantConversations].sort((a, b) =>
    String(b.last_message_at || "").localeCompare(String(a.last_message_at || "")),
  ).slice(0, 100);
}

export async function updateAssistantConversation(id: string, action: string, note?: string) {
  if (!isServiceRoleConfigured()) throw new Error("service_role_not_configured");
  const status = action === "close" ? "closed" : action === "takeover" ? "human_active" : action === "reopen" ? "open" : null;
  if (status) {
    await serviceUpdate("assistant_conversations", `id=eq.${encodeURIComponent(id)}`, { status });
  }
  if (note?.trim()) {
    await serviceInsert("assistant_messages", {
      conversation_id: id,
      role: "system",
      channel: "website",
      body: note.trim().slice(0, 1500),
      metadata: { admin_note: true, action },
    });
  }
}

export async function updateWhatsAppSupportConversation(
  id: string,
  action: "close" | "block" | "unblock" | "retry",
  contactId?: string,
  escalationId?: string,
) {
  if (!isServiceRoleConfigured()) throw new Error("service_role_not_configured");
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("invalid_conversation_id");
  if (action === "close") {
    await serviceUpdate("whatsapp_conversations", `id=eq.${id}`, {
      status: "closed",
      escalation_status: "closed",
      closed_at: new Date().toISOString(),
    });
    return;
  }
  if ((action === "block" || action === "unblock") && contactId && /^[0-9a-f-]{36}$/i.test(contactId)) {
    await serviceUpdate("whatsapp_contacts", `id=eq.${contactId}`, {
      blocked_until: action === "block" ? new Date(Date.now() + 24 * 60 * 60_000).toISOString() : null,
      abuse_count: action === "unblock" ? 0 : undefined,
    });
    await serviceUpdate("whatsapp_conversations", `id=eq.${id}`, {
      status: action === "block" ? "blocked" : "active",
    });
    return;
  }
  if (action === "retry" && escalationId && /^[0-9a-f-]{36}$/i.test(escalationId)) {
    await serviceUpdate("support_escalations", `id=eq.${escalationId}`, {
      status: "retry_pending",
      next_retry_at: new Date().toISOString(),
      last_error: null,
    });
    return;
  }
  throw new Error("invalid_whatsapp_admin_action");
}
