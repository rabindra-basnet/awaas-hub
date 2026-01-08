"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import Link from "next/link"

interface Property {
  _id: string
  title: string
  description: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  images: string[]
}

export default function BuyerPropertiesPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session?.user) {
      fetchProperties()
    }
  }, [session?.user])

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties")
      const data = await response.json()
      setProperties(data)
    } catch (error) {
      console.error("Error fetching properties:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isPending || !session?.user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-lg font-bold text-foreground hover:text-primary">
              Real Estate Platform
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Available Properties</h1>

        {isLoading ? (
          <div className="text-center">Loading properties...</div>
        ) : properties.length === 0 ? (
          <p className="text-muted-foreground">No properties available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property._id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-smooth"
              >
                {property.images[0] && (
                  <div className="w-full h-48 bg-muted relative">
                    <img
                      src={property.images[0] || "/placeholder.svg"}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{property.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{property.location}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-primary">${property.price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">{property.area} sqft</span>
                  </div>
                  <div className="flex gap-2 text-sm text-muted-foreground mb-4">
                    <span>{property.bedrooms} beds</span>
                    <span>•</span>
                    <span>{property.bathrooms} baths</span>
                  </div>
                  <Link
                    href={`/buyer/property/${property._id}`}
                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-center hover:bg-primary/90 transition-smooth"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
