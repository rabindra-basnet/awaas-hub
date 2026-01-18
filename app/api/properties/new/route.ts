import { Property } from "@/lib/models/Property";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

/**
 * POST /api/properties
 * - Only seller with MANAGE_PROPERTIES can create
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user)
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const role = session.user.role as Role;
        console.log(role)
        if (!hasPermission(role, Permission.MANAGE_PROPERTIES)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { title, price, location } = body;

        if (!title || !price || !location) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        const property = await Property.create({
            title,
            price,
            location,
            sellerId: new mongoose.Types.ObjectId(session.user.id),
            status: "available",
        });

        return NextResponse.json(property, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}


