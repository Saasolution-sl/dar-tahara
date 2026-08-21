import { MfaSecurityPanel } from "@/components/auth/MfaSecurityPanel";
import { isLocale } from "@/i18n/config";
import { requireAuth } from "@/lib/portal-auth";
import { safeNextPath } from "@/lib/portal-routing";
import { getRequestLocale } from "@/lib/request-locale";

export const metadata = { title: "Account security · Dar Tahara", robots: { index: false, follow: false } };

const copies = {
  en: {
    title: "Account security",
    loading: "Checking your security settings…",
    protected: "Two-factor authentication is active",
    protectedBody: "This session has completed the required authenticator challenge.",
    enrollTitle: "Authenticator verification required",
    enrollBody: "Privileged Dar Tahara accounts require a time-based code. Scan the QR code with your authenticator app, retain its recovery information securely, and enter the current six-digit code.",
    start: "Set up authenticator",
    secret: "Manual setup key",
    code: "Six-digit code",
    verify: "Verify and continue",
    verifying: "Verifying…",
    error: "The authenticator operation failed. Check the code and try again.",
  },
  nl: {
    title: "Accountbeveiliging",
    loading: "Beveiligingsinstellingen controleren…",
    protected: "Tweestapsverificatie is actief",
    protectedBody: "Deze sessie heeft de vereiste authenticatorcontrole voltooid.",
    enrollTitle: "Authenticatorcontrole vereist",
    enrollBody: "Bevoorrechte Dar Tahara-accounts vereisen een tijdgebonden code. Scan de QR-code met uw authenticator-app, bewaar de herstelgegevens veilig en voer de actuele zescijferige code in.",
    start: "Authenticator instellen",
    secret: "Handmatige instelsleutel",
    code: "Zescijferige code",
    verify: "Verifiëren en doorgaan",
    verifying: "Controleren…",
    error: "De authenticatorbewerking is mislukt. Controleer de code en probeer opnieuw.",
  },
} as const;

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  await requireAuth();
  const locale = await getRequestLocale();
  const copy = isLocale(locale) && locale === "nl" ? copies.nl : copies.en;
  const { next } = await searchParams;
  return <main className="min-h-screen bg-background px-4 py-12 text-foreground sm:px-6">
    <section className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Dar Tahara</p>
      <h1 className="mt-2 font-serif text-4xl">{copy.title}</h1>
      <div className="mt-7"><MfaSecurityPanel next={safeNextPath(next)} copy={copy} /></div>
    </section>
  </main>;
}
