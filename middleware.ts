// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  let session = null;
  try {
    // 1) Explicit env‑vars: fail early if you typo’d
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    // 2) Create the Supabase client in middleware
    const supabase = createMiddlewareClient(
      { req, res },
      {
        supabaseUrl,
        supabaseKey,
      }
    );

    // 3) Use getUser() to revalidate the token server‑side
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Supabase getUser error:", error);
    } else {
      session = user;
    }
  } catch (err) {
    console.error("Middleware edge error:", err);
    // -> we’re intentionally *not* returning an error response,
    //    so the rest of your site still works even if auth check fails
  }

  // ——— your existing redirect logic below ———

  // not logged in → protected
  if (
    !session &&
    (req.nextUrl.pathname.startsWith("/account") ||
      req.nextUrl.pathname.startsWith("/admin")) &&
    !req.nextUrl.pathname.includes("/account/login") &&
    !req.nextUrl.pathname.includes("/account/signup")
  ) {
    const redirectUrl = new URL("/account/login", req.url);
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // logged in → don’t show login/signup
  if (
    session &&
    (req.nextUrl.pathname.includes("/account/login") ||
      req.nextUrl.pathname.includes("/account/signup"))
  ) {
    return NextResponse.redirect(new URL("/account", req.url));
  }

  // legacy slug redirects
  const redirects: Record<string, string> = {
    "/xbox-games": "/category/games/xbox-games",
    "/gift-cards": "/category/gift-cards",
    "/streaming-services": "/category/streaming-services",
    "/game-points": "/category/game-points",
    "/software": "/category/software",
  };
  for (const [from, to] of Object.entries(redirects)) {
    if (req.nextUrl.pathname.startsWith(from)) {
      return NextResponse.redirect(new URL(to, req.url));
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
