"use client"

import { useState, useEffect } from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

async function getSession() {
  const supabase = createServerSupabaseClient({ cookies })
  return await supabase.auth.getSession()
}

// Example component
export default function ExampleAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await getSession()

        // If no session, redirect to login
        if (!session) {
          redirect("/account/login")
        }

        // Get the user profile
        const supabase = createServerSupabaseClient({ cookies })
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setUser(session.user)
        setProfile(profileData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Protected Page</h1>
      <p>Welcome, {profile?.full_name || user?.email}</p>
    </div>
  )
}
