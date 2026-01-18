export default function TermsAndConditionsPage() {
  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight mb-12">
        Terms and Conditions
      </h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing, browsing, or using our property management platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
          <p className="text-muted-foreground">
            You must be at least 18 years old and legally capable of entering into contracts to use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Provide accurate, current and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized use</li>
            <li>Prohibited: multiple accounts, impersonation, bots</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Property Listings</h2>
          <p className="text-muted-foreground">
            You are solely responsible for the accuracy, legality, and quality of listings you post.
            You grant us a worldwide, non-exclusive, royalty-free, sublicensable license to use, display, reproduce, and distribute your content on the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Payments & Fees</h2>
          <p className="text-muted-foreground">
            Certain features may require payment. All fees are non-refundable unless expressly stated. We may change pricing at any time with notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Prohibited Conduct</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Fraudulent, misleading or illegal listings</li>
            <li>Harassment, discrimination, spam</li>
            <li>Scraping, reverse-engineering, or unauthorized access</li>
            <li>Violating any applicable laws</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            To the maximum extent permitted by law, we provide the Service "as is" and disclaim all warranties. We are not liable for any indirect, incidental, special, consequential or punitive damages.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Indemnification</h2>
          <p className="text-muted-foreground">
            You agree to indemnify and hold us harmless from any claims, losses, or damages arising from your use of the Service or violation of these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
          <p className="text-muted-foreground">
            We may suspend or terminate your access immediately, without notice, for any breach of these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
          <p className="text-muted-foreground">
            These Terms are governed by the laws of Nepal. Any disputes shall be resolved exclusively in the courts of Kathmandu.
          </p>
        </section>

        <p className="text-sm text-muted-foreground mt-16">
          Last updated: January 18, 2026
        </p>
      </div>
    </>
  );
}