// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const reqCookies = req.headers.get("cookie") || ""
  const resCookies: string[] = []

  const supabase = createServerClient(reqCookies, resCookies)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Attach updated cookies to response
  resCookies.forEach((cookie) => {
    res.headers.append("Set-Cookie", cookie)
  })

  // Redirect unauthenticated users
  const pathname = req.nextUrl.pathname

  const protectedRoutes = ["/account", "/admin"]
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  if (!session && isProtected && !pathname.includes("/login") && !pathname.includes("/signup")) {
    const redirectUrl = new URL("/account/login", req.url)
    redirectUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (session && (pathname.includes("/login") || pathname.includes("/signup"))) {
    return NextResponse.redirect(new URL("/account", req.url))
  }

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
