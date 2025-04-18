import { createClient } from "@/lib/supabase/client"

// Get the current user
export async function getCurrentUser() {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      throw error
    }

    if (!user) {
      return null
    }

    // Get the user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
    }

    return {
      id: user.id,
      email: user.email || "",
      full_name: profile?.full_name || "",
      avatar_url: profile?.avatar_url || "",
      role: profile?.role || "user",
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    if (!data.user) {
      throw new Error("No user returned from sign in")
    }

    // Get the user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
    }

    return {
      id: data.user.id,
      email: data.user.email || "",
      full_name: profile?.full_name || "",
      avatar_url: profile?.avatar_url || "",
      role: profile?.role || "user",
    }
  } catch (error: any) {
    console.error("Error signing in:", error)
    throw error
  }
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const supabase = createClient()

  try {
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

    if (!data.user) {
      throw new Error("No user returned from sign up")
    }

    try {
      // Create a profile for the user with proper error handling
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        email: email,
        role: "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Error creating profile:", profileError)
      }
    } catch (profileErr) {
      console.error("Exception during profile creation:", profileErr)
    }

    return {
      id: data.user.id,
      email: data.user.email || "",
      full_name: fullName,
      avatar_url: "",
      role: "user",
    }
  } catch (error: any) {
    console.error("Error signing up:", error)
    throw error
  }
}

// Sign out
export async function signOutUser() {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  } catch (error: any) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { data }
  } catch (error: any) {
    console.error("Error signing in with Google:", error)
    return { error: error.message }
  }
}
