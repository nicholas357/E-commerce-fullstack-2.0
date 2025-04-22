import type { GetServerSidePropsContext } from "next"
import { createServerClient } from "./server"

// Helper function to create a Supabase client in getServerSideProps
export function createServerSupabaseClient(context: GetServerSidePropsContext) {
  const { req, res } = context

  // Get the cookies from the request
  const reqCookies = req.headers.cookie || ""

  // Create an array to store cookies for the response
  const resCookies: string[] = []

  // Create the Supabase client
  const supabase = createServerClient(reqCookies, resCookies)

  // Set the cookies on the response after the Supabase client has modified them
  const originalEnd = res.end
  res.end = function end(...args) {
    resCookies.forEach((cookie) => {
      res.setHeader("Set-Cookie", cookie)
    })
    return originalEnd.apply(this, args)
  }

  return supabase
}
