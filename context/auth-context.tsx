"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast-provider"
import { createClient } from "@/lib/supabase/client"

type User = {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role?: string
}

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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { addToast } = useToast()
  const supabase = createClient()

  const isAdmin = user?.role === "admin"

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true)
      setError(null)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          full_name: profileData?.full_name || "",
          avatar_url: profileData?.avatar_url || "",
          role: profileData?.role || "user",
        })

        setProfile(profileData)
      } else {
        setUser(null)
        setProfile(null)
      }

      setIsLoading(false)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          full_name: profileData?.full_name || "",
          avatar_url: profileData?.avatar_url || "",
          role: profileData?.role || "user",
        })

        setProfile(profileData)
      } else {
        setUser(null)
        setProfile(null)
      }

      setIsLoading(false)
    })

    checkUser()

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Immediately fetch session + user data to set manually
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          full_name: profileData?.full_name || "",
          avatar_url: profileData?.avatar_url || "",
          role: profileData?.role || "user",
        })

        setProfile(profileData)
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

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true)
      setError(null)

      if (password.length < 6) {
        const errorMessage = "Password must be at least 6 characters long"
        setError(errorMessage)
        return { error: errorMessage }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (error) throw error
      if (!data?.user) throw new Error("Failed to create user account")

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

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
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

  const signOut = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await supabase.auth.signOut()
      if (error) throw error

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

  const value = {
    user,
    profile,
    isLoading,
    isAdmin,
    error,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
