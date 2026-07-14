import "server-only";
import { randomUUID } from "node:crypto";
import { isLocale, type Locale } from "@/i18n/config";
import { ANNUAL_DISCOUNT_PERCENT, formatMoneyFromCents } from "@/lib/assessment";
import { calculatePrice, frequencyOrder, type FrequencyKey } from "@/lib/pricing";
import { isServiceRoleConfigured, serviceInsert, serviceSelect, serviceUpdate, serviceUpsert } from "@/lib/supabase-rpc";
import { generateWithConfiguredProvider } from "./provider";
import { classifyIntent, fallbackSources, retrieveKnowledge } from "./retrieval";
import type { AssistantInput, AssistantIntent, AssistantReply, AssistantToolCall, RetrievedKnowledge } from "./types";

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

function buildActions(locale: Locale, intent: AssistantIntent) {
  const labels = RESPONSE_BY_LOCALE[locale].actions;
  return [
    { label: labels.firstVisit, action: "ask" as const, value: labels.firstVisit },
    { label: labels.calculate, action: "open_calculator" as const, value: "#calculator" },
    { label: labels.book, action: "open_booking" as const, value: "book_assessment" },
    ...(intent === "human_handoff" ? [] : [{ label: labels.specialist, action: "handoff" as const, value: labels.specialist }]),
  ];
}

function needsHandoff(intent: AssistantIntent, message: string, retrieved: RetrievedKnowledge[]): string | null {
  if (/refund|chargeback|dispute|damage|unsafe|lawyer|legal|misconduct/i.test(message)) return "sensitive_or_disputed_issue";
  if (intent === "human_handoff") return "customer_requested_human";
  if (["complaint", "cancellation", "reschedule", "booking_status", "privacy", "opt_out"].includes(intent)) return intent;
  if (retrieved.length === 0 && message.length > 20) return "knowledge_gap";
  return null;
}

function composeGroundedAnswer(input: AssistantInput, intent: AssistantIntent, retrieved: RetrievedKnowledge[], toolCalls: AssistantToolCall[]): string {
  const copy = RESPONSE_BY_LOCALE[input.locale];
  const priceTool = toolCalls.find((call) => call.name === "calculate_price" && call.status === "success");
  if (priceTool) {
    const monthlyCents = priceTool.result.monthlyCents as number | null;
    const annualCents = priceTool.result.annualCents as number | null;
    const assessmentCents = priceTool.result.assessmentCents as number;
    if (monthlyCents === null) return copy.priceCustom;
    return [
      copy.priceIntro,
      `• ${formatMoneyFromCents(monthlyCents, input.locale)} estimated monthly subscription`,
      annualCents ? `• ${formatMoneyFromCents(annualCents, input.locale)} estimated annual total with ${ANNUAL_DISCOUNT_PERCENT}% annual discount` : null,
      `• ${formatMoneyFromCents(assessmentCents, input.locale)} one-time Initial Home Assessment`,
      "The final ongoing subscription may be adjusted after the home is professionally assessed.",
    ].filter(Boolean).join("\n");
  }
  if (intent === "pricing" && !priceTool) return copy.priceNeedSize;
  if (intent === "booking_status") return copy.bookingPrivate;
  if (["human_handoff", "complaint", "cancellation", "reschedule", "privacy", "opt_out"].includes(intent)) return copy.handoff;
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

async function retrievePublishedDatabaseKnowledge(message: string, locale: Locale): Promise<RetrievedKnowledge[]> {
  if (!isServiceRoleConfigured()) return [];
  const now = encodeURIComponent(new Date().toISOString());
  const rows = await serviceSelect<DatabaseKnowledgeRow[]>(
    `knowledge_entries?status=eq.published&language=in.(${locale},en)&or=(effective_from.is.null,effective_from.lte.${now})&select=id,slug,category,title,language,content,version,effective_from&order=version.desc&limit=100`,
  ).catch(() => []);
  const query = new Set(knowledgeTokens(message));
  const scored = rows.map((row) => {
    const haystack = knowledgeTokens(`${row.slug} ${row.category} ${row.title} ${row.content}`);
    const matches = haystack.filter((token) => query.has(token));
    const languageBoost = row.language === locale ? 3 : 0;
    return { row, score: matches.length + languageBoost, matches };
  }).filter((item) => item.score > 0)
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

async function persistAssistantTurn(input: AssistantInput, reply: AssistantReply, retrieved: RetrievedKnowledge[]) {
  if (!isServiceRoleConfigured()) return;
  const nowMetadata = {
    session_id: input.sessionId || null,
    website_path: input.websitePath || null,
    contact: input.contact || null,
    sources: retrieved.map((item) => ({ id: item.article.id, score: item.score })),
    tool_calls: reply.toolCalls,
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
  if (reply.handoffRequired) {
    await serviceInsert("support_cases", {
      customer_id: input.customerId || null,
      conversation_id: reply.conversationId,
      channel: input.channel,
      status: "open",
      priority: reply.handoffReason === "sensitive_or_disputed_issue" ? "high" : "normal",
      category: reply.handoffReason || reply.intent,
      language: reply.locale,
      subject: `Assistant handoff: ${reply.intent}`,
      summary: cleanMessage(input.message),
      metadata: nowMetadata,
    }).catch(() => undefined);
  }
}

export async function answerAssistant(input: AssistantInput): Promise<AssistantReply> {
  const locale = isLocale(input.locale) ? input.locale : "en";
  const message = cleanMessage(input.message);
  const conversationId = input.conversationId || randomUUID();
  const normalizedInput = { ...input, locale, message, conversationId };
  const intent = classifyIntent(message);
  const databaseKnowledge = await retrievePublishedDatabaseKnowledge(message, locale);
  const retrieved = databaseKnowledge.length
    ? databaseKnowledge
    : intent === "unknown" ? fallbackSources(locale) : retrieveKnowledge(message, locale);
  const priceTool = intent === "pricing" ? calculatePriceTool(message, locale) : null;
  const toolCalls = priceTool ? [priceTool] : [];
  const handoffReason = needsHandoff(intent, message, retrieved);
  const providerAnswer = handoffReason ? null : await generateWithConfiguredProvider(normalizedInput, retrieved);
  const answer = providerAnswer?.answer || composeGroundedAnswer(normalizedInput, intent, retrieved, toolCalls);
  const confidence = handoffReason ? 0.48 : providerAnswer?.confidence ?? Math.min(0.9, 0.55 + retrieved.length * 0.1 + toolCalls.length * 0.15);
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
    intent,
    answer,
    confidence,
    modelName: providerAnswer?.modelName,
    tokenUsage: providerAnswer?.tokenUsage,
    handoffRequired: Boolean(handoffReason),
    handoffReason: handoffReason || undefined,
    sources,
    suggestedActions: buildActions(locale, intent),
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
