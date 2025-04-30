"use client"

import { useEffect, useState, useRef, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

interface ProtectedRouteWrapperProps {
  children: ReactNode
  fallbackUrl?: string
}

export function ProtectedRouteWrapper({ children, fallbackUrl = "/account/login" }: ProtectedRouteWrapperProps) {
  const { user, isLoading } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [bypassEnabled, setBypassEnabled] = useState(false)
  const router = useRouter()
  const hasRedirected = useRef(false)
  const hasChecked = useRef(false)

  useEffect(() => {
    // Prevent multiple checks
    if (hasChecked.current) return

    const checkAuth = async () => {
      try {
        hasChecked.current = true

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

        // No user, no bypass, and not loading - redirect
        if (!hasRedirected.current) {
          console.log("[Protected Route] No auth found, redirecting to:", fallbackUrl)
          hasRedirected.current = true
          router.push(`${fallbackUrl}?redirectTo=${encodeURIComponent(window.location.pathname)}`)
        }
      } catch (err) {
        console.error("[Protected Route] Error checking auth:", err)
        // On error, enable bypass as a fallback
        setBypassEnabled(true)
      } finally {
        setIsChecking(false)
      }
    }

    if (!isLoading) {
      checkAuth()
    }
  }, [user, isLoading, router, fallbackUrl])

  // Show loading state while checking
  if (isLoading || isChecking) {
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
  return user ? <>{children}</> : null
}
