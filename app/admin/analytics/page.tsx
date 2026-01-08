"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import Link from "next/link"

interface Analytics {
  totalUsers: number
  totalProperties: number
  totalAppointments: number
  availableProperties: number
}

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session?.user) {
      fetchAnalytics()
    }
  }, [session?.user])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics")
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
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
          <Link href="/dashboard" className="text-lg font-bold text-foreground hover:text-primary">
            Real Estate Platform
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Platform Analytics</h1>

        {isLoading ? (
          <div className="text-center">Loading analytics...</div>
        ) : analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground text-sm mb-2">Total Users</p>
              <p className="text-4xl font-bold text-foreground">{analytics.totalUsers}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground text-sm mb-2">Total Properties</p>
              <p className="text-4xl font-bold text-primary">{analytics.totalProperties}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground text-sm mb-2">Available Properties</p>
              <p className="text-4xl font-bold text-accent">{analytics.availableProperties}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground text-sm mb-2">Total Appointments</p>
              <p className="text-4xl font-bold text-orange-600">{analytics.totalAppointments}</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Failed to load analytics.</p>
        )}
      </main>
    </div>
  )
}
