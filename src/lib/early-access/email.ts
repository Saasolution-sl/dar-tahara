import "server-only";
import type { Locale } from "@/i18n/config";
import { getDir } from "@/i18n/config";

/**
 * Early-access transactional email (verification + verified welcome), sent via
 * Resend as "Dar Tahara". A no-op when RESEND_API_KEY / MAILING_FROM_EMAIL are
 * unset, so the flow still works in dev (the lead is stored pending). Localised
 * to the applicant's language; Arabic renders right-to-left.
 *
 * These are OPERATIONAL emails about the user's own request, so they are sent on
 * the basis of operational-comms consent — they are not marketing.
 */

type VerifyCopy = { subject: string; heading: string; body: string; button: string; ignore: string; expiry: string };
type WelcomeCopy = { subject: string; heading: string; body: string; cityLine: (city: string) => string; notBooking: string; shareHeading: string; shareBody: string; button: string };

const VERIFY: Record<Locale, VerifyCopy> = {
  en: { subject: "Confirm your Dar Tahara early-access request", heading: "Confirm your email", body: "Thank you for requesting early access to Dar Tahara home care. Please confirm your email so we can keep you updated and let you know when service opens in your area.", button: "Confirm my email", ignore: "If you didn't request this, you can safely ignore this email.", expiry: "This link expires in 48 hours." },
  fr: { subject: "Confirmez votre demande d'accès anticipé Dar Tahara", heading: "Confirmez votre e-mail", body: "Merci d'avoir demandé un accès anticipé aux services Dar Tahara. Confirmez votre e-mail pour rester informé et savoir quand le service ouvrira dans votre région.", button: "Confirmer mon e-mail", ignore: "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.", expiry: "Ce lien expire dans 48 heures." },
  ar: { subject: "أكِّد طلب الوصول المبكر إلى دار طهارة", heading: "أكِّد بريدك الإلكتروني", body: "شكرًا لطلبك الوصول المبكر إلى خدمات دار طهارة للعناية بالمنزل. يرجى تأكيد بريدك الإلكتروني لنبقيك على اطلاع ونعلمك عند توفّر الخدمة في منطقتك.", button: "تأكيد بريدي الإلكتروني", ignore: "إذا لم تطلب هذا، يمكنك تجاهل هذه الرسالة بأمان.", expiry: "تنتهي صلاحية هذا الرابط خلال 48 ساعة." },
  nl: { subject: "Bevestig uw Dar Tahara early-access-aanvraag", heading: "Bevestig uw e-mail", body: "Bedankt voor uw aanvraag voor early access tot Dar Tahara. Bevestig uw e-mail zodat we u op de hoogte kunnen houden en laten weten wanneer de dienst in uw regio start.", button: "Mijn e-mail bevestigen", ignore: "Heeft u dit niet aangevraagd? Negeer deze e-mail.", expiry: "Deze link verloopt over 48 uur." },
  es: { subject: "Confirma tu solicitud de acceso anticipado a Dar Tahara", heading: "Confirma tu correo", body: "Gracias por solicitar acceso anticipado a Dar Tahara. Confirma tu correo para mantenerte informado y saber cuándo abrimos servicio en tu zona.", button: "Confirmar mi correo", ignore: "Si no solicitaste esto, ignora este correo.", expiry: "Este enlace caduca en 48 horas." },
  de: { subject: "Bestätigen Sie Ihre Dar Tahara Early-Access-Anfrage", heading: "Bestätigen Sie Ihre E-Mail", body: "Danke für Ihre Anfrage für frühen Zugang zu Dar Tahara. Bitte bestätigen Sie Ihre E-Mail, damit wir Sie informieren können, sobald der Service in Ihrer Region startet.", button: "E-Mail bestätigen", ignore: "Falls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail.", expiry: "Dieser Link läuft in 48 Stunden ab." },
  pt: { subject: "Confirme o seu pedido de acesso antecipado à Dar Tahara", heading: "Confirme o seu e-mail", body: "Obrigado por pedir acesso antecipado à Dar Tahara. Confirme o seu e-mail para o mantermos informado e avisarmos quando o serviço abrir na sua região.", button: "Confirmar o meu e-mail", ignore: "Se não foi você a solicitar, ignore este e-mail.", expiry: "Este link expira em 48 horas." },
};

const WELCOME: Record<Locale, WelcomeCopy> = {
  en: { subject: "You're on the Dar Tahara early-access list", heading: "Welcome to early access", body: "Your email is confirmed. You're now on the Dar Tahara early-access list.", cityLine: (c) => `We'll contact you when service becomes available for your property in ${c}.`, notBooking: "This is not a confirmed booking — it's your place in line. We'll reach out as we open your area.", shareHeading: "Invite friends and family", shareBody: "Share your personal invitation link — it helps us bring Dar Tahara to your city sooner.", button: "Open my referral tools" },
  fr: { subject: "Vous êtes sur la liste d'accès anticipé Dar Tahara", heading: "Bienvenue dans l'accès anticipé", body: "Votre e-mail est confirmé. Vous êtes maintenant sur la liste d'accès anticipé Dar Tahara.", cityLine: (c) => `Nous vous contacterons dès que le service sera disponible pour votre bien à ${c}.`, notBooking: "Ceci n'est pas une réservation confirmée — c'est votre place dans la file. Nous vous contacterons à l'ouverture de votre région.", shareHeading: "Invitez vos proches", shareBody: "Partagez votre lien d'invitation personnel — cela nous aide à arriver plus vite dans votre ville.", button: "Ouvrir mes outils de parrainage" },
  ar: { subject: "أنت الآن على قائمة الوصول المبكر لدار طهارة", heading: "مرحبًا بك في الوصول المبكر", body: "تم تأكيد بريدك الإلكتروني. أنت الآن على قائمة الوصول المبكر لدار طهارة.", cityLine: (c) => `سنتواصل معك عند توفّر الخدمة لعقارك في ${c}.`, notBooking: "هذا ليس حجزًا مؤكدًا — إنه مكانك في القائمة. سنتواصل معك عند افتتاح منطقتك.", shareHeading: "ادعُ العائلة والأصدقاء", shareBody: "شارك رابط دعوتك الشخصي — فهذا يساعدنا على الوصول إلى مدينتك أسرع.", button: "فتح أدوات الإحالة" },
  nl: { subject: "U staat op de Dar Tahara early-access-lijst", heading: "Welkom bij early access", body: "Uw e-mail is bevestigd. U staat nu op de Dar Tahara early-access-lijst.", cityLine: (c) => `We nemen contact op zodra de dienst beschikbaar is voor uw woning in ${c}.`, notBooking: "Dit is geen bevestigde boeking — het is uw plek in de rij. We nemen contact op als we uw regio openen.", shareHeading: "Nodig familie en vrienden uit", shareBody: "Deel uw persoonlijke uitnodigingslink — zo brengen we Dar Tahara sneller naar uw stad.", button: "Mijn verwijshulpmiddelen openen" },
  es: { subject: "Estás en la lista de acceso anticipado de Dar Tahara", heading: "Bienvenido al acceso anticipado", body: "Tu correo está confirmado. Ya estás en la lista de acceso anticipado de Dar Tahara.", cityLine: (c) => `Te contactaremos cuando el servicio esté disponible para tu propiedad en ${c}.`, notBooking: "Esto no es una reserva confirmada — es tu lugar en la fila. Te avisaremos al abrir tu zona.", shareHeading: "Invita a familiares y amigos", shareBody: "Comparte tu enlace de invitación personal — nos ayuda a llegar antes a tu ciudad.", button: "Abrir mis herramientas de referidos" },
  de: { subject: "Sie stehen auf der Dar Tahara Early-Access-Liste", heading: "Willkommen beim frühen Zugang", body: "Ihre E-Mail ist bestätigt. Sie stehen jetzt auf der Dar Tahara Early-Access-Liste.", cityLine: (c) => `Wir melden uns, sobald der Service für Ihre Immobilie in ${c} verfügbar ist.`, notBooking: "Dies ist keine bestätigte Buchung — es ist Ihr Platz in der Warteliste. Wir melden uns, sobald wir Ihre Region eröffnen.", shareHeading: "Laden Sie Familie und Freunde ein", shareBody: "Teilen Sie Ihren persönlichen Einladungslink — so bringen wir Dar Tahara schneller in Ihre Stadt.", button: "Meine Empfehlungstools öffnen" },
  pt: { subject: "Está na lista de acesso antecipado da Dar Tahara", heading: "Bem-vindo ao acesso antecipado", body: "O seu e-mail está confirmado. Está agora na lista de acesso antecipado da Dar Tahara.", cityLine: (c) => `Entraremos em contacto quando o serviço estiver disponível para o seu imóvel em ${c}.`, notBooking: "Isto não é uma reserva confirmada — é o seu lugar na fila. Entraremos em contacto ao abrir a sua região.", shareHeading: "Convide família e amigos", shareBody: "Partilhe o seu link de convite pessoal — ajuda-nos a chegar mais cedo à sua cidade.", button: "Abrir as minhas ferramentas de indicação" },
};

function shell(dir: "ltr" | "rtl", inner: string): string {
  const align = dir === "rtl" ? "right" : "left";
  return `<!doctype html><html dir="${dir}"><body style="margin:0;background:#faf8f3;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#26241f;">
    <div style="max-width:540px;margin:0 auto;padding:40px 24px;">
      <div style="background:#fff;border:1px solid #e8e0d0;border-radius:16px;padding:32px;text-align:${align};">
        <div style="font-size:20px;font-weight:700;color:#2f4a29;">Dar Tahara</div>
        ${inner}
      </div>
    </div>
  </body></html>`;
}

async function send(to: string, subject: string, html: string): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAILING_FROM_EMAIL || "Dar Tahara <hello@dartahara.com>";
  if (!apiKey) return { sent: false, reason: "email_provider_not_configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
      cache: "no-store",
    });
    return { sent: res.ok, reason: res.ok ? undefined : `provider_${res.status}` };
  } catch {
    return { sent: false, reason: "provider_error" };
  }
}

export async function sendVerificationEmail(params: {
  email: string; token: string; locale: Locale; baseUrl: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const copy = VERIFY[params.locale] ?? VERIFY.en;
  const dir = getDir(params.locale);
  const url = `${params.baseUrl}/api/early-access/verify?token=${encodeURIComponent(params.token)}&locale=${params.locale}`;
  const inner = `
    <h1 style="font-size:22px;margin:20px 0 8px;">${copy.heading}</h1>
    <p style="font-size:15px;line-height:1.6;color:#574a3c;">${copy.body}</p>
    <a href="${url}" style="display:inline-block;margin:20px 0;background:#2f4a29;color:#faf8f3;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px;">${copy.button}</a>
    <p style="font-size:12px;color:#9c8562;">${copy.expiry}</p>
    <p style="font-size:12px;color:#9c8562;">${copy.ignore}</p>`;
  return send(params.email, copy.subject, shell(dir, inner));
}

export async function sendWelcomeEmail(params: {
  email: string; locale: Locale; baseUrl: string; city?: string | null; referralCode?: string | null;
}): Promise<{ sent: boolean; reason?: string }> {
  const copy = WELCOME[params.locale] ?? WELCOME.en;
  const dir = getDir(params.locale);
  const successUrl = `${params.baseUrl}/${params.locale}/early-access/success${params.referralCode ? `?ref=${encodeURIComponent(params.referralCode)}` : ""}`;
  const cityLine = params.city ? `<p style="font-size:15px;line-height:1.6;color:#574a3c;">${copy.cityLine(params.city)}</p>` : "";
  const inner = `
    <h1 style="font-size:22px;margin:20px 0 8px;">${copy.heading}</h1>
    <p style="font-size:15px;line-height:1.6;color:#574a3c;">${copy.body}</p>
    ${cityLine}
    <p style="font-size:13px;line-height:1.6;color:#7a6a55;background:#f5efe2;border-radius:10px;padding:12px 14px;">${copy.notBooking}</p>
    <h2 style="font-size:17px;margin:22px 0 6px;">${copy.shareHeading}</h2>
    <p style="font-size:14px;line-height:1.6;color:#574a3c;">${copy.shareBody}</p>
    <a href="${successUrl}" style="display:inline-block;margin:16px 0 4px;background:#2f4a29;color:#faf8f3;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px;">${copy.button}</a>`;
  return send(params.email, copy.subject, shell(dir, inner));
}

export function isEarlyAccessEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
