import { NextResponse } from "next/server";

export const unauthorized = (msg = "Unauthorized, please login") =>
  NextResponse.json({ message: msg }, { status: 401 });

export const forbidden = (msg = "Forbidden") =>
  NextResponse.json({ message: msg }, { status: 403 });

export const badRequest = (msg: string) =>
  NextResponse.json({ message: msg }, { status: 400 });

export const notFound = (msg = "Not found") =>
  NextResponse.json({ message: msg }, { status: 404 });

export const internalServerError = (msg = "Internal server error") =>
  NextResponse.json({ message: msg }, { status: 500 });

export async function apiError(res: Response): Promise<Error> {
  const body = await res.json().catch(() => ({}));
  return new Error(body.message || `Request failed with status ${res.status}`);
}
