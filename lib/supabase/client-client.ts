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

  supabaseClient = createBrowserClient(supabaseUrl, supabaseKey)
  return supabaseClient
}

// Add the missing export as an alias to the existing function
export const getSupabaseClient = getClientClient
