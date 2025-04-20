"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast-provider"
import { createClient } from "@/lib/supabase/client"

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
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error?: string }>
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create the AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { addToast } = useToast()
  const supabase = createClient()

  // Check if the user is an admin
  const isAdmin = user?.role === "admin"

  // Check if the user is logged in
  useEffect(() => {
    // Only proceed if running in a browser environment
    if (typeof window === "undefined") {
      setIsLoading(false)
      return
    }

    let isMounted = true

    const checkUser = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (isMounted) {
          if (session?.user) {
            // Get the user profile
            const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

            if (isMounted) {
              const userProfile = {
                id: session.user.id,
                email: session.user.email || "",
                full_name: profileData?.full_name || "",
                avatar_url: profileData?.avatar_url || "",
                role: profileData?.role || "user",
              }
              setUser(userProfile)
              setProfile(profileData)
            }
          } else {
            setUser(null)
            setProfile(null)
          }
        }
      } catch (err: any) {
        console.error("Error checking user:", err)
        if (isMounted) {
          setError(err.message || "An unknown error occurred")
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkUser()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        if (session?.user) {
          // Get the user profile
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          const userProfile = {
            id: session.user.id,
            email: session.user.email || "",
            full_name: profileData?.full_name || "",
            avatar_url: profileData?.avatar_url || "",
            role: profileData?.role || "user",
          }
          setUser(userProfile)
          setProfile(profileData)
        } else {
          setUser(null)
          setProfile(null)
        }

        setIsLoading(false)
      }
    })

    // Cleanup function
    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [supabase, router])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      addToast({
        title: "Signed in successfully",
        description: "Welcome back!",
        type: "success",
      })

      router.push("/account") // Client-side redirect after successful sign-in
      return {}
    } catch (err: any) {
      console.error("Error signing in:", err)
      const errorMessage = err.message || "Invalid email or password. Please try again."
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Validate password length
      if (password.length < 6) {
        const errorMessage = "Password must be at least 6 characters long"
        setError(errorMessage)
        return { error: errorMessage }
      }

      // First, sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        throw error
      }

      if (!data?.user) {
        throw new Error("Failed to create user account")
      }

      addToast({
        title: "Account created successfully",
        description: "Welcome to TurGame!",
        type: "success",
      })

      router.push("/account") // Client-side redirect after successful sign-up
      return {}
    } catch (err: any) {
      console.error("Error signing up:", err)
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
      setIsLoading(true)
      setError(null)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      return {}
    } catch (err: any) {
      console.error("Error signing in with Google:", err)
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
      setIsLoading(true)
      setError(null)

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      setUser(null)
      setProfile(null)

      addToast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
        type: "info",
      })

      router.push("/")
    } catch (err: any) {
      console.error("Error signing out:", err)
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
    signIn,
    signUp,
    signOut,
    signInWithGoogle: handleSignInWithGoogle,
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
