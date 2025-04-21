import { createBrowserClient } from "@supabase/ssr"
import { getEnv } from "@/lib/config"

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function getClientClient() {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or anon key is missing in environment variables")
  }

  // Create the browser client with cookie persistence
  supabaseClient = createBrowserClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        // Get cookie from document.cookie
        const cookies = document.cookie.split(";").map((cookie) => cookie.trim())
        const cookie = cookies.find((cookie) => cookie.startsWith(`${name}=`))
        return cookie ? cookie.split("=")[1] : undefined
      },
      set(name, value, options) {
        // Set cookie in document.cookie
        document.cookie = `${name}=${value}; path=/; max-age=${options?.maxAge || 3600 * 24 * 7}; ${options?.secure ? "secure; " : ""}${options?.sameSite ? `samesite=${options.sameSite}; ` : ""}`
      },
      remove(name, options) {
        // Remove cookie by setting expiry in the past
        document.cookie = `${name}=; path=/; max-age=0; ${options?.secure ? "secure; " : ""}${options?.sameSite ? `samesite=${options.sameSite}; ` : ""}`
      },
    },
  })

  return supabaseClient
}

// Add the missing export with the expected name
export const getSupabaseClient = getClientClient
