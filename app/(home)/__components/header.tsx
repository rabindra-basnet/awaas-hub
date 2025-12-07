import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { gsap } from 'gsap'

interface HeaderProps {
  isMenuOpen: boolean
  setIsMenuOpen: (isOpen: boolean) => void
}

const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const navRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // GSAP animation for slide-down on mount
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        duration: 0.8,
        y: -100,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.1
      })
    }
  }, [])

  const navItems = [
    { name: 'Home', href: '#' },
    { name: 'Properties', href: '#properties' },
    { name: 'Features', href: '#features' },
    { name: 'Contact', href: '#contact' }
  ]

  return (
    <div
      ref={containerRef}
      className='fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 p-0.5'
    >
      {/* 2. GRADIENT BORDER EFFECT */}
      <div className='bg-linear-to-r from-orange-500/95 via-orange-500/95 to-red-400/95 shadow-2xl rounded-xl'>
        <nav
          ref={navRef}
          className='bg-white/95 backdrop-blur-sm rounded-[11px] overflow-hidden'
        >
          <div className='mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center h-20'>
              {/* Logo */}
              <div className='flex items-center space-x-2'>
                <Link href={'/'}>
                  <Image
                    src='/home-logo.png'
                    alt='Awaas Hub - Secure Property Management System Logo'
                    width={1000}
                    height={1000}
                    className='h-[72px] w-auto'
                    priority
                  />
                </Link>
              </div>

              {/* Desktop Menu */}
              <div className='hidden md:flex items-center space-x-8'>
                {navItems.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className='text-gray-700 hover:text-orange-600 transition font-medium'
                  >
                    {item.name}
                  </Link>
                ))}
                <Link href='/list-property'>
                  <Button className='bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition shadow-lg font-medium'>
                    List Property
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <Button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className='md:hidden text-gray-700 hover:text-orange-600 transition'
              >
                {isMenuOpen ? (
                  <X className='h-6 w-6' />
                ) : (
                  <Menu className='h-6 w-6' />
                )}
              </Button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className='md:hidden py-4 space-y-3 border-t border-gray-100'>
                {navItems.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className='block text-gray-700 hover:text-orange-600 transition font-medium py-2 px-4'
                  >
                    {item.name}
                  </Link>
                ))}
                <Link href='/list-property' className='block w-full px-4 pt-2'>
                  <Button className='w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition shadow-lg font-medium'>
                    List Property
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Header
