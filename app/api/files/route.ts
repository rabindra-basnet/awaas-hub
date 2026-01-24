import { NextResponse } from "next/server";
import { listFiles } from "@/lib/server/r2-client";
import { getDb } from "@/lib/server/db";
import { getServerSession } from "@/lib/server/getSession";
import Files from "@/lib/models/Files";
import { forbidden, internalServerError, unauthorized } from "@/lib/error";
import { Role, Permission, hasPermission } from "@/lib/rbac";

export async function GET() {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();
    const role = session.user.role as Role;

    if (!hasPermission(role, Permission.VIEW_FILES)) return forbidden();

    const userId = session.user.id;

    const dbFiles = await Files.find({ userId }).sort({ createdAt: -1 });
    console.log(dbFiles);

    const r2Files = await listFiles();

    const filteredFiles = dbFiles.filter((dbFile) =>
      r2Files.some(
        (r2File) =>
          r2File.Key === dbFile.storedName &&
          r2File.Metadata?.userid === userId.toString(),
      ),
    );

    return NextResponse.json(filteredFiles);
  } catch (error) {
    console.error("Error listing files:", error);
    return internalServerError("Error listing files");
  }
}
