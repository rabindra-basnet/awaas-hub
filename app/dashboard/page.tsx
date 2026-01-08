"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signOut, useSession } from "@/lib/auth-client"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login")
    } else if (session?.user) {
      fetchUserRole()
    }
  }, [session, isPending, router])

  const fetchUserRole = async () => {
    try {
      const response = await fetch("/api/user/profile")
      const user = await response.json()
      setUserRole(user.role)
    } catch (error) {
      console.error("Error fetching user role:", error)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  if (isPending || !session?.user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Real Estate Platform</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-smooth"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome, {session.user.name}!</h2>
          <p className="text-muted-foreground">
            Role: <span className="font-semibold capitalize">{userRole}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userRole === "buyer" && (
            <>
              <Link
                href="/buyer/properties"
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-smooth"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">Browse Properties</h3>
                <p className="text-muted-foreground">Explore available properties in your area</p>
              </Link>
              <Link
                href="/buyer/favorites"
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-smooth"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">Saved Properties</h3>
                <p className="text-muted-foreground">View your favorite properties</p>
              </Link>
              <Link
                href="/buyer/appointments"
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-smooth"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">Appointments</h3>
                <p className="text-muted-foreground">Manage your property viewings</p>
              </Link>
            </>
          )}

          {userRole === "seller" && (
            <>
              <Link
                href="/seller/properties"
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-smooth"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">My Properties</h3>
                <p className="text-muted-foreground">Manage your property listings</p>
              </Link>
              <Link
                href="/seller/appointments"
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-smooth"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">Appointments</h3>
                <p className="text-muted-foreground">View buyer appointment requests</p>
              </Link>
              <Link
                href="/seller/analytics"
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-smooth"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">Analytics</h3>
                <p className="text-muted-foreground">View listing performance metrics</p>
              </Link>
            </>
          )}

          {userRole === "admin" && (
            <>
              <Link
                href="/admin/users"
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-smooth"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">Manage Users</h3>
                <p className="text-muted-foreground">View and manage platform users</p>
              </Link>
              <Link
                href="/admin/properties"
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-smooth"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">Properties</h3>
                <p className="text-muted-foreground">Monitor all property listings</p>
              </Link>
              <Link
                href="/admin/analytics"
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-smooth"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">Platform Analytics</h3>
                <p className="text-muted-foreground">View platform statistics and insights</p>
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
