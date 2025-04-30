"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast-provider"
import { createClient } from "@/lib/supabase/client"
import { checkSessionStatus, refreshSession } from "@/lib/supabase/client-client"

// Define the User type
type User = {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role?: string
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

// Helper function to get user from cookie/localStorage
function getUserFromStorage(): User | null {
  if (typeof window === "undefined") return null

  try {
    // Try to get from localStorage first
    const storedUser = localStorage.getItem("turgame_user")
    if (storedUser) {
      return JSON.parse(storedUser)
    }
    return null
  } catch (err) {
    console.error("[Auth] Error getting user from storage:", err)
    return null
  }
}

// Helper function to store user in cookie/localStorage
function storeUserInStorage(user: User | null): void {
  if (typeof window === "undefined") return

  try {
    if (user) {
      localStorage.setItem("turgame_user", JSON.stringify(user))
    } else {
      localStorage.removeItem("turgame_user")
    }
  } catch (err) {
    console.error("[Auth] Error storing user in storage:", err)
  }
}

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
  const router = useRouter()
  const { addToast } = useToast()
  const supabase = createClient()

  // Use refs to track initialization and prevent infinite loops
  const isInitialized = useRef(false)
  const checkingSession = useRef(false)

  // Check if the user is an admin
  const isAdmin = user?.role === "admin"

  const toggleDebugMode = () => {
    setDebugMode((prev) => !prev)
    console.log("[Auth] Debug mode:", !debugMode)
  }

  // Function to check session status
  const checkSession = async () => {
    if (checkingSession.current) return false

    try {
      checkingSession.current = true
      console.log("[Auth] Checking session status")

      // First check if we have a stored user
      const storedUser = getUserFromStorage()
      if (storedUser && !user) {
        console.log("[Auth] Found stored user:", storedUser.id)
        setUser(storedUser)
        setProfile(storedUser)
        setSessionStatus((prev) => ({
          ...prev,
          hasSession: true,
          lastChecked: new Date().toISOString(),
        }))
        checkingSession.current = false
        return true
      }

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
      }

      return hasSession || Boolean(storedUser)
    } catch (err) {
      console.error("[Auth] Error checking session:", err)
      return Boolean(getUserFromStorage())
    } finally {
      checkingSession.current = false
    }
  }

  // Function to refresh the user session
  const refreshUserSession = async () => {
    if (checkingSession.current) return false

    try {
      checkingSession.current = true
      console.log("[Auth] Attempting to refresh session")

      // First check if we have a stored user
      const storedUser = getUserFromStorage()
      if (storedUser && !user) {
        console.log("[Auth] Found stored user during refresh:", storedUser.id)
        setUser(storedUser)
        setProfile(storedUser)
        setSessionStatus((prev) => ({
          ...prev,
          hasSession: true,
          lastChecked: new Date().toISOString(),
        }))
        checkingSession.current = false
        return true
      }

      setSessionStatus((prev) => ({
        ...prev,
        refreshAttempts: prev.refreshAttempts + 1,
      }))

      const { data, error } = await refreshSession()

      if (error) {
        console.error("[Auth] Session refresh error:", error)
        return Boolean(storedUser)
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
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.session.user.id)
              .single()

            const userData = {
              id: data.session.user.id,
              email: data.session.user.email || "",
              full_name: profileData?.full_name || "",
              avatar_url: profileData?.avatar_url || "",
              role: profileData?.role || "user",
            }

            setUser(userData)
            setProfile(profileData)

            // Store user in storage
            storeUserInStorage(userData)
          } catch (profileErr) {
            console.error("[Auth] Error fetching profile after refresh:", profileErr)
          }
        }

        return true
      }

      return Boolean(storedUser)
    } catch (err) {
      console.error("[Auth] Error refreshing session:", err)
      return Boolean(getUserFromStorage())
    } finally {
      checkingSession.current = false
    }
  }

  // Check if the user is logged in
  useEffect(() => {
    // Prevent running this effect multiple times
    if (isInitialized.current) return
    isInitialized.current = true

    const checkUser = async () => {
      try {
        console.log("[Auth] Initial auth check")
        setIsLoading(true)
        setError(null)

        // First check for stored user
        const storedUser = getUserFromStorage()
        if (storedUser) {
          console.log("[Auth] Found stored user on initial load:", storedUser.id)
          setUser(storedUser)
          setProfile(storedUser)
          setSessionStatus({
            hasSession: true,
            expiresAt: null,
            lastChecked: new Date().toISOString(),
            refreshAttempts: 0,
          })
          setIsLoading(false)
          return
        }

        // Get the current session
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

          // Get the user profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (profileError) {
            console.error("[Auth] Error fetching profile:", profileError)
          } else {
            console.log("[Auth] Profile loaded successfully")
          }

          const userData = {
            id: session.user.id,
            email: session.user.email || "",
            full_name: profileData?.full_name || "",
            avatar_url: profileData?.avatar_url || "",
            role: profileData?.role || "user",
          }

          setUser(userData)
          setProfile(profileData)

          // Store user in storage
          storeUserInStorage(userData)

          setSessionStatus({
            hasSession: true,
            expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
            lastChecked: new Date().toISOString(),
            refreshAttempts: 0,
          })
        } else {
          console.log("[Auth] No user in session")
          setUser(null)
          setProfile(null)
          storeUserInStorage(null)
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
        storeUserInStorage(null)
        setSessionStatus({
          hasSession: false,
          expiresAt: null,
          lastChecked: new Date().toISOString(),
          refreshAttempts: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Auth] Auth state change event:", event)

      if (session?.user) {
        console.log("[Auth] User in auth change:", session.user.id)

        // Get the user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          console.error("[Auth] Error fetching profile on auth change:", profileError)
        } else {
          console.log("[Auth] Profile loaded on auth change")
        }

        const userData = {
          id: session.user.id,
          email: session.user.email || "",
          full_name: profileData?.full_name || "",
          avatar_url: profileData?.avatar_url || "",
          role: profileData?.role || "user",
        }

        setUser(userData)
        setProfile(profileData)

        // Store user in storage
        storeUserInStorage(userData)

        setSessionStatus({
          hasSession: true,
          expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
          lastChecked: new Date().toISOString(),
          refreshAttempts: 0,
        })
      } else if (event === "SIGNED_OUT") {
        console.log("[Auth] User signed out")
        setUser(null)
        setProfile(null)
        storeUserInStorage(null)
        setSessionStatus({
          hasSession: false,
          expiresAt: null,
          lastChecked: new Date().toISOString(),
          refreshAttempts: 0,
        })
      }

      setIsLoading(false)
    })

    checkUser()

    // Cleanup subscription on unmount
    return () => {
      console.log("[Auth] Cleaning up auth subscriptions")
      subscription.unsubscribe()
    }
  }, [supabase]) // Only depend on supabase

  // Set up periodic session check - in a separate effect to avoid dependency issues
  useEffect(() => {
    if (isLoading) return

    const sessionCheckInterval = setInterval(
      () => {
        if (!checkingSession.current) {
          checkSession()
        }
      },
      5 * 60 * 1000,
    ) // Check every 5 minutes

    return () => {
      clearInterval(sessionCheckInterval)
    }
  }, [isLoading]) // Only depend on isLoading

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
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

      // Store user in storage immediately
      if (data.user) {
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

        const userData = {
          id: data.user.id,
          email: data.user.email || "",
          full_name: profileData?.full_name || "",
          avatar_url: profileData?.avatar_url || "",
          role: profileData?.role || "user",
        }

        storeUserInStorage(userData)
      }

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
  }

  // Sign up with email and password - SIMPLIFIED APPROACH
  const signUp = async (email: string, password: string, fullName: string) => {
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

        // Store user in storage
        const userData = {
          id: data.user.id,
          email: data.user.email || "",
          full_name: fullName,
          role: "user",
        }
        storeUserInStorage(userData)
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
  }

  // Sign in with Google
  const handleSignInWithGoogle = async () => {
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
  }

  // Sign out
  const signOut = async () => {
    try {
      console.log("[Auth] Attempting sign out")
      setIsLoading(true)
      setError(null)

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("[Auth] Sign out error:", error)
        throw error
      }

      console.log("[Auth] Sign out successful")
      setUser(null)
      setProfile(null)
      storeUserInStorage(null)
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
  }

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
