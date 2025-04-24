import { createBrowserClient } from "@supabase/ssr"
import { getEnv } from "@/lib/config"

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

function getClientClient() {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or anon key is missing in environment variables")
  }

  supabaseClient = createBrowserClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        const cookies = document.cookie.split(";").reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split("=")
          if (key === name) {
            try {
              return JSON.parse(decodeURIComponent(value))
            } catch (e) {
              return decodeURIComponent(value)
            }
          }
          return acc
        }, {})
        return cookies[name] || null
      },
      set(name, value, options) {
        const safeValue = typeof value === "object" ? JSON.stringify(value) : String(value)
        const encodedValue = encodeURIComponent(safeValue)
        document.cookie = `${name}=${encodedValue}; path=${options?.path || "/"}; max-age=${options?.maxAge || 31536000}; SameSite=Lax;${options?.secure ? " Secure" : ""}`
      },
      remove(name, options) {
        document.cookie = `${name}=; path=${options?.path || "/"}; max-age=0; SameSite=Lax;${options?.secure ? " Secure" : ""}`
      },
    },
  })

  return supabaseClient
}

// Add the missing export with the expected name
export const getSupabaseClient = getClientClient
