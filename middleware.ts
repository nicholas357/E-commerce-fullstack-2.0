import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function middleware(req: NextRequest) {
  // Create a response object
  const res = NextResponse.next()

  // Get the token from the cookie
  const token = req.cookies.get("supabase-auth-token")?.value

  // If no token is found and trying to access protected routes
  if (
    !token &&
    (req.nextUrl.pathname.startsWith("/account") || req.nextUrl.pathname.startsWith("/admin")) &&
    !req.nextUrl.pathname.includes("/account/login") &&
    !req.nextUrl.pathname.includes("/account/signup")
  ) {
    const redirectUrl = new URL("/account/login", req.url)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If token is found, verify it and check user role
  if (token) {
    try {
      // Initialize Supabase client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      )

      // Verify the token
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token)

      if (authError || !user) {
        // If there's an error or no user found, redirect to login
        if (req.nextUrl.pathname.startsWith("/account") || req.nextUrl.pathname.startsWith("/admin")) {
          const redirectUrl = new URL("/account/login", req.url)
          return NextResponse.redirect(redirectUrl)
        }
      }

      // Get the user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("firebase_uid", user.id)
        .single()

      if (profileError || !profile) {
        // If there's an error or no profile found, redirect to login
        if (req.nextUrl.pathname.startsWith("/account") || req.nextUrl.pathname.startsWith("/admin")) {
          const redirectUrl = new URL("/account/login", req.url)
          return NextResponse.redirect(redirectUrl)
        }
      }

      // Check if user is trying to access admin routes but doesn't have admin role
      if (req.nextUrl.pathname.startsWith("/admin") && profile.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }

      // If user is logged in and trying to access login/signup pages
      if (req.nextUrl.pathname.includes("/account/login") || req.nextUrl.pathname.includes("/account/signup")) {
        return NextResponse.redirect(new URL("/account", req.url))
      }
    } catch (error) {
      console.error("Error verifying token:", error)

      // If token verification fails and trying to access protected routes
      if (req.nextUrl.pathname.startsWith("/account") || req.nextUrl.pathname.startsWith("/admin")) {
        const redirectUrl = new URL("/account/login", req.url)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return res
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
}
