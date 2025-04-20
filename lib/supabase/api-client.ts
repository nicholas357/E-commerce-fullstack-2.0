import { createServerClient } from "@supabase/ssr"
import type { NextApiRequest, NextApiResponse } from "next"
import type { CookieOptions } from "@supabase/ssr"

export function createApiSupabaseClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return req.cookies[name]
      },
      set(name: string, value: string, options: CookieOptions) {
        res.setHeader("Set-Cookie", `${name}=${value}; Path=/; ${serializeCookieOptions(options)}`)
      },
      remove(name: string, options: CookieOptions) {
        res.setHeader("Set-Cookie", `${name}=; Max-Age=0; Path=/; ${serializeCookieOptions(options)}`)
      },
    },
  })
}

// Helper to serialize cookie options
function serializeCookieOptions(options: CookieOptions): string {
  const parts = []

  if (options.domain) parts.push(`Domain=${options.domain}`)
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`)
  if (options.secure) parts.push("Secure")
  if (options.httpOnly) parts.push("HttpOnly")
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)

  return parts.join("; ")
}
