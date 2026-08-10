import type { Locale } from "./config";
import type { CitySelectorCopy } from "@/components/early-access/moroccan-city-selector";

export type EarlyAccessLeadCopy = {
  heading: string;
  intro: string;
  firstName: string;
  email: string;
  city: string;
  consent: string;
  privacy: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  checkInbox: string;
  priorityTitle: string;
  priorityBody: string;
  continue: string;
  later: string;
  errors: Record<string, string>;
  citySelector: CitySelectorCopy;
};

const cityStatus = {
  planned: "Coming soon to this area",
  waiting_list: "Join the city waiting list",
  unsupported: "You can still join Early Access",
};

const en: EarlyAccessLeadCopy = {
  heading: "Join Early Access",
  intro: "Be first to hear when Dar Tahara premium home care becomes available in your city.",
  firstName: "First name", email: "Email address", city: "City in Morocco",
  consent: "I agree to receive Early Access updates, launch information, offers and, if I start it, reminders to finish onboarding from Dar Tahara.",
  privacy: "Privacy Policy", submit: "Join Early Access", submitting: "Joining…",
  successTitle: "You're on the list!",
  successBody: "We'll let you know when Dar Tahara becomes available in your city.",
  checkInbox: "Please check your inbox to confirm your email address.",
  priorityTitle: "Want priority access?",
  priorityBody: "Tell us a little more about your property so we can prepare for launch.",
  continue: "Continue", later: "I'll do this later",
  errors: { required: "Required", invalid: "Please check this field", invalid_email: "Enter a valid email address", consent_required: "Consent is required", captcha_failed: "Please complete the security check", rate_limited: "Please wait a moment and try again", server_error: "Your details could not be saved. Please try again.", network: "Check your connection and try again." },
  citySelector: { searchPlaceholder: "Search your city", notListed: "Other", manualLabel: "Your city", manualPlaceholder: "Type your city", status: cityStatus },
};

const fr: EarlyAccessLeadCopy = {
  ...en, heading: "Rejoignez l’accès anticipé", intro: "Soyez informé en priorité du lancement des services premium Dar Tahara dans votre ville.", firstName: "Prénom", email: "Adresse e-mail", city: "Ville au Maroc", consent: "J’accepte de recevoir les actualités, informations de lancement, offres et, si je le commence, des rappels pour terminer l’inscription de Dar Tahara.", privacy: "Politique de confidentialité", submit: "Rejoindre l’accès anticipé", submitting: "Inscription…", successTitle: "Vous êtes sur la liste !", successBody: "Nous vous préviendrons dès que Dar Tahara sera disponible dans votre ville.", checkInbox: "Consultez votre boîte mail pour confirmer votre adresse.", priorityTitle: "Vous souhaitez un accès prioritaire ?", priorityBody: "Parlez-nous de votre propriété pour préparer le lancement.", continue: "Continuer", later: "Je le ferai plus tard", citySelector: { ...en.citySelector, searchPlaceholder: "Rechercher votre ville", notListed: "Autre", manualLabel: "Votre ville", manualPlaceholder: "Saisissez votre ville", status: { planned: "Bientôt dans cette zone", waiting_list: "Liste d’attente de la ville", unsupported: "Vous pouvez tout de même vous inscrire" } },
};

const nl: EarlyAccessLeadCopy = {
  ...en, heading: "Meld je aan voor Early Access", intro: "Hoor als eerste wanneer de premium woningservice van Dar Tahara in jouw stad beschikbaar is.", firstName: "Voornaam", email: "E-mailadres", city: "Stad in Marokko", consent: "Ik ga akkoord met Early Access-updates, lanceringsinformatie, aanbiedingen en, als ik eraan begin, herinneringen om de onboarding af te ronden.", privacy: "Privacybeleid", submit: "Meld je aan", submitting: "Aanmelden…", successTitle: "Je staat op de lijst!", successBody: "We laten je weten wanneer Dar Tahara in jouw stad beschikbaar is.", checkInbox: "Controleer je inbox om je e-mailadres te bevestigen.", priorityTitle: "Wil je voorrang?", priorityBody: "Vertel ons iets meer over je woning, zodat we de lancering kunnen voorbereiden.", continue: "Doorgaan", later: "Ik doe dit later", citySelector: { ...en.citySelector, searchPlaceholder: "Zoek je stad", notListed: "Andere", manualLabel: "Jouw stad", manualPlaceholder: "Vul je stad in" },
};

const es: EarlyAccessLeadCopy = {
  ...en, heading: "Únete al acceso anticipado", intro: "Sé de los primeros en saber cuándo llega el cuidado premium de Dar Tahara a tu ciudad.", firstName: "Nombre", email: "Correo electrónico", city: "Ciudad en Marruecos", consent: "Acepto recibir novedades, información de lanzamiento, ofertas y, si lo inicio, recordatorios para completar el registro de Dar Tahara.", privacy: "Política de privacidad", submit: "Unirme al acceso anticipado", submitting: "Registrando…", successTitle: "¡Estás en la lista!", successBody: "Te avisaremos cuando Dar Tahara esté disponible en tu ciudad.", checkInbox: "Revisa tu correo para confirmar tu dirección.", priorityTitle: "¿Quieres acceso prioritario?", priorityBody: "Cuéntanos algo más sobre tu propiedad para preparar el lanzamiento.", continue: "Continuar", later: "Lo haré más tarde", citySelector: { ...en.citySelector, searchPlaceholder: "Busca tu ciudad", notListed: "Otra", manualLabel: "Tu ciudad", manualPlaceholder: "Escribe tu ciudad" },
};

const de: EarlyAccessLeadCopy = {
  ...en, heading: "Für Early Access anmelden", intro: "Erfahren Sie zuerst, wann Dar Taharas Premium-Hausservice in Ihrer Stadt verfügbar ist.", firstName: "Vorname", email: "E-Mail-Adresse", city: "Stadt in Marokko", consent: "Ich stimme Early-Access-Updates, Startinformationen, Angeboten und – falls begonnen – Erinnerungen zum Abschluss des Onboardings zu.", privacy: "Datenschutzerklärung", submit: "Early Access beitreten", submitting: "Anmeldung…", successTitle: "Sie stehen auf der Liste!", successBody: "Wir informieren Sie, sobald Dar Tahara in Ihrer Stadt verfügbar ist.", checkInbox: "Bitte bestätigen Sie Ihre E-Mail-Adresse im Posteingang.", priorityTitle: "Möchten Sie bevorzugten Zugang?", priorityBody: "Erzählen Sie uns mehr über Ihre Immobilie, damit wir den Start vorbereiten können.", continue: "Weiter", later: "Später erledigen", citySelector: { ...en.citySelector, searchPlaceholder: "Stadt suchen", notListed: "Andere", manualLabel: "Ihre Stadt", manualPlaceholder: "Stadt eingeben" },
};

const pt: EarlyAccessLeadCopy = {
  ...en, heading: "Junte-se ao acesso antecipado", intro: "Saiba primeiro quando o cuidado premium da Dar Tahara chegar à sua cidade.", firstName: "Nome", email: "E-mail", city: "Cidade em Marrocos", consent: "Concordo em receber novidades, informações de lançamento, ofertas e, se iniciar, lembretes para concluir o onboarding da Dar Tahara.", privacy: "Política de Privacidade", submit: "Juntar-me ao acesso antecipado", submitting: "A registar…", successTitle: "Está na lista!", successBody: "Avisaremos quando a Dar Tahara estiver disponível na sua cidade.", checkInbox: "Consulte o e-mail para confirmar o seu endereço.", priorityTitle: "Quer acesso prioritário?", priorityBody: "Conte-nos um pouco mais sobre a sua propriedade para prepararmos o lançamento.", continue: "Continuar", later: "Faço isto mais tarde", citySelector: { ...en.citySelector, searchPlaceholder: "Pesquisar cidade", notListed: "Outra", manualLabel: "A sua cidade", manualPlaceholder: "Escreva a sua cidade" },
};

const ar: EarlyAccessLeadCopy = {
  ...en, heading: "انضم إلى الوصول المبكر", intro: "كن من أوائل من يعرفون متى تتوفر خدمات دار طهارة المميزة في مدينتك.", firstName: "الاسم الأول", email: "البريد الإلكتروني", city: "المدينة في المغرب", consent: "أوافق على تلقي تحديثات الوصول المبكر ومعلومات الإطلاق والعروض، وإذا بدأت التسجيل، تذكيرات لإكماله من دار طهارة.", privacy: "سياسة الخصوصية", submit: "الانضمام إلى الوصول المبكر", submitting: "جارٍ الانضمام…", successTitle: "أنت على القائمة!", successBody: "سنخبرك عندما تصبح دار طهارة متاحة في مدينتك.", checkInbox: "تحقق من بريدك لتأكيد عنوانك الإلكتروني.", priorityTitle: "هل تريد أولوية الوصول؟", priorityBody: "أخبرنا قليلاً عن عقارك حتى نستعد للإطلاق.", continue: "متابعة", later: "سأفعل ذلك لاحقاً", citySelector: { ...en.citySelector, searchPlaceholder: "ابحث عن مدينتك", notListed: "أخرى", manualLabel: "مدينتك", manualPlaceholder: "اكتب مدينتك" },
};

const copy: Record<Locale, EarlyAccessLeadCopy> = { en, fr, nl, es, de, pt, ar };

export function getEarlyAccessLeadCopy(locale: Locale): EarlyAccessLeadCopy {
  return copy[locale];
}
