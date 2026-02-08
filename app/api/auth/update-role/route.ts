import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/server/db";
import { Role } from "@/lib/rbac";

/**
 * POST /api/update-role
 * Updates a user's role (admin cannot be updated)
 */
export async function POST(req: NextRequest) {
    try {
        const { db } = await connectToDatabase();

        const body = await req.json();
        const { role, userId } = body;

        // 1️⃣ Basic validation
        if (!role || typeof role !== "string" || !userId || typeof userId !== "string") {
            return NextResponse.json(
                { message: "role and userId are required and must be strings" },
                { status: 400 }
            );
        }

        // 2️⃣ Validate role enum
        if (!Object.values(Role).includes(role as Role)) {
            return NextResponse.json({ message: "Invalid role value" }, { status: 400 });
        }

        // 3️⃣ Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ message: "Invalid userId" }, { status: 400 });
        }

        const objectId = new mongoose.Types.ObjectId(userId);

        // 4️⃣ Find user using native MongoDB
        const user = await db.collection("users").findOne({ _id: objectId });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // 5️⃣ Prevent updating admin role
        if (user.role === Role.ADMIN) {
            return NextResponse.json({ message: "Cannot update admin role" }, { status: 403 });
        }

        // 6️⃣ Check if role already matches
        if (user.role === role.trim()) {
            return NextResponse.json({ message: "Role already set", role: user.role }, { status: 200 });
        }

        // 7️⃣ Update role
        const result = await db.collection("users").updateOne(
            { _id: objectId },
            { $set: { role: role.trim() } }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json({ message: "Failed to update role" }, { status: 500 });
        }

        return NextResponse.json({ message: "Role updated successfully", role }, { status: 200 });
    } catch (err: any) {
        console.error("❌ Failed to update role:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
