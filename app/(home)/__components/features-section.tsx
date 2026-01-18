import React, { JSX } from 'react'

interface Feature {
    icon: JSX.Element
    title: string
    description: string
}

interface FeaturesSectionProps {
    features: Feature[]
    featureSectionRef: React.RefObject<HTMLDivElement>
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({
    features,
    featureSectionRef
}) => {
    return (
        <section
            id="features"
            className="py-20 px-4 sm:px-6 lg:px-8 bg-background"
        >
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-4xl font-bold text-foreground">
                        Why Choose AawasHub?
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Nepal&apos;s most trusted property marketplace
                    </p>
                </div>

                {/* Features grid */}
                <div
                    ref={featureSectionRef}
                    className="
            grid gap-8 md:grid-cols-3
            opacity-0 translate-y-8
            transition-all duration-1000
          "
                >
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="
                group rounded-2xl p-8
                border border-border
                bg-linear-to-br from-card to-accent/30
                transition-all duration-300
                hover:-translate-y-2 hover:shadow-xl
              "
                        >
                            <div
                                className="
                  mb-4 inline-flex rounded-xl
                  bg-card p-4
                  transition-transform
                  group-hover:scale-110
                "
                            >
                                {feature.icon}
                            </div>

                            <h3 className="mb-3 text-xl font-bold text-foreground">
                                {feature.title}
                            </h3>

                            <p className="text-muted-foreground">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeaturesSection
