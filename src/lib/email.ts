import "server-only";
import type { Locale } from "@/i18n/config";

/**
 * Double opt-in confirmation email. Sent via Resend when RESEND_API_KEY and
 * MAILING_FROM_EMAIL are configured; otherwise a no-op (the subscriber is
 * stored as unconfirmed and no email is sent — documented in the README).
 *
 * Content is localised to the subscriber's detected/selected language and every
 * message carries an unsubscribe link.
 */

type EmailCopy = {
  subject: string;
  heading: string;
  body: string;
  button: string;
  ignore: string;
  unsubscribe: string;
};

const COPY: Record<Locale, EmailCopy> = {
  en: {
    subject: "Confirm your Dar Tahara subscription",
    heading: "One quick step",
    body: "Please confirm your email to join the Dar Tahara early-access list. We'll let you know the moment our cleaning subscriptions go live.",
    button: "Confirm my email",
    ignore: "If you didn't request this, you can safely ignore this email.",
    unsubscribe: "Unsubscribe",
  },
  nl: {
    subject: "Bevestig uw Dar Tahara-inschrijving",
    heading: "Nog één stap",
    body: "Bevestig uw e-mailadres om lid te worden van de early-access-lijst van Dar Tahara. We laten het u weten zodra onze schoonmaakabonnementen live gaan.",
    button: "Mijn e-mail bevestigen",
    ignore: "Heeft u dit niet aangevraagd? Dan kunt u deze e-mail negeren.",
    unsubscribe: "Uitschrijven",
  },
  fr: {
    subject: "Confirmez votre inscription à Dar Tahara",
    heading: "Une dernière étape",
    body: "Confirmez votre e-mail pour rejoindre la liste d'accès anticipé de Dar Tahara. Nous vous préviendrons dès le lancement de nos formules de ménage.",
    button: "Confirmer mon e-mail",
    ignore: "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.",
    unsubscribe: "Se désabonner",
  },
  ar: {
    subject: "أكّد اشتراكك في دار طهارة",
    heading: "خطوة أخيرة",
    body: "يرجى تأكيد بريدك الإلكتروني للانضمام إلى قائمة الوصول المبكر لدار طهارة. سنُعلمك فور إطلاق باقات التنظيف لدينا.",
    button: "تأكيد بريدي الإلكتروني",
    ignore: "إذا لم تطلب هذا، يمكنك تجاهل هذه الرسالة بأمان.",
    unsubscribe: "إلغاء الاشتراك",
  },
  es: {
    subject: "Confirma tu suscripción a Dar Tahara",
    heading: "Un último paso",
    body: "Confirma tu correo para unirte a la lista de acceso anticipado de Dar Tahara. Te avisaremos en cuanto se activen nuestras suscripciones de limpieza.",
    button: "Confirmar mi correo",
    ignore: "Si no solicitaste esto, puedes ignorar este correo.",
    unsubscribe: "Cancelar suscripción",
  },
  de: {
    subject: "Bestätigen Sie Ihr Dar Tahara-Abonnement",
    heading: "Nur noch ein Schritt",
    body: "Bitte bestätigen Sie Ihre E-Mail, um der Early-Access-Liste von Dar Tahara beizutreten. Wir informieren Sie, sobald unsere Reinigungsabos verfügbar sind.",
    button: "E-Mail bestätigen",
    ignore: "Falls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail einfach.",
    unsubscribe: "Abmelden",
  },
  pt: {
    subject: "Confirme a sua subscrição da Dar Tahara",
    heading: "Só mais um passo",
    body: "Confirme o seu e-mail para entrar na lista de acesso antecipado da Dar Tahara. Avisamos assim que as nossas subscrições de limpeza forem lançadas.",
    button: "Confirmar o meu e-mail",
    ignore: "Se não foi você a solicitar, pode ignorar este e-mail.",
    unsubscribe: "Cancelar subscrição",
  },
};

function render(copy: EmailCopy, confirmUrl: string, unsubUrl: string, dir: "ltr" | "rtl"): string {
  return `<!doctype html><html dir="${dir}"><body style="margin:0;background:#faf8f3;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#26241f;">
    <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
      <div style="background:#fff;border:1px solid #e8e0d0;border-radius:16px;padding:32px;text-align:${dir === "rtl" ? "right" : "left"};">
        <div style="font-size:20px;font-weight:700;color:#2f4a29;">Dar Tahara</div>
        <h1 style="font-size:22px;margin:20px 0 8px;">${copy.heading}</h1>
        <p style="font-size:15px;line-height:1.6;color:#574a3c;">${copy.body}</p>
        <a href="${confirmUrl}" style="display:inline-block;margin:20px 0;background:#2f4a29;color:#faf8f3;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px;">${copy.button}</a>
        <p style="font-size:12px;color:#9c8562;">${copy.ignore}</p>
      </div>
      <p style="text-align:center;font-size:12px;color:#9c8562;margin-top:16px;">
        <a href="${unsubUrl}" style="color:#9c8562;">${copy.unsubscribe}</a>
      </p>
    </div>
  </body></html>`;
}

export async function sendConfirmationEmail(params: {
  email: string;
  token: string;
  locale: Locale;
  baseUrl: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAILING_FROM_EMAIL;
  if (!apiKey || !from) return { sent: false, reason: "email_provider_not_configured" };

  const copy = COPY[params.locale] ?? COPY.en;
  const dir = params.locale === "ar" ? "rtl" : "ltr";
  const confirmUrl = `${params.baseUrl}/api/confirm?token=${params.token}`;
  const unsubUrl = `${params.baseUrl}/api/unsubscribe?token=${params.token}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: params.email,
        subject: copy.subject,
        html: render(copy, confirmUrl, unsubUrl, dir),
      }),
      cache: "no-store",
    });
    return { sent: res.ok, reason: res.ok ? undefined : `provider_${res.status}` };
  } catch {
    return { sent: false, reason: "provider_error" };
  }
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAILING_FROM_EMAIL);
}
