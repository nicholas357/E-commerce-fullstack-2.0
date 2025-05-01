import { createBrowserClient } from "@supabase/ssr"
import { getEnv } from "@/lib/config"

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

// Track connection status
let connectionStatus = {
  isConnected: false,
  lastConnected: null as Date | null,
  reconnectAttempts: 0,
}

export function getClientClient() {
  if (supabaseClient) {
    console.log("[Supabase Client] Returning existing client instance")
    return supabaseClient
  }

  console.log("[Supabase Client] Creating new client instance")
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  if (!supabaseUrl || !supabaseKey) {
    console.error("[Supabase Client] Missing environment variables")
    throw new Error("Supabase URL or anon key is missing in environment variables")
  }

  // Create browser client with proper cookie settings
  supabaseClient = createBrowserClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        // Parse cookies from document.cookie
        const cookies = document.cookie.split(";").reduce(
          (acc, cookie) => {
            const [key, value] = cookie.trim().split("=")
            if (key) acc[key.trim()] = decodeURIComponent(value || "")
            return acc
          },
          {} as Record<string, string>,
        )
        console.log(`[Supabase Client] Getting cookie: ${name}, exists: ${Boolean(cookies[name])}`)
        return cookies[name]
      },
      set(name, value, options) {
        console.log(`[Supabase Client] Setting cookie: ${name}, options:`, options)
        // Set cookie with proper attributes for production
        const secure = options?.secure || location.protocol === "https:"
        const maxAge = options?.maxAge || 60 * 60 * 24 * 30 // 30 days default
        const domain = options?.domain || window.location.hostname
        const sameSite = options?.sameSite || "lax"

        document.cookie = `${name}=${encodeURIComponent(value)}; path=${
          options?.path || "/"
        }; max-age=${maxAge}; domain=${domain}; samesite=${sameSite}${secure ? "; secure" : ""}`
      },
      remove(name, options) {
        console.log(`[Supabase Client] Removing cookie: ${name}`)
        // Remove cookie by setting expiry in the past
        document.cookie = `${name}=; path=${options?.path || "/"}; max-age=-1; domain=${
          options?.domain || window.location.hostname
        }; samesite=${options?.sameSite || "lax"}${options?.secure || location.protocol === "https:" ? "; secure" : ""}`
      },
    },
    persistSession: true, // Ensure session is persisted
    autoRefreshToken: true, // Automatically refresh the token
  })

  // Initialize connection status
  connectionStatus = {
    isConnected: true,
    lastConnected: new Date(),
    reconnectAttempts: 0,
  }

  // Set up connection health check
  setupConnectionHealthCheck()

  return supabaseClient
}

// IMPORTANT: Add the missing export with the expected name
export const getSupabaseClient = getClientClient

// Helper function to check session status
export async function checkSessionStatus() {
  const client = getClientClient()
  try {
    const { data, error } = await client.auth.getSession()
    console.log("[Supabase Client] Session check:", {
      hasSession: Boolean(data.session),
      expiresAt: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null,
      error: error?.message,
    })

    // Update connection status on successful check
    connectionStatus = {
      isConnected: true,
      lastConnected: new Date(),
      reconnectAttempts: 0,
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

    // Try to reconnect
    if (connectionStatus.reconnectAttempts < 3) {
      console.log("[Supabase Client] Attempting to reconnect...")
      resetClient()
      return checkSessionStatus()
    }

    return { data: { session: null }, error: err }
  }
}

// Helper function to refresh the session
export async function refreshSession() {
  const client = getClientClient()
  try {
    console.log("[Supabase Client] Attempting to refresh session")
    const { data, error } = await client.auth.refreshSession()
    console.log("[Supabase Client] Session refresh result:", {
      success: Boolean(data.session),
      error: error?.message,
    })

    // Update connection status on successful refresh
    if (!error) {
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

    // Try to reconnect
    if (connectionStatus.reconnectAttempts < 3) {
      console.log("[Supabase Client] Attempting to reconnect...")
      resetClient()
      return refreshSession()
    }

    return { data: { session: null }, error: err }
  }
}

// Reset the client to force a new connection
export function resetClient() {
  console.log("[Supabase Client] Resetting client instance")
  supabaseClient = null
  return getClientClient()
}

// Check connection health and reconnect if needed
function setupConnectionHealthCheck() {
  if (typeof window !== "undefined") {
    // Check connection on page visibility change (when user returns to the tab)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        console.log("[Supabase Client] Page became visible, checking connection")
        checkConnection()
      }
    })

    // Check connection on online event (when network is restored)
    window.addEventListener("online", () => {
      console.log("[Supabase Client] Network connection restored, checking database connection")
      checkConnection()
    })

    // Set up periodic health check
    setInterval(checkConnection, 60000) // Check every minute
  }
}

// Check connection and reconnect if needed
async function checkConnection() {
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
}

// Export connection status for monitoring
export function getConnectionStatus() {
  return { ...connectionStatus }
}
