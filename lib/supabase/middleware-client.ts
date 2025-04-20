import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export function createMiddlewareSupabaseClient(req: NextRequest) {
  // Create a response object that we'll use to set cookies
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          req.cookies.set({ name, value, ...options })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          req.cookies.set({ name, value: "", ...options })
          res.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  return { supabase, res }
}
