import type { Locale } from "@/i18n/config";
import type { HandoffEvaluation } from "./handoff";
import type {
  AssistantIntent,
  AssistantSuggestion,
  AssistantSuggestionState,
} from "./types";

export const EMPTY_SUGGESTION_STATE: AssistantSuggestionState = {
  shownSuggestionIds: [],
  selectedSuggestionIds: [],
  answeredTopics: [],
  unresolvedTopics: [],
  clarificationAttempts: {},
};

type SuggestionGroup = "size" | "issue" | "payment" | "technical" | "human" | "afterPricing" | "access" | "general";
type Catalog = Record<SuggestionGroup, AssistantSuggestion[]>;

function suggestion(id: string, label: string, value = label, intent = id): AssistantSuggestion {
  return { id, label, value, intent };
}

const CATALOG: Record<Locale, Catalog> = {
  en: {
    size: [
      suggestion("size-0-50", "Up to 50 m²", "My property is up to 50 m²", "provide_property_size"),
      suggestion("size-51-75", "51–75 m²", "My property is between 51 and 75 m²", "provide_property_size"),
      suggestion("size-76-100", "76–100 m²", "My property is between 76 and 100 m²", "provide_property_size"),
      suggestion("size-over-100", "More than 100 m²", "My property is larger than 100 m²", "provide_property_size"),
    ],
    issue: [
      suggestion("issue-not-cleaned", "An area was not cleaned", undefined, "report_service_issue"),
      suggestion("issue-damage", "Something was damaged", undefined, "report_damage"),
      suggestion("issue-no-show", "The team did not arrive", undefined, "report_no_show"),
      suggestion("issue-other", "I have another issue", undefined, "describe_other_issue"),
    ],
    payment: [
      suggestion("payment-invoice-ref", "I have an invoice reference", undefined, "provide_invoice_reference"),
      suggestion("payment-booking-ref", "I have a booking reference", undefined, "provide_booking_reference"),
      suggestion("payment-no-ref", "I do not have a reference", undefined, "payment_without_reference"),
      suggestion("payment-method", "Which payment method was used?", undefined, "provide_payment_method"),
    ],
    technical: [
      suggestion("tech-iphone", "iPhone or iPad", undefined, "provide_device"),
      suggestion("tech-android", "Android phone or tablet", undefined, "provide_device"),
      suggestion("tech-computer", "Computer", undefined, "provide_device"),
      suggestion("tech-error", "I can share the error message", undefined, "provide_error"),
    ],
    human: [
      suggestion("human-booking", "Booking", "I need help with a booking", "handoff_topic"),
      suggestion("human-payment", "Payment", "I need help with a payment", "handoff_topic"),
      suggestion("human-complaint", "Complaint", "I need help with a complaint", "handoff_topic"),
      suggestion("human-damage", "Damage or missing item", "I need help with damage or a missing item", "handoff_topic"),
    ],
    afterPricing: [
      suggestion("next-included", "What is included?"), suggestion("next-first-clean", "Is the first cleaning prepaid?"),
      suggestion("next-annual", "Can I pay annually?"), suggestion("next-cities", "Which cities do you serve?"),
    ],
    access: [
      suggestion("access-digital-lock", "How do digital locks work?"), suggestion("access-physical-key", "Can you hold a physical key?"),
      suggestion("access-home", "Do I need to be home?"), suggestion("access-schedule", "How are visits scheduled?"),
    ],
    general: [
      suggestion("general-price", "How much does cleaning cost?"), suggestion("general-services", "What services are included?"),
      suggestion("general-assessment", "How does the first visit work?"), suggestion("general-cities", "Which cities do you serve?"),
    ],
  },
  nl: {
    size: [suggestion("size-0-50", "Tot 50 m²", "Mijn woning is maximaal 50 m²", "provide_property_size"), suggestion("size-51-75", "51–75 m²", "Mijn woning is tussen 51 en 75 m²", "provide_property_size"), suggestion("size-76-100", "76–100 m²", "Mijn woning is tussen 76 en 100 m²", "provide_property_size"), suggestion("size-over-100", "Meer dan 100 m²", "Mijn woning is groter dan 100 m²", "provide_property_size")],
    issue: [suggestion("issue-not-cleaned", "Een deel is niet schoongemaakt"), suggestion("issue-damage", "Er is iets beschadigd"), suggestion("issue-no-show", "Het team is niet gekomen"), suggestion("issue-other", "Ik heb een ander probleem")],
    payment: [suggestion("payment-invoice-ref", "Ik heb een factuurreferentie"), suggestion("payment-booking-ref", "Ik heb een boekingsreferentie"), suggestion("payment-no-ref", "Ik heb geen referentie"), suggestion("payment-method", "Welke betaalmethode is gebruikt?")],
    technical: [suggestion("tech-iphone", "iPhone of iPad"), suggestion("tech-android", "Android-telefoon of tablet"), suggestion("tech-computer", "Computer"), suggestion("tech-error", "Ik kan de foutmelding delen")],
    human: [suggestion("human-booking", "Boeking", "Ik heb hulp nodig met een boeking"), suggestion("human-payment", "Betaling", "Ik heb hulp nodig met een betaling"), suggestion("human-complaint", "Klacht", "Ik heb hulp nodig met een klacht"), suggestion("human-damage", "Schade of vermist item", "Ik heb hulp nodig met schade of een vermist item")],
    afterPricing: [suggestion("next-included", "Wat is inbegrepen?"), suggestion("next-first-clean", "Is de eerste schoonmaak vooraf betaald?"), suggestion("next-annual", "Kan ik jaarlijks betalen?"), suggestion("next-cities", "In welke steden werken jullie?")],
    access: [suggestion("access-digital-lock", "Hoe werken digitale sloten?"), suggestion("access-physical-key", "Kunnen jullie een fysieke sleutel bewaren?"), suggestion("access-home", "Moet ik thuis zijn?"), suggestion("access-schedule", "Hoe worden bezoeken gepland?")],
    general: [suggestion("general-price", "Wat kost de schoonmaak?"), suggestion("general-services", "Welke diensten zijn inbegrepen?"), suggestion("general-assessment", "Hoe werkt het eerste bezoek?"), suggestion("general-cities", "In welke steden werken jullie?")],
  },
  fr: {
    size: [suggestion("size-0-50", "Jusqu’à 50 m²", "Mon logement fait jusqu’à 50 m²", "provide_property_size"), suggestion("size-51-75", "51–75 m²", "Mon logement fait entre 51 et 75 m²", "provide_property_size"), suggestion("size-76-100", "76–100 m²", "Mon logement fait entre 76 et 100 m²", "provide_property_size"), suggestion("size-over-100", "Plus de 100 m²", "Mon logement fait plus de 100 m²", "provide_property_size")],
    issue: [suggestion("issue-not-cleaned", "Une zone n’a pas été nettoyée"), suggestion("issue-damage", "Quelque chose a été endommagé"), suggestion("issue-no-show", "L’équipe n’est pas venue"), suggestion("issue-other", "J’ai un autre problème")],
    payment: [suggestion("payment-invoice-ref", "J’ai une référence de facture"), suggestion("payment-booking-ref", "J’ai une référence de réservation"), suggestion("payment-no-ref", "Je n’ai pas de référence"), suggestion("payment-method", "Quel moyen de paiement a été utilisé ?")],
    technical: [suggestion("tech-iphone", "iPhone ou iPad"), suggestion("tech-android", "Téléphone ou tablette Android"), suggestion("tech-computer", "Ordinateur"), suggestion("tech-error", "Je peux partager le message d’erreur")],
    human: [suggestion("human-booking", "Réservation", "J’ai besoin d’aide pour une réservation"), suggestion("human-payment", "Paiement", "J’ai besoin d’aide pour un paiement"), suggestion("human-complaint", "Réclamation", "J’ai besoin d’aide pour une réclamation"), suggestion("human-damage", "Dommage ou objet manquant", "J’ai besoin d’aide pour un dommage ou un objet manquant")],
    afterPricing: [suggestion("next-included", "Que comprend le service ?"), suggestion("next-first-clean", "Le premier nettoyage est-il prépayé ?"), suggestion("next-annual", "Puis-je payer annuellement ?"), suggestion("next-cities", "Dans quelles villes intervenez-vous ?")],
    access: [suggestion("access-digital-lock", "Comment fonctionnent les serrures numériques ?"), suggestion("access-physical-key", "Pouvez-vous garder une clé physique ?"), suggestion("access-home", "Dois-je être présent ?"), suggestion("access-schedule", "Comment les visites sont-elles planifiées ?")],
    general: [suggestion("general-price", "Combien coûte le nettoyage ?"), suggestion("general-services", "Quels services sont inclus ?"), suggestion("general-assessment", "Comment se déroule la première visite ?"), suggestion("general-cities", "Dans quelles villes intervenez-vous ?")],
  },
  es: {
    size: [suggestion("size-0-50", "Hasta 50 m²", "Mi vivienda tiene hasta 50 m²", "provide_property_size"), suggestion("size-51-75", "51–75 m²", "Mi vivienda tiene entre 51 y 75 m²", "provide_property_size"), suggestion("size-76-100", "76–100 m²", "Mi vivienda tiene entre 76 y 100 m²", "provide_property_size"), suggestion("size-over-100", "Más de 100 m²", "Mi vivienda tiene más de 100 m²", "provide_property_size")],
    issue: [suggestion("issue-not-cleaned", "Una zona no fue limpiada"), suggestion("issue-damage", "Algo fue dañado"), suggestion("issue-no-show", "El equipo no llegó"), suggestion("issue-other", "Tengo otro problema")],
    payment: [suggestion("payment-invoice-ref", "Tengo una referencia de factura"), suggestion("payment-booking-ref", "Tengo una referencia de reserva"), suggestion("payment-no-ref", "No tengo referencia"), suggestion("payment-method", "¿Qué método de pago se utilizó?")],
    technical: [suggestion("tech-iphone", "iPhone o iPad"), suggestion("tech-android", "Teléfono o tableta Android"), suggestion("tech-computer", "Ordenador"), suggestion("tech-error", "Puedo compartir el mensaje de error")],
    human: [suggestion("human-booking", "Reserva", "Necesito ayuda con una reserva"), suggestion("human-payment", "Pago", "Necesito ayuda con un pago"), suggestion("human-complaint", "Reclamación", "Necesito ayuda con una reclamación"), suggestion("human-damage", "Daño u objeto perdido", "Necesito ayuda con un daño u objeto perdido")],
    afterPricing: [suggestion("next-included", "¿Qué está incluido?"), suggestion("next-first-clean", "¿La primera limpieza es prepagada?"), suggestion("next-annual", "¿Puedo pagar anualmente?"), suggestion("next-cities", "¿En qué ciudades trabajan?")],
    access: [suggestion("access-digital-lock", "¿Cómo funcionan las cerraduras digitales?"), suggestion("access-physical-key", "¿Pueden guardar una llave física?"), suggestion("access-home", "¿Debo estar en casa?"), suggestion("access-schedule", "¿Cómo se programan las visitas?")],
    general: [suggestion("general-price", "¿Cuánto cuesta la limpieza?"), suggestion("general-services", "¿Qué servicios están incluidos?"), suggestion("general-assessment", "¿Cómo funciona la primera visita?"), suggestion("general-cities", "¿En qué ciudades trabajan?")],
  },
  de: {
    size: [suggestion("size-0-50", "Bis 50 m²", "Meine Immobilie ist bis zu 50 m² groß", "provide_property_size"), suggestion("size-51-75", "51–75 m²", "Meine Immobilie ist zwischen 51 und 75 m² groß", "provide_property_size"), suggestion("size-76-100", "76–100 m²", "Meine Immobilie ist zwischen 76 und 100 m² groß", "provide_property_size"), suggestion("size-over-100", "Mehr als 100 m²", "Meine Immobilie ist größer als 100 m²", "provide_property_size")],
    issue: [suggestion("issue-not-cleaned", "Ein Bereich wurde nicht gereinigt"), suggestion("issue-damage", "Etwas wurde beschädigt"), suggestion("issue-no-show", "Das Team ist nicht gekommen"), suggestion("issue-other", "Ich habe ein anderes Problem")],
    payment: [suggestion("payment-invoice-ref", "Ich habe eine Rechnungsreferenz"), suggestion("payment-booking-ref", "Ich habe eine Buchungsreferenz"), suggestion("payment-no-ref", "Ich habe keine Referenz"), suggestion("payment-method", "Welche Zahlungsart wurde verwendet?")],
    technical: [suggestion("tech-iphone", "iPhone oder iPad"), suggestion("tech-android", "Android-Telefon oder -Tablet"), suggestion("tech-computer", "Computer"), suggestion("tech-error", "Ich kann die Fehlermeldung teilen")],
    human: [suggestion("human-booking", "Buchung", "Ich brauche Hilfe bei einer Buchung"), suggestion("human-payment", "Zahlung", "Ich brauche Hilfe bei einer Zahlung"), suggestion("human-complaint", "Beschwerde", "Ich brauche Hilfe bei einer Beschwerde"), suggestion("human-damage", "Schaden oder vermisster Gegenstand", "Ich brauche Hilfe bei einem Schaden oder vermissten Gegenstand")],
    afterPricing: [suggestion("next-included", "Was ist enthalten?"), suggestion("next-first-clean", "Wird die erste Reinigung vorausbezahlt?"), suggestion("next-annual", "Kann ich jährlich zahlen?"), suggestion("next-cities", "In welchen Städten arbeiten Sie?")],
    access: [suggestion("access-digital-lock", "Wie funktionieren digitale Schlösser?"), suggestion("access-physical-key", "Können Sie einen Schlüssel aufbewahren?"), suggestion("access-home", "Muss ich zu Hause sein?"), suggestion("access-schedule", "Wie werden Besuche geplant?")],
    general: [suggestion("general-price", "Was kostet die Reinigung?"), suggestion("general-services", "Welche Leistungen sind enthalten?"), suggestion("general-assessment", "Wie funktioniert der erste Besuch?"), suggestion("general-cities", "In welchen Städten arbeiten Sie?")],
  },
  pt: {
    size: [suggestion("size-0-50", "Até 50 m²", "A minha casa tem até 50 m²", "provide_property_size"), suggestion("size-51-75", "51–75 m²", "A minha casa tem entre 51 e 75 m²", "provide_property_size"), suggestion("size-76-100", "76–100 m²", "A minha casa tem entre 76 e 100 m²", "provide_property_size"), suggestion("size-over-100", "Mais de 100 m²", "A minha casa tem mais de 100 m²", "provide_property_size")],
    issue: [suggestion("issue-not-cleaned", "Uma área não foi limpa"), suggestion("issue-damage", "Algo foi danificado"), suggestion("issue-no-show", "A equipa não apareceu"), suggestion("issue-other", "Tenho outro problema")],
    payment: [suggestion("payment-invoice-ref", "Tenho uma referência de fatura"), suggestion("payment-booking-ref", "Tenho uma referência de reserva"), suggestion("payment-no-ref", "Não tenho referência"), suggestion("payment-method", "Que método de pagamento foi usado?")],
    technical: [suggestion("tech-iphone", "iPhone ou iPad"), suggestion("tech-android", "Telefone ou tablet Android"), suggestion("tech-computer", "Computador"), suggestion("tech-error", "Posso partilhar a mensagem de erro")],
    human: [suggestion("human-booking", "Reserva", "Preciso de ajuda com uma reserva"), suggestion("human-payment", "Pagamento", "Preciso de ajuda com um pagamento"), suggestion("human-complaint", "Reclamação", "Preciso de ajuda com uma reclamação"), suggestion("human-damage", "Dano ou item em falta", "Preciso de ajuda com um dano ou item em falta")],
    afterPricing: [suggestion("next-included", "O que está incluído?"), suggestion("next-first-clean", "A primeira limpeza é pré-paga?"), suggestion("next-annual", "Posso pagar anualmente?"), suggestion("next-cities", "Em que cidades trabalham?")],
    access: [suggestion("access-digital-lock", "Como funcionam as fechaduras digitais?"), suggestion("access-physical-key", "Podem guardar uma chave física?"), suggestion("access-home", "Preciso de estar em casa?"), suggestion("access-schedule", "Como são agendadas as visitas?")],
    general: [suggestion("general-price", "Quanto custa a limpeza?"), suggestion("general-services", "Que serviços estão incluídos?"), suggestion("general-assessment", "Como funciona a primeira visita?"), suggestion("general-cities", "Em que cidades trabalham?")],
  },
  ar: {
    size: [suggestion("size-0-50", "حتى 50 م²", "مساحة منزلي حتى 50 م²", "provide_property_size"), suggestion("size-51-75", "51–75 م²", "مساحة منزلي بين 51 و75 م²", "provide_property_size"), suggestion("size-76-100", "76–100 م²", "مساحة منزلي بين 76 و100 م²", "provide_property_size"), suggestion("size-over-100", "أكثر من 100 م²", "مساحة منزلي أكبر من 100 م²", "provide_property_size")],
    issue: [suggestion("issue-not-cleaned", "منطقة لم تُنظف"), suggestion("issue-damage", "حدث ضرر لشيء ما"), suggestion("issue-no-show", "لم يصل الفريق"), suggestion("issue-other", "لدي مشكلة أخرى")],
    payment: [suggestion("payment-invoice-ref", "لدي مرجع فاتورة"), suggestion("payment-booking-ref", "لدي مرجع حجز"), suggestion("payment-no-ref", "ليس لدي مرجع"), suggestion("payment-method", "ما وسيلة الدفع المستخدمة؟")],
    technical: [suggestion("tech-iphone", "iPhone أو iPad"), suggestion("tech-android", "هاتف أو جهاز Android"), suggestion("tech-computer", "حاسوب"), suggestion("tech-error", "يمكنني إرسال رسالة الخطأ")],
    human: [suggestion("human-booking", "حجز", "أحتاج مساعدة في حجز"), suggestion("human-payment", "دفع", "أحتاج مساعدة في دفع"), suggestion("human-complaint", "شكوى", "أحتاج مساعدة في شكوى"), suggestion("human-damage", "ضرر أو شيء مفقود", "أحتاج مساعدة في ضرر أو شيء مفقود")],
    afterPricing: [suggestion("next-included", "ما الخدمات المشمولة؟"), suggestion("next-first-clean", "هل التنظيف الأول مدفوع مسبقاً؟"), suggestion("next-annual", "هل يمكنني الدفع سنوياً؟"), suggestion("next-cities", "في أي مدن تعملون؟")],
    access: [suggestion("access-digital-lock", "كيف تعمل الأقفال الرقمية؟"), suggestion("access-physical-key", "هل يمكنكم حفظ مفتاح فعلي؟"), suggestion("access-home", "هل يجب أن أكون في المنزل؟"), suggestion("access-schedule", "كيف تُحدد مواعيد الزيارات؟")],
    general: [suggestion("general-price", "كم تكلفة التنظيف؟"), suggestion("general-services", "ما الخدمات المشمولة؟"), suggestion("general-assessment", "كيف تعمل الزيارة الأولى؟"), suggestion("general-cities", "في أي مدن تعملون؟")],
  },
};

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function hasPropertySize(value: string): boolean {
  return /\b\d{2,4}(?:[.,]\d+)?\s*(?:m2|m²|sqm|square metres?|meter|metre)\b|\b(?:between|tussen|entre|zwischen)\s+\d{2,4}\s+(?:and|en|et|y|und|e)\s+\d{2,4}\b|بين\s*\d{2,4}\s*(?:و|إلى)\s*\d{2,4}/iu.test(value);
}

export function deriveMissingInformation(input: {
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  latestUserMessage: string;
  detectedIntent: AssistantIntent;
  evaluation: HandoffEvaluation;
}): string[] {
  const combined = [...input.conversationHistory.map((item) => item.content), input.latestUserMessage].join(" ");
  const missing: string[] = [];
  if (input.detectedIntent === "pricing" && !hasPropertySize(combined)) missing.push("property_size");
  if (input.evaluation.topic === "service_issue") missing.push("issue_category");
  if (input.evaluation.topic === "technical_bug" && !/iphone|ipad|android|computer|desktop|laptop|chrome|safari|firefox|edge/iu.test(combined)) missing.push("device_details");
  if (["payment_investigation", "booking_reference"].includes(input.evaluation.topic || "") && !/\bDTH-[A-Z0-9-]{4,}\b|invoice|factuur|facture|factura|rechnung|fatura|فاتورة/iu.test(combined)) missing.push("reference");
  if (input.evaluation.topic === "human_topic") missing.push("issue_category");
  return unique(missing);
}

function groupFor(input: {
  detectedIntent: AssistantIntent;
  latestUserMessage: string;
  missingInformation: string[];
  evaluation: HandoffEvaluation;
}): SuggestionGroup {
  if (input.evaluation.topic === "service_issue") return "issue";
  if (input.evaluation.topic === "technical_bug") return "technical";
  if (["payment_investigation", "booking_reference"].includes(input.evaluation.topic || "")) return "payment";
  if (input.evaluation.topic === "human_topic") return "human";
  if (input.detectedIntent === "pricing") return input.missingInformation.includes("property_size") ? "size" : "afterPricing";
  if (/key|access|lock|sleutel|toegang|serrure|cl[ée]|llave|acceso|schl[üu]ssel|zugang|chave|acesso|مفتاح|الدخول/iu.test(input.latestUserMessage)) return "access";
  if (["billing", "payment", "assessment_explanation"].includes(input.detectedIntent)) return "afterPricing";
  return "general";
}

export function generateConversationSuggestions(input: {
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  latestUserMessage: string;
  latestAssistantResponse: string;
  detectedIntent: AssistantIntent;
  missingInformation: string[];
  conversationLanguage: Locale;
  availableActions: string[];
  state: AssistantSuggestionState;
  evaluation: HandoffEvaluation;
}): AssistantSuggestion[] {
  const catalog = CATALOG[input.conversationLanguage];
  const primary = catalog[groupFor(input)];
  const pool = [...primary, ...catalog.general, ...catalog.afterPricing];
  const selected = new Set(input.state.selectedSuggestionIds);
  const shown = new Set(input.state.shownSuggestionIds);
  const fresh = pool.filter((item, index) =>
    !selected.has(item.id) && !shown.has(item.id) && pool.findIndex((candidate) => candidate.id === item.id) === index,
  );
  if (fresh.length >= 3) return fresh.slice(0, 4);
  const stillRequired = primary.filter((item) => !selected.has(item.id) && !fresh.some((candidate) => candidate.id === item.id));
  return [...fresh, ...stillRequired].slice(0, 4);
}

function topicForSuggestion(id: string): string | null {
  if (id.startsWith("size-")) return "property_size";
  if (id.startsWith("issue-") || id.startsWith("human-")) return "issue_category";
  if (id.startsWith("payment-")) return "reference";
  if (id.startsWith("tech-")) return "device_details";
  if (id.startsWith("access-")) return "access_topic";
  return null;
}

export function advanceSuggestionState(input: {
  state: AssistantSuggestionState;
  selectedSuggestionId?: string | null;
  suggestions: AssistantSuggestion[];
  evaluation: HandoffEvaluation;
  latestUserMessage: string;
}): AssistantSuggestionState {
  const selectedTopic = input.selectedSuggestionId ? topicForSuggestion(input.selectedSuggestionId) : null;
  const detectedTopics = [
    hasPropertySize(input.latestUserMessage) ? "property_size" : null,
    /\bDTH-[A-Z0-9-]{4,}\b/i.test(input.latestUserMessage) ? "reference" : null,
  ].filter((item): item is string => Boolean(item));
  const topic = input.evaluation.topic;
  const asksClarification = input.evaluation.nextAction === "ask_clarifying_question" || input.evaluation.nextAction === "guided_self_service";
  return {
    shownSuggestionIds: unique([...input.state.shownSuggestionIds, ...input.suggestions.map((item) => item.id)]),
    selectedSuggestionIds: unique([
      ...input.state.selectedSuggestionIds,
      ...(input.selectedSuggestionId ? [input.selectedSuggestionId] : []),
    ]),
    answeredTopics: unique([...input.state.answeredTopics, ...detectedTopics, ...(selectedTopic ? [selectedTopic] : [])]),
    unresolvedTopics: unique([
      ...input.state.unresolvedTopics.filter((item) => item !== selectedTopic),
      ...(topic && asksClarification ? [topic] : []),
    ]),
    clarificationAttempts: {
      ...input.state.clarificationAttempts,
      ...(topic && asksClarification ? { [topic]: (input.state.clarificationAttempts[topic] || 0) + 1 } : {}),
    },
  };
}

export function suggestionStateFromMetadata(metadata: Record<string, unknown> | null | undefined): AssistantSuggestionState {
  const stringArray = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 100) : [];
  const rawAttempts = metadata?.clarification_attempts;
  const clarificationAttempts = rawAttempts && typeof rawAttempts === "object"
    ? Object.fromEntries(Object.entries(rawAttempts).filter((entry): entry is [string, number] => typeof entry[1] === "number" && entry[1] >= 0))
    : {};
  return {
    shownSuggestionIds: stringArray(metadata?.shown_suggestion_ids),
    selectedSuggestionIds: stringArray(metadata?.selected_suggestion_ids),
    answeredTopics: stringArray(metadata?.answered_topics),
    unresolvedTopics: stringArray(metadata?.unresolved_topics),
    clarificationAttempts,
  };
}
