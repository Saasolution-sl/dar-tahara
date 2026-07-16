import type { Locale } from "@/i18n/config";
import { knowledgeArticles } from "./knowledge";
import type { AssistantIntent, RetrievedKnowledge } from "./types";

const STOP_WORDS = new Set([
  "the", "and", "for", "you", "your", "with", "that", "this", "are", "can",
  "how", "what", "when", "waar", "wat", "hoe", "pour", "avec", "que", "una",
  "und", "der", "die", "das", "uma", "com", "هل", "ما", "في",
]);

const INTENT_KEYWORDS: Record<AssistantIntent, string[]> = {
  general_faq: [
    "question", "help", "info", "about", "wat doet", "informatie", "aide", "informations", "que hace",
    "informacion", "was macht", "informationen", "o que faz", "informacoes", "ماذا تفعل", "معلومات",
  ],
  service_explanation: [
    "included", "service", "cleaning", "linen", "laundry", "products", "materials", "pets", "keys", "access",
    "inbegrepen", "dienst", "schoonmaak", "linnen", "wasgoed", "sleutels", "toegang",
    "inclus", "service", "nettoyage", "linge", "lessive", "cles", "acces",
    "incluido", "servicio", "limpieza", "ropa de cama", "lavanderia", "llaves", "acceso",
    "enthalten", "dienst", "reinigung", "wasche", "schlussel", "zugang",
    "incluido", "servico", "limpeza", "roupa de cama", "lavandaria", "chaves", "acesso",
    "مشمول", "الخدمات", "التنظيف", "الغسيل", "المفاتيح", "الدخول",
  ],
  assessment_explanation: [
    "assessment", "first visit", "initial", "deep clean", "updated proposal",
    "eerste bezoek", "woningbeoordeling", "beoordeling", "premiere visite", "evaluation initiale", "evaluation",
    "primera visita", "evaluacion inicial", "evaluacion", "erster besuch", "erste bewertung", "bewertung",
    "primeira visita", "avaliacao inicial", "avaliacao", "الزيارة الأولى", "التقييم الأولي", "التقييم",
  ],
  pricing: [
    "price", "cost", "estimate", "m2", "square", "calculator", "how much", "proposal",
    "prijs", "kosten", "offerte", "combien", "prix", "devis", "precio", "cuesta", "presupuesto",
    "preis", "kosten", "angebot", "preco", "custa", "orcamento", "السعر", "تكلفة", "عرض سعر", "شحال",
  ],
  billing: [
    "monthly", "annual", "yearly", "discount", "5%", "subscription", "maandelijks", "jaarlijks", "korting",
    "abonnement", "mensuel", "annuel", "remise", "mensual", "anual", "descuento", "suscripcion",
    "monatlich", "jahrlich", "rabatt", "abo", "mensal", "anual", "desconto", "subscricao",
    "شهري", "سنوي", "خصم", "اشتراك",
  ],
  payment: [
    "payment", "stripe", "checkout", "card", "pay", "failed", "betaling", "betalen", "kaart", "paiement",
    "payer", "carte", "pago", "pagar", "tarjeta", "zahlung", "bezahlen", "karte", "pagamento", "pagar",
    "cartao", "الدفع", "أدفع", "بطاقة",
  ],
  booking_guidance: [
    "book", "booking", "appointment", "date", "schedule", "boeken", "afspraak", "datum", "reserver",
    "rendez vous", "fecha", "reservar", "cita", "buchen", "termin", "datum", "reservar", "marcacao",
    "موعد", "حجز", "أحجز",
  ],
  booking_status: ["status", "reference", "confirmed", "bevestigd", "referentie", "confirme", "referencia", "bestatigt", "referenz", "confirmado", "مرجع", "مؤكد"],
  reschedule: ["reschedule", "change date", "postpone", "move appointment", "verzetten", "datum wijzigen", "reporter", "changer la date", "reprogramar", "cambiar la fecha", "verschieben", "termin andern", "remarcar", "mudar a data", "تغيير الموعد", "تأجيل"],
  cancellation: ["cancel", "stop", "pause", "refund", "annuleren", "pauzeren", "terugbetaling", "annuler", "pause", "remboursement", "cancelar", "pausar", "reembolso", "stornieren", "kundigen", "ruckerstattung", "cancelar", "pausar", "reembolso", "إلغاء", "توقيف", "استرداد"],
  complaint: ["complaint", "damage", "unsafe", "misconduct", "angry", "legal", "klacht", "schade", "onveilig", "plainte", "dommage", "dangereux", "queja", "dano", "inseguro", "beschwerde", "schaden", "unsicher", "reclamacao", "dano", "inseguro", "شكوى", "ضرر", "غير آمن"],
  human_handoff: ["human", "specialist", "person", "agent", "staff", "medewerker", "specialist", "persoon", "humain", "specialiste", "persona", "especialista", "mitarbeiter", "mensch", "pessoa", "especialista", "موظف", "مختص", "إنسان"],
  language_change: [
    "language", "english", "engels", "anglais", "ingles", "dutch", "nederlands", "neerlandais",
    "français", "francais", "french", "español", "espanol", "spanish", "deutsch", "german",
    "português", "portugues", "portuguese", "arabic", "arabe", "arabisch", "العربية", "دارجة", "darija",
  ],
  privacy: ["privacy", "data", "delete", "export", "personal"],
  opt_out: ["unsubscribe", "opt out", "stop messaging", "marketing"],
  unknown: [],
};

const INTENT_ARTICLE_IDS: Partial<Record<AssistantIntent, string[]>> = {
  general_faq: ["company-overview"],
  service_explanation: ["included-services"],
  assessment_explanation: ["initial-home-assessment"],
  pricing: ["pricing-rules"],
  billing: ["billing-monthly-annual"],
  payment: ["payments-stripe"],
  booking_guidance: ["initial-home-assessment", "access-presence-keys"],
  booking_status: ["privacy-boundaries"],
  reschedule: ["reschedule-cancel-pause"],
  cancellation: ["reschedule-cancel-pause"],
  complaint: ["human-handoff"],
  human_handoff: ["human-handoff"],
  privacy: ["privacy-boundaries"],
  opt_out: ["privacy-boundaries"],
};

const ARTICLE_QUERY_ALIASES: Partial<Record<string, string[]>> = {
  "company-overview": ["wat doet dar tahara", "que fait dar tahara", "que hace dar tahara", "was macht dar tahara", "o que faz a dar tahara", "ماذا تقدم دار طهارة"],
  "initial-home-assessment": ["eerste bezoek woningbeoordeling", "premiere visite evaluation initiale", "primera visita evaluacion inicial", "erster besuch erste bewertung", "primeira visita avaliacao inicial", "الزيارة الأولى التقييم الأولي"],
  "pricing-rules": ["prijs kosten offerte", "prix devis combien", "precio presupuesto cuesta", "preis kosten angebot", "preco orcamento custa", "السعر التكلفة عرض سعر شحال"],
  "billing-monthly-annual": ["maandelijks jaarlijks korting", "mensuel annuel remise", "mensual anual descuento", "monatlich jahrlich rabatt", "mensal anual desconto", "شهري سنوي خصم"],
  "payments-stripe": ["betaling kaart betalen", "paiement carte payer", "pago tarjeta pagar", "zahlung karte bezahlen", "pagamento cartao pagar", "الدفع بطاقة"],
  "included-services": ["diensten inbegrepen schoonmaak", "services inclus nettoyage", "servicios incluidos limpieza", "dienste enthalten reinigung", "servicos incluidos limpeza", "الخدمات المشمولة التنظيف"],
  "access-presence-keys": ["moet ik thuis sleutels toegang", "dois je etre present cles acces", "debo estar en casa llaves acceso", "muss ich zu hause zuhause schlussel zugang", "preciso estar em casa chaves acesso", "هل يجب أن أكون في المنزل المفاتيح الدخول"],
  "reschedule-cancel-pause": ["verzetten annuleren pauzeren", "reporter annuler suspendre", "reprogramar cancelar pausar", "verschieben stornieren pausieren", "reagendar cancelar pausar", "تغيير الموعد إلغاء توقيف"],
  "human-handoff": ["medewerker specialist persoon", "humain specialiste personne", "persona especialista agente", "mensch spezialist mitarbeiter", "pessoa especialista agente", "موظف مختص إنسان"],
  "privacy-boundaries": ["privacy persoonlijke gegevens", "confidentialite donnees personnelles", "privacidad datos personales", "datenschutz personliche daten", "privacidade dados pessoais", "الخصوصية البيانات الشخصية"],
};

const INTENT_CATEGORIES: Partial<Record<AssistantIntent, KnowledgeArticleCategory[]>> = {
  general_faq: ["company"],
  service_explanation: ["services", "access"],
  assessment_explanation: ["assessment"],
  pricing: ["pricing"],
  billing: ["billing"],
  payment: ["payments"],
  booking_guidance: ["assessment", "access"],
  booking_status: ["policies"],
  reschedule: ["policies"],
  cancellation: ["policies"],
  complaint: ["support"],
  human_handoff: ["support"],
  privacy: ["policies"],
  opt_out: ["policies"],
};

type KnowledgeArticleCategory = RetrievedKnowledge["article"]["category"];

export function knowledgeCategoriesForIntent(intent: AssistantIntent): KnowledgeArticleCategory[] {
  return INTENT_CATEGORIES[intent] || [];
}

function normalize(text: string): string {
  return text
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}%]+/gu, " ")
    .trim();
}

function tokens(text: string): string[] {
  return normalize(text)
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

export function classifyIntent(message: string): AssistantIntent {
  const n = normalize(message);
  if (/\bdth\b|booking reference|reservation reference/.test(n) || (n.includes("booking") && n.includes("status"))) {
    return "booking_status";
  }
  let best: { intent: AssistantIntent; score: number } = { intent: "unknown", score: 0 };
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as Array<[AssistantIntent, string[]]>) {
    const score = keywords.reduce((total, keyword) => total + (n.includes(normalize(keyword)) ? keyword.length : 0), 0);
    if (score > best.score) best = { intent, score };
  }
  return best.score > 0 ? best.intent : "unknown";
}

export function retrieveKnowledge(
  message: string,
  locale: Locale,
  limit = 4,
  intent: AssistantIntent = classifyIntent(message),
): RetrievedKnowledge[] {
  const words = tokens(message);
  const normalizedMessage = normalize(message);

  const scored = knowledgeArticles
    .filter((article) => article.status === "approved" && article.visibility === "public")
    .map((article) => {
      const haystack = normalize([
        article.title,
        article.summary,
        article.content,
        article.category,
        article.keywords.join(" "),
        article.relatedQuestions.join(" "),
        (ARTICLE_QUERY_ALIASES[article.id] || []).join(" "),
      ].join(" "));
      const haystackTokens = new Set(haystack.split(/\s+/).filter(Boolean));
      const matchedKeywords = article.keywords.filter((keyword) => normalizedMessage.includes(normalize(keyword)));
      const tokenScore = words.reduce((score, word) => score + (haystackTokens.has(word) ? 1 : 0), 0);
      const keywordScore = matchedKeywords.reduce((score, keyword) => score + keyword.length / 4, 0);
      const languageBoost = article.language === locale ? 2 : article.language === "all" ? 1 : 0;
      return { article, score: tokenScore + keywordScore + languageBoost, matchedKeywords };
    })
    .filter((result) => result.score > 1)
    .sort((a, b) => b.score - a.score || b.article.version - a.article.version)
    .slice(0, limit);

  if (scored.length) return scored;

  const fallbackIds = INTENT_ARTICLE_IDS[intent] || [];
  return fallbackIds.slice(0, limit).flatMap((id) => {
    const article = knowledgeArticles.find((item) => item.id === id);
    return article ? [{ article, score: 2, matchedKeywords: [] }] : [];
  });
}
