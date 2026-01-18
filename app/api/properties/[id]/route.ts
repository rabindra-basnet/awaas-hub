import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Property } from "@/lib/models/Property";
import { Role, Permission, hasPermission } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession()
    if (!session?.user)
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const role = session.user.role as Role;

    if (!hasPermission(role, Permission.VIEW_PROPERTIES)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params
    // return 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: "Invalid property ID" }, { status: 400 });
    }

    try {
        const property = await Property.findById(id);
        if (!property) return NextResponse.json({ message: "Property not found" }, { status: 404 });

        // Only seller can see their own private properties, others only view basic info
        if (role === Role.SELLER && property.sellerId.toString() !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(property);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
