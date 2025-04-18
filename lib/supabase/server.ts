import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { getEnv } from "@/lib/config"
import type { NextApiRequest, NextApiResponse } from "next"
import type { CookieOptions } from "@supabase/auth-helpers-nextjs"

// For use in API routes
export function createServerClient(req: NextApiRequest, res: NextApiResponse) {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or key is missing in environment variables")
  }

  return createServerComponentClient({
    supabaseUrl,
    supabaseKey,
    cookies: {
      get(name) {
        return req.cookies[name]
      },
      set(name, value, options) {
        res.setHeader("Set-Cookie", serializeCookie(name, value, options))
      },
      remove(name, options) {
        res.setHeader(
          "Set-Cookie",
          serializeCookie(name, "", {
            ...options,
            maxAge: 0,
          }),
        )
      },
    },
  })
}

// For use in getServerSideProps
export function createServerSideClient(req: any, res: any) {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or key is missing in environment variables")
  }

  return createServerComponentClient({
    supabaseUrl,
    supabaseKey,
    cookies: {
      get(name) {
        return req.cookies[name]
      },
      set(name, value, options) {
        res.setHeader("Set-Cookie", serializeCookie(name, value, options))
      },
      remove(name, options) {
        res.setHeader(
          "Set-Cookie",
          serializeCookie(name, "", {
            ...options,
            maxAge: 0,
          }),
        )
      },
    },
  })
}

// For direct server access (e.g., in API routes without req/res)
export function createAdminClient() {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or key is missing in environment variables")
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Helper function to serialize cookies
function serializeCookie(name: string, value: string, options: CookieOptions = {}) {
  const stringValue = typeof value === "object" ? `j:${JSON.stringify(value)}` : String(value)

  const cookieOptions = {
    ...options,
  }

  if (options.maxAge) {
    cookieOptions.expires = new Date(Date.now() + options.maxAge * 1000)
  }

  let cookie = `${name}=${encodeURIComponent(stringValue)}`

  if (cookieOptions.path) {
    cookie += `; Path=${cookieOptions.path}`
  }

  if (cookieOptions.expires) {
    cookie += `; Expires=${cookieOptions.expires.toUTCString()}`
  }

  if (cookieOptions.maxAge) {
    cookie += `; Max-Age=${cookieOptions.maxAge}`
  }

  if (cookieOptions.domain) {
    cookie += `; Domain=${cookieOptions.domain}`
  }

  if (cookieOptions.secure) {
    cookie += "; Secure"
  }

  if (cookieOptions.httpOnly) {
    cookie += "; HttpOnly"
  }

  if (cookieOptions.sameSite) {
    cookie += `; SameSite=${cookieOptions.sameSite}`
  }

  return cookie
}

// Maintain backward compatibility
export const createClient = createAdminClient
