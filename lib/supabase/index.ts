// Re-export the client functions without importing them
// This file is safe to import anywhere
export { createServerSupabaseClient } from "./server-client"
export { createBrowserSupabaseClient } from "./client-client"
export { createMiddlewareSupabaseClient } from "./middleware-client"
export { createApiSupabaseClient } from "./api-client"

// Type exports
export type { SupabaseClient } from "@supabase/supabase-js"
