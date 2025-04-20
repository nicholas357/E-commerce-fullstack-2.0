import { type NextRequest, NextResponse } from "next/server"
import { parse } from "cookie"

export function middleware(req: NextRequest) {
  // Get the pathname
  const { pathname } = req.nextUrl

  // Parse cookies from the request
  const cookies = parse(req.headers.get("cookie") || "")

  // Check if the user is logged in by looking for the access token
  const hasSession = cookies["sb-access-token"] || cookies["supabase-auth-token"]

  // If user is not logged in and trying to access protected routes
  if (
    !hasSession &&
    (pathname.startsWith("/account") || pathname.startsWith("/admin")) &&
    !pathname.includes("/account/login") &&
    !pathname.includes("/account/signup")
  ) {
    const redirectUrl = new URL("/account/login", req.url)
    redirectUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and trying to access login/signup pages
  if (hasSession && (pathname.includes("/account/login") || pathname.includes("/account/signup"))) {
    return NextResponse.redirect(new URL("/account", req.url))
  }

  // Handle category slug redirects for old URLs
  if (pathname.startsWith("/xbox-games")) {
    return NextResponse.redirect(new URL("/category/games/xbox-games", req.url))
  }

  if (pathname.startsWith("/gift-cards")) {
    return NextResponse.redirect(new URL("/category/gift-cards", req.url))
  }

  if (pathname.startsWith("/streaming-services")) {
    return NextResponse.redirect(new URL("/category/streaming-services", req.url))
  }

  if (pathname.startsWith("/game-points")) {
    return NextResponse.redirect(new URL("/category/game-points", req.url))
  }

  if (pathname.startsWith("/software")) {
    return NextResponse.redirect(new URL("/category/software", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/xbox-games",
    "/gift-cards",
    "/streaming-services",
    "/game-points",
    "/software",
  ],
}
