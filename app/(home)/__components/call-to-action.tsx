import { Button } from '@/components/ui/button'
import React from 'react'

const CallToAction: React.FC = () => {
    return (
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8
      bg-linear-to-br from-primary via-primary/90 to-primary/80
    ">
            {/* Subtle overlay pattern */}
            <div
                className="
          pointer-events-none absolute inset-0 opacity-10
          bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]
        "
            />

            <div className="relative z-10 mx-auto max-w-4xl text-center">
                <h2 className="mb-6 text-4xl sm:text-5xl font-bold text-primary-foreground">
                    Ready to Find Your Dream Property?
                </h2>

                <p className="mb-8 text-xl text-primary-foreground/80">
                    Join thousands of satisfied customers who found their perfect home with AawasHub
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        size="lg"
                        variant="secondary"
                        className="rounded-full px-8 shadow-lg"
                    >
                        Get Started Now
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full px-8"
                    >
                        Learn More
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default CallToAction
