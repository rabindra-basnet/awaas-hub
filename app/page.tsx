import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-foreground">RealEstate</h1>
            <div className="flex gap-4">
              <Link href="/login" className="px-4 py-2 text-foreground hover:text-primary transition-smooth">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          <h2 className="text-5xl font-bold text-foreground">Find Your Dream Home</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the perfect property with our modern real estate platform. Connect buyers, sellers, and agents in a
            seamless experience.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-smooth"
            >
              Start Browsing
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border border-border text-foreground rounded-lg hover:bg-muted font-medium transition-smooth"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-foreground mb-12 text-center">Why Choose Our Platform?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "For Buyers",
                description: "Browse thousands of properties, save favorites, and schedule appointments.",
                icon: "🏠",
              },
              {
                title: "For Sellers",
                description: "List your properties, manage inquiries, and track analytics.",
                icon: "📊",
              },
              {
                title: "For Admins",
                description: "Monitor platform activity, manage users, and view comprehensive analytics.",
                icon: "⚙️",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-smooth"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h3 className="text-3xl font-bold text-foreground mb-6">Ready to Get Started?</h3>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of users on our platform. Create your account today and start your real estate journey.
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-smooth"
        >
          Sign Up Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2026 RealEstate Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
