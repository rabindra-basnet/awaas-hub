import { getDatabase } from "@/lib/db"
import { auth } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const db = await getDatabase()
    const user = await db.collection("user").findOne({ id: session.user.id })

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const totalUsers = await db.collection("user").countDocuments()
    const totalProperties = await db.collection("properties").countDocuments()
    const availableProperties = await db.collection("properties").countDocuments({ status: "available" })
    const totalAppointments = await db.collection("appointments").countDocuments()

    return NextResponse.json({
      totalUsers,
      totalProperties,
      availableProperties,
      totalAppointments,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
