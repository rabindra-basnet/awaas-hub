import { NextResponse } from "next/server";
import { fetchFeaturedProperties } from "@/features/home/server/home.fetcher";

export async function GET() {
  const properties = await fetchFeaturedProperties();
  return NextResponse.json(properties);
}
