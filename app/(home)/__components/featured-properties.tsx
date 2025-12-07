import React from 'react'
import Image from 'next/image'
import { MapPin, CheckCircle, ArrowRight } from 'lucide-react'

interface Property {
  id: number
  title: string
  location: string
  price: string
  type: string
  beds: number
  baths: number
  image: string
  verified: boolean
}

interface FeaturedPropertiesProps {
  properties: Property[]
}

const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  properties
}) => {
  return (
    <section id='properties' className='py-20 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-12'>
          <div>
            <h2 className='text-4xl font-bold text-gray-900 mb-2'>
              Featured Properties
            </h2>
            <p className='text-gray-600'>Handpicked properties just for you</p>
          </div>
          <button className='hidden sm:flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold group'>
            View All
            <ArrowRight className='h-5 w-5 group-hover:translate-x-1 transition-transform' />
          </button>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {properties.map(property => (
            <div
              key={property.id}
              className='bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border border-gray-100'
            >
              {/* This parent div must define the size (h-64) and be relative */}
              <div className='relative h-64 overflow-hidden'>
                <Image
                  src={property.image}
                  alt={property.title}
                  fill={true} // Use 'fill' prop for size inference (equivalent to layout='fill')
                  className='object-cover group-hover:scale-110 transition-transform duration-500' // Use object-cover Tailwind class
                />
                <div className='absolute top-4 left-4 flex gap-2'>
                  <span className='bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold'>
                    {property.type}
                  </span>
                  {property.verified && (
                    <span className='bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1'>
                      <CheckCircle className='h-4 w-4' />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <div className='p-6'>
                <h3 className='text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition'>
                  {property.title}
                </h3>
                <div className='flex items-center text-gray-600 mb-4'>
                  <MapPin className='h-4 w-4 mr-1' />
                  <span className='text-sm'>{property.location}</span>
                </div>

                <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
                  <div className='flex items-center gap-4 text-gray-600 text-sm'>
                    {property.beds > 0 && <span>{property.beds} Beds</span>}
                    <span>{property.baths} Baths</span>
                  </div>
                  <div className='text-xl font-bold text-orange-600'>
                    {property.price}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProperties