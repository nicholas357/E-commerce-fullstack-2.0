import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Create a response object
  const res = NextResponse.next()

  // Create the Supabase middleware client
  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      cookieOptions: {
        name: "sb-auth-token",
        lifetime: 60 * 60 * 24 * 7, // 7 days
        domain: process.env.NODE_ENV === "production" ? req.headers.get("host")?.split(":")[0] : undefined,
        path: "/",
        sameSite: "None",  // Use "None" for cross-site cookies
        secure: process.env.NODE_ENV === "production",  // Secure for production
      },
    },
  )

  // Fetch session data and handle errors
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Session fetch error:', error.message)
    // Optional: Handle the error, maybe redirect to login or show an error page
  }

  // If user is not logged in and trying to access protected routes
  if (
    !session &&
    (req.nextUrl.pathname.startsWith("/account") || req.nextUrl.pathname.startsWith("/admin")) &&
    !req.nextUrl.pathname.includes("/account/login") &&
    !req.nextUrl.pathname.includes("/account/signup")
  ) {
    const redirectUrl = new URL("/account/login", req.url)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in and trying to access login/signup pages
  if (
    session &&
    (req.nextUrl.pathname.includes("/account/login") || req.nextUrl.pathname.includes("/account/signup"))
  ) {
    return NextResponse.redirect(new URL("/account", req.url))
  }

  // Handle category slug redirects for old URLs
  if (req.nextUrl.pathname.startsWith("/xbox-games")) {
    return NextResponse.redirect(new URL("/category/games/xbox-games", req.url))
  }

  if (req.nextUrl.pathname.startsWith("/gift-cards")) {
    return NextResponse.redirect(new URL("/category/gift-cards", req.url))
  }

  if (req.nextUrl.pathname.startsWith("/streaming-services")) {
    return NextResponse.redirect(new URL("/category/streaming-services", req.url))
  }

  if (req.nextUrl.pathname.startsWith("/game-points")) {
    return NextResponse.redirect(new URL("/category/game-points", req.url))
  }

  if (req.nextUrl.pathname.startsWith("/software")) {
    return NextResponse.redirect(new URL("/category/software", req.url))
  }

  // Log session and requested path for debugging
  console.log('Session:', session)
  console.log('Requested Path:', req.nextUrl.pathname)

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
