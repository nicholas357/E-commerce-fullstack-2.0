import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Debugging: Log the request URL
  console.log('Request URL:', req.nextUrl.pathname)

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Debugging: Log the session state
  console.log('Session:', session)

  // If user is not logged in and trying to access protected routes
  if (
    !session &&
    (req.nextUrl.pathname.startsWith("/account") || req.nextUrl.pathname.startsWith("/admin")) &&
    !req.nextUrl.pathname.includes("/account/login") &&
    !req.nextUrl.pathname.includes("/account/signup")
  ) {
    console.log('User not logged in, redirecting to login page...')
    const redirectUrl = new URL("/account/login", req.url)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and trying to access login/signup pages
  if (
    session &&
    (req.nextUrl.pathname.includes("/account/login") || req.nextUrl.pathname.includes("/account/signup"))
  ) {
    console.log('User already logged in, redirecting to account page...')
    return NextResponse.redirect(new URL("/account", req.url))
  }

  // Handle category slug redirects for old URLs
  if (req.nextUrl.pathname.startsWith("/xbox-games")) {
    console.log('Redirecting /xbox-games to /category/games/xbox-games')
    return NextResponse.redirect(new URL("/category/games/xbox-games", req.url))
  }

  if (req.nextUrl.pathname.startsWith("/gift-cards")) {
    console.log('Redirecting /gift-cards to /category/gift-cards')
    return NextResponse.redirect(new URL("/category/gift-cards", req.url))
  }

  if (req.nextUrl.pathname.startsWith("/streaming-services")) {
    console.log('Redirecting /streaming-services to /category/streaming-services')
    return NextResponse.redirect(new URL("/category/streaming-services", req.url))
  }

  if (req.nextUrl.pathname.startsWith("/game-points")) {
    console.log('Redirecting /game-points to /category/game-points')
    return NextResponse.redirect(new URL("/category/game-points", req.url))
  }

  if (req.nextUrl.pathname.startsWith("/software")) {
    console.log('Redirecting /software to /category/software')
    return NextResponse.redirect(new URL("/category/software", req.url))
  }

  // For admin routes, we'll do a more thorough check in the layout component
  // This is just a first layer of protection

  return res
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
