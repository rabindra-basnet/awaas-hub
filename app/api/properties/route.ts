import { getDatabase } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const properties = await db.collection("properties").find({ status: "available" }).toArray()

    return NextResponse.json(properties)
  } catch (error) {
    console.error("Error fetching properties:", error)
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const db = await getDatabase()

    const result = await db.collection("properties").insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ id: result.insertedId, ...body }, { status: 201 })
  } catch (error) {
    console.error("Error creating property:", error)
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
  }
}
