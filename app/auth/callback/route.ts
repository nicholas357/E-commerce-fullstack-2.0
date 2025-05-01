import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Handle OAuth errors
  if (error) {
    console.error("[Auth Callback] OAuth error:", error, errorDescription)
    // Redirect to login with error parameters
    return NextResponse.redirect(
      new URL(
        `/account/login?error=${error}&error_description=${errorDescription || "Authentication failed"}`,
        request.url,
      ),
    )
  }

  let redirectPath = "/account"

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies })
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("[Auth Callback] Code exchange error:", exchangeError)
        return NextResponse.redirect(
          new URL(`/account/login?error=exchange_failed&error_description=${exchangeError.message}`, request.url),
        )
      }

      console.log("[Auth Callback] Successfully exchanged code for session")

      // Check for a stored return path
      const cookieStore = cookies()
      const returnPathCookie = cookieStore.get("authReturnPath")

      if (returnPathCookie?.value) {
        redirectPath = returnPathCookie.value
        // Clear the cookie
        cookies().set("authReturnPath", "", { maxAge: 0 })
      }

      // Add a success parameter to trigger client-side refresh
      return NextResponse.redirect(new URL(`${redirectPath}?auth_success=true&timestamp=${Date.now()}`, request.url))
    } catch (err) {
      console.error("[Auth Callback] Exception during code exchange:", err)
      return NextResponse.redirect(
        new URL(`/account/login?error=exchange_exception&error_description=An unexpected error occurred`, request.url),
      )
    }
  } else {
    console.error("[Auth Callback] No code provided in callback")
    return NextResponse.redirect(
      new URL(`/account/login?error=no_code&error_description=No authentication code received`, request.url),
    )
  }
}
