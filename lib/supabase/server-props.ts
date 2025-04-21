import type { GetServerSidePropsContext } from "next"
import { createServerClient } from "./server"

export async function createServerSupabaseClient(context: GetServerSidePropsContext) {
  const { req, res } = context

  // Get cookies from the request
  const reqCookies = req.headers.cookie || ""

  // Create an array to store cookies for the response
  const resCookies: string[] = []

  // Create the Supabase client
  const supabase = createServerClient(reqCookies, resCookies)

  // Set the cookies on the response after the request is complete
  context.res.on("finish", () => {
    resCookies.forEach((cookie) => {
      res.setHeader("Set-Cookie", cookie)
    })
  })

  return supabase
}
