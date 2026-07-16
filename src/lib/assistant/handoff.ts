import type { Locale } from "@/i18n/config";
import type {
  AssistantEscalation,
  AssistantEscalationReason,
  AssistantHandoffSummary,
  AssistantIntent,
  AssistantSuggestionState,
  RetrievedKnowledge,
} from "./types";

export type HandoffEvaluation = AssistantEscalation & { topic: string | null };

const EXPLICIT_HUMAN = /\b(?:speak|talk|connect|transfer|contact|call|chat|want|need|would like|spreken|praten|verbinden|bellen|wil|nodig|parler|contacter|transf[ée]rer|appeler|veux|besoin|hablar|contactar|transferir|llamar|quiero|necesito|sprechen|kontaktieren|verbinden|anrufen|möchte|brauche|falar|contactar|transferir|ligar|quero|preciso)(?:\s+\S+){0,8}\s+(?:human|person|manager|agent|someone|specialist|medewerker|persoon|beheerder|mens|humain|personne|responsable|sp[ée]cialiste|persona|gerente|agente|especialista|mensch|mitarbeiter|pessoa|gestor|especialista)\b|\b(?:live agent|real person|human agent|menselijke medewerker|echte persoon|agent humain|personne r[ée]elle|agente humano|persona real|menschlicher mitarbeiter|echte person|agente humano|pessoa real)\b|(?:أريد|اريد|أحتاج|احتاج|تحدث|تكلم|حولني|اتصل).{0,50}(?:موظف|شخص|مدير|مختص)/iu;
const SECURITY = /\b(unsafe|danger|threat|harassment|security|onveilig|gevaar|bedreiging|dangereux|menace|s[ée]curit[ée]|peligro|amenaza|seguridad|gefahr|bedrohung|sicherheit|perigo|amea[çc]a|seguran[çc]a)\b|خطر|تهديد|أمان/iu;
const DAMAGE = /\b(damage|damaged|broken|d[ée]g[âa]t|cass[ée]|schade|beschadigd|da[ñn]o|roto|schaden|besch[äa]digt|dano|danificado)\b|ضرر|تلف/iu;
const MISSING_ITEM = /\b(missing|stolen|theft|lost item|missing item|vermist|gestolen|kwijt|manquant|vol[ée]?|perdu|falta|robado|perdido|gestohlen|verloren|roubado|perdido)\b|مفقود|مسروق|سرقة/iu;
const PAYMENT_INVESTIGATION = /\b(charged twice|double charg|duplicate charg|payment dispute|chargeback|refund|twice charged|dubbel afgeschreven|dubbele betaling|terugbetaling|factur[ée] deux fois|double pr[ée]l[èe]vement|remboursement|cobrado dos veces|cargo duplicado|reembolso|doppelt belastet|doppelte abbuchung|r[üu]ckerstattung|cobrado duas vezes|cobran[çc]a duplicada|reembolso)\b|خصم مرتين|دفع مكرر|استرداد/iu;
const TECHNICAL_BUG = /\b(crash|crashes|crashed|bug|error|blank page|not load|not working|broken page|vastlop|foutmelding|laadt niet|plantage|erreur|page blanche|ne charge pas|bloquea|error|no carga|absturz|fehler|l[äa]dt nicht|falha|erro|n[ãa]o carrega)\b|عطل|خطأ|لا تعمل|لا تفتح/iu;
const SERVICE_FAILURE = /\b(did not arrive|didn'?t arrive|no show|team never came|niet gekomen|kwam niet|pas venu|n'est pas venu|no lleg[óo]|no se present[óo]|nicht gekommen|kam nicht|n[ãa]o apareceu|n[ãa]o chegou)\b|لم يصل|لم يأت/iu;
const CUSTOM_APPROVAL = /\b(exception|special approval|custom approval|approve this|uitzondering|goedkeuring|exception|approbation|excepci[óo]n|aprobaci[óo]n|ausnahme|genehmigung|exce[çc][ãa]o|aprova[çc][ãa]o)\b|استثناء|موافقة خاصة/iu;
const VAGUE_SERVICE_ISSUE = /\b(cleaning (?:was|is) not (?:good|correct|right)|not cleaned well|poor cleaning|schoonmaak (?:was|is) niet goed|niet goed schoongemaakt|nettoyage (?:n'est|est) pas (?:bon|correct)|mal nettoy[ée]|limpieza (?:no estuvo|no est[áa]) bien|mal limpiado|reinigung war nicht gut|nicht gut gereinigt|limpeza n[ãa]o (?:foi|est[áa]) boa|mal limpo)\b|التنظيف غير جيد|لم يتم التنظيف جيداً/iu;
const BOOKING_REFERENCE = /\bDTH-[A-Z0-9-]{4,}\b/i;

function decision(
  required: boolean,
  reason: AssistantEscalationReason | null,
  confidence: number,
  nextAction: AssistantEscalation["nextAction"],
  topic: string | null,
): HandoffEvaluation {
  return { required, reason, confidence, nextAction, topic };
}

export function evaluateHumanHandoff(input: {
  message: string;
  intent: AssistantIntent;
  retrieved: RetrievedKnowledge[];
  state: AssistantSuggestionState;
}): HandoffEvaluation {
  const { message, intent, retrieved, state } = input;
  if (SECURITY.test(message)) return decision(true, "security_issue", 0.99, "offer_handoff", "security_issue");
  if (DAMAGE.test(message)) return decision(true, "damage_claim", 0.98, "offer_handoff", "damage_claim");
  if (MISSING_ITEM.test(message)) return decision(true, "missing_item_claim", 0.98, "offer_handoff", "missing_item_claim");
  if (PAYMENT_INVESTIGATION.test(message)) return decision(true, "payment_investigation", 0.98, "offer_handoff", "payment_investigation");
  if (SERVICE_FAILURE.test(message)) return decision(true, "service_failure", 0.96, "offer_handoff", "service_failure");
  if (CUSTOM_APPROVAL.test(message)) return decision(true, "manual_approval_required", 0.94, "offer_handoff", "manual_approval_required");
  if (EXPLICIT_HUMAN.test(message) || state.selectedSuggestionIds.some((id) => id.startsWith("human-"))) {
    return decision(true, "customer_explicitly_requests_human", 0.99, "offer_handoff", "human_topic");
  }

  const technicalAttempts = state.clarificationAttempts.technical_bug || 0;
  const continuingTechnicalIssue = state.unresolvedTopics.includes("technical_bug");
  if (TECHNICAL_BUG.test(message) || continuingTechnicalIssue) {
    if (technicalAttempts >= 2 && /\b(still|again|same|unresolved|nog steeds|encore|toujours|todav[íi]a|sigue|immer noch|ainda|novamente)\b|ما زال|لا يزال/iu.test(message)) {
      return decision(true, "technical_bug", 0.93, "offer_handoff", "technical_bug");
    }
    return decision(false, null, 0.91, technicalAttempts ? "guided_self_service" : "ask_clarifying_question", "technical_bug");
  }

  if (intent === "booking_status") {
    if (BOOKING_REFERENCE.test(message)) return decision(true, "account_access_required", 0.96, "offer_handoff", "booking_reference");
    return decision(false, null, 0.94, "ask_clarifying_question", "booking_reference");
  }
  if (VAGUE_SERVICE_ISSUE.test(message) || intent === "complaint") {
    return decision(false, null, 0.94, "ask_clarifying_question", "service_issue");
  }

  const unclearAttempts = state.clarificationAttempts.unclear_request || 0;
  if (intent === "unknown" && retrieved.length === 0) {
    if (unclearAttempts >= 2) {
      return decision(true, "assistant_failed_after_multiple_attempts", 0.9, "offer_handoff", "unclear_request");
    }
    return decision(false, null, 0.86, "ask_clarifying_question", "unclear_request");
  }
  return decision(false, null, 0.96, "answer", null);
}

const GUIDED_COPY: Record<Locale, Record<string, string>> = {
  en: {
    service_issue: "I’m sorry the cleaning was not right. Was an area not cleaned, was something damaged or missing, did the team not arrive, or is it another issue?",
    technical_bug: "Let’s try to solve this first. Which device and browser are you using, and what happens just before the page stops working?",
    technical_troubleshoot: "Please refresh the page once, then try a private window or another browser. If it still fails, tell me the exact error shown.",
    booking_reference: "I can help with the next step. Do you have the booking reference that starts with DTH-?",
    unclear_request: "I want to understand your request correctly. Is it about pricing, a booking, a payment, the cleaning service, or something else?",
  },
  nl: {
    service_issue: "Het spijt me dat de schoonmaak niet in orde was. Is een deel niet schoongemaakt, is er iets beschadigd of vermist, is het team niet gekomen, of gaat het om iets anders?",
    technical_bug: "Laten we dit eerst proberen op te lossen. Welk apparaat en welke browser gebruikt u, en wat gebeurt er vlak voordat de pagina stopt?",
    technical_troubleshoot: "Vernieuw de pagina één keer en probeer daarna een privévenster of een andere browser. Als het nog niet werkt, stuur dan de exacte foutmelding.",
    booking_reference: "Ik help u graag met de volgende stap. Hebt u de boekingsreferentie die met DTH- begint?",
    unclear_request: "Ik wil uw vraag goed begrijpen. Gaat het om prijzen, een boeking, een betaling, de schoonmaakdienst of iets anders?",
  },
  fr: {
    service_issue: "Je suis désolé que le nettoyage n’ait pas été satisfaisant. Une zone n’a-t-elle pas été nettoyée, quelque chose a-t-il été endommagé ou perdu, l’équipe n’est-elle pas venue, ou s’agit-il d’un autre problème ?",
    technical_bug: "Essayons d’abord de résoudre le problème. Quel appareil et quel navigateur utilisez-vous, et que se passe-t-il juste avant que la page ne cesse de fonctionner ?",
    technical_troubleshoot: "Actualisez la page une fois, puis essayez une fenêtre privée ou un autre navigateur. Si le problème persiste, indiquez le message d’erreur exact.",
    booking_reference: "Je peux vous aider pour la suite. Avez-vous la référence de réservation qui commence par DTH- ?",
    unclear_request: "Je souhaite bien comprendre votre demande. Concerne-t-elle les tarifs, une réservation, un paiement, le nettoyage ou autre chose ?",
  },
  es: {
    service_issue: "Siento que la limpieza no haya sido correcta. ¿Quedó una zona sin limpiar, hubo algún daño o falta algo, el equipo no llegó, o se trata de otro problema?",
    technical_bug: "Intentemos resolverlo primero. ¿Qué dispositivo y navegador utiliza, y qué ocurre justo antes de que la página deje de funcionar?",
    technical_troubleshoot: "Actualice la página una vez y pruebe una ventana privada u otro navegador. Si sigue fallando, indique el mensaje de error exacto.",
    booking_reference: "Puedo ayudarle con el siguiente paso. ¿Tiene la referencia de reserva que empieza por DTH-?",
    unclear_request: "Quiero entender bien su solicitud. ¿Se refiere a precios, una reserva, un pago, la limpieza u otro asunto?",
  },
  de: {
    service_issue: "Es tut mir leid, dass die Reinigung nicht in Ordnung war. Wurde ein Bereich nicht gereinigt, wurde etwas beschädigt oder fehlt etwas, ist das Team nicht gekommen oder geht es um etwas anderes?",
    technical_bug: "Versuchen wir zuerst, das Problem zu lösen. Welches Gerät und welchen Browser verwenden Sie, und was passiert unmittelbar bevor die Seite nicht mehr funktioniert?",
    technical_troubleshoot: "Aktualisieren Sie die Seite einmal und versuchen Sie danach ein privates Fenster oder einen anderen Browser. Wenn es weiterhin nicht funktioniert, nennen Sie bitte die genaue Fehlermeldung.",
    booking_reference: "Ich helfe Ihnen beim nächsten Schritt. Haben Sie die Buchungsreferenz, die mit DTH- beginnt?",
    unclear_request: "Ich möchte Ihre Anfrage richtig verstehen. Geht es um Preise, eine Buchung, eine Zahlung, die Reinigung oder etwas anderes?",
  },
  pt: {
    service_issue: "Lamento que a limpeza não tenha ficado correta. Ficou alguma área por limpar, houve danos ou falta algum item, a equipa não apareceu, ou trata-se de outro problema?",
    technical_bug: "Vamos tentar resolver primeiro. Que dispositivo e navegador está a usar, e o que acontece imediatamente antes de a página deixar de funcionar?",
    technical_troubleshoot: "Atualize a página uma vez e tente uma janela privada ou outro navegador. Se continuar a falhar, indique a mensagem de erro exata.",
    booking_reference: "Posso ajudar no passo seguinte. Tem a referência de reserva que começa por DTH-?",
    unclear_request: "Quero compreender corretamente o pedido. É sobre preços, uma reserva, um pagamento, a limpeza ou outro assunto?",
  },
  ar: {
    service_issue: "آسف لأن التنظيف لم يكن بالمستوى المطلوب. هل توجد منطقة لم تُنظف، أو حدث ضرر أو فُقد شيء، أو لم يصل الفريق، أم توجد مشكلة أخرى؟",
    technical_bug: "لنحاول حل المشكلة أولاً. ما الجهاز والمتصفح اللذان تستخدمهما، وماذا يحدث مباشرة قبل أن تتوقف الصفحة عن العمل؟",
    technical_troubleshoot: "حدّث الصفحة مرة واحدة، ثم جرّب نافذة خاصة أو متصفحاً آخر. إذا استمرت المشكلة، أرسل رسالة الخطأ كما تظهر.",
    booking_reference: "يمكنني مساعدتك في الخطوة التالية. هل لديك مرجع الحجز الذي يبدأ بـ DTH-؟",
    unclear_request: "أريد فهم طلبك بشكل صحيح. هل يتعلق بالسعر، أو الحجز، أو الدفع، أو خدمة التنظيف، أم بشيء آخر؟",
  },
};

const HANDOFF_COPY: Record<Locale, Record<AssistantEscalationReason, string>> = {
  en: {
    technical_bug: "The troubleshooting steps did not resolve this technical issue. A Dar Tahara specialist needs to review it; I’ll include the device and error details already provided.",
    payment_investigation: "This payment issue requires access to transaction records that I cannot review directly. Please share the invoice or booking reference if available; I can connect you with a specialist and include everything already provided.",
    account_access_required: "This request requires access to your protected booking records. I can connect you with a Dar Tahara specialist and include the booking reference and details already provided.",
    complaint_investigation: "This complaint requires a human review of the service records. I can connect you with a specialist and include the details already provided.",
    damage_claim: "A damage report requires a human investigation. I can connect you with a Dar Tahara specialist and include the details already provided.",
    missing_item_claim: "A missing-item report requires a human investigation. I can connect you with a Dar Tahara specialist and include the details already provided.",
    security_issue: "This safety or security issue requires immediate human review. I can connect you with a Dar Tahara specialist and include the details already provided.",
    manual_approval_required: "This request needs a custom decision or approval. I can connect you with a Dar Tahara specialist and include the context already provided.",
    service_failure: "This service failure requires access to scheduling and visit records. I can connect you with a specialist and include the details already provided.",
    assistant_failed_after_multiple_attempts: "We have tried the available self-service steps without resolving this. I can connect you with a Dar Tahara specialist and include the conversation summary.",
    customer_explicitly_requests_human: "Certainly. I can connect you with a person. Is this about a booking, payment, complaint, damage or missing item, or another issue?",
  },
  nl: {
    technical_bug: "De stappen hebben dit technische probleem niet opgelost. Een Dar Tahara-specialist moet dit beoordelen; ik voeg de verstrekte apparaat- en foutgegevens toe.",
    payment_investigation: "Voor dit betaalprobleem is toegang tot transactiegegevens nodig. Deel indien mogelijk de factuur- of boekingsreferentie; ik verbind u met een specialist en stuur de verzamelde informatie mee.",
    account_access_required: "Hiervoor is toegang tot uw beveiligde boekingsgegevens nodig. Ik verbind u met een Dar Tahara-specialist en stuur de verstrekte referentie en details mee.",
    complaint_investigation: "Deze klacht vereist menselijke beoordeling van de servicegegevens. Ik verbind u met een specialist en stuur de details mee.",
    damage_claim: "Een schademelding vereist menselijk onderzoek. Ik verbind u met een Dar Tahara-specialist en stuur de details mee.",
    missing_item_claim: "Een melding van een vermist item vereist menselijk onderzoek. Ik verbind u met een Dar Tahara-specialist en stuur de details mee.",
    security_issue: "Dit veiligheidsprobleem vereist directe menselijke beoordeling. Ik verbind u met een Dar Tahara-specialist en stuur de details mee.",
    manual_approval_required: "Dit verzoek vraagt om een persoonlijke beslissing of goedkeuring. Ik verbind u met een specialist en stuur de context mee.",
    service_failure: "Hiervoor moeten planning en bezoekgegevens worden gecontroleerd. Ik verbind u met een specialist en stuur de details mee.",
    assistant_failed_after_multiple_attempts: "De beschikbare zelfservicestappen hebben het probleem niet opgelost. Ik verbind u met een specialist en stuur de gesprekssamenvatting mee.",
    customer_explicitly_requests_human: "Natuurlijk. Ik kan u met een medewerker verbinden. Gaat het om een boeking, betaling, klacht, schade of vermist item, of iets anders?",
  },
  fr: {
    technical_bug: "Les étapes de dépannage n’ont pas résolu ce problème technique. Un spécialiste Dar Tahara doit l’examiner ; je transmettrai les informations déjà fournies.",
    payment_investigation: "Ce problème de paiement nécessite l’accès aux transactions. Indiquez si possible la référence de facture ou de réservation ; je peux vous mettre en relation avec un spécialiste en transmettant les informations déjà fournies.",
    account_access_required: "Cette demande nécessite l’accès à vos données de réservation protégées. Je peux vous mettre en relation avec un spécialiste Dar Tahara en transmettant la référence et les informations déjà fournies.",
    complaint_investigation: "Cette réclamation nécessite l’examen humain des données de service. Je peux vous mettre en relation avec un spécialiste et transmettre les détails fournis.",
    damage_claim: "Un signalement de dommage nécessite une enquête humaine. Je peux vous mettre en relation avec un spécialiste Dar Tahara et transmettre les détails fournis.",
    missing_item_claim: "Un objet manquant nécessite une enquête humaine. Je peux vous mettre en relation avec un spécialiste et transmettre les détails fournis.",
    security_issue: "Ce problème de sécurité nécessite un examen humain immédiat. Je peux vous mettre en relation avec un spécialiste et transmettre les détails fournis.",
    manual_approval_required: "Cette demande nécessite une décision ou une approbation personnalisée. Je peux vous mettre en relation avec un spécialiste et transmettre le contexte.",
    service_failure: "Ce problème nécessite l’accès aux données de planning et de visite. Je peux vous mettre en relation avec un spécialiste et transmettre les détails.",
    assistant_failed_after_multiple_attempts: "Les étapes disponibles n’ont pas permis de résoudre le problème. Je peux vous mettre en relation avec un spécialiste et transmettre le résumé de la conversation.",
    customer_explicitly_requests_human: "Bien sûr. Je peux vous mettre en relation avec une personne. S’agit-il d’une réservation, d’un paiement, d’une réclamation, d’un dommage ou objet manquant, ou d’un autre sujet ?",
  },
  es: {
    technical_bug: "Los pasos de solución no resolvieron este problema técnico. Un especialista de Dar Tahara debe revisarlo; incluiré los datos ya facilitados.",
    payment_investigation: "Este problema de pago requiere acceso a las transacciones. Comparta si puede la referencia de factura o reserva; puedo conectarle con un especialista e incluir la información ya facilitada.",
    account_access_required: "Esta solicitud requiere acceso a sus datos protegidos de reserva. Puedo conectarle con un especialista de Dar Tahara e incluir la referencia y los datos facilitados.",
    complaint_investigation: "Esta reclamación requiere revisar manualmente los registros del servicio. Puedo conectarle con un especialista e incluir los detalles facilitados.",
    damage_claim: "Un informe de daños requiere una investigación humana. Puedo conectarle con un especialista e incluir los detalles facilitados.",
    missing_item_claim: "Un objeto perdido requiere una investigación humana. Puedo conectarle con un especialista e incluir los detalles facilitados.",
    security_issue: "Este problema de seguridad requiere una revisión humana inmediata. Puedo conectarle con un especialista e incluir los detalles facilitados.",
    manual_approval_required: "Esta solicitud necesita una decisión o aprobación personalizada. Puedo conectarle con un especialista e incluir el contexto.",
    service_failure: "Este fallo requiere consultar los registros de planificación y visita. Puedo conectarle con un especialista e incluir los detalles.",
    assistant_failed_after_multiple_attempts: "Los pasos de autoservicio disponibles no resolvieron el problema. Puedo conectarle con un especialista e incluir el resumen de la conversación.",
    customer_explicitly_requests_human: "Por supuesto. Puedo conectarle con una persona. ¿Se trata de una reserva, pago, reclamación, daño u objeto perdido, u otro asunto?",
  },
  de: {
    technical_bug: "Die Schritte haben dieses technische Problem nicht gelöst. Ein Dar Tahara-Spezialist muss es prüfen; ich gebe die bereits genannten Details weiter.",
    payment_investigation: "Dieses Zahlungsproblem erfordert Zugriff auf Transaktionsdaten. Teilen Sie wenn möglich die Rechnungs- oder Buchungsreferenz; ich verbinde Sie mit einem Spezialisten und gebe die Angaben weiter.",
    account_access_required: "Diese Anfrage erfordert Zugriff auf geschützte Buchungsdaten. Ich verbinde Sie mit einem Dar Tahara-Spezialisten und gebe Referenz und Details weiter.",
    complaint_investigation: "Diese Beschwerde erfordert eine manuelle Prüfung der Servicedaten. Ich verbinde Sie mit einem Spezialisten und gebe die Details weiter.",
    damage_claim: "Eine Schadensmeldung erfordert eine menschliche Untersuchung. Ich verbinde Sie mit einem Spezialisten und gebe die Details weiter.",
    missing_item_claim: "Ein vermisster Gegenstand erfordert eine menschliche Untersuchung. Ich verbinde Sie mit einem Spezialisten und gebe die Details weiter.",
    security_issue: "Dieses Sicherheitsproblem erfordert sofortige menschliche Prüfung. Ich verbinde Sie mit einem Spezialisten und gebe die Details weiter.",
    manual_approval_required: "Diese Anfrage benötigt eine individuelle Entscheidung oder Genehmigung. Ich verbinde Sie mit einem Spezialisten und gebe den Kontext weiter.",
    service_failure: "Dafür müssen Planungs- und Besuchsdaten geprüft werden. Ich verbinde Sie mit einem Spezialisten und gebe die Details weiter.",
    assistant_failed_after_multiple_attempts: "Die verfügbaren Selbsthilfeschritte haben das Problem nicht gelöst. Ich verbinde Sie mit einem Spezialisten und gebe die Gesprächszusammenfassung weiter.",
    customer_explicitly_requests_human: "Natürlich. Ich kann Sie mit einem Mitarbeiter verbinden. Geht es um eine Buchung, Zahlung, Beschwerde, einen Schaden oder vermissten Gegenstand oder um etwas anderes?",
  },
  pt: {
    technical_bug: "Os passos de resolução não corrigiram este problema técnico. Um especialista da Dar Tahara precisa de o analisar; enviarei os dados já fornecidos.",
    payment_investigation: "Este problema de pagamento exige acesso às transações. Partilhe, se possível, a referência da fatura ou reserva; posso encaminhar para um especialista com a informação já fornecida.",
    account_access_required: "Este pedido exige acesso aos dados protegidos da reserva. Posso encaminhar para um especialista da Dar Tahara com a referência e os detalhes fornecidos.",
    complaint_investigation: "Esta reclamação exige uma análise humana dos registos do serviço. Posso encaminhar para um especialista com os detalhes fornecidos.",
    damage_claim: "Um dano exige uma investigação humana. Posso encaminhar para um especialista da Dar Tahara com os detalhes fornecidos.",
    missing_item_claim: "Um item em falta exige uma investigação humana. Posso encaminhar para um especialista com os detalhes fornecidos.",
    security_issue: "Este problema de segurança exige análise humana imediata. Posso encaminhar para um especialista com os detalhes fornecidos.",
    manual_approval_required: "Este pedido precisa de uma decisão ou aprovação personalizada. Posso encaminhar para um especialista com o contexto.",
    service_failure: "Esta falha exige acesso aos registos de planeamento e visita. Posso encaminhar para um especialista com os detalhes.",
    assistant_failed_after_multiple_attempts: "Os passos de autosserviço disponíveis não resolveram o problema. Posso encaminhar para um especialista com o resumo da conversa.",
    customer_explicitly_requests_human: "Claro. Posso encaminhar para uma pessoa. É sobre uma reserva, pagamento, reclamação, dano ou item em falta, ou outro assunto?",
  },
  ar: {
    technical_bug: "لم تنجح خطوات المعالجة في حل هذا العطل التقني. يحتاج مختص من دار طهارة إلى مراجعته، وسأرسل التفاصيل التي قدمتها.",
    payment_investigation: "تحتاج مشكلة الدفع هذه إلى مراجعة سجلات المعاملة. أرسل مرجع الفاتورة أو الحجز إن توفر، ويمكنني إحالتك إلى مختص مع كل المعلومات التي قدمتها.",
    account_access_required: "يتطلب هذا الطلب الوصول إلى بيانات الحجز المحمية. يمكنني إحالتك إلى مختص من دار طهارة مع المرجع والتفاصيل التي قدمتها.",
    complaint_investigation: "تحتاج هذه الشكوى إلى مراجعة بشرية لسجلات الخدمة. يمكنني إحالتك إلى مختص مع التفاصيل التي قدمتها.",
    damage_claim: "يتطلب بلاغ الضرر تحقيقاً بشرياً. يمكنني إحالتك إلى مختص من دار طهارة مع التفاصيل التي قدمتها.",
    missing_item_claim: "يتطلب بلاغ الشيء المفقود تحقيقاً بشرياً. يمكنني إحالتك إلى مختص مع التفاصيل التي قدمتها.",
    security_issue: "تحتاج مشكلة السلامة أو الأمان هذه إلى مراجعة بشرية فورية. يمكنني إحالتك إلى مختص مع التفاصيل التي قدمتها.",
    manual_approval_required: "يحتاج هذا الطلب إلى قرار أو موافقة خاصة. يمكنني إحالتك إلى مختص مع سياق الطلب.",
    service_failure: "تحتاج هذه المشكلة إلى مراجعة سجلات الموعد والزيارة. يمكنني إحالتك إلى مختص مع التفاصيل.",
    assistant_failed_after_multiple_attempts: "لم تنجح خطوات الخدمة الذاتية المتاحة في حل المشكلة. يمكنني إحالتك إلى مختص مع ملخص المحادثة.",
    customer_explicitly_requests_human: "بالطبع. يمكنني إحالتك إلى موظف. هل يتعلق الأمر بحجز أو دفع أو شكوى أو ضرر أو شيء مفقود، أم بموضوع آخر؟",
  },
};

export function guidedResponse(locale: Locale, evaluation: HandoffEvaluation): string {
  if (evaluation.required && evaluation.reason) return HANDOFF_COPY[locale][evaluation.reason];
  const key = evaluation.topic === "technical_bug" && evaluation.nextAction === "guided_self_service"
    ? "technical_troubleshoot"
    : evaluation.topic || "unclear_request";
  return GUIDED_COPY[locale][key] || GUIDED_COPY[locale].unclear_request;
}

export function buildHandoffSummary(input: {
  locale: Locale;
  intent: AssistantIntent;
  reason: AssistantEscalationReason;
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}): AssistantHandoffSummary {
  const transcript = [...input.history, { role: "user" as const, content: input.message }].slice(-10);
  const combined = transcript.map((item) => `${item.role}: ${item.content}`).join("\n");
  const bookingReference = combined.match(BOOKING_REFERENCE)?.[0] || null;
  const addressMatch = combined.match(/(?:address|adres|adresse|direcci[óo]n|endere[çc]o|العنوان)\s*[:\-]?\s*([^\n]{5,180})/iu);
  const requestedOutcome = /refund|remboursement|reembolso|r[üu]ckerstattung|استرداد/iu.test(combined) ? "refund"
    : /reschedul|verzet|report|reprogram|verschieb|reagend|تغيير الموعد/iu.test(combined) ? "reschedule"
      : /cancel|annul|storn|إلغاء/iu.test(combined) ? "cancel"
        : null;
  const troubleshootingCompleted = [
    /refresh|actualis|vernieuw|aktualis|atualiz|تحديث/iu.test(combined) ? "page_refresh" : null,
    /private window|incognito|priv[ée]|priv[ée]venster|private[sr]? fenster|janela privada|نافذة خاصة/iu.test(combined) ? "private_window" : null,
    /another browser|andere browser|autre navigateur|otro navegador|anderen browser|outro navegador|متصفح آخر/iu.test(combined) ? "alternate_browser" : null,
  ].filter((item): item is string => Boolean(item));
  return {
    customerLanguage: input.locale,
    customerIntent: input.intent,
    issueCategory: input.reason,
    propertyAddress: addressMatch?.[1]?.trim() || null,
    bookingReference,
    conversationSummary: combined.slice(0, 2400),
    troubleshootingCompleted,
    customerRequestedOutcome: requestedOutcome,
  };
}
