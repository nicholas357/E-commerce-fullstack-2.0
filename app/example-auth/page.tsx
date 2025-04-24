import type { GetServerSideProps } from "next"
import { createServerSupabaseClient } from "@/lib/supabase/server-props"

// Example of how to use the Supabase client in getServerSideProps
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Create the Supabase client
  const supabase = createServerSupabaseClient(context)

  // Get the user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, redirect to login
  if (!session) {
    return {
      redirect: {
        destination: "/account/login",
        permanent: false,
      },
    }
  }

  // Get the user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Return the props
  return {
    props: {
      user: session.user,
      profile,
    },
  }
}

// Example component
export default function ExampleAuth({ user, profile }) {
  return (
    <div>
      <h1>Protected Page</h1>
      <p>Welcome, {profile?.full_name || user.email}</p>
    </div>
  )
}
