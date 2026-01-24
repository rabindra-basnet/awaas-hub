import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/server/db";
import { Permission, Role } from "@/lib/rbac";
import { getServerSession, handleSessionCheck } from "@/lib/server/getSession";
import { internalServerError } from "@/lib/error";
import { auth } from "@/lib/server/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await handleSessionCheck(Permission.MANAGE_USERS);

    const allUsers = await auth.api.listUsers({
      query: {},
      headers: await headers(),
    });

    const filteredUsers = allUsers.users.filter(
      (user) => user.role !== "admin",
    );

    return NextResponse.json(filteredUsers);
  } catch (error) {
    console.error("Failed to list users:", error);
    return internalServerError("Failed to list users");
  }
}

export async function POST(req: NextRequest) {
  await handleSessionCheck(Permission.MANAGE_USERS);

  try {
    const body = await req.json();
    const { email, password, name, role, data } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newUser = await auth.api.createUser({
      body: { email, password, name, role, data },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("Failed to create user", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
