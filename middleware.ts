import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  const isAuthPage =
    pathname.includes("/account/login") || pathname.includes("/account/signup");

  const isProtectedRoute =
    pathname.startsWith("/account") || pathname.startsWith("/admin");

  // ✅ Redirect if logged-in user tries to visit login/signup
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/account", req.url));
  }

  // ✅ Redirect if not logged in AND session cookie is definitely missing
  // AND not on login/signup
  if (!session && isProtectedRoute && !isAuthPage) {
    const redirectUrl = new URL("/account/login", req.url);
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ✅ Handle legacy route redirects
  const legacyRedirects: Record<string, string> = {
    "/xbox-games": "/category/games/xbox-games",
    "/gift-cards": "/category/gift-cards",
    "/streaming-services": "/category/streaming-services",
    "/game-points": "/category/game-points",
    "/software": "/category/software",
  };

  for (const [legacyPath, newPath] of Object.entries(legacyRedirects)) {
    if (pathname.startsWith(legacyPath)) {
      return NextResponse.redirect(new URL(newPath, req.url));
    }
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
