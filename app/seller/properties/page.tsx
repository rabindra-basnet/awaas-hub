"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import Link from "next/link"

interface Property {
  _id: string
  title: string
  price: number
  location: string
  status: string
  createdAt: string
}

export default function SellerPropertiesPage() {
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
      const response = await fetch("/api/seller/properties")
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-lg font-bold text-foreground hover:text-primary">
            Real Estate Platform
          </Link>
          <Link
            href="/seller/properties/new"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-smooth"
          >
            List Property
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Properties</h1>

        {isLoading ? (
          <div className="text-center">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">You haven't listed any properties yet.</p>
            <Link
              href="/seller/properties/new"
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
            >
              List Your First Property
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Title</th>
                  <th className="text-left py-3 px-4 font-semibold">Location</th>
                  <th className="text-left py-3 px-4 font-semibold">Price</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property._id} className="border-b border-border hover:bg-muted">
                    <td className="py-3 px-4">{property.title}</td>
                    <td className="py-3 px-4">{property.location}</td>
                    <td className="py-3 px-4 font-semibold">${property.price.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          property.status === "available"
                            ? "bg-green-100 text-green-800"
                            : property.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {property.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/seller/properties/${property._id}`} className="text-primary hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
