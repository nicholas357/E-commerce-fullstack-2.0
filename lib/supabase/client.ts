import { createBrowserClient } from "@supabase/ssr"
import { getEnv } from "@/lib/config"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  // Get Supabase URL and anon key from environment variables or config
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || getEnv("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  // Validate that we have the required values
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials. Please check your environment variables or config.ts file.", {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey,
    })
    throw new Error("Missing Supabase credentials. Check your environment variables or config.ts file.")
  }

  try {
    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
    return supabaseClient
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    throw error
  }
}

export function getSupabaseClient() {
  return createClient()
}
