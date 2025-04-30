"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { checkSessionStatus } from "@/lib/supabase/client-client"

interface UseSessionOptions {
  redirectTo?: string
  redirectIfFound?: boolean
  refreshInterval?: number | false
}

export function useSession(options: UseSessionOptions = {}) {
  const { user, isLoading: authLoading, sessionStatus, checkSession, refreshUserSession } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const {
    redirectTo = "/account/login",
    redirectIfFound = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
  } = options

  // Handle redirects based on auth state
  useEffect(() => {
    if (!authLoading) {
      if (
        // If redirectTo is set and user is not found, redirect
        !redirectIfFound &&
        !user &&
        redirectTo
      ) {
        console.log("[useSession] No user found, redirecting to:", redirectTo)
        router.push(`${redirectTo}?redirectTo=${encodeURIComponent(window.location.pathname)}`)
      } else if (
        // If redirectIfFound is true and user is found, redirect
        redirectIfFound &&
        user &&
        redirectTo
      ) {
        console.log("[useSession] User found, redirecting to:", redirectTo)
        router.push(redirectTo)
      }
      setIsLoading(false)
    }
  }, [user, authLoading, redirectIfFound, redirectTo, router])

  // Verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        console.log("[useSession] Verifying session on mount")
        const { data, error } = await checkSessionStatus()

        if (error) {
          console.error("[useSession] Session verification error:", error)
          return
        }

        if (!data.session && !authLoading && !user) {
          console.log("[useSession] No valid session found")
          if (redirectTo) {
            router.push(`${redirectTo}?redirectTo=${encodeURIComponent(window.location.pathname)}`)
          }
        }
      } catch (err) {
        console.error("[useSession] Error verifying session:", err)
      }
    }

    if (!authLoading) {
      verifySession()
    }
  }, [authLoading, user, redirectTo, router])

  // Set up periodic session refresh
  useEffect(() => {
    if (refreshInterval === false || authLoading) return

    const refreshUserSessionPeriodically = async () => {
      if (!user) return

      try {
        setIsRefreshing(true)
        console.log("[useSession] Periodic session refresh")
        await refreshUserSession()
      } catch (err) {
        console.error("[useSession] Error in periodic refresh:", err)
      } finally {
        setIsRefreshing(false)
      }
    }

    const intervalId = setInterval(refreshUserSessionPeriodically, refreshInterval)

    return () => clearInterval(intervalId)
  }, [user, authLoading, refreshInterval, refreshUserSession])

  return {
    session: user ? { user } : null,
    isLoading: authLoading || isLoading,
    isRefreshing,
    sessionStatus,
    checkSession,
    refreshSession: refreshUserSession,
  }
}
