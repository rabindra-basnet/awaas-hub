// app/api/favorites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { Favorite } from "@/lib/models/Favorite";
import { connectToDatabase } from "@/lib/server/db";

export async function GET(req: NextRequest,) {
  try {
    const session = await getServerSession();

    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const favorites = await Favorite.find({ userId: session.user.id }).lean();
    console.log(favorites);

    return NextResponse.json(favorites);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { propertyId } = await req.json();
    if (!propertyId)
      return NextResponse.json(
        { error: "propertyId is required" },
        { status: 400 },
      );

    await connectToDatabase();

    // Upsert: only one favorite per user-property
    const favorite = await Favorite.findOneAndUpdate(
      { userId: session.user.id, propertyId },
      { $setOnInsert: { userId: session.user.id, propertyId } },
      { upsert: true, new: true },
    );

    return NextResponse.json(favorite);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 },
    );
  }
}
