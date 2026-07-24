import type { Locale } from "@/i18n/config";

type Copy = {
  unsupported: string;
  emailRequest: string;
  invalidEmail: string;
  ticketCreated: string;
  ticketPending: string;
  rateLimited: string;
  tooLong: string;
  blocked: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    unsupported: "I can currently help with text messages only. Please describe your request in writing.",
    emailRequest: "Your support request needs help from Dar Tahara Support. Please provide the email address where you would like to receive their reply. We will include this WhatsApp conversation for context.",
    invalidEmail: "That does not look like a valid email address. Please send the email address where Dar Tahara Support should reply.",
    ticketCreated: "Your support request has been transferred to Dar Tahara Support. It has been created successfully, and Dar Tahara Support will reply to the email address you provided. Please check your inbox and spam folder.",
    ticketPending: "Your support request has been recorded, but I could not finish sending it to Dar Tahara Support yet. We will retry safely and will confirm only after it succeeds.",
    rateLimited: "I received several messages close together. Please wait a moment while I process them, then send one concise follow-up if needed.",
    tooLong: "That message is too long for safe processing. Please resend the essential details in a shorter message and do not include payment details, passwords, or full access codes.",
    blocked: "Messaging is temporarily paused because repeated automated or abusive content was detected. Please try again later or use the secure website contact options.",
  },
  fr: {
    unsupported: "Je peux actuellement traiter uniquement les messages texte. Veuillez décrire votre demande par écrit.",
    emailRequest: "Votre demande d’assistance nécessite l’aide de Dar Tahara Support. Indiquez l’adresse e-mail à laquelle vous souhaitez recevoir la réponse. Cette conversation WhatsApp sera jointe pour le contexte.",
    invalidEmail: "Cette adresse e-mail ne semble pas valide. Envoyez l’adresse à laquelle Dar Tahara Support doit répondre.",
    ticketCreated: "Votre demande d’assistance a été transmise à Dar Tahara Support. Elle a été créée avec succès et une réponse sera envoyée à l’adresse e-mail fournie. Vérifiez aussi vos courriers indésirables.",
    ticketPending: "Votre demande d’assistance a été enregistrée, mais n’a pas encore pu être transmise à Dar Tahara Support. Une nouvelle tentative sécurisée sera effectuée.",
    rateLimited: "J'ai reçu plusieurs messages rapprochés. Patientez un instant, puis envoyez un seul complément concis si nécessaire.",
    tooLong: "Ce message est trop long pour être traité en toute sécurité. Renvoyez l'essentiel sans données de paiement, mots de passe ni codes d'accès complets.",
    blocked: "La messagerie est temporairement suspendue après la détection répétée de contenu automatisé ou abusif. Réessayez plus tard.",
  },
  ar: {
    unsupported: "يمكنني حاليًا معالجة الرسائل النصية فقط. يُرجى وصف طلبك كتابةً.",
    emailRequest: "يحتاج طلب الدعم إلى مساعدة Dar Tahara Support. يُرجى إرسال البريد الإلكتروني الذي تريد أن يصلك الرد عليه. سنرفق محادثة واتساب هذه للسياق.",
    invalidEmail: "يبدو أن عنوان البريد الإلكتروني غير صالح. يُرجى إرسال العنوان الذي تريد أن يرد عليه Dar Tahara Support.",
    ticketCreated: "تم تحويل طلب الدعم إلى Dar Tahara Support وإنشاؤه بنجاح. سيصلك الرد على البريد الإلكتروني الذي قدمته. يُرجى التحقق من صندوق الوارد والرسائل غير المرغوب فيها.",
    ticketPending: "تم تسجيل طلب الدعم، لكن تعذّر إرساله إلى Dar Tahara Support الآن. سنعيد المحاولة بأمان ونؤكد فقط بعد النجاح.",
    rateLimited: "وصلتني عدة رسائل متتالية. يُرجى الانتظار قليلًا ثم إرسال متابعة مختصرة واحدة عند الحاجة.",
    tooLong: "الرسالة طويلة جدًا للمعالجة الآمنة. أرسل التفاصيل الأساسية باختصار ومن دون بيانات دفع أو كلمات مرور أو رموز دخول كاملة.",
    blocked: "تم إيقاف الرسائل مؤقتًا بعد رصد محتوى آلي أو مسيء بشكل متكرر. يُرجى المحاولة لاحقًا.",
  },
  nl: {
    unsupported: "Ik kan momenteel alleen tekstberichten verwerken. Beschrijf uw vraag alstublieft in tekst.",
    emailRequest: "Uw supportverzoek heeft hulp van Dar Tahara Support nodig. Stuur het e-mailadres waarop u het antwoord wilt ontvangen. We voegen dit WhatsApp-gesprek toe als context.",
    invalidEmail: "Dat lijkt geen geldig e-mailadres. Stuur het adres waarop Dar Tahara Support moet antwoorden.",
    ticketCreated: "Uw supportverzoek is naar Dar Tahara Support gestuurd en succesvol aangemaakt. U ontvangt antwoord op het opgegeven e-mailadres. Controleer ook uw spammap.",
    ticketPending: "Uw supportverzoek is vastgelegd, maar kon nog niet naar Dar Tahara Support worden gestuurd. We proberen dit veilig opnieuw.",
    rateLimited: "Ik ontving meerdere berichten kort na elkaar. Wacht even en stuur daarna zo nodig één korte aanvulling.",
    tooLong: "Dit bericht is te lang om veilig te verwerken. Stuur de belangrijkste details korter en deel geen betaalgegevens, wachtwoorden of volledige toegangscodes.",
    blocked: "Berichten zijn tijdelijk gepauzeerd na herhaald geautomatiseerd of beledigend gebruik. Probeer het later opnieuw.",
  },
  es: {
    unsupported: "Actualmente solo puedo procesar mensajes de texto. Describe tu solicitud por escrito.",
    emailRequest: "Tu solicitud de soporte necesita ayuda de Dar Tahara Support. Envía el correo donde quieres recibir la respuesta. Incluiremos esta conversación de WhatsApp como contexto.",
    invalidEmail: "Ese correo no parece válido. Envía la dirección donde debe responder Dar Tahara Support.",
    ticketCreated: "Tu solicitud de soporte se ha enviado a Dar Tahara Support y se creó correctamente. Recibirás la respuesta en el correo proporcionado. Revisa también la carpeta de spam.",
    ticketPending: "Tu solicitud de soporte quedó registrada, pero todavía no se pudo enviar a Dar Tahara Support. Lo reintentaremos de forma segura.",
    rateLimited: "Recibí varios mensajes seguidos. Espera un momento y envía una sola aclaración breve si hace falta.",
    tooLong: "El mensaje es demasiado largo para procesarlo con seguridad. Reenvía lo esencial sin datos de pago, contraseñas ni códigos de acceso completos.",
    blocked: "Los mensajes están temporalmente pausados tras detectar contenido automatizado o abusivo repetido. Inténtalo más tarde.",
  },
  de: {
    unsupported: "Ich kann derzeit nur Textnachrichten verarbeiten. Bitte beschreiben Sie Ihr Anliegen schriftlich.",
    emailRequest: "Ihre Supportanfrage benötigt Hilfe von Dar Tahara Support. Senden Sie die E-Mail-Adresse, an die die Antwort gehen soll. Wir fügen diesen WhatsApp-Verlauf als Kontext bei.",
    invalidEmail: "Das scheint keine gültige E-Mail-Adresse zu sein. Senden Sie bitte die Adresse für die Antwort von Dar Tahara Support.",
    ticketCreated: "Ihre Supportanfrage wurde an Dar Tahara Support übertragen und erfolgreich erstellt. Die Antwort geht an die angegebene E-Mail-Adresse. Prüfen Sie auch den Spam-Ordner.",
    ticketPending: "Ihre Supportanfrage wurde erfasst, konnte aber noch nicht an Dar Tahara Support übertragen werden. Wir versuchen es sicher erneut.",
    rateLimited: "Mehrere Nachrichten kamen kurz nacheinander an. Warten Sie bitte kurz und senden Sie danach bei Bedarf eine knappe Ergänzung.",
    tooLong: "Diese Nachricht ist für eine sichere Verarbeitung zu lang. Senden Sie die wichtigsten Angaben kürzer und keine Zahlungsdaten, Passwörter oder vollständigen Zugangscodes.",
    blocked: "Nach wiederholt automatisierten oder missbräuchlichen Inhalten ist der Nachrichtenversand vorübergehend pausiert. Versuchen Sie es später erneut.",
  },
  pt: {
    unsupported: "Neste momento só consigo processar mensagens de texto. Descreva o pedido por escrito.",
    emailRequest: "O seu pedido de suporte precisa da ajuda de Dar Tahara Support. Envie o e-mail onde pretende receber a resposta. Incluiremos esta conversa do WhatsApp como contexto.",
    invalidEmail: "Esse endereço não parece válido. Envie o e-mail para o qual Dar Tahara Support deve responder.",
    ticketCreated: "O seu pedido de suporte foi enviado para Dar Tahara Support e criado com sucesso. A resposta seguirá para o e-mail indicado. Verifique também a pasta de spam.",
    ticketPending: "O seu pedido de suporte foi registado, mas ainda não foi possível enviá-lo para Dar Tahara Support. Tentaremos novamente em segurança.",
    rateLimited: "Recebi várias mensagens seguidas. Aguarde um momento e envie apenas um complemento breve, se necessário.",
    tooLong: "A mensagem é demasiado longa para processamento seguro. Reenvie apenas o essencial, sem dados de pagamento, palavras-passe ou códigos de acesso completos.",
    blocked: "As mensagens estão temporariamente suspensas após conteúdo automatizado ou abusivo repetido. Tente mais tarde.",
  },
};

export function whatsappCopy(locale: Locale): Copy {
  return COPY[locale] || COPY.en;
}
