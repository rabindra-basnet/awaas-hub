import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Property } from "@/lib/models/Property";
import { Role, Permission, hasPermission } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import { badRequest, forbidden, notFound, serverError, unauthorized } from "@/lib/error";

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


// PUT - Edit property
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.user) return unauthorized();

    const role = session.user.role as Role;
    if (!hasPermission(role, Permission.MANAGE_PROPERTIES)) return forbidden();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid ID");

    try {
        const property = await Property.findById(id);
        if (!property) return notFound();

        // Only admin or property owner
        if (role !== Role.ADMIN && property.sellerId.toString() !== session.user.id) {
            return forbidden();
        }

        const body = await req.json();
        const updated = await Property.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        return NextResponse.json(updated);
    } catch (err) {
        return serverError();
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.user) return unauthorized();

    const role = session.user.role as Role;
    if (!hasPermission(role, Permission.MANAGE_PROPERTIES)) return forbidden();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) return badRequest("Invalid ID");

    try {
        const property = await Property.findById(id);
        if (!property) return notFound();

        // Only admin or property owner
        if (role !== Role.ADMIN && property.sellerId.toString() !== session.user.id) {
            return forbidden();
        }

        await Property.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return serverError();
    }
}
