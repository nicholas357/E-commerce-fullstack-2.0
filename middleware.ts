import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // 🧠 Create Supabase client
  const supabase = createMiddlewareClient({ req })

  // 📡 Try to get the session from Supabase's built-in session management
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  // 🐞 Debug session
  console.log("🔐 Session in middleware:", session?.user?.email || "No session")
  console.log("📄 Requested Path:", req.nextUrl.pathname)

  // ❌ Handle session fetch errors
  if (error) {
    console.error("❌ Session fetch error:", error.message)
    return NextResponse.next()  // Let the request continue (or log the error in the console)
  }

  // 🔐 Define protected routes
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/account") ||
    req.nextUrl.pathname.startsWith("/admin") ||
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/profile") ||
    req.nextUrl.pathname === "/checkout"

  const isAuthPage =
    req.nextUrl.pathname.includes("/account/login") ||
    req.nextUrl.pathname.includes("/account/signup")

  // 🔁 If NOT logged in and accessing a protected route
  if (!session && isProtectedRoute && !isAuthPage) {
    const redirectUrl = new URL("/account/login", req.url)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    console.log("➡️ Redirecting to login:", redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)
  }

  // 🚫 If logged in and accessing login/signup page, redirect to dashboard
  if (session && isAuthPage) {
    const dashboardUrl = new URL("/account", req.url)
    console.log("✅ Already logged in, redirecting to:", dashboardUrl.toString())
    return NextResponse.redirect(dashboardUrl)
  }

  // Legacy URL redirects (optional)
  const legacyRedirects: Record<string, string> = {
    "/xbox-games": "/category/games/xbox-games",
    "/gift-cards": "/category/gift-cards",
    "/streaming-services": "/category/streaming-services",
    "/game-points": "/category/game-points",
    "/software": "/category/software",
  }

  const redirectTarget = legacyRedirects[req.nextUrl.pathname]
  if (redirectTarget) {
    console.log("🧭 Redirecting legacy URL to:", redirectTarget)
    return NextResponse.redirect(new URL(redirectTarget, req.url))
  }

  return NextResponse.next()  // Continue with the request if no redirection needed
}

// ✅ Apply to all relevant protected routes
export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/checkout",
    "/xbox-games",
    "/gift-cards",
    "/streaming-services",
    "/game-points",
    "/software",
  ],
}
