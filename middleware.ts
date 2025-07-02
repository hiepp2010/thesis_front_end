import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log("Middleware checking path:", pathname)

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register"]

  // Check if the current path is a public route
  if (publicRoutes.includes(pathname)) {
    console.log("Public route, allowing access")
    return NextResponse.next()
  }

  // For protected routes, check for access token in cookies or localStorage
  // Note: We can't access localStorage in middleware, so we'll check cookies
  const accessToken = request.cookies.get("accessToken")?.value

  console.log("Access token from cookies:", !!accessToken)

  // If no token and trying to access protected route, redirect to login
  if (!accessToken && pathname !== "/") {
    console.log("No token, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If accessing root path, redirect to dashboard
  if (pathname === "/") {
    console.log("Root path, redirecting to dashboard")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  console.log("Allowing access to protected route")
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
