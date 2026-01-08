"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import Link from "next/link"

interface Appointment {
  _id: string
  propertyId: string
  date: string
  notes: string
  status: "pending" | "confirmed" | "cancelled"
}

export default function BuyerAppointmentsPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login")
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session?.user) {
      fetchAppointments()
    }
  }, [session?.user])

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments")
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
        <h1 className="text-3xl font-bold text-foreground mb-8">My Appointments</h1>

        {isLoading ? (
          <div className="text-center">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">You don't have any appointments yet.</p>
            <Link
              href="/buyer/properties"
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-smooth"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Property: {appointment.propertyId}</h3>
                    <p className="text-muted-foreground">
                      Date: {new Date(appointment.date).toLocaleDateString()} at{" "}
                      {new Date(appointment.date).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
                {appointment.notes && <p className="text-muted-foreground text-sm">Notes: {appointment.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
