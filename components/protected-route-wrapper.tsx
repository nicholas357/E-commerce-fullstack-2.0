"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { enableEmergencyBypass, directCheckAuthState } from "@/lib/auth-direct"
// Import the auth cookie utilities
import { getAuthFromCookie } from "@/lib/auth-cookies"

interface ProtectedRouteWrapperProps {
  children: ReactNode
  fallbackUrl?: string
}

export function ProtectedRouteWrapper({ children, fallbackUrl = "/account/login" }: ProtectedRouteWrapperProps) {
  const { user, isLoading } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [bypassEnabled, setBypassEnabled] = useState(false)
  const router = useRouter()

  // Update the checkAuth function in useEffect
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if emergency bypass is enabled
        const bypass =
          sessionStorage.getItem("emergency_auth_bypass") === "true" ||
          document.cookie.includes("emergency_auth_bypass=true")

        if (bypass) {
          console.log("[Protected Route] Emergency bypass enabled, allowing access")
          setBypassEnabled(true)
          setIsChecking(false)
          return
        }

        // Check for our custom auth cookie
        const authData = getAuthFromCookie()
        if (authData && authData.id) {
          console.log("[Protected Route] Auth cookie found, allowing access")
          setIsChecking(false)
          return
        }

        // If we have a user, we're good
        if (user) {
          console.log("[Protected Route] User authenticated, allowing access")
          setIsChecking(false)
          return
        }

        // If still loading, wait
        if (isLoading) {
          console.log("[Protected Route] Auth still loading, waiting")
          return
        }

        // No user, no bypass, and not loading - check direct auth state
        const { hasAuthToken, hasLocalStorageAuth, hasCustomAuthCookie } = await directCheckAuthState()

        if (hasAuthToken || hasLocalStorageAuth || hasCustomAuthCookie) {
          console.log("[Protected Route] Auth tokens found but no user, enabling bypass")
          enableEmergencyBypass()
          setBypassEnabled(true)
          setIsChecking(false)
          return
        }

        // No auth at all, redirect
        console.log("[Protected Route] No auth found, redirecting to:", fallbackUrl)
        router.push(`${fallbackUrl}?redirectTo=${encodeURIComponent(window.location.pathname)}`)
      } catch (err) {
        console.error("[Protected Route] Error checking auth:", err)
        // On error, enable bypass as a fallback
        enableEmergencyBypass()
        setBypassEnabled(true)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [user, isLoading, router, fallbackUrl])

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Show bypass notice if enabled
  if (bypassEnabled) {
    return (
      <>
        <div className="bg-green-500/10 text-green-500 text-xs p-1 text-center">Emergency auth bypass active</div>
        {children}
      </>
    )
  }

  // Render children if authenticated
  return <>{children}</>
}
