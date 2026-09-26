import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 2026">
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Account details: your name, email address and role.</li>
          <li>Profile content you add: display name, headline, bio, photos, price, company details.</li>
          <li>Activity in the product: briefs, applications, collaborations, messages and simulated earnings.</li>
          <li>Card views on public creator cards, used to show creators how often their card is opened.</li>
        </ul>
      </section>
      <section>
        <h2>How we use it</h2>
        <p>To run the marketplace, show your profile to the people you work with, send account emails (such as password resets) and keep the service secure.</p>
      </section>
      <section>
        <h2>What is public</h2>
        <p>
          A published creator card — name, photo, headline, bio, tags, follower count and price per post — is visible to
          anyone with the link and may appear on the Naano website. Brand names may appear on the site once a brief is
          published. Messages are only visible to the people in the conversation.
        </p>
      </section>
      <section>
        <h2>Where it is stored</h2>
        <p>Data is stored with our infrastructure provider, Supabase, and the site is hosted on Vercel. We do not sell personal data.</p>
      </section>
      <section>
        <h2>Your choices</h2>
        <ul>
          <li>Edit or remove your profile details and photos at any time in Settings and My card.</li>
          <li>Unpublish your card to make it private.</li>
          <li>Ask the Naano team to delete your account and data.</li>
        </ul>
      </section>
    </LegalPage>
  );
}
