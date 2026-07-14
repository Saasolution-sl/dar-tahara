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
    emailRequest: "Your request needs help from our support team. Please provide the email address where you would like to receive their reply. We will include this WhatsApp conversation for context.",
    invalidEmail: "That does not look like a valid email address. Please send the email address where our support team should reply.",
    ticketCreated: "Your request has been transferred to our support team. A ticket has been created, and the team will reply to you at the email address you provided. Please check your inbox and spam folder.",
    ticketPending: "Your request has been recorded, but I could not finish creating the support ticket yet. We will retry safely. I will not claim that a ticket exists until creation succeeds.",
    rateLimited: "I received several messages close together. Please wait a moment while I process them, then send one concise follow-up if needed.",
    tooLong: "That message is too long for safe processing. Please resend the essential details in a shorter message and do not include payment details, passwords, or full access codes.",
    blocked: "Messaging is temporarily paused because repeated automated or abusive content was detected. Please try again later or use the secure website contact options.",
  },
  fr: {
    unsupported: "Je peux actuellement traiter uniquement les messages texte. Veuillez décrire votre demande par écrit.",
    emailRequest: "Votre demande nécessite l'aide de notre équipe support. Veuillez indiquer l'adresse e-mail à laquelle vous souhaitez recevoir sa réponse. Cette conversation WhatsApp sera jointe pour le contexte.",
    invalidEmail: "Cette adresse e-mail ne semble pas valide. Veuillez envoyer l'adresse à laquelle notre équipe support doit répondre.",
    ticketCreated: "Votre demande a été transférée à notre équipe support. Un ticket a été créé et l'équipe vous répondra à l'adresse e-mail fournie. Vérifiez votre boîte de réception et vos courriers indésirables.",
    ticketPending: "Votre demande a été enregistrée, mais le ticket support n'a pas encore pu être créé. Une nouvelle tentative sécurisée sera effectuée.",
    rateLimited: "J'ai reçu plusieurs messages rapprochés. Patientez un instant, puis envoyez un seul complément concis si nécessaire.",
    tooLong: "Ce message est trop long pour être traité en toute sécurité. Renvoyez l'essentiel sans données de paiement, mots de passe ni codes d'accès complets.",
    blocked: "La messagerie est temporairement suspendue après la détection répétée de contenu automatisé ou abusif. Réessayez plus tard.",
  },
  ar: {
    unsupported: "يمكنني حاليًا معالجة الرسائل النصية فقط. يُرجى وصف طلبك كتابةً.",
    emailRequest: "طلبك يحتاج إلى مساعدة فريق الدعم. يُرجى إرسال البريد الإلكتروني الذي تريد أن يصلك الرد عليه. سنرفق محادثة واتساب هذه للسياق.",
    invalidEmail: "يبدو أن عنوان البريد الإلكتروني غير صالح. يُرجى إرسال العنوان الذي تريد أن يرد عليه فريق الدعم.",
    ticketCreated: "تم تحويل طلبك إلى فريق الدعم وإنشاء تذكرة. سيرد الفريق على البريد الإلكتروني الذي قدمته. يُرجى التحقق من صندوق الوارد والرسائل غير المرغوب فيها.",
    ticketPending: "تم تسجيل طلبك، لكن تعذّر إكمال إنشاء تذكرة الدعم الآن. سنعيد المحاولة بأمان ولن نؤكد إنشاء التذكرة قبل نجاح العملية.",
    rateLimited: "وصلتني عدة رسائل متتالية. يُرجى الانتظار قليلًا ثم إرسال متابعة مختصرة واحدة عند الحاجة.",
    tooLong: "الرسالة طويلة جدًا للمعالجة الآمنة. أرسل التفاصيل الأساسية باختصار ومن دون بيانات دفع أو كلمات مرور أو رموز دخول كاملة.",
    blocked: "تم إيقاف الرسائل مؤقتًا بعد رصد محتوى آلي أو مسيء بشكل متكرر. يُرجى المحاولة لاحقًا.",
  },
  nl: {
    unsupported: "Ik kan momenteel alleen tekstberichten verwerken. Beschrijf uw vraag alstublieft in tekst.",
    emailRequest: "Uw verzoek heeft hulp van ons supportteam nodig. Stuur het e-mailadres waarop u hun antwoord wilt ontvangen. We voegen dit WhatsApp-gesprek toe als context.",
    invalidEmail: "Dat lijkt geen geldig e-mailadres. Stuur het adres waarop ons supportteam moet antwoorden.",
    ticketCreated: "Uw verzoek is overgedragen aan ons supportteam. Er is een ticket aangemaakt en het team antwoordt op het opgegeven e-mailadres. Controleer ook uw spammap.",
    ticketPending: "Uw verzoek is vastgelegd, maar het supportticket kon nog niet worden aangemaakt. We proberen dit veilig opnieuw.",
    rateLimited: "Ik ontving meerdere berichten kort na elkaar. Wacht even en stuur daarna zo nodig één korte aanvulling.",
    tooLong: "Dit bericht is te lang om veilig te verwerken. Stuur de belangrijkste details korter en deel geen betaalgegevens, wachtwoorden of volledige toegangscodes.",
    blocked: "Berichten zijn tijdelijk gepauzeerd na herhaald geautomatiseerd of beledigend gebruik. Probeer het later opnieuw.",
  },
  es: {
    unsupported: "Actualmente solo puedo procesar mensajes de texto. Describe tu solicitud por escrito.",
    emailRequest: "Tu solicitud necesita ayuda de nuestro equipo de soporte. Envía el correo electrónico donde quieres recibir su respuesta. Incluiremos esta conversación de WhatsApp como contexto.",
    invalidEmail: "Ese correo no parece válido. Envía la dirección donde debe responder nuestro equipo de soporte.",
    ticketCreated: "Tu solicitud se ha transferido al equipo de soporte. Se creó un ticket y el equipo responderá al correo proporcionado. Revisa también la carpeta de spam.",
    ticketPending: "Tu solicitud quedó registrada, pero aún no se pudo crear el ticket. Lo reintentaremos de forma segura.",
    rateLimited: "Recibí varios mensajes seguidos. Espera un momento y envía una sola aclaración breve si hace falta.",
    tooLong: "El mensaje es demasiado largo para procesarlo con seguridad. Reenvía lo esencial sin datos de pago, contraseñas ni códigos de acceso completos.",
    blocked: "Los mensajes están temporalmente pausados tras detectar contenido automatizado o abusivo repetido. Inténtalo más tarde.",
  },
  de: {
    unsupported: "Ich kann derzeit nur Textnachrichten verarbeiten. Bitte beschreiben Sie Ihr Anliegen schriftlich.",
    emailRequest: "Ihr Anliegen benötigt Hilfe unseres Supportteams. Senden Sie die E-Mail-Adresse, an die die Antwort gehen soll. Wir fügen diesen WhatsApp-Verlauf als Kontext bei.",
    invalidEmail: "Das scheint keine gültige E-Mail-Adresse zu sein. Senden Sie bitte die Adresse für die Antwort unseres Supportteams.",
    ticketCreated: "Ihr Anliegen wurde an unser Supportteam übergeben. Ein Ticket wurde erstellt; das Team antwortet an die angegebene E-Mail-Adresse. Prüfen Sie auch den Spam-Ordner.",
    ticketPending: "Ihr Anliegen wurde erfasst, das Supportticket konnte aber noch nicht erstellt werden. Wir versuchen es sicher erneut.",
    rateLimited: "Mehrere Nachrichten kamen kurz nacheinander an. Warten Sie bitte kurz und senden Sie danach bei Bedarf eine knappe Ergänzung.",
    tooLong: "Diese Nachricht ist für eine sichere Verarbeitung zu lang. Senden Sie die wichtigsten Angaben kürzer und keine Zahlungsdaten, Passwörter oder vollständigen Zugangscodes.",
    blocked: "Nach wiederholt automatisierten oder missbräuchlichen Inhalten ist der Nachrichtenversand vorübergehend pausiert. Versuchen Sie es später erneut.",
  },
  pt: {
    unsupported: "Neste momento só consigo processar mensagens de texto. Descreva o pedido por escrito.",
    emailRequest: "O seu pedido precisa da ajuda da nossa equipa de suporte. Envie o e-mail onde pretende receber a resposta. Incluiremos esta conversa do WhatsApp como contexto.",
    invalidEmail: "Esse endereço não parece válido. Envie o e-mail para o qual a equipa de suporte deve responder.",
    ticketCreated: "O seu pedido foi transferido para a equipa de suporte. Foi criado um ticket e a equipa responderá para o e-mail indicado. Verifique também a pasta de spam.",
    ticketPending: "O seu pedido foi registado, mas ainda não foi possível criar o ticket. Tentaremos novamente em segurança.",
    rateLimited: "Recebi várias mensagens seguidas. Aguarde um momento e envie apenas um complemento breve, se necessário.",
    tooLong: "A mensagem é demasiado longa para processamento seguro. Reenvie apenas o essencial, sem dados de pagamento, palavras-passe ou códigos de acesso completos.",
    blocked: "As mensagens estão temporariamente suspensas após conteúdo automatizado ou abusivo repetido. Tente mais tarde.",
  },
};

export function whatsappCopy(locale: Locale): Copy {
  return COPY[locale] || COPY.en;
}
