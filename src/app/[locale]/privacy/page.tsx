import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Dar Tahara collects, uses and safeguards personal data." };

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated="Effective 13 July 2026">
    <p>Dar Tahara is responsible for the personal data described in this policy. This notice applies to our website, mailing list, Initial Home Assessments, subscriptions, operational email and WhatsApp communications.</p>
    <h2>1. Data we collect</h2>
    <p>We collect identity and contact details; billing identifiers and payment status (card details remain with Stripe); service addresses; declared and verified property size, rooms, condition, pets, smoking, access and care notes; appointment choices; assessment observations; quotes, subscriptions and invoices; communications; legal acceptances; and security data such as IP address, user agent and webhook records.</p>
    <h2>2. Why we use data</h2>
    <p>We process data to take steps requested before a contract, perform assessments and subscriptions, collect payment, schedule staff, maintain safety and service quality, answer enquiries, prevent fraud, keep financial and consent records, comply with law and defend legal claims. Marketing is sent only where consent or another lawful basis applies, and you may unsubscribe at any time.</p>
    <h2>3. WhatsApp assistant and automated responses</h2>
    <p>When you message our WhatsApp Business number, Meta processes the message and we may automatically classify its language and topic to provide an FAQ answer. Conversation content, phone number, detected language and delivery status may be logged. Ask for a specialist at any time. Automated answers do not make eligibility, pricing or contractual decisions.</p>
    <h2>4. Service providers and international transfers</h2>
    <p>We use vetted providers including Supabase for application data, Stripe for payments and invoices, Resend or a comparable provider for email, Meta for WhatsApp, and Cloudflare for bot protection. Providers act under their own terms and data-protection commitments. Where data crosses borders, we use an available lawful transfer mechanism and proportionate safeguards.</p>
    <h2>5. Retention</h2>
    <p>Unpaid abandoned bookings are normally removed or anonymised within 90 days. Operational customer records are retained while the relationship is active and ordinarily for up to five years afterward; invoices and legally required accounting records may be kept longer. Support messages are ordinarily retained for two years. Mailing-list data is retained until unsubscribe or the list is retired. Security logs are kept only as long as reasonably needed.</p>
    <h2>6. Sharing and confidentiality</h2>
    <p>Data is shared only with personnel and processors who need it for delivery, with professional advisers, or where law, safety or a corporate transaction requires it. We do not sell personal data. Staff access is role-based and customer-facing database access is restricted by row-level security.</p>
    <h2>7. Your choices and rights</h2>
    <p>Subject to applicable law, you may request access, correction, deletion, restriction, portability or objection; withdraw consent; unsubscribe; or complain to the competent data-protection authority. Some records must be retained for legal obligations or claims. We may verify identity before acting.</p>
    <h2>8. Security and cookies</h2>
    <p>We use encrypted transport, restricted server credentials, signed payment and messaging webhooks, audit events and access controls. No system is risk-free. The site uses essential storage for language, theme, security and admin sessions; optional analytics should be enabled only in accordance with applicable consent requirements.</p>
    <h2>9. Children and changes</h2>
    <p>Our services are not directed to children. We may update this policy and will identify the effective date; material changes will be communicated where appropriate.</p>
    <h2>10. Contact</h2><p>For a privacy request, email <a href={`mailto:${site.email}`}>{site.email}</a> and identify the relevant booking or account.</p>
  </LegalPage>;
}
