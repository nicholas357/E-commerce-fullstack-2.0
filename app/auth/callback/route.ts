import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  console.log("[Auth Callback] Processing callback with URL:", request.url)
  console.log("[Auth Callback] Code present:", Boolean(code))
  console.log("[Auth Callback] Error present:", Boolean(error))

  // Handle OAuth errors
  if (error) {
    console.error("[Auth Callback] OAuth error:", error, errorDescription)
    // Redirect to login with error parameters
    return NextResponse.redirect(
      new URL(
        `/account/login?error=${error}&error_description=${errorDescription || "Authentication failed"}`,
        requestUrl.origin,
      ),
    )
  }

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      console.log("[Auth Callback] Exchanging code for session...")
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("[Auth Callback] Code exchange error:", exchangeError)
        return NextResponse.redirect(
          new URL(`/account/login?error=exchange_failed&error_description=${exchangeError.message}`, requestUrl.origin),
        )
      }

      console.log("[Auth Callback] Successfully exchanged code for session")
    } catch (err) {
      console.error("[Auth Callback] Exception during code exchange:", err)
      return NextResponse.redirect(
        new URL(
          `/account/login?error=exchange_exception&error_description=An unexpected error occurred`,
          requestUrl.origin,
        ),
      )
    }
  } else {
    console.error("[Auth Callback] No code provided in callback")
  }

  // Check for a stored return path
  const cookieStore = cookies()
  const returnPathCookie = cookieStore.get("authReturnPath")
  const redirectAfterLoginCookie = cookieStore.get("redirectAfterLogin")
  let redirectPath = "/account"

  if (returnPathCookie?.value) {
    redirectPath = returnPathCookie.value
    // Clear the cookie
    cookies().set("authReturnPath", "", { maxAge: 0 })
  } else if (redirectAfterLoginCookie?.value) {
    redirectPath = redirectAfterLoginCookie.value
    // Clear the cookie
    cookies().set("redirectAfterLogin", "", { maxAge: 0 })
  }

  console.log("[Auth Callback] Redirecting to:", redirectPath)

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
}
