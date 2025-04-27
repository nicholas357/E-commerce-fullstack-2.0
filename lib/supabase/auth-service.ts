"use client"

import { createClient } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

export type AuthError = {
  code: string
  message: string
}

// Sign in with email and password
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ user: any | null; error: AuthError | null }> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { user: data.user, error: null }
  } catch (error: any) {
    return {
      user: null,
      error: {
        code: error.code || "auth/unknown",
        message: error.message || "An unknown error occurred",
      },
    }
  }
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
): Promise<{ user: any | null; error: AuthError | null }> {
  try {
    const supabase = getSupabaseClient()

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error

    // Create a profile in the profiles table
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        email,
        role: "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Error creating profile:", profileError)
      }
    }

    return { user: data.user, error: null }
  } catch (error: any) {
    return {
      user: null,
      error: {
        code: error.code || "auth/unknown",
        message: error.message || "An unknown error occurred",
      },
    }
  }
}

// Sign in with OAuth provider (e.g., Google)
export async function signInWithOAuth(
  provider: "google" | "github" | "facebook",
): Promise<{ error: AuthError | null }> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
    })

    if (error) throw error

    return { error: null }
  } catch (error: any) {
    return {
      error: {
        code: error.code || "auth/unknown",
        message: error.message || "An unknown error occurred",
      },
    }
  }
}

// Sign out
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()

    if (error) throw error

    return { error: null }
  } catch (error: any) {
    return {
      error: {
        code: error.code || "auth/unknown",
        message: error.message || "An unknown error occurred",
      },
    }
  }
}

// Reset password
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) throw error

    return { error: null }
  } catch (error: any) {
    return {
      error: {
        code: error.code || "auth/unknown",
        message: error.message || "An unknown error occurred",
      },
    }
  }
}

// Get the current session
export async function getSession() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error("Error getting session:", error)
    return null
  }

  return data.session
}

// Get the current user
export async function getCurrentUser() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error("Error getting user:", error)
    return null
  }

  return data.user
}

// Custom hook to get the current user
export function useUser() {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient()

    // Get the initial user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    // Set up the auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Clean up the subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
