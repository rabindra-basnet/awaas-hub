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
    <section id='features' className='py-20 px-4 sm:px-6 lg:px-8 bg-white'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-gray-900 mb-4'>
            Why Choose AawasHub?
          </h2>
          <p className='text-lg text-gray-600'>
            Nepal&apos;s most trusted property marketplace
          </p>
        </div>

        <div
          ref={featureSectionRef}
          className='grid md:grid-cols-3 gap-8 opacity-0 translate-y-8 transition-all duration-1000'
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className='bg-linear-to-br from-gray-50 to-orange-50 p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group'
            >
              <div className='bg-white p-4 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform'>
                {feature.icon}
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                {feature.title}
              </h3>
              <p className='text-gray-600'>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection