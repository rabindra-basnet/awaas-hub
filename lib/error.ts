import { NextResponse } from "next/server";

export function unauthorized() { return NextResponse.json({ message: "Unauthorized" }, { status: 401 }); }
export function forbidden() { return NextResponse.json({ message: "Forbidden" }, { status: 403 }); }
export function badRequest(msg: string) { return NextResponse.json({ message: msg }, { status: 400 }); }
export function notFound() { return NextResponse.json({ message: "Not found" }, { status: 404 }); }
export function serverError() { return NextResponse.json({ message: "Server error" }, { status: 500 }); }