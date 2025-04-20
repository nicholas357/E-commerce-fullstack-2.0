// This is a Next.js Middleware
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware-client"

export async function middleware(req: NextRequest) {
  const { supabase, res } = createMiddlewareSupabaseClient(req)

  // Get the user's session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Example: redirect if not authenticated
  if (!session && req.nextUrl.pathname.startsWith("/protected")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return res
}

export const config = {
  matcher: ["/protected/:path*"],
}
