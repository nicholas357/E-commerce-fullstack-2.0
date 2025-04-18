import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import { createServerSideClient, createServerClient as createApiServerClient } from "./supabase/server"

// For use in getServerSideProps
export async function getSessionFromServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createServerSideClient(context.req, context.res)

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { session: null, user: null }
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    return {
      session,
      user: {
        id: session.user.id,
        email: session.user.email,
        ...profile,
      },
    }
  } catch (error) {
    console.error("Error getting session:", error)
    return { session: null, user: null }
  }
}

// For use in API routes
export async function getSessionFromApiRoute(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createApiServerClient(req, res)

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { session: null, user: null }
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    return {
      session,
      user: {
        id: session.user.id,
        email: session.user.email,
        ...profile,
      },
    }
  } catch (error) {
    console.error("Error getting session:", error)
    return { session: null, user: null }
  }
}

// Helper to check if user is authenticated in getServerSideProps
export async function requireAuth(context: GetServerSidePropsContext) {
  const { session } = await getSessionFromServerSideProps(context)

  if (!session) {
    return {
      redirect: {
        destination: "/account/login",
        permanent: false,
      },
    }
  }

  return { props: {} }
}

// Helper to check if user is admin in getServerSideProps
export async function requireAdmin(context: GetServerSidePropsContext) {
  const { session, user } = await getSessionFromServerSideProps(context)

  if (!session) {
    return {
      redirect: {
        destination: "/account/login",
        permanent: false,
      },
    }
  }

  if (user?.role !== "admin") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  return { props: {} }
}
