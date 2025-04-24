import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { getEnv } from "@/lib/config"
import { parse, serialize } from "cookie"

// Create a server client that works with Pages Router
export function createServerClient(reqCookies?: string, resCookies?: Array<string>) {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or key is missing in environment variables")
  }

  // Parse cookies from the request
  const cookies = reqCookies ? parse(reqCookies || "") : {}

  // Create a cookie manager compatible with Pages Router
  const supabaseClient = createSupabaseServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        return cookies[name]
      },
      set(name, value, options) {
        if (!resCookies) return

        // Stringify the value before storing it in the cookie
        const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value)
        // Add the cookie to the response with proper security settings
        resCookies.push(
          serialize(name, stringValue, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: "lax",
            ...options,
          }),
        )
      },
      remove(name, options) {
        if (!resCookies) return

        // Add the cookie with an expired date to the response
        resCookies.push(
          serialize(name, "", {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: -1,
            sameSite: "lax",
            ...options,
          }),
        )
      },
    },
  })

  return supabaseClient
}

// For backward compatibility
export const createClient = (reqCookies?: string, resCookies?: Array<string>) => {
  return createServerClient(reqCookies, resCookies)
}

export { createSupabaseServerClient }
export { createServerClient as createServerSupabaseClient }
