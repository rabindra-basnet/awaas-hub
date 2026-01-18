"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/client/auth-client"
import Link from "next/link"

interface Property {
  _id: string
  title: string
  price: number
  location: string
  status: string
  sellerId: string
}

export default function AdminPropertiesPage() {
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
      const response = await fetch("/api/admin/properties")
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

  const stats = {
    total: properties.length,
    available: properties.filter((p) => p.status === "available").length,
    pending: properties.filter((p) => p.status === "pending").length,
    sold: properties.filter((p) => p.status === "sold").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="text-lg font-bold text-foreground hover:text-primary">
            Real Estate Platform
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Property Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-sm mb-1">Total Properties</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-sm mb-1">Available</p>
            <p className="text-2xl font-bold text-accent">{stats.available}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-sm mb-1">Sold</p>
            <p className="text-2xl font-bold text-primary">{stats.sold}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center">Loading properties...</div>
        ) : properties.length === 0 ? (
          <p className="text-muted-foreground">No properties found.</p>
        ) : (
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Title</th>
                  <th className="text-left py-3 px-4 font-semibold">Location</th>
                  <th className="text-left py-3 px-4 font-semibold">Price</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property._id} className="border-b border-border hover:bg-muted/50">
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
