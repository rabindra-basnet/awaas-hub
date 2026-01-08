import { getDatabase } from "@/lib/db"
import { auth } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const favorites = await db.collection("favorites").find({ userId: session.user.id }).toArray()

    // Get property details
    const propertyIds = favorites.map((f) => new ObjectId(f.propertyId))
    const properties = await db
      .collection("properties")
      .find({ _id: { $in: propertyIds } })
      .toArray()

    return NextResponse.json(properties)
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
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

    const { propertyId } = await request.json()
    const db = await getDatabase()

    await db.collection("favorites").insertOne({
      userId: session.user.id,
      propertyId,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Error adding favorite:", error)
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { propertyId } = await request.json()
    const db = await getDatabase()

    await db.collection("favorites").deleteOne({
      userId: session.user.id,
      propertyId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing favorite:", error)
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 })
  }
}
