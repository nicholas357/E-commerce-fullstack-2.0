import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  // Use environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lgfnbyurnavwxtcrftzx.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZm5ieXVybmF2d3h0Y3JmdHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTQ3NDIsImV4cCI6MjA1OTk3MDc0Mn0.4iKhdwzJeNGxV8DO3jpQ-OwmOfjKg1cvIFPUed3akOI"

  supabaseClient = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      fetch: (...args) => {
        // Add a longer timeout for fetch operations
        return fetch(...args)
      },
    },
    // Add storage-specific options
    storage: {
      // Increase timeout for large file uploads
      uploadTimeout: 30000,
    },
  })

  return supabaseClient
}
