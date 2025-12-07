import React from 'react'
import { Search, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  heroHeadlineRef: React.RefObject<HTMLDivElement>
  searchBarRef: React.RefObject<HTMLDivElement>
}

const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  heroHeadlineRef,
  searchBarRef
}) => {
  return (
    <section className='relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden'>
      {/* Decorative background elements */}
      <div className='absolute top-0 right-0 w-96 h-96 bg-orange-300 rounded-full blur-3xl opacity-20 animate-pulse'></div>
      <div
        className='absolute bottom-0 left-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-20 animate-pulse'
        style={{ animationDelay: '1s' }}
      ></div>

      <div className='max-w-7xl mx-auto relative z-10'>
        <div
          ref={heroHeadlineRef}
          className='text-center mb-12 opacity-0 translate-y-8 transition-all duration-1000'
        >
          <h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight'>
            Find Your Perfect
            <span className='block mt-2 bg-linear-to-r from-orange-600 via-yellow-500 to-orange-600 bg-clip-text text-transparent animate-gradient'>
              Property in Nepal
            </span>
          </h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            Discover verified properties for rent and sale across Kathmandu
            Valley and beyond.
          </p>
        </div>

        {/* Search Bar */}
        <div
          ref={searchBarRef}
          className='max-w-4xl mx-auto opacity-0 translate-y-8 transition-all duration-1000'
        >
          <div className='bg-white rounded-2xl shadow-2xl p-4 sm:p-6 border border-gray-100'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1 relative'>
                <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder='Search by location, property type, or upload image...'
                  className='w-full pl-12 pr-32 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition'
                />
                <label className='absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer'>
                  <input
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setSearchQuery(`Searching by image: ${file.name}`)
                      }
                    }}
                  />
                  <div className='flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg transition group'>
                    <svg
                      className='h-5 w-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                    <span className='text-sm font-medium'>Image</span>
                  </div>
                </label>
              </div>
              <div className='relative sm:w-48'>
                <MapPin className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                <select className='w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition appearance-none bg-white'>
                  <option>All Cities</option>
                  <option>Kathmandu</option>
                  <option>Lalitpur</option>
                  <option>Bhaktapur</option>
                  <option>Pokhara</option>
                </select>
              </div>
              <Button className='bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl transition shadow-lg shadow-orange-200 font-semibold flex items-center justify-center gap-2 group'>
                Search
                <ArrowRight className='h-5 w-5 group-hover:translate-x-1 transition-transform' />
              </Button>
            </div>

            {/* Quick filters */}
            <div className='flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100'>
              <Button className='px-4 py-2 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition text-sm font-medium'>
                Apartments
              </Button>
              <Button className='px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition text-sm font-medium'>
                Houses
              </Button>
              <Button className='px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition text-sm font-medium'>
                Commercial
              </Button>
              <Button className='px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition text-sm font-medium'>
                Land
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
