import { NextRequest, NextResponse } from "next/server";

// Protected route prefixes — unauthenticated users are redirected to /login
const PROTECTED = [
  "/dashboard",
  "/properties/new",
  "/appointments",
  "/favorites",
  "/settings",
  "/billing",
  "/files",
  "/chat",
  "/support",
  "/analytics",
  "/admin",
];

// We do NOT redirect authenticated users from auth pages in the proxy —
// the auth layout handles that server-side. Doing it here causes redirect
// loops when a session cookie exists but the server-side validation fails
// (e.g. expired session).

function hasSessionCookie(request: NextRequest): boolean {
  return !!(
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth.session_token")?.value
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isProtected && !hasSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
