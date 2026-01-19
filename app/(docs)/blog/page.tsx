// export default function BlogPage() {
//     return (
//         <div>Blog Page</div>
//     )
// }

export default function BlogPage() {
  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight mb-12">
        AawaasHub Blog
      </h1>

      <p className="text-xl text-muted-foreground mb-16 max-w-3xl">
        Practical tips, insights, and updates on property management, rentals, 
        and real estate in Nepal — straight from the team building AawaasHub.
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-16">
        {/* Featured / Latest Post Section */}
        <section>
          <h2 className="text-3xl font-semibold mb-8">Latest Articles</h2>

          <div className="space-y-12">
            {/* Example Post 1 */}
            <article className="border-b border-border pb-12 last:border-b-0">
              <h3 className="text-2xl font-bold mb-3">
                <a href="/blog/how-to-collect-rent-on-time-nepal" className="hover:underline">
                  How to Collect Rent On Time: Tips for Nepali Landlords in 2026
                </a>
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                January 10, 2026 • 8 min read
              </p>
              <p className="text-muted-foreground mb-4">
                Late rent payments are one of the biggest headaches for property owners. In this post, we share proven strategies — from polite reminders to digital tools — tailored to Nepal's rental market, including how AawaasHub automates the process.
              </p>
              <a
                href="/blog/how-to-collect-rent-on-time-nepal"
                className="text-primary hover:underline font-medium"
              >
                Read more →
              </a>
            </article>

            {/* Example Post 2 */}
            <article className="border-b border-border pb-12 last:border-b-0">
              <h3 className="text-2xl font-bold mb-3">
                <a href="/blog/maintenance-requests-digital-era" className="hover:underline">
                  From Phone Calls to App: Modern Maintenance Requests in Kathmandu
                </a>
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                December 20, 2025 • 6 min read
              </p>
              <p className="text-muted-foreground mb-4">
                Tenants in busy areas like Lazimpat or Thamel no longer wait days for responses. Discover why switching to digital maintenance tracking saves time, money, and reduces disputes — with real examples from AawaasHub users.
              </p>
              <a
                href="/blog/maintenance-requests-digital-era"
                className="text-primary hover:underline font-medium"
              >
                Read more →
              </a>
            </article>

            {/* Example Post 3 */}
            <article className="border-b border-border pb-12 last:border-b-0">
              <h3 className="text-2xl font-bold mb-3">
                <a href="/blog/nepal-rental-laws-2026-update" className="hover:underline">
                  Key Changes in Nepal's Rental Laws: What Landlords & Tenants Need to Know in 2026
                </a>
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                November 15, 2025 • 10 min read
              </p>
              <p className="text-muted-foreground mb-4">
                Recent amendments to house rent laws affect deposits, evictions, and lease agreements. We break down the updates and explain how AawaasHub helps both parties stay compliant without extra paperwork.
              </p>
              <a
                href="/blog/nepal-rental-laws-2026-update"
                className="text-primary hover:underline font-medium"
              >
                Read more →
              </a>
            </article>
          </div>
        </section>

        {/* Call to Action / Subscribe Section */}
        <section className="bg-muted/50 rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get new posts on property management tips, Nepal real estate trends, 
            and AawaasHub features delivered to your inbox.
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            No spam — unsubscribe anytime.
          </p>
        </section>

        <p className="text-sm text-muted-foreground mt-16 text-center">
          More articles coming soon. Last updated: January 18, 2026
        </p>
      </div>
    </>
  );
}