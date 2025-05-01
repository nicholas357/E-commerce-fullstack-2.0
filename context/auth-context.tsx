"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast-provider"
import { createClient } from "@/lib/supabase/client"
import { checkSessionStatus, refreshSession } from "@/lib/supabase/client-client"

// Import the auth cookie utilities
import { setAuthCookie, getAuthFromCookie, clearAuthCookie } from "@/lib/auth-cookies"

// Define the User type
type User = {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role?: string
  expiresAt?: string | null
}

// Define the AuthContext type
type AuthContextType = {
  user: User | null
  profile: any
  isLoading: boolean
  isAdmin: boolean
  error: string | null
  sessionStatus: {
    hasSession: boolean
    expiresAt: string | null
    lastChecked: string | null
    refreshAttempts: number
  }
  debugMode: boolean
  toggleDebugMode: () => void
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error?: string }>
  checkSession: () => Promise<boolean>
  refreshUserSession: () => Promise<boolean>
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create the AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [sessionStatus, setSessionStatus] = useState({
    hasSession: false,
    expiresAt: null as string | null,
    lastChecked: null as string | null,
    refreshAttempts: 0,
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const { addToast } = useToast()
  const supabase = createClient()

  // Check if the user is an admin
  const isAdmin = user?.role === "admin"

  const toggleDebugMode = useCallback(() => {
    setDebugMode((prev) => !prev)
    console.log("[Auth] Debug mode:", !debugMode)
  }, [debugMode])

  // Safely fetch profile with retries and connection recovery
  const fetchUserProfile = useCallback(async (userId: string, retries = 3): Promise<any> => {
    try {
      console.log(`[Auth] Fetching profile for user ${userId}, attempt ${4 - retries}`)

      // Create a fresh client for each attempt to avoid stale connections
      const client = createClient()

      const { data, error } = await client.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error(`[Auth] Error fetching profile (attempt ${4 - retries}):`, error)

        // If we have retries left, wait and try again
        if (retries > 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second
          return fetchUserProfile(userId, retries - 1)
        }

        throw error
      }

      console.log("[Auth] Profile fetched successfully:", data?.id)
      return data
    } catch (err) {
      console.error(`[Auth] Failed to fetch profile after ${4 - retries} attempts:`, err)

      // If this looks like a connection issue, try to reset the client
      if (
        err instanceof Error &&
        (err.message.includes("Failed to fetch") ||
          err.message.includes("NetworkError") ||
          err.message.includes("network") ||
          err.message.includes("connection"))
      ) {
        console.log("[Auth] Detected connection issue, resetting client...")
        // Import and use the resetClient function
        const { resetClient } = await import("@/lib/supabase/client-client")
        resetClient()
      }

      // Return a minimal profile to prevent breaking the auth flow
      return {
        id: userId,
        full_name: "",
        role: "user",
      }
    }
  }, [])

  // Function to check session status with connection recovery
  const checkSession = useCallback(async () => {
    try {
      console.log("[Auth] Checking session status")

      // First check if we have user data in the cookie
      const cookieAuth = getAuthFromCookie()
      if (cookieAuth && cookieAuth.id) {
        console.log("[Auth] Found user data in cookie:", cookieAuth.id)

        // Update session status based on cookie data
        setSessionStatus((prev) => ({
          ...prev,
          hasSession: true,
          expiresAt: cookieAuth.expiresAt || null,
          lastChecked: new Date().toISOString(),
        }))

        // If we don't already have a user set, set it from the cookie
        if (!user) {
          setUser(cookieAuth)
          setProfile(cookieAuth)
        }

        return true
      }

      // If no cookie, check with Supabase
      const { data, error } = await checkSessionStatus()

      const hasSession = Boolean(data.session)
      const expiresAt = data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null

      setSessionStatus((prev) => ({
        ...prev,
        hasSession,
        expiresAt,
        lastChecked: new Date().toISOString(),
      }))

      if (error) {
        console.error("[Auth] Session check error:", error)

        // If this looks like a connection issue, try to reset the client
        if (
          error instanceof Error &&
          (error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError") ||
            error.message.includes("network") ||
            error.message.includes("connection"))
        ) {
          console.log("[Auth] Detected connection issue during session check, resetting client...")
          // Import and use the resetClient function
          const { resetClient } = await import("@/lib/supabase/client-client")
          resetClient()
        }
      }

      return hasSession
    } catch (err) {
      console.error("[Auth] Error checking session:", err)

      // If this looks like a connection issue, try to reset the client
      if (
        err instanceof Error &&
        (err.message.includes("Failed to fetch") ||
          err.message.includes("NetworkError") ||
          err.message.includes("network") ||
          err.message.includes("connection"))
      ) {
        console.log("[Auth] Detected connection issue during session check exception, resetting client...")
        // Import and use the resetClient function
        const { resetClient } = await import("@/lib/supabase/client-client")
        resetClient()
      }

      return false
    }
  }, [user])

  // Function to refresh the user session - using useCallback to prevent recreation on each render
  const refreshUserSession = useCallback(async () => {
    try {
      console.log("[Auth] Attempting to refresh session")
      setSessionStatus((prev) => ({
        ...prev,
        refreshAttempts: prev.refreshAttempts + 1,
      }))

      const { data, error } = await refreshSession()

      if (error) {
        console.error("[Auth] Session refresh error:", error)
        return false
      }

      if (data.session) {
        console.log("[Auth] Session refreshed successfully")
        setSessionStatus((prev) => ({
          ...prev,
          hasSession: true,
          expiresAt: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null,
          lastChecked: new Date().toISOString(),
        }))

        // Update user data after successful refresh
        if (data.session.user) {
          try {
            // Use the safe profile fetch method
            const profileData = await fetchUserProfile(data.session.user.id)

            const userData = {
              id: data.session.user.id,
              email: data.session.user.email || "",
              full_name: profileData?.full_name || "",
              avatar_url: profileData?.avatar_url || "",
              role: profileData?.role || "user",
              expiresAt: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null,
            }

            setUser(userData)
            setProfile(profileData)

            // Update the auth cookie
            setAuthCookie(userData)
          } catch (profileErr) {
            console.error("[Auth] Error fetching profile after refresh:", profileErr)

            // Still update user with basic info even if profile fetch fails
            const userData = {
              id: data.session.user.id,
              email: data.session.user.email || "",
              full_name: "",
              role: "user",
              expiresAt: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null,
            }

            setUser(userData)
            setAuthCookie(userData)
          }
        }

        return true
      }

      return false
    } catch (err) {
      console.error("[Auth] Error refreshing session:", err)
      return false
    }
  }, [fetchUserProfile])

  // Check if the user is logged in - only run once on mount
  useEffect(() => {
    // Skip if already initialized
    if (isInitialized) return

    const checkUser = async () => {
      try {
        console.log("[Auth] Initial auth check")
        setIsLoading(true)
        setError(null)

        // First check if we have user data in the cookie
        const cookieAuth = getAuthFromCookie()
        if (cookieAuth) {
          console.log("[Auth] Found user data in cookie:", cookieAuth.id)
          setUser(cookieAuth)
          setProfile(cookieAuth)
          setSessionStatus({
            hasSession: true,
            expiresAt: cookieAuth.expiresAt || null,
            lastChecked: new Date().toISOString(),
            refreshAttempts: 0,
          })

          // Verify with Supabase that the session is still valid
          const {
            data: { session },
          } = await supabase.auth.getSession()
          if (!session) {
            console.log("[Auth] Cookie session found but Supabase session invalid, attempting refresh")
            await refreshUserSession()
          }

          setIsLoading(false)
          setIsInitialized(true)
          return
        }

        // Get the current session from Supabase
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        console.log("[Auth] Initial session check:", {
          hasSession: Boolean(session),
          error: sessionError?.message,
        })

        if (sessionError) {
          console.error("[Auth] Session error:", sessionError)
          throw sessionError
        }

        if (session?.user) {
          console.log("[Auth] User found in session:", session.user.id)

          try {
            // Use the safe profile fetch method
            const profileData = await fetchUserProfile(session.user.id)

            const userData = {
              id: session.user.id,
              email: session.user.email || "",
              full_name: profileData?.full_name || "",
              avatar_url: profileData?.avatar_url || "",
              role: profileData?.role || "user",
              expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
            }

            setUser(userData)
            setProfile(profileData)

            // Store user data in cookie for persistence
            setAuthCookie(userData)

            setSessionStatus({
              hasSession: true,
              expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
              lastChecked: new Date().toISOString(),
              refreshAttempts: 0,
            })
          } catch (profileErr) {
            console.error("[Auth] Error fetching profile:", profileErr)

            // Still set basic user data even if profile fetch fails
            const userData = {
              id: session.user.id,
              email: session.user.email || "",
              full_name: "",
              role: "user",
              expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
            }

            setUser(userData)
            setAuthCookie(userData)

            setSessionStatus({
              hasSession: true,
              expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
              lastChecked: new Date().toISOString(),
              refreshAttempts: 0,
            })
          }
        } else {
          console.log("[Auth] No user in session")
          setUser(null)
          setProfile(null)
          clearAuthCookie()
          setSessionStatus({
            hasSession: false,
            expiresAt: null,
            lastChecked: new Date().toISOString(),
            refreshAttempts: 0,
          })
        }
      } catch (err) {
        console.error("[Auth] Error checking user:", err)
        setError(null)
        setUser(null)
        setProfile(null)
        clearAuthCookie()
        setSessionStatus({
          hasSession: false,
          expiresAt: null,
          lastChecked: new Date().toISOString(),
          refreshAttempts: 0,
        })
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    checkUser()
  }, [isInitialized, refreshUserSession, supabase, fetchUserProfile])

  // Set up auth state change listener - separate from the initial check
  useEffect(() => {
    // Skip if not initialized yet
    if (!isInitialized) return

    console.log("[Auth] Setting up auth state change listener")

    // Add connection recovery on page visibility change
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        console.log("[Auth] Page became visible, checking session")
        await checkSession()
      }
    }

    // Set up visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Auth] Auth state change event:", event)

      if (session?.user) {
        console.log("[Auth] User in auth change:", session.user.id)

        try {
          // Use the safe profile fetch method with retries
          const profileData = await fetchUserProfile(session.user.id)

          const userData = {
            id: session.user.id,
            email: session.user.email || "",
            full_name: profileData?.full_name || "",
            avatar_url: profileData?.avatar_url || "",
            role: profileData?.role || "user",
            expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
          }

          setUser(userData)
          setProfile(profileData)

          // Store user data in cookie for persistence
          setAuthCookie(userData)

          setSessionStatus({
            hasSession: true,
            expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
            lastChecked: new Date().toISOString(),
            refreshAttempts: 0,
          })
        } catch (err) {
          console.error("[Auth] Error in auth state change handler:", err)

          // Still update user with basic info even if profile fetch fails
          const userData = {
            id: session.user.id,
            email: session.user.email || "",
            full_name: "",
            role: "user",
            expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
          }

          setUser(userData)
          setAuthCookie(userData)

          setSessionStatus({
            hasSession: true,
            expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
            lastChecked: new Date().toISOString(),
            refreshAttempts: 0,
          })
        }
      } else {
        console.log("[Auth] No user in auth change event")
        setUser(null)
        setProfile(null)
        clearAuthCookie()
        setSessionStatus({
          hasSession: false,
          expiresAt: null,
          lastChecked: new Date().toISOString(),
          refreshAttempts: 0,
        })
      }

      setIsLoading(false)
    })

    // Set up periodic session check - but only if initialized
    const sessionCheckInterval = setInterval(
      () => {
        if (!isLoading) {
          checkSession()
        }
      },
      5 * 60 * 1000,
    ) // Check every 5 minutes

    // Cleanup subscription on unmount
    return () => {
      console.log("[Auth] Cleaning up auth subscriptions")
      subscription.unsubscribe()
      clearInterval(sessionCheckInterval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isInitialized, isLoading, checkSession, supabase, fetchUserProfile])

  // Sign in with email and password
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        console.log("[Auth] Attempting sign in:", email)
        setIsLoading(true)
        setError(null)

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          console.error("[Auth] Sign in error:", error)
          throw error
        }

        console.log("[Auth] Sign in successful:", data.user?.id)

        addToast({
          title: "Signed in successfully",
          description: "Welcome back!",
          type: "success",
        })

        return {}
      } catch (err: any) {
        console.error("[Auth] Error signing in:", err)
        const errorMessage = err.message || "Invalid email or password. Please try again."
        setError(errorMessage)
        return { error: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    [addToast, supabase],
  )

  // Sign up with email and password
  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        console.log("[Auth] Attempting sign up:", email)
        setIsLoading(true)
        setError(null)

        // Validate password length
        if (password.length < 6) {
          const errorMessage = "Password must be at least 6 characters long"
          console.error("[Auth] Password validation failed")
          setError(errorMessage)
          return { error: errorMessage }
        }

        // Use the built-in Supabase signup method
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })

        if (signUpError) {
          console.error("[Auth] Sign up error:", signUpError)
          throw signUpError
        }

        if (!data?.user) {
          console.error("[Auth] No user returned from sign up")
          throw new Error("Failed to create user account")
        }

        console.log("[Auth] Sign up successful:", data.user.id)

        // Try to create the profile manually
        try {
          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: "user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (profileError) {
            console.error("[Auth] Error creating profile:", profileError)
          } else {
            console.log("[Auth] Profile created successfully")
          }
        } catch (profileError) {
          console.error("[Auth] Exception creating profile:", profileError)
          // Continue even if profile creation fails - the trigger should handle it
        }

        addToast({
          title: "Account created successfully",
          description: "Welcome to TurGame!",
          type: "success",
        })

        return {}
      } catch (err: any) {
        console.error("[Auth] Error signing up:", err)
        const errorMessage = err.message || "Failed to create account. Please try again."
        setError(errorMessage)
        return { error: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    [addToast, supabase],
  )

  // Sign in with Google
  const handleSignInWithGoogle = useCallback(async () => {
    try {
      console.log("[Auth] Attempting Google sign in")
      setIsLoading(true)
      setError(null)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("[Auth] Google sign in error:", error)
        throw error
      }

      console.log("[Auth] Google sign in initiated")
      return {}
    } catch (err: any) {
      console.error("[Auth] Error signing in with Google:", err)
      const errorMessage = err.message || "Failed to sign in with Google. Please try again."
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      console.log("[Auth] Attempting sign out")
      setIsLoading(true)
      setError(null)

      // Clear the auth cookie first
      clearAuthCookie()

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("[Auth] Sign out error:", error)
        throw error
      }

      console.log("[Auth] Sign out successful")
      setUser(null)
      setProfile(null)
      setSessionStatus({
        hasSession: false,
        expiresAt: null,
        lastChecked: new Date().toISOString(),
        refreshAttempts: 0,
      })

      addToast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
        type: "info",
      })

      router.push("/")
    } catch (err: any) {
      console.error("[Auth] Error signing out:", err)
      setError(err.message || "Failed to sign out. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [addToast, router, supabase])

  // Create the context value
  const value = {
    user,
    profile,
    isLoading,
    isAdmin,
    error,
    sessionStatus,
    debugMode,
    toggleDebugMode,
    signIn,
    signUp,
    signOut,
    signInWithGoogle: handleSignInWithGoogle,
    checkSession,
    refreshUserSession,
  }

  // Return the AuthContext.Provider
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Create the useAuth hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
