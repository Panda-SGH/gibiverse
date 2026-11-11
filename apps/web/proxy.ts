import { NextResponse } from "next/server.js"
import type { NextRequest } from "next/server.js"

// Routes that require authentication
const protectedPrefixes = [
  "/resources/upload",
  "/questions/ask",
  "/qa/ask",
  "/settings",
]

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Check for better-auth session token cookie
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value

  const isAuthenticated = Boolean(sessionToken)

  // 1. Authenticated student visiting /sign-in or /sign-up is redirected to /
  if (isAuthenticated && (pathname === "/sign-in" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // 2. Unauthenticated student attempting a protected action is redirected to /sign-in?callbackUrl=...
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (!isAuthenticated && isProtected) {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`)
    return NextResponse.redirect(
      new URL(`/sign-in?callbackUrl=${callbackUrl}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (handled by rewrites or route handlers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
