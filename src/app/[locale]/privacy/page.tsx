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
      <h2>4. Your rights</h2>
      <p>You may request access, correction or deletion of your personal data at any time.</p>
      <h2>5. Contact</h2>
      <p>For privacy enquiries, please contact us.</p>
    </LegalPage>
  );
}
