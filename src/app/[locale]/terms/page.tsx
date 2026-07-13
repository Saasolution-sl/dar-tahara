import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Service", description: "Terms governing Dar Tahara home assessments and subscriptions." };

export default function TermsPage() {
  return <LegalPage title="Terms of Service" updated="Effective 13 July 2026">
    <p>These Terms govern bookings and subscriptions supplied by Dar Tahara in Morocco. By paying for an Initial Home Assessment or accepting a subscription, you agree to these Terms and the order summary shown before payment.</p>
    <h2>1. Initial Home Assessment</h2>
    <p>An Initial Home Assessment is mandatory before any recurring service begins. It is a separate, one-time, prepaid service covering a professional visit, verification of the home information, a cleaning profile and, where reasonably achievable during the allocated visit, initial cleaning. Payment reserves the requested appointment but remains subject to our scheduling confirmation.</p>
    <p>The assessment fee is not a subscription payment and does not guarantee approval for recurring service. If the declared size, condition, access requirements, safety conditions or workload differ materially from the booking, we may propose an additional deep-clean fee, a revised recurring price or decline ongoing service.</p>
    <h2>2. Customer information and access</h2>
    <p>You must provide accurate property, contact, pet, smoking, access and safety information and ensure lawful, safe access at the agreed time. You remain responsible for valuables, hazardous materials, unstable fittings and disclosing risks. Keys or access codes accepted by us are handled only for service delivery and must not be shared through insecure channels unless we expressly instruct you to do so.</p>
    <h2>3. Scheduling, rescheduling and cancellation</h2>
    <p>You may request a change at least 48 hours before an assessment or scheduled visit. Requests are subject to availability. Cancellations made at least 48 hours beforehand are eligible for a refund of the assessment or visit charge, less non-refundable payment processing costs where lawful. Later cancellations, denied access or no-shows may be charged in full. We may waive a charge for a documented emergency.</p>
    <h2>4. Subscription approval and billing</h2>
    <p>A subscription begins only when the assessment is approved and you complete the separate secure subscription checkout. Monthly plans renew monthly. Annual plans are prepaid for twelve months and include the discount displayed at checkout. Stripe processes card payments and may store a payment method for future charges. Prices include only the scope stated in your plan; extras require approval.</p>
    <p>We will communicate material price changes before they take effect. Failed payments may pause service. You may request a frequency or address change; a new assessment or price may be required. Pausing and cancellation take effect as confirmed by us and do not erase charges already incurred. Statutory consumer rights remain unaffected.</p>
    <h2>5. Quality, damage and complaints</h2>
    <p>Please report a service concern or alleged damage within 48 hours, with reasonable evidence, so we can investigate. Where we are responsible, our first remedy may be a return visit, repair, replacement or an appropriate credit. We are not responsible for pre-existing damage, ordinary wear, undisclosed fragility, inherent defects or events outside reasonable control.</p>
    <h2>6. Liability</h2>
    <p>Nothing excludes liability that cannot lawfully be excluded. Subject to that rule, our aggregate liability arising from a service is limited to the amount paid for the affected service or, for a subscription claim, the fees paid during the preceding three months. We are not liable for indirect business losses.</p>
    <h2>7. Communications and acceptable use</h2>
    <p>We may send operational email and WhatsApp messages about bookings, payments, assessments, quotes and renewals. You must not misuse our website, staff, messaging assistant or payment systems. Automated answers are general service information; a specialist confirms exceptional arrangements.</p>
    <h2>8. Privacy, changes and law</h2>
    <p>Our Privacy Policy explains personal-data processing. We may update these Terms prospectively; the version accepted at checkout is recorded with your booking. These Terms are governed by Moroccan law, and disputes are subject to the competent Moroccan courts unless mandatory consumer law provides otherwise.</p>
    <h2>9. Contact</h2><p>Questions or formal notices may be sent to <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
  </LegalPage>;
}
