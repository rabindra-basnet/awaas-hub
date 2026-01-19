// export default function AboutPage() {
//     return (
//         <div>About Section</div>
//     )
// }

export default function AboutUsPage() {
  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight mb-12">
        About AawaasHub
      </h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
          <p className="text-muted-foreground">
            AawaasHub is Nepal's modern property management platform, built to simplify the way landlords, tenants, and property managers handle rentals, maintenance, payments, and communication — all in one secure, user-friendly place.
          </p>
          <p className="text-muted-foreground mt-4">
            Launched with the vision of bringing transparency, efficiency, and trust to Nepal's fast-growing real estate market, we combine smart technology with a deep understanding of local needs.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-muted-foreground">
            To empower property owners and tenants across Nepal with tools that save time, reduce hassle, and build better relationships — whether you're managing a single flat in Kathmandu or a portfolio of apartments in Pokhara and beyond.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Easy online property listing and tenant screening</li>
            <li>Secure online rent collection and automated reminders</li>
            <li>Maintenance request tracking with photo uploads and status updates</li>
            <li>Digital lease agreements and document storage</li>
            <li>Transparent communication between landlords and tenants</li>
            <li>Mobile-friendly experience for users on the go</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Why AawaasHub?</h2>
          <p className="text-muted-foreground">
            In a market where property management often relies on notebooks, phone calls, and manual follow-ups, we bring everything into the digital age — while keeping things simple, affordable, and compliant with Nepali laws.
          </p>
          <p className="text-muted-foreground mt-4">
            We are committed to data privacy, fair practices, and continuous improvement based on feedback from real users like you.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Trust</strong> — We prioritize security and transparency in every transaction and interaction.</li>
            <li><strong>Simplicity</strong> — Powerful tools don't need to be complicated.</li>
            <li><strong>Local Focus</strong> — Built for Nepal, with features shaped by Nepali users and regulations.</li>
            <li><strong>Innovation</strong> — Always evolving to solve real problems in property management.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          <p className="text-muted-foreground">
            Have questions, suggestions, or just want to say hello? We're here to help.
            Reach us at <a href="mailto:support@aawaashub.com" className="text-primary hover:underline">support@aawaashub.com</a> or through the contact form in the app.
          </p>
        </section>

        <p className="text-sm text-muted-foreground mt-16">
          Last updated: January 18, 2026
        </p>
      </div>
    </>
  );
}