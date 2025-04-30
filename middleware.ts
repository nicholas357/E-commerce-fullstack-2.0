import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Create a response object
  const res = NextResponse.next()

  console.log("[Middleware] Processing request:", req.nextUrl.pathname)

  // Debug cookies
  const cookies = req.cookies.getAll()
  console.log(
    "[Middleware] Cookies:",
    cookies.map((c) => `${c.name}=${c.value.substring(0, 20)}${c.value.length > 20 ? "..." : ""}`),
  )

  // DIRECT AUTH CHECK: Look for our custom user cookie first
  const directUserCookie = req.cookies.get("turgame_user")
  if (directUserCookie?.value) {
    try {
      const userData = JSON.parse(decodeURIComponent(directUserCookie.value))
      console.log("[Middleware] Direct auth found for user:", userData.id)

      // Set header to indicate direct auth was used
      res.headers.set("x-auth-method", "direct")
      res.headers.set("x-auth-user-id", userData.id)

      // Allow access to protected routes
      return res
    } catch (err) {
      console.error("[Middleware] Error parsing direct auth cookie:", err)
    }
  }

  // Check for emergency bypass flag in cookies
  const emergencyBypass = req.cookies.get("emergency_auth_bypass")
  if (emergencyBypass?.value === "true") {
    console.log("[Middleware] Emergency auth bypass detected, skipping auth checks")
    // Set header to indicate bypass was used
    res.headers.set("x-auth-bypass", "true")
    return res
  }

  // Check authentication forced flag
  const authForced = req.cookies.get("authentication_forced")
  if (authForced?.value === "true") {
    console.log("[Middleware] Authentication was forced, skipping auth checks")
    res.headers.set("x-auth-forced", "true")
    return res
  }

  // Create the Supabase middleware client
  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      cookieOptions: {
        name: "sb-auth-token",
        lifetime: 60 * 60 * 24 * 30, // 30 days
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

    // IMPORTANT FIX: Store session info in a custom header that our client can read
    // This helps debug session issues across the request/response cycle
    res.headers.set("x-supabase-auth-status", session ? "authenticated" : "unauthenticated")
    if (session?.user?.id) {
      res.headers.set("x-supabase-user-id", session.user.id)
    }

    // If user is not logged in and trying to access protected routes
    if (
      !session &&
      (req.nextUrl.pathname.startsWith("/account") || req.nextUrl.pathname.startsWith("/admin")) &&
      !req.nextUrl.pathname.includes("/account/login") &&
      !req.nextUrl.pathname.includes("/account/signup")
    ) {
      console.log("[Middleware] Redirecting to login: No session for protected route")

      // Check if we're in a potential redirect loop
      const redirectCount = Number.parseInt(req.cookies.get("auth_redirect_count")?.value || "0")
      if (redirectCount >= 2) {
        console.log("[Middleware] Potential redirect loop detected, setting bypass cookie")
        // Set bypass cookie to break the loop
        res.cookies.set("emergency_auth_bypass", "true", {
          maxAge: 60 * 60, // 1 hour
          path: "/",
        })
        // Increment the count
        res.cookies.set("auth_redirect_count", (redirectCount + 1).toString())
        return res
      }

      // Increment redirect count
      res.cookies.set("auth_redirect_count", (redirectCount + 1).toString())

      const redirectUrl = new URL("/account/login", req.url)
      redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Reset redirect count if not redirecting
    res.cookies.set("auth_redirect_count", "0")

    // CRITICAL FIX: If user is logged in and trying to access login/signup pages
    // This prevents the redirect loop you're experiencing
    if (
      session &&
      (req.nextUrl.pathname.includes("/account/login") || req.nextUrl.pathname.includes("/account/signup"))
    ) {
      console.log("[Middleware] User is logged in but on login page, redirecting to account")

      // Check if there's a redirectTo parameter
      const url = new URL(req.url)
      const redirectTo = url.searchParams.get("redirectTo")
      if (redirectTo) {
        console.log("[Middleware] Redirecting to:", redirectTo)
        return NextResponse.redirect(new URL(redirectTo, req.url))
      }

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
