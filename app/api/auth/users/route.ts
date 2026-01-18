import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server/getSession";
import { connectToDatabase } from "@/lib/server/db";
import { Role } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Check if user is admin
    const role = session.user.role as Role

    // 5️⃣ Prevent updating admin role
    if (role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { db } = await connectToDatabase();

    const users = await db.collection("users").find({ role: { $ne: Role.ADMIN } }).toArray();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
