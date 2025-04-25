import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import ExampleAuth from "./page"

export default async function Page() {
  const supabase = createServerSupabaseClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, redirect to login
  if (!session) {
    redirect("/account/login")
  }

  // Get the user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return <ExampleAuth user={session.user} profile={profile} />
}
