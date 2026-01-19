import { badRequest, unauthorized } from "@/lib/error";
import { Favorite } from "@/lib/models/Favorite";
import { connectToDatabase } from "@/lib/server/db";
import { getServerSession } from "@/lib/server/getSession";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.user) return unauthorized();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid property ID");

    await connectToDatabase();

    // Upsert favorite
    const favorite = await Favorite.findOneAndUpdate(
        { userId: session.user.id, propertyId: id },
        { $setOnInsert: { userId: session.user.id, propertyId: id } },
        { upsert: true, new: true }
    );

    return NextResponse.json(favorite);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.user) return unauthorized();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid property ID");

    await Favorite.deleteOne({ userId: session.user.id, propertyId: id });
    return NextResponse.json({ success: true });
}
