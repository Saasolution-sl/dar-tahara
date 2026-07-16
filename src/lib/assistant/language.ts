import { francAll } from "franc";
import type { Locale } from "@/i18n/config";

export const LANGUAGE_CONFIDENCE_THRESHOLD = 0.8;

export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  nl: "Dutch",
  fr: "French",
  es: "Spanish",
  de: "German",
  pt: "Portuguese",
  ar: "Arabic",
};

export const LANGUAGE_CLARIFICATION = [
  "Which language would you like to continue in?",
  "In welke taal wilt u verdergaan?",
  "Dans quelle langue souhaitez-vous continuer ?",
  "¿En qué idioma desea continuar?",
  "In welcher Sprache möchten Sie fortfahren?",
  "Em que idioma gostaria de continuar?",
  "بأي لغة تود المتابعة؟",
].join("\n");

const FRANC_TO_LOCALE: Record<string, Locale> = {
  eng: "en",
  nld: "nl",
  fra: "fr",
  spa: "es",
  deu: "de",
  por: "pt",
  arb: "ar",
};

const FRANC_LANGUAGES = Object.keys(FRANC_TO_LOCALE);

const SHORT_LANGUAGE_SIGNALS: Record<string, Locale> = {
  hello: "en",
  hi: "en",
  hey: "en",
  "good morning": "en",
  "good afternoon": "en",
  thanks: "en",
  "thank you": "en",
  hoi: "nl",
  goedemorgen: "nl",
  goedemiddag: "nl",
  goedenavond: "nl",
  bedankt: "nl",
  bonjour: "fr",
  salut: "fr",
  bonsoir: "fr",
  merci: "fr",
  hola: "es",
  "buenos dias": "es",
  buenas: "es",
  gracias: "es",
  hallo: "de",
  "guten tag": "de",
  gutenmorgen: "de",
  danke: "de",
  ola: "pt",
  oi: "pt",
  "bom dia": "pt",
  obrigado: "pt",
  obrigada: "pt",
  "السلام عليكم": "ar",
  مرحبا: "ar",
  أهلا: "ar",
  سلام: "ar",
};

const LANGUAGE_HINTS: Record<Locale, string[]> = {
  en: ["the", "and", "hello", "would", "like", "quote", "home", "please", "can", "i", "my", "your", "booking", "price", "change", "frequency", "what", "how", "cost", "services", "included", "first", "visit", "payment", "want", "speak", "person", "someone", "support", "manager", "cleaning", "give", "physical", "key", "for", "often", "much", "many", "clean", "cleaner", "arrive", "time", "you", "apartment", "apartments"],
  nl: ["de", "het", "een", "en", "ik", "graag", "offerte", "mijn", "uw", "goedemiddag", "waarmee", "woning", "prijs", "wat", "hoe", "diensten", "inbegrepen", "schoonmaak", "eerste", "bezoek", "betaling", "hoeveel", "vaak", "komen", "jullie", "schoonmaken", "kost", "kosten"],
  fr: ["le", "la", "les", "et", "je", "voudrais", "devis", "mon", "votre", "bonjour", "pouvez", "maison", "prix", "comment", "quels", "services", "inclus", "nettoyage", "premiere", "visite", "paiement", "combien", "frequence", "souvent", "menage", "quelle", "faites"],
  es: ["el", "la", "los", "una", "y", "quisiera", "presupuesto", "mi", "su", "hola", "puede", "casa", "precio", "que", "como", "servicios", "estan", "incluidos", "limpieza", "primera", "visita", "pago", "cuanto", "frecuencia", "limpian", "limpiar", "con"],
  de: ["der", "die", "das", "und", "ich", "gerne", "angebot", "mein", "ihre", "guten", "konnen", "haus", "preis", "wie", "welche", "dienste", "enthalten", "reinigung", "erste", "besuch", "zahlung", "oft", "reinigen", "wieviel", "sie"],
  pt: ["o", "a", "os", "uma", "e", "gostaria", "orcamento", "meu", "sua", "ola", "pode", "casa", "preco", "como", "quais", "servicos", "estao", "incluidos", "limpeza", "primeira", "visita", "pagamento", "quanto", "frequencia", "voces", "limpam", "limpar", "com", "que"],
  ar: ["السلام", "عليكم", "مرحبا", "أريد", "اريد", "عرض", "سعر", "منزل", "بيتي", "من", "في", "هل"],
};

/**
 * franc is a statistical model and is unreliable below roughly this many words: it returns a
 * confident but wrong language for ordinary short questions ("How often do you clean?" scores as
 * Dutch). Shorter messages are decided by the curated lexicon instead, and fall back to the
 * caller's language when the lexicon has no clear winner.
 */
const FRANC_MIN_WORDS = 8;

const LANGUAGE_ALIASES: Record<Locale, string[]> = {
  en: ["english", "anglais", "ingles", "engels", "englisch", "الانجليزية", "الإنجليزية"],
  nl: ["dutch", "nederlands", "neerlandais", "holandes", "niederlandisch", "holandes", "الهولندية"],
  fr: ["french", "francais", "frances", "frans", "franzosisch", "frances", "الفرنسية"],
  es: ["spanish", "espanol", "espagnol", "spaans", "spanisch", "espanhol", "الإسبانية", "الاسبانية"],
  de: ["german", "deutsch", "allemand", "aleman", "duits", "alemao", "الألمانية", "الالمانية"],
  pt: ["portuguese", "portugues", "portugais", "portugees", "portugiesisch", "البرتغالية"],
  ar: ["arabic", "arabe", "arabisch", "arabisch", "arabe", "العربية", "دارجة", "darija"],
};

const EXPLICIT_CHANGE_MARKERS = /\b(can we|could we|could you|would you|please|continue|speak|talk|respond|answer|reply|switch|use|translate|translation|write|podemos|puedes|hablar|continuar|responder|cambiar|traducir|pouvons|pouvez|parler|continuer|repondre|changer|traduire|kunnen|doorgaan|praten|antwoorden|schakel|vertalen|konnen|weiter|sprechen|antworten|wechsel|ubersetzen|falar|mudar|traduzir)\b|يمكن|نتكلم|نتحدث|نكمل|باللغة|حول|ترجم|اكتب/u;

export type LanguageDetection = {
  locale: Locale | null;
  confidence: number;
  source: "short-signal" | "script" | "darija" | "lexicon" | "franc" | "undetermined";
};

export type ConversationLanguageDecision = {
  locale: Locale | null;
  detectedLocale: Locale | null;
  confidence: number;
  languageChanged: boolean;
  explicitChange: boolean;
  needsClarification: boolean;
};

function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function countHints(text: string, locale: Locale): number {
  const words = new Set(normalize(text).split(/\s+/).filter(Boolean));
  return LANGUAGE_HINTS[locale].reduce((total, hint) => total + (words.has(normalize(hint)) ? 1 : 0), 0);
}

/**
 * True when the customer actually wrote words rather than only a reference or digits. A bare
 * "DTH-2607-10001 12345" carries no language signal at all and is worth a language question; a real
 * sentence is not, even when the lexicon cannot place it.
 */
function hasLinguisticContent(text: string): boolean {
  const words = normalize(text).split(" ").filter((token) => token.length > 1 && /^\p{L}+$/u.test(token));
  return words.length >= 3;
}

function rankHints(text: string): Array<{ locale: Locale; count: number }> {
  return (Object.keys(LANGUAGE_HINTS) as Locale[])
    .map((locale) => ({ locale, count: countHints(text, locale) }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Decides a short message from the curated lexicon. A tie or a message with no known words stays
 * undetermined so the caller keeps the language the customer already chose rather than guessing.
 */
function detectFromLexicon(text: string): LanguageDetection {
  const [best, runnerUp] = rankHints(text);
  const runnerUpCount = runnerUp?.count || 0;
  if (!best || best.count === 0 || best.count === runnerUpCount) {
    return { locale: null, confidence: 0, source: "undetermined" };
  }
  const confidence = Math.min(0.97, 0.78 + best.count * 0.06 + (best.count - runnerUpCount) * 0.04);
  return { locale: best.locale, confidence: Number(confidence.toFixed(3)), source: "lexicon" };
}

export function detectLanguage(text: string): LanguageDetection {
  const normalized = normalize(text);
  const shortSignal = SHORT_LANGUAGE_SIGNALS[normalized];
  if (shortSignal) return { locale: shortSignal, confidence: 0.99, source: "short-signal" };

  const arabicCharacters = text.match(/[\u0600-\u06ff]/g)?.length || 0;
  if (arabicCharacters >= 2) return { locale: "ar", confidence: 0.99, source: "script" };

  if (/\b(salam|bghit|chhal|wach|3afak|afak|kifach|fin|nqiya|n9iya|darija)\b/i.test(normalized)) {
    return { locale: "ar", confidence: 0.96, source: "darija" };
  }

  if (normalized.length < 3) return { locale: null, confidence: 0, source: "undetermined" };
  if (normalized.split(" ").filter(Boolean).length < FRANC_MIN_WORDS) return detectFromLexicon(text);

  const ranked = francAll(text, { only: FRANC_LANGUAGES, minLength: 3 });
  const [bestCode, bestScore] = ranked[0] || ["und", 0];
  let locale = FRANC_TO_LOCALE[bestCode];
  if (!locale) return { locale: null, confidence: 0, source: "undetermined" };

  const strongestHints = rankHints(text)[0];
  const originalHintCount = countHints(text, locale);
  const lexiconOverride = strongestHints.count >= 2 && strongestHints.count > originalHintCount + 1;
  if (lexiconOverride) locale = strongestHints.locale;

  const secondScore = ranked[1]?.[1] ?? 0;
  const margin = Math.max(0, bestScore - secondScore);
  const hintSupport = Math.min(0.2, countHints(text, locale) * 0.06);
  const lengthSupport = Math.min(0.06, normalized.length / 500);
  const confidence = Math.min(0.99, 0.72 + Math.min(0.2, margin * 1.25) + hintSupport + lengthSupport + (lexiconOverride ? 0.05 : 0));
  return { locale, confidence: Number(confidence.toFixed(3)), source: "franc" };
}

function explicitLanguageTarget(message: string, selectionPending: boolean): Locale | null {
  const normalized = normalize(message);
  const markerFound = EXPLICIT_CHANGE_MARKERS.test(normalized);
  for (const [locale, aliases] of Object.entries(LANGUAGE_ALIASES) as Array<[Locale, string[]]>) {
    const matched = aliases.some((alias) => {
      const normalizedAlias = normalize(alias);
      return normalized === normalizedAlias || normalized.split(" ").includes(normalizedAlias) || normalized.includes(normalizedAlias);
    });
    if (matched && (markerFound || selectionPending || aliases.some((alias) => normalize(alias) === normalized))) return locale;
  }
  return null;
}

export function resolveConversationLanguage(input: {
  message: string;
  currentLanguage?: Locale | null;
  /** Language the customer is already browsing in. Used when detection is inconclusive. */
  fallbackLanguage?: Locale | null;
  selectedLanguage?: Locale | null;
  selectionPending?: boolean;
}): ConversationLanguageDecision {
  if (input.selectedLanguage) {
    return {
      locale: input.selectedLanguage,
      detectedLocale: input.selectedLanguage,
      confidence: 1,
      languageChanged: Boolean(input.currentLanguage && input.currentLanguage !== input.selectedLanguage),
      explicitChange: true,
      needsClarification: false,
    };
  }

  const explicitTarget = explicitLanguageTarget(input.message, Boolean(input.selectionPending));
  if (explicitTarget) {
    return {
      locale: explicitTarget,
      detectedLocale: explicitTarget,
      confidence: 1,
      languageChanged: Boolean(input.currentLanguage && input.currentLanguage !== explicitTarget),
      explicitChange: true,
      needsClarification: false,
    };
  }

  const detection = detectLanguage(input.message);
  if (input.currentLanguage) {
    const latestMessageLanguage = detection.locale && detection.confidence > LANGUAGE_CONFIDENCE_THRESHOLD
      ? detection.locale
      : null;
    return {
      locale: latestMessageLanguage || input.currentLanguage,
      detectedLocale: detection.locale,
      confidence: detection.confidence,
      languageChanged: Boolean(latestMessageLanguage && latestMessageLanguage !== input.currentLanguage),
      explicitChange: false,
      needsClarification: false,
    };
  }

  const confident = Boolean(detection.locale && detection.confidence > LANGUAGE_CONFIDENCE_THRESHOLD);
  // A written but unrecognised opening message is answered in the language the customer is already
  // reading, which is a far better signal than a statistical guess on a few words. A message with
  // no words at all still gets a language question.
  if (!confident && input.fallbackLanguage && hasLinguisticContent(input.message)) {
    return {
      locale: input.fallbackLanguage,
      detectedLocale: detection.locale,
      confidence: detection.confidence,
      languageChanged: false,
      explicitChange: false,
      needsClarification: false,
    };
  }
  return {
    locale: confident ? detection.locale : null,
    detectedLocale: detection.locale,
    confidence: detection.confidence,
    languageChanged: false,
    explicitChange: false,
    needsClarification: !confident,
  };
}

export function responseMatchesConversationLanguage(response: string, conversationLanguage: Locale): boolean {
  const detection = detectLanguage(response);
  return !detection.locale
    || detection.confidence <= LANGUAGE_CONFIDENCE_THRESHOLD
    || detection.locale === conversationLanguage;
}

export function languageLogMetadata(decision: ConversationLanguageDecision, previousLanguage?: Locale | null) {
  return {
    event: decision.explicitChange ? "explicit_language_change_detected" : "language_detected",
    detectedLanguage: decision.detectedLocale ? LANGUAGE_NAMES[decision.detectedLocale] : "Undetermined",
    confidence: Math.round(decision.confidence * 100) / 100,
    currentSessionLanguage: decision.locale ? LANGUAGE_NAMES[decision.locale] : "Unconfirmed",
    languageChanged: decision.languageChanged,
    explicitLanguageChange: decision.explicitChange,
    previousSessionLanguage: previousLanguage ? LANGUAGE_NAMES[previousLanguage] : null,
    sessionLanguageUpdated: decision.languageChanged && previousLanguage && decision.locale
      ? `${LANGUAGE_NAMES[previousLanguage]} → ${LANGUAGE_NAMES[decision.locale]}`
      : null,
  };
}
