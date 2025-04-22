import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // 🧠 Create Supabase client with dynamic cookie settings
  const supabase = createMiddlewareClient({
    req,
    res,
    options: {
      cookies: {
        name: "sb",  // your cookie name
        lifetime: 365 * 24 * 60 * 60, // cookie lifetime
        domain: process.env.NODE_ENV === "production" ? "yourdomain.com" : "localhost",
        path: "/",
        sameSite: "Lax",  // recommended for cross-site sessions
        secure: process.env.NODE_ENV === "production", // true in production, false in dev
      },
    },
  })

  // 📡 Try to get session
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  // 🐞 Debug session
  console.log("🔐 Session in middleware:", session?.user?.email || "No session")
  console.log("📄 Requested Path:", req.nextUrl.pathname)

  if (error) {
    console.error("❌ Error fetching session:", error.message)
  }

  // 🔐 Route protection logic
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/account") ||
    req.nextUrl.pathname.startsWith("/admin") ||
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/profile") ||
    req.nextUrl.pathname === "/checkout"

  const isAuthPage =
    req.nextUrl.pathname.includes("/account/login") ||
    req.nextUrl.pathname.includes("/account/signup")

  // If session is not found and trying to access protected route, redirect to login
  if (!session && isProtectedRoute && !isAuthPage) {
    const redirectUrl = new URL("/account/login", req.url)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If already logged in and trying to access login/signup, redirect to account
  if (session && isAuthPage) {
    const dashboardUrl = new URL("/account", req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return res
}

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/checkout",
  ],
}
