import { NextRequest, NextResponse } from "next/server";
import { handleSessionCheck } from "@/lib/server/getSession";
import { Permission } from "@/lib/rbac";
import { connectToDatabase } from "@/lib/server/db";
import { badRequest } from "@/lib/error";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  await handleSessionCheck(Permission.MANAGE_USERS);

  try {
    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ _id: params.id });

    if (!user) return badRequest("User not found");

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  await handleSessionCheck(Permission.MANAGE_USERS);

  try {
    const body = await req.json();
    const { name, email, role, password } = body;

    if (!name && !email && !role && !password)
      return badRequest("Nothing to update");

    const { db } = await connectToDatabase();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) updateData.password = password; // hash if required

    const result = await db
      .collection("users")
      .findOneAndUpdate(
        { _id: params.id },
        { $set: updateData },
        { returnDocument: "after" },
      );

    if (!result.value) return badRequest("User not found");

    return NextResponse.json(result.value);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  await handleSessionCheck(Permission.MANAGE_USERS);

  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("users").deleteOne({ _id: params.id });

    if (result.deletedCount === 0) return badRequest("User not found");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
