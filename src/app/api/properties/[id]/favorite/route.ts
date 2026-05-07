import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { connectToDatabase } from "@/shared/lib/db";
import { Favorite } from "@/features/favorites/models/favorite.model";
import { unauthorized } from "@/shared/lib/error";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();
  await Favorite.findOneAndUpdate(
    { userId: session.user.id, propertyId: id },
    { userId: session.user.id, propertyId: id },
    { upsert: true },
  );
  return NextResponse.json({ isFavorite: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();

  await connectToDatabase();
  await Favorite.deleteOne({ userId: session.user.id, propertyId: id });
  return NextResponse.json({ isFavorite: false });
}
