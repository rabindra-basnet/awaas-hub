import React from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'

const Footer: React.FC = () => {
  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Properties', href: '/properties' },
    { name: 'Agents', href: '/agents' },
    { name: 'Blog', href: '/blog' }
  ]

  const supportLinks = [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' }
  ]

  return (
    <footer className='bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid md:grid-cols-4 gap-8 mb-8'>
          {/* Company Info */}
          <div>
            <div className='flex items-center space-x-2 mb-4'>
              <div className='bg-orange-500 p-2 rounded-lg'>
                <Home className='h-6 w-6 text-white' />
              </div>
              <span className='text-2xl font-bold'>AawasHub</span>
            </div>
            <p className='text-gray-400'>
              Your trusted partner in finding the perfect property in Nepal.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className='font-bold mb-4'>Quick Links</h4>
            <ul className='space-y-2 text-gray-400'>
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='hover:text-orange-400 transition'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className='font-bold mb-4'>Support</h4>
            <ul className='space-y-2 text-gray-400'>
              {supportLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='hover:text-orange-400 transition'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className='font-bold mb-4'>Contact</h4>
            <ul className='space-y-2 text-gray-400'>
              <li>Kathmandu, Nepal</li>
              <li>contact@aawashub.com</li>
              <li>+977 1 234 5678</li>
            </ul>
          </div>
        </div>

        <div className='border-t border-gray-800 pt-8 text-center text-gray-400'>
          <p>&copy; 2024 AawasHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer