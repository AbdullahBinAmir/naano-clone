import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 2026">
      <section>
        <h2>The service</h2>
        <p>
          Naano connects brands with LinkedIn creators for sponsored posts. Brands publish briefs and book creators;
          creators publish a card, apply to briefs and deliver posts from their own LinkedIn accounts.
        </p>
      </section>
      <section>
        <h2>Accounts</h2>
        <ul>
          <li>You must provide accurate information and keep your password secure.</li>
          <li>An account is either a creator or a brand account; you are responsible for activity under it.</li>
          <li>We may suspend accounts that break these terms or misuse the platform.</li>
        </ul>
      </section>
      <section>
        <h2>Bookings and payments</h2>
        <p>
          Prices are set by creators and agreed before a post is booked. In this test build all balances and payouts are
          simulated — no money is charged or paid out. Payment terms will be published before real payments are enabled.
        </p>
      </section>
      <section>
        <h2>Content and conduct</h2>
        <ul>
          <li>Creators keep editorial control of what they publish and must follow LinkedIn&apos;s rules and applicable advertising disclosure requirements.</li>
          <li>Do not upload content you do not have the right to use, or content that is unlawful, misleading or abusive.</li>
          <li>Do not attempt to access other users&apos; data or disrupt the service.</li>
        </ul>
      </section>
      <section>
        <h2>Liability</h2>
        <p>The service is provided as is during testing, without warranties, to the extent permitted by law.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>Questions about these terms? Contact the Naano team through your test coordinator.</p>
      </section>
    </LegalPage>
  );
}
