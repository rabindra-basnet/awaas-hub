'use client'
import { useState, useEffect, useRef } from 'react'
import { Shield, CheckCircle, Home } from 'lucide-react'
import HeroSection from './__components/hero-section'
import FeaturesSection from './__components/features-section'
import FeaturedProperties from './__components/featured-properties'
import CallToAction from './__components/call-to-action'
import Header from '@/components/header'
import Footer from './__components/footer'


const propertiesData = [
    {
        id: 1,
        title: 'Modern Apartment in Jhamsikhel',
        location: 'Jhamsikhel, Lalitpur',
        price: 'NPR 35,000/month',
        type: 'Rent',
        beds: 2,
        baths: 1,
        image: '/modern-apartment.png',
        verified: true
    },
    {
        id: 2,
        title: 'Commercial Space in Baneshwor',
        location: 'New Baneshwor, Kathmandu',
        price: 'NPR 1,20,000/month',
        type: 'Rent',
        beds: 0,
        baths: 2,
        image: '/commercial_space_in_baneshwor.png',
        verified: true
    },
    {
        id: 3,
        title: 'Luxury House on Sale',
        location: 'Budhanilkantha, Kathmandu',
        price: 'NPR 4.5 Cr',
        type: 'Sale',
        beds: 5,
        baths: 4,
        image: '/luxury-house.png',
        verified: true
    }
]

const featuresData = [
    {
        icon: <Shield className='h-8 w-8 text-orange-500' />,
        title: 'Verified Listings',
        description:
            'Every property is verified by our team to ensure authenticity and quality.'
    },
    {
        icon: <CheckCircle className='h-8 w-8 text-orange-500' />,
        title: 'Secure Transactions',
        description:
            'Your data and transactions are protected with bank-level security.'
    },
    {
        icon: <Home className='h-8 w-8 text-orange-500' />,
        title: 'Wide Selection',
        description: 'Find apartments, houses, commercial spaces across Nepal.'
    },
]

const HomePage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Refs for animations
    const heroHeadlineRef = useRef<HTMLDivElement>(null!)
    const searchBarRef = useRef<HTMLDivElement>(null!)
    const featureSectionRef = useRef<HTMLDivElement>(null!)

    useEffect(() => {
        const timeline = [
            { ref: heroHeadlineRef, delay: 100 },
            { ref: searchBarRef, delay: 300 },
            { ref: featureSectionRef, delay: 500 }
        ]

        timeline.forEach(({ ref, delay }) => {
            if (ref.current) {
                setTimeout(() => {
                    ref.current?.classList.add('opacity-100', 'translate-y-0')
                }, delay)
            }
        })
    }, [])

    return (
        <div className='min-h-screen bg-linear-to-br from-gray-50 to-orange-50 font-sans text-gray-800'>
            <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            <HeroSection
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <FeaturesSection
                features={featuresData}
                featureSectionRef={featureSectionRef}
            />

            <FeaturedProperties properties={propertiesData} />

            <CallToAction />

            <Footer />

            <style jsx>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
        </div>
    )
}

export default HomePage
