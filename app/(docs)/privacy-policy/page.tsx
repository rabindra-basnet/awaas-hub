// export default function PrivacyPolicy() {
//   return <>Privacy Policy Page</>;
// }


export default function PrivacyPolicyPage() {
  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight mb-12">
        Privacy Policy
      </h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-muted-foreground">
            AawaasHub ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our property management platform, website, and related services (collectively, the "Service").
          </p>
          <p className="text-muted-foreground mt-4">
            By accessing or using the Service, you agree to the practices described in this policy. If you do not agree, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <p className="text-muted-foreground">
            We collect information that identifies, relates to, or could reasonably be linked to you ("Personal Information"), including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
            <li>Account data: name, email, phone number, password, address</li>
            <li>Property & tenant data: rental listings, lease details, tenant/landlord identities, payment history</li>
            <li>Payment information: processed securely via third-party providers (we do not store full card details)</li>
            <li>Usage data: IP address, browser type, device info, pages visited, time spent</li>
            <li>Communication data: messages, maintenance requests, support tickets</li>
            <li>Cookies & similar technologies: for authentication, analytics, and preferences</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="text-muted-foreground">
            We use your Personal Information to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
            <li>Provide, maintain, and improve the Service (e.g., manage rentals, process payments, handle maintenance requests)</li>
            <li>Authenticate accounts and prevent fraud</li>
            <li>Communicate with you (updates, support, reminders)</li>
            <li>Comply with legal obligations and enforce our Terms</li>
            <li>Analyze usage to enhance features and user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Sharing Your Information</h2>
          <p className="text-muted-foreground">
            We do not sell your Personal Information. We may share it with:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
            <li>Service providers (payment processors, cloud hosting, analytics tools) under strict confidentiality</li>
            <li>Other users as necessary for the Service (e.g., landlords see tenant contact info for verified rentals)</li>
            <li>Legal authorities if required by Nepali law, court order, or to protect rights/safety</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p className="text-muted-foreground">
            We implement reasonable technical and organizational measures (encryption, access controls, secure hosting) to protect your information. However, no system is completely secure — we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
          <p className="text-muted-foreground">
            Subject to applicable law (including Nepal's Individual Privacy Act, 2018), you may have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
            <li>Access, update, or correct your Personal Information</li>
            <li>Request deletion (subject to legal retention requirements)</li>
            <li>Withdraw consent where processing is consent-based</li>
            <li>Opt out of marketing communications</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            To exercise these rights, contact us at privacy@aawaashub.com. We may verify your identity before responding.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
          <p className="text-muted-foreground">
            We retain Personal Information as long as needed for the purposes outlined here, or as required by law (e.g., for accounting, dispute resolution, or compliance). After that, we securely delete or anonymize it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
          <p className="text-muted-foreground">
            We use cookies and similar technologies for essential functions, analytics, and preferences. You can manage preferences via your browser settings. For details, see our Cookie Policy (if separate) or contact us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
          <p className="text-muted-foreground">
            Our Service is not directed to children under 18. We do not knowingly collect Personal Information from children under 18. If we learn we have, we will delete it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy from time to time. Changes will be posted here with an updated "Last updated" date. Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Governing Law & Contact</h2>
          <p className="text-muted-foreground">
            This Privacy Policy is governed by the laws of Nepal. For questions or concerns, contact us at:
          </p>
          <p className="text-muted-foreground mt-4">
            Email: privacy@aawaashub.com
          </p>
        </section>

        <p className="text-sm text-muted-foreground mt-16">
          Last updated: January 18, 2026
        </p>
      </div>
    </>
  );
}