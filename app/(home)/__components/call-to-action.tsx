import { Button } from '@/components/ui/button'
import React from 'react'

const CallToAction: React.FC = () => {
  return (
    <section className='py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-orange-500 to-orange-600 relative overflow-hidden'>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

      <div className='max-w-4xl mx-auto text-center relative z-10'>
        <h2 className='text-4xl sm:text-5xl font-bold text-white mb-6'>
          Ready to Find Your Dream Property?
        </h2>
        <p className='text-xl text-orange-100 mb-8'>
          Join thousands of satisfied customers who found their perfect home with
          AawasHub
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button className='bg-white text-orange-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition shadow-xl hover:scale-105'>
            Get Started Now
          </Button>
          <Button className='bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-orange-600 transition'>
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CallToAction