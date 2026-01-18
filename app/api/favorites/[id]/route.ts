import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/server/db";
import { Favorite } from "@/lib/models/Favorite";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        if (!id || !Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid favorite id" }, { status: 400 });
        }

        await connectToDatabase();

        await Favorite.deleteOne({ _id: id, userId: session.user.id });

        return NextResponse.json({ message: "Favorite removed" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
    }
}
