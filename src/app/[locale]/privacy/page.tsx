import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Dar Tahara collects, uses and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="Last updated: placeholder — replace before launch.">
      <p>
        This placeholder policy describes how Dar Tahara handles personal information. Replace
        it with your finalised privacy policy, aligned with applicable Moroccan and EU data
        protection requirements, before going live.
      </p>
      <h2>1. Information we collect</h2>
      <p>Contact details, property information and booking preferences you provide to us.</p>
      <h2>2. How we use it</h2>
      <p>To deliver, schedule and improve our services and to communicate with you.</p>
      <h2>3. Data protection</h2>
      <p>We apply appropriate safeguards and treat your information with strict confidentiality.</p>
      <h2>4. Mailing list &amp; launch updates</h2>
      <p>
        If you join our pre-launch mailing list we collect your <strong>email address</strong> and,
        to serve you better, your <strong>preferred language</strong>, approximate
        <strong> country</strong> (derived from your IP address, not GPS), the <strong>signup
        source</strong>, the <strong>date and time</strong> of signup and your <strong>consent
        status</strong>. We use this only to notify you about our launch and service availability.
        Where confirmation email is enabled, we use a double opt-in process. We keep this information
        until you unsubscribe or the list is no longer needed, after which it is deleted.
      </p>
      <p>
        You can <strong>unsubscribe at any time</strong> via the link in every email. We do not use
        the mailing-list signup as consent for unrelated advertising, and we never sell your data.
      </p>
      <p>
        <strong>Processors:</strong> subscriber data is stored with Supabase. Bot
        protection may use Cloudflare Turnstile. Confirmation and update emails may be delivered by
        an email provider (e.g. Resend). Analytics events are privacy-conscious and never include
        your email address.
      </p>
      <h2>5. Your rights</h2>
      <p>You may request access, correction or deletion of your personal data at any time.</p>
      <h2>6. Contact</h2>
      <p>For privacy enquiries, please contact us.</p>
    </LegalPage>
  );
}
