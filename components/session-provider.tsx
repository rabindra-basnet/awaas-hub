"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getSession } from "@/lib/auth-client"

export function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession()
        setSession(session)
      } catch (error) {
        console.error("Session check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return <>{children}</>
}
