import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of Dar Tahara services.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="Last updated: placeholder — replace before launch.">
      <p>
        These placeholder terms outline the relationship between Dar Tahara and its clients.
        Replace this content with your finalised legal terms prepared with qualified counsel
        before going live.
      </p>
      <h2>1. Services</h2>
      <p>
        Dar Tahara provides premium home care and property concierge services as described on
        this website and in your individual service agreement.
      </p>
      <h2>2. Bookings & scheduling</h2>
      <p>Details on booking, rescheduling and cancellation policies to be added.</p>
      <h2>3. Access & key holding</h2>
      <p>Terms covering secure key custody, logged access and liability to be added.</p>
      <h2>4. Payments</h2>
      <p>Billing cycles, subscription terms and refunds to be added.</p>
      <h2>5. Liability</h2>
      <p>Limitations of liability and insurance coverage to be added.</p>
      <h2>6. Contact</h2>
      <p>For any questions about these terms, please contact us.</p>
    </LegalPage>
  );
}
