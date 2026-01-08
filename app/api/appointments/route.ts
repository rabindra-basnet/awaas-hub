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

    const db = await getDatabase()
    const appointments = await db
      .collection("appointments")
      .find({
        $or: [{ buyerId: session.user.id }, { sellerId: session.user.id }],
      })
      .toArray()

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const db = await getDatabase()

    const result = await db.collection("appointments").insertOne({
      ...body,
      buyerId: session.user.id,
      status: "pending",
      createdAt: new Date(),
    })

    return NextResponse.json({ id: result.insertedId, ...body }, { status: 201 })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}
