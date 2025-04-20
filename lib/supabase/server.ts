import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { getEnv } from "@/lib/config"
import { parse, serialize } from "cookie"

// Create a Supabase client for server-side usage (API routes, getServerSideProps)
export function createServerClient(reqCookies?: string | null) {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or key is missing in environment variables")
  }

  // Parse cookies from the request
  const cookies = reqCookies ? parse(reqCookies) : {}

  return createSupabaseServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        return cookies[name]
      },
      set(name, value, options) {
        // This is handled in the API route or getServerSideProps
        // We'll need to manually set cookies in those contexts
        cookies[name] = value
      },
      remove(name, options) {
        // This is handled in the API route or getServerSideProps
        delete cookies[name]
      },
    },
  })
}

// Helper function to set cookies in API routes
export function setServerCookie(res: any, name: string, value: string, options: any = {}) {
  const cookie = serialize(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
    ...options,
  })

  // Set the cookie header
  const setCookieHeader = res.getHeader("Set-Cookie") || []
  res.setHeader("Set-Cookie", Array.isArray(setCookieHeader) ? [...setCookieHeader, cookie] : [setCookieHeader, cookie])
}

// Helper function to remove cookies in API routes
export function removeServerCookie(res: any, name: string, options: any = {}) {
  setServerCookie(res, name, "", { ...options, maxAge: -1 })
}

// For backward compatibility
export const createClient = createServerClient
