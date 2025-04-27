"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithOAuth,
  signOut,
  getSupabaseClient,
  useUser as useSupabaseUser,
} from "@/lib/supabase/auth-service"
import { useToast } from "@/components/ui/toast-provider"

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { addToast } = useToast()
  const { user: supabaseUser, loading } = useSupabaseUser()

  // Check if the user is an admin
  const isAdmin = user?.role === "admin"

  // Fetch the user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching profile:", error)
        setUser(null)
        return
      }

      setUser(data)
    } catch (error) {
      console.error("Error fetching user profile:", error)
      setUser(null)
    }
  }

  // Update user state when Supabase user changes
  useEffect(() => {
    if (!loading) {
      if (supabaseUser) {
        fetchUserProfile(supabaseUser.id)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }
  }, [supabaseUser, loading])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { user, error } = await signInWithEmail(email, password)

      if (error) {
        throw new Error(error.message)
      }

      addToast({
        title: "Signed in successfully",
        description: "Welcome back!",
        type: "success",
      })

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

  // Sign up with email and password
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

      const { user, error } = await signUpWithEmail(email, password, fullName)

      if (error) {
        throw new Error(error.message)
      }

      addToast({
        title: "Account created successfully",
        description: "Welcome to TurGame!",
        type: "success",
      })

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

      const { error } = await signInWithOAuth("google")

      if (error) {
        throw new Error(error.message)
      }

      addToast({
        title: "Signed in successfully",
        description: "Welcome to TurGame!",
        type: "success",
      })

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
  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await signOut()

      if (error) {
        throw new Error(error.message)
      }

      setUser(null)

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
    isLoading,
    isAdmin,
    error,
    signIn,
    signUp,
    signOut: handleSignOut,
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
