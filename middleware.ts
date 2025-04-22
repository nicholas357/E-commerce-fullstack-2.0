import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Get the cookies from the request
  const reqCookies = req.headers.get("cookie") || "";
  const resCookies: string[] = [];

  // Create the Supabase client with server-side cookies
  const supabase = createServerClient(reqCookies, resCookies);

  // Get session data
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Attach updated cookies to the response
  resCookies.forEach((cookie) => {
    res.headers.append("Set-Cookie", cookie);
  });

  // Redirect unauthenticated users
  const pathname = req.nextUrl.pathname;

  // Define protected routes
  const protectedRoutes = ["/account", "/admin"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // If no session and trying to access protected route, redirect to login
  if (!session && isProtected && !pathname.includes("/login") && !pathname.includes("/signup")) {
    const redirectUrl = new URL("/account/login", req.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is already logged in and trying to access login/signup pages, redirect to the account page
  if (session && (pathname.includes("/login") || pathname.includes("/signup"))) {
    return NextResponse.redirect(new URL("/account", req.url));
  }

  return res;
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
};
