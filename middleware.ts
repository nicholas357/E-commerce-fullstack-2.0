import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  console.log("[Middleware] Processing request:", req.nextUrl.pathname)

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
        lifetime: 60 * 60 * 24 * 30, // 30 days (increased from 7)
        domain: process.env.NODE_ENV === "production" ? req.headers.get("host")?.split(":")[0] || undefined : undefined,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
  )

  try {
    // Refresh the session if it exists
    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log("[Middleware] Session check:", {
      path: req.nextUrl.pathname,
      hasSession: Boolean(session),
      userId: session?.user?.id || null,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
    })

    // If user is not logged in and trying to access protected routes
    if (
      !session &&
      (req.nextUrl.pathname.startsWith("/account") || req.nextUrl.pathname.startsWith("/admin")) &&
      !req.nextUrl.pathname.includes("/account/login") &&
      !req.nextUrl.pathname.includes("/account/signup")
    ) {
      console.log("[Middleware] Redirecting to login: No session for protected route")
      const redirectUrl = new URL("/account/login", req.url)
      redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is logged in and trying to access login/signup pages
    if (
      session &&
      (req.nextUrl.pathname.includes("/account/login") || req.nextUrl.pathname.includes("/account/signup"))
    ) {
      console.log("[Middleware] Redirecting to account: User already logged in")
      return NextResponse.redirect(new URL("/account", req.url))
    }

    // Try to refresh the session if it's close to expiring (within 1 hour)
    if (session && session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000)
      const now = new Date()
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

      if (expiresAt < oneHourFromNow) {
        console.log("[Middleware] Session expiring soon, refreshing")
        await supabase.auth.refreshSession()
      }
    }

    // Handle category slug redirects for old URLs
    // This is a simplified example - in a real app, you might want to check against a database of old slugs
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

    return res
  } catch (error) {
    console.error("[Middleware] Error in middleware:", error)
    return res
  }
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
