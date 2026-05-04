import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Property } from "@/lib/models/Property";
import { Role } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import {
  badRequest,
  forbidden,
  internalServerError,
  unauthorized,
} from "@/lib/error";
import { getDb } from "@/lib/server/db";

/**
 * PATCH /api/properties/[id]/verify
 * Admin only — marks a property's status as "sold".
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getDb();
    const session = await getServerSession();
    const role = (session?.user?.role as Role) ?? Role.GUEST;

    if (!session) return unauthorized();
    if (role !== Role.ADMIN) return forbidden();

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return badRequest("Invalid or missing property id");
    }

    const property = await Property.findById(
      new mongoose.Types.ObjectId(id),
    ).lean();

    if (!property) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 },
      );
    }

    if (property.verificationStatus !== "verified") {
      return badRequest("Only verified properties can be marked as sold");
    }

    await Property.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      [{ $set: { status: "sold", soldAt: new Date() } }],
      { updatePipeline: true },
    );

    return NextResponse.json({ message: "Property marked as sold" });
  } catch (err) {
    console.error(err);
    return internalServerError();
  }
}

/**
 * POST /api/properties/[id]/verify
 * Body: { status: "verified" | "rejected" | "pending" }
 * Admin only — updates verificationStatus of a single property.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getDb();
    const session = await getServerSession();
    const role = (session?.user?.role as Role) ?? Role.GUEST;

    if (!session) return unauthorized();
    if (role !== Role.ADMIN) return forbidden();

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return badRequest("Invalid or missing property id");
    }

    const body = await req.json();
    const { status } = body;

    const allowedStatuses = ["pending", "verified", "rejected"] as const;
    if (!status || !allowedStatuses.includes(status)) {
      return badRequest(`Status must be one of: ${allowedStatuses.join(", ")}`);
    }

    // ── Key fix: array pipeline form ─────────────────────────────────────────
    // [ { $set: {} } ] forces MongoDB to write the field even when it was
    // completely absent from the document. Plain { $set: {} } can silently
    // skip fields that don't yet exist in old documents.
    const updated = await Property.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      [
        {
          $set: {
            verificationStatus: status,
            verifiedAt: status === "verified" ? new Date() : null,
            verifiedBy: status === "verified" ? session.user.id : null,
          },
        },
      ],
      { new: true, updatePipeline: true },
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: `Property ${status} successfully`,
    });
  } catch (err) {
    console.error(err);
    return internalServerError();
  }
}
