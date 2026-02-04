// import {
//   badRequest,
//   forbidden,
//   internalServerError,
//   unauthorized,
// } from "@/lib/error";
// import { Property } from "@/lib/models/Property";
// import { hasPermission, Permission, Role } from "@/lib/rbac";
// import { getServerSession } from "@/lib/server/getSession";
// import mongoose from "mongoose";
// import { NextResponse } from "next/server";

// /**
//  * POST /api/properties
//  * - Only seller with MANAGE_PROPERTIES can create
//  */
// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession();
//     if (!session?.user) return unauthorized();

//     const role = session.user.role as Role;
//     if (!hasPermission(role, Permission.MANAGE_PROPERTIES)) {
//       return forbidden();
//     }

//     const body = await req.json();
//     const { title, price, location } = body;

//     if (!title || !price || !location) {
//       return badRequest("All fields are required");
//     }

//     const property = await Property.create({
//       title,
//       price,
//       location,
//       sellerId: new mongoose.Types.ObjectId(session.user.id),
//       status: "available",
//     });

//     return NextResponse.json(property, { status: 201 });
//   } catch (err) {
//     console.error(err);
//     return internalServerError();
//   }
// }


import {
  badRequest,
  forbidden,
  internalServerError,
  unauthorized,
} from "@/lib/error";
import { Property } from "@/lib/models/Property";
import Files from "@/lib/models/Files";
import { uploadFile } from "@/lib/server/r2-client";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/server/db";

/**
 * POST /api/properties
 * - Creates property
 * - Uploads files
 * - Links files via propertyId
 */
export async function POST(req: NextRequest) {
  try {
    await getDb();

    const session = await getServerSession();
    if (!session?.user?.id) return unauthorized();

    const role = session.user.role as Role;
    if (!hasPermission(role, Permission.MANAGE_PROPERTIES)) {
      return forbidden();
    }

    const userId = session.user.id;
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const price = Number(formData.get("price"));
    const location = formData.get("location") as string;
    const files = formData.getAll("files") as File[];

    if (!title || !price || !location) {
      return badRequest("Title, price and location are required");
    }

    /* ---------------- Create Property ---------------- */

    const property = await Property.create({
      title,
      price,
      location,
      sellerId: new mongoose.Types.ObjectId(userId),
      status: "available",
    });

    /* ---------------- Upload Files ---------------- */

    const uploadedFiles = [];

    for (const file of files) {
      if (!file) continue;

      let uniqueName = file.name;
      const exists = await Files.exists({ storedName: uniqueName });

      if (exists) {
        const ext = file.name.includes(".")
          ? `.${file.name.split(".").pop()}`
          : "";
        const base = file.name.replace(ext, "");
        const rand = crypto.randomBytes(4).toString("hex");
        uniqueName = `${base}-${rand}${ext}`;
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      await uploadFile(buffer, uniqueName, {
        userId,
        propertyId: property._id.toString(),
        isPrivate: "false",
      });

      const doc = await Files.create({
        userId,
        propertyId: property._id,
        filename: file.name,
        storedName: uniqueName,
        isPrivate: false,
        mimetype: file.type,
        size: file.size,
      });

      uploadedFiles.push(doc);
    }

    return NextResponse.json(
      {
        success: true,
        property,
        files: uploadedFiles,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error(err);
    return internalServerError(err.message);
  }
}
