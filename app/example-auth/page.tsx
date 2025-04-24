import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

async function getSession() {
  const supabase = createServerSupabaseClient({ cookies })
  return await supabase.auth.getSession()
}

// Example component
export default async function ExampleAuth() {
  const {
    data: { session },
  } = await getSession()

  // If no session, redirect to login
  if (!session) {
    redirect("/account/login")
  }

  // Get the user profile
  const supabase = createServerSupabaseClient({ cookies })
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return (
    <div>
      <h1>Protected Page</h1>
      <p>Welcome, {profile?.full_name || session.user.email}</p>
    </div>
  )
}
