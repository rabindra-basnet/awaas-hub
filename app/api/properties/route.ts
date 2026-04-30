import { NextRequest, NextResponse } from "next/server";
import { Property } from "@/lib/models/Property";
import { Favorite } from "@/lib/models/Favorite";
import { Role } from "@/lib/rbac";
import { getServerSession } from "@/lib/server/getSession";
import { internalServerError } from "@/lib/error";
import Files from "@/lib/models/Files";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
import { getDb } from "@/lib/server/db";
import { Types } from "mongoose";

const PAGE_LIMIT = 12;

async function withImages(
  properties: any[],
  favoriteSet: Set<string>,
): Promise<any[]> {
  if (!properties.length) return [];

  const files = await Files.find({
    propertyId: { $in: properties.map((p) => p._id) },
    isDeleted: false,
  })
    .sort({ createdAt: 1 })
    .lean();

  const firstFileByProperty = new Map<string, any>();
  for (const file of files) {
    const pid = file.propertyId?.toString();
    if (pid && !firstFileByProperty.has(pid)) firstFileByProperty.set(pid, file);
  }

  return Promise.all(
    properties.map(async (property: any) => {
      const pid = property._id.toString();
      const firstFile = firstFileByProperty.get(pid);
      const base = {
        ...property,
        verificationStatus: property.verificationStatus ?? "pending",
        isFavorite: favoriteSet.has(pid),
      };
      if (!firstFile?.storedName) return JSON.parse(JSON.stringify({ ...base, images: [] }));
      const imageUrl = await getSignedUrlForDownload(firstFile.storedName);
      return JSON.parse(JSON.stringify({ ...base, images: [imageUrl] }));
    }),
  );
}

async function getFavoriteSet(userId: string | undefined, propertyIds: any[]): Promise<Set<string>> {
  if (!userId || !propertyIds.length) return new Set();
  const favorites = await Favorite.find({
    userId: new Types.ObjectId(userId),
    propertyId: { $in: propertyIds },
  })
    .select("propertyId")
    .lean();
  return new Set(favorites.map((f) => f.propertyId.toString()));
}

export async function GET(request: NextRequest) {
  try {
    await getDb();
    const session = await getServerSession();
    const role = (session?.user?.role as Role) ?? Role.GUEST;
    const userId = session?.user?.id;

    const baseQuery: Record<string, any> =
      role === Role.ADMIN ? {} : { verificationStatus: "verified" };

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limitStr = searchParams.get("limit");

    // ── Cursor-based infinite scroll ──────────────────────────────────────
    if (cursor !== null || limitStr !== null) {
      const limit = Math.min(50, parseInt(limitStr ?? String(PAGE_LIMIT), 10));

      const query = cursor
        ? { ...baseQuery, _id: { $lt: new Types.ObjectId(cursor) } }
        : baseQuery;

      const properties = await Property.find(query)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean();

      const hasNextPage = properties.length > limit;
      const pageItems = hasNextPage ? properties.slice(0, limit) : properties;
      const nextCursor = hasNextPage
        ? (pageItems[pageItems.length - 1]._id as Types.ObjectId).toString()
        : null;

      const favoriteSet = await getFavoriteSet(userId, pageItems.map((p) => p._id));
      const items = await withImages(pageItems as any[], favoriteSet);
      return NextResponse.json({ items, nextCursor });
    }

    // ── Legacy: return full list ──────────────────────────────────────────
    const properties = await Property.find(baseQuery).sort({ _id: -1 }).lean();
    const favoriteSet = await getFavoriteSet(userId, properties.map((p) => p._id));
    const items = await withImages(properties as any[], favoriteSet);
    return NextResponse.json(items);
  } catch (err) {
    console.error("[GET /api/properties] error:", err);
    return internalServerError();
  }
}
