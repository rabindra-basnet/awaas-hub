import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Define public routes
  const publicRoutes = ["/", "/login", "/signup", "/api/auth"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Check if path is protected
  const protectedRoutes = ["/dashboard", "/buyer", "/seller", "/admin"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !isPublicRoute) {
    const sessionToken = request.cookies.get("better-auth.session_token")

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
