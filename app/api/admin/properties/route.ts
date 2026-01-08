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

    const properties = await db.collection("properties").find({}).toArray()
    return NextResponse.json(properties)
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}
