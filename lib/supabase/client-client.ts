import { createClient } from "./client"
import { setAuthCookie } from "@/lib/auth-cookies"

// Singleton instance
let supabaseClient: any = null

// Track connection status
let connectionStatus = {
  isConnected: false,
  lastConnected: null as Date | null,
  reconnectAttempts: 0,
}

// Get the Supabase client
export function getClient() {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
}

// Alias for getClient for backward compatibility
export function getClientClient() {
  return getClient()
}

// Alias for getClient for backward compatibility
export function getSupabaseClient() {
  return getClient()
}

// Reset the client (useful for connection recovery)
export function resetClient() {
  supabaseClient = null
  return getClient()
}

// Check session status
export async function checkSessionStatus() {
  const client = getClient()
  try {
    const { data, error } = await client.auth.getSession()

    // Update connection status on successful check
    if (!error) {
      connectionStatus = {
        isConnected: true,
        lastConnected: new Date(),
        reconnectAttempts: 0,
      }
    }

    return { data, error }
  } catch (err) {
    console.error("[Supabase Client] Error checking session:", err)

    // Update connection status on failure
    connectionStatus = {
      ...connectionStatus,
      isConnected: false,
      reconnectAttempts: connectionStatus.reconnectAttempts + 1,
    }

    return { data: { session: null }, error: err }
  }
}

// Refresh session
export async function refreshSession() {
  const client = getClient()
  try {
    const { data, error } = await client.auth.refreshSession()

    // If successful, manually update our custom cookie
    if (data.session && data.user) {
      const userData = {
        id: data.user.id,
        email: data.user.email || "",
        full_name: data.user.user_metadata?.full_name || "",
        avatar_url: data.user.user_metadata?.avatar_url || "",
        role: data.user.app_metadata?.role || "user",
        expiresAt: data.session.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null,
      }

      setAuthCookie(userData)

      // Update connection status on successful refresh
      connectionStatus = {
        isConnected: true,
        lastConnected: new Date(),
        reconnectAttempts: 0,
      }
    }

    return { data, error }
  } catch (err) {
    console.error("[Supabase Client] Error refreshing session:", err)

    // Update connection status on failure
    connectionStatus = {
      ...connectionStatus,
      isConnected: false,
      reconnectAttempts: connectionStatus.reconnectAttempts + 1,
    }

    return { data: { session: null, user: null }, error: err }
  }
}

// Manual sign in with OAuth (without cookies)
export async function signInWithOAuth(provider: string, redirectTo: string) {
  const client = getClient()
  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    return { data, error }
  } catch (err) {
    console.error(`[Supabase Client] Error signing in with ${provider}:`, err)
    return { data: null, error: err }
  }
}

// Check connection and reconnect if needed
export async function checkConnection() {
  if (
    !connectionStatus.isConnected ||
    (connectionStatus.lastConnected && new Date().getTime() - connectionStatus.lastConnected.getTime() > 5 * 60 * 1000)
  ) {
    console.log("[Supabase Client] Connection check: reconnecting...")
    try {
      const client = resetClient()
      const { error } = await client.from("profiles").select("count", { count: "exact", head: true })

      if (error) {
        console.error("[Supabase Client] Connection check failed:", error)
        connectionStatus.isConnected = false
        connectionStatus.reconnectAttempts += 1
      } else {
        console.log("[Supabase Client] Connection check successful")
        connectionStatus = {
          isConnected: true,
          lastConnected: new Date(),
          reconnectAttempts: 0,
        }
      }
    } catch (err) {
      console.error("[Supabase Client] Connection check exception:", err)
      connectionStatus.isConnected = false
      connectionStatus.reconnectAttempts += 1
    }
  }

  return connectionStatus.isConnected
}

// Export connection status for monitoring
export function getConnectionStatus() {
  return { ...connectionStatus }
}
