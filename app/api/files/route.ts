import { NextRequest, NextResponse } from "next/server";
import {
  getSignedUrlForUpload,
  getSignedUrlForDownload,
  deleteFile,
  listFiles,
} from "@/lib/server/r2-client";
import { getDb } from "@/lib/server/db";
import { getServerSession } from "@/lib/server/getSession";
import Files from "@/lib/models/Files";
import { internalServerError, unauthorized } from "@/lib/error";

// --- GET: list all files ---
// export async function GET() {
//   try {
//     await getDb();
//     const session = await getServerSession();
//     if (!session?.user?.id) return unauthorized();

//     const userId = session.user.id;

//     // Step 1: list all files from R2
//     const r2Files = await listFiles();
//     console.log(r2Files);

//     // Step 2: get all files from DB for this user
//     const dbFiles = await Files.find({ userId }).sort({ createdAt: -1 });

//     // Step 3: filter DB files that exist in R2
//     const filteredFiles = dbFiles.filter((dbFile) =>
//       r2Files.some((r2File) => r2File.Key === dbFile.storedName),
//     );
//     console.log(filteredFiles);
//     return NextResponse.json(filteredFiles);
//   } catch (error) {
//     console.error("Error listing files:", error);
//     return NextResponse.json({ error: "Error listing files" }, { status: 500 });
//   }
// }
export async function GET() {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();

    const userId = session.user.id;

    // 1. DB files for this user
    const dbFiles = await Files.find({ userId }).sort({ createdAt: -1 });
    console.log(dbFiles);

    // 2. All R2 files
    const r2Files = await listFiles();

    dbFiles.forEach((dbFile) => {
      console.log("DB:", dbFile.storedName, dbFile.userId.toString());
    });
    r2Files.forEach((r2File) => {
      console.log("R2:", r2File.Key, r2File.Metadata?.userid);
    });

    // 3. Keep only files that exist in R2 AND metadata.userid matches
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
    return NextResponse.json({ error: "Error listing files" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await getDb();
  const session = await getServerSession();
  if (!session?.user?.id) return unauthorized();

  const userId = session.user.id;
  const { key } = await request.json();
  try {
    const signedUrl = await getSignedUrlForDownload(key);
    return NextResponse.json({ signedUrl });
  } catch (error) {
    return NextResponse.json(
      { error: "Error generating download URL" },
      { status: 500 },
    );
  }
}

// --- DELETE: remove file from R2 and DB ---
export async function DELETE(request: NextRequest) {
  try {
    await getDb();
    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();

    const { key } = await request.json();
    if (!key)
      return NextResponse.json({ error: "File key required" }, { status: 400 });

    // Delete from R2
    await deleteFile(key);

    // Delete metadata from DB
    await Files.deleteOne({ storedName: key });

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Error deleting file" }, { status: 500 });
  }
}
