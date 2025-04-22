import type { NextApiRequest, NextApiResponse } from "next"
import { createServerClient } from "./server"

export function withAuth(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Get the cookies from the request
    const reqCookies = req.headers.cookie || ""

    // Create an array to store cookies for the response
    const resCookies: string[] = []

    // Create the Supabase client
    const supabase = createServerClient(reqCookies, resCookies)

    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Set the cookies on the response
    resCookies.forEach((cookie) => {
      res.setHeader("Set-Cookie", cookie)
    })

    // If no session, return unauthorized
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    // Add the session and supabase client to the request
    req.session = session
    req.supabase = supabase

    // Call the handler
    return handler(req, res)
  }
}

// Add TypeScript declarations
declare module "next" {
  interface NextApiRequest {
    session?: any
    supabase?: any
  }
}
