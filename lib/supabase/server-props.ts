import { createServerClient } from "./server"
import type { GetServerSidePropsContext } from "next"

// Helper function to use in getServerSideProps
export async function getSupabaseServerProps(context: GetServerSidePropsContext) {
  const { req, res } = context

  // Create Supabase client using cookies from the request
  const supabase = createServerClient(req.headers.cookie)

  // Get the user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Handle Supabase auth cookie refresh if needed
  if (session) {
    const {
      data: { session: refreshedSession },
    } = await supabase.auth.refreshSession()

    // If we have a new session with new tokens, update the cookies
    if (refreshedSession && refreshedSession.access_token !== session.access_token) {
      const { access_token, refresh_token } = refreshedSession

      // Set the new cookies
      res.setHeader("Set-Cookie", [
        `sb-access-token=${access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
        `sb-refresh-token=${refresh_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
      ])
    }
  }

  return {
    supabase,
    session,
    user: session?.user || null,
  }
}
