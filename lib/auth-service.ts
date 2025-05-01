import { createClient } from "@/lib/supabase/client"

// Get the current user
export async function getCurrentUser() {
  const supabase = createClient()

  try {
    console.log("[Auth Service] Getting current user")
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("[Auth Service] Error getting user:", error)
      throw error
    }

    if (!user) {
      console.log("[Auth Service] No user found")
      return null
    }

    console.log("[Auth Service] User found:", user.id)

    // Get the user profile with retry logic
    let profileAttempts = 0
    let profile = null
    let profileError = null

    while (profileAttempts < 3 && !profile) {
      try {
        profileAttempts++
        console.log(`[Auth Service] Fetching profile, attempt ${profileAttempts}`)

        // Create a fresh client for each attempt
        const freshClient = createClient()

        const { data, error: fetchError } = await freshClient.from("profiles").select("*").eq("id", user.id).single()

        if (fetchError) {
          console.error(`[Auth Service] Error fetching profile (attempt ${profileAttempts}):`, fetchError)
          profileError = fetchError

          // Wait before retrying
          if (profileAttempts < 3) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        } else {
          profile = data
          console.log("[Auth Service] Profile fetched successfully")
          break
        }
      } catch (err) {
        console.error(`[Auth Service] Exception fetching profile (attempt ${profileAttempts}):`, err)
        profileError = err

        // Wait before retrying
        if (profileAttempts < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    // Even if profile fetch fails, return basic user info
    return {
      id: user.id,
      email: user.email || "",
      full_name: profile?.full_name || "",
      avatar_url: profile?.avatar_url || "",
      role: profile?.role || "user",
    }
  } catch (error) {
    console.error("[Auth Service] Error getting current user:", error)
    return null
  }
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()

  try {
    console.log("[Auth Service] Signing in with email:", email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("[Auth Service] Sign in error:", error)
      throw error
    }

    if (!data.user) {
      console.error("[Auth Service] No user returned from sign in")
      throw new Error("No user returned from sign in")
    }

    console.log("[Auth Service] Sign in successful:", data.user.id)

    // Get the user profile with retry logic
    let profileAttempts = 0
    let profile = null
    let profileError = null

    while (profileAttempts < 3 && !profile) {
      try {
        profileAttempts++
        console.log(`[Auth Service] Fetching profile, attempt ${profileAttempts}`)

        // Create a fresh client for each attempt
        const freshClient = createClient()

        const { data: profileData, error: fetchError } = await freshClient
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (fetchError) {
          console.error(`[Auth Service] Error fetching profile (attempt ${profileAttempts}):`, fetchError)
          profileError = fetchError

          // Wait before retrying
          if (profileAttempts < 3) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        } else {
          profile = profileData
          console.log("[Auth Service] Profile fetched successfully")
          break
        }
      } catch (err) {
        console.error(`[Auth Service] Exception fetching profile (attempt ${profileAttempts}):`, err)
        profileError = err

        // Wait before retrying
        if (profileAttempts < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    return {
      id: data.user.id,
      email: data.user.email || "",
      full_name: profile?.full_name || "",
      avatar_url: profile?.avatar_url || "",
      role: profile?.role || "user",
    }
  } catch (error: any) {
    console.error("[Auth Service] Error signing in:", error)
    throw error
  }
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const supabase = createClient()

  try {
    console.log("[Auth Service] Signing up with email:", email)
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
      console.error("[Auth Service] Sign up error:", error)
      throw error
    }

    if (!data.user) {
      console.error("[Auth Service] No user returned from sign up")
      throw new Error("No user returned from sign up")
    }

    console.log("[Auth Service] Sign up successful:", data.user.id)

    // Create a profile with retry logic
    let profileAttempts = 0
    let profileSuccess = false

    while (profileAttempts < 3 && !profileSuccess) {
      try {
        profileAttempts++
        console.log(`[Auth Service] Creating profile, attempt ${profileAttempts}`)

        // Create a fresh client for each attempt
        const freshClient = createClient()

        const { error: profileError } = await freshClient.from("profiles").insert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          role: "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error(`[Auth Service] Error creating profile (attempt ${profileAttempts}):`, profileError)

          // Wait before retrying
          if (profileAttempts < 3) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        } else {
          console.log("[Auth Service] Profile created successfully")
          profileSuccess = true
          break
        }
      } catch (err) {
        console.error(`[Auth Service] Exception creating profile (attempt ${profileAttempts}):`, err)

        // Wait before retrying
        if (profileAttempts < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    return {
      id: data.user.id,
      email: data.user.email || "",
      full_name: fullName,
      avatar_url: "",
      role: "user",
    }
  } catch (error: any) {
    console.error("[Auth Service] Error signing up:", error)
    throw error
  }
}

// Sign out
export async function signOutUser() {
  const supabase = createClient()

  try {
    console.log("[Auth Service] Signing out")
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("[Auth Service] Sign out error:", error)
      throw error
    }

    console.log("[Auth Service] Sign out successful")
  } catch (error: any) {
    console.error("[Auth Service] Error signing out:", error)
    throw error
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  const supabase = createClient()

  try {
    console.log("[Auth Service] Signing in with Google")
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error("[Auth Service] Google sign in error:", error)
      return { error: error.message }
    }

    console.log("[Auth Service] Google sign in initiated")
    return { data }
  } catch (error: any) {
    console.error("Error signing in with Google:", error)
    return { error: error.message }
  }
}

// Refresh session
export async function refreshSession() {
  const supabase = createClient()

  try {
    console.log("[Auth Service] Refreshing session")
    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      console.error("[Auth Service] Session refresh error:", error)
      return { error: error.message }
    }

    console.log("[Auth Service] Session refreshed successfully:", Boolean(data.session))
    return { data }
  } catch (error: any) {
    console.error("[Auth Service] Error refreshing session:", error)
    return { error: error.message }
  }
}

// Check session
export async function checkSession() {
  const supabase = createClient()

  try {
    console.log("[Auth Service] Checking session")
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("[Auth Service] Session check error:", error)
      return { error: error.message }
    }

    console.log("[Auth Service] Session check result:", Boolean(data.session))
    return { data }
  } catch (error: any) {
    console.error("[Auth Service] Error checking session:", error)
    return { error: error.message }
  }
}
