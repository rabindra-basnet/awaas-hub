import { NextResponse } from "next/server";
import { notFound as NotFound } from "next/navigation";

export function unauthorized() {
  return NextResponse.json(
    { message: "Unauthorized, Please login" },
    { status: 401 },
  );
}
export function forbidden(msg: string = "Forbidden") {
  return NextResponse.json({ message: msg }, { status: 403 });
}
export function badRequest(msg: string) {
  return NextResponse.json({ message: msg }, { status: 400 });
}
export function notFound(msg: string | undefined = "Not found") {
  return  NextResponse.json({ message: msg }, { status: 404 });;
}

/** @deprecated Use `internalServerError()` instead */
export function ServerError() {
  return NextResponse.json({ message: "Server error" }, { status: 500 });
}

export function internalServerError(msg: string = "server error ") {
  return NextResponse.json({ message: msg }, { status: 500 });
}
