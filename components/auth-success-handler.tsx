"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export function AuthSuccessHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { checkSession, refreshUserSession } = useAuth()

  useEffect(() => {
    const handleAuthSuccess = async () => {
      const authSuccess = searchParams.get("auth_success")

      if (authSuccess === "true") {
        console.log("[Auth Success Handler] Detected successful authentication")

        // Remove the query parameters
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)

        // Force session refresh
        try {
          console.log("[Auth Success Handler] Refreshing session")
          await refreshUserSession()

          // Force a page reload to ensure all auth state is properly updated
          console.log("[Auth Success Handler] Reloading page to refresh auth state")
          window.location.reload()
        } catch (err) {
          console.error("[Auth Success Handler] Error refreshing session:", err)
        }
      }
    }

    handleAuthSuccess()
  }, [searchParams, refreshUserSession])

  return null
}
