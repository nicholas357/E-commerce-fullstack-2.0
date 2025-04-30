"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowRight, RefreshCw } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"

export function EmergencyAuthBypass() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const router = useRouter()

  // Check if we're in a potential redirect loop
  useEffect(() => {
    const checkForLoop = () => {
      // Check URL for redirect parameter
      const url = new URL(window.location.href)
      const redirectTo = url.searchParams.get("redirectTo")
      const isLoginPage = window.location.pathname.includes("/account/login")

      // Check session storage for redirect count
      const redirectCount = Number.parseInt(sessionStorage.getItem("auth_redirect_count") || "0")

      // Increment redirect count if we're on login page with redirectTo
      if (isLoginPage && redirectTo) {
        sessionStorage.setItem("auth_redirect_count", (redirectCount + 1).toString())

        // If we've redirected more than 2 times, we're probably in a loop
        if (redirectCount >= 2) {
          console.warn("[Emergency Bypass] Detected potential redirect loop")
          setIsVisible(true)
          collectDebugInfo()
        }
      } else {
        // Reset redirect count if we're not on login page with redirectTo
        sessionStorage.removeItem("auth_redirect_count")
      }
    }

    checkForLoop()
  }, [])

  // Collect debug information
  const collectDebugInfo = async () => {
    try {
      const info: any = {
        url: window.location.href,
        cookies: document.cookie,
        localStorage: {},
        sessionStorage: {},
        timestamp: new Date().toISOString(),
      }

      // Collect localStorage items related to auth
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes("supabase") || key.includes("auth") || key.includes("sb-"))) {
          info.localStorage[key] = localStorage.getItem(key)
        }
      }

      // Collect sessionStorage items
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) {
          info.sessionStorage[key] = sessionStorage.getItem(key)
        }
      }

      // Try to get session from Supabase
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data, error } = await supabase.auth.getSession()
        info.supabaseSession = {
          hasSession: Boolean(data.session),
          error: error?.message,
          user: data.session?.user
            ? {
                id: data.session.user.id,
                email: data.session.user.email,
              }
            : null,
          expiresAt: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null,
        }
      } catch (err) {
        info.supabaseSessionError = String(err)
      }

      setDebugInfo(info)
      console.log("[Emergency Bypass] Debug info:", info)
    } catch (err) {
      console.error("[Emergency Bypass] Error collecting debug info:", err)
    }
  }

  // Force redirect to the target page
  const handleForceRedirect = () => {
    setIsLoading(true)
    try {
      // Get the redirect path from URL or use default
      const url = new URL(window.location.href)
      const redirectTo = url.searchParams.get("redirectTo") || "/account"

      console.log("[Emergency Bypass] Force redirecting to:", redirectTo)

      // Reset redirect count
      sessionStorage.removeItem("auth_redirect_count")

      // Set a flag to bypass auth checks
      sessionStorage.setItem("emergency_auth_bypass", "true")

      // Force navigation
      window.location.href = redirectTo
    } catch (err) {
      console.error("[Emergency Bypass] Error during force redirect:", err)
      setIsLoading(false)
    }
  }

  // Reset auth state completely
  const handleResetAuth = async () => {
    setIsLoading(true)
    try {
      console.log("[Emergency Bypass] Resetting auth state")

      // Clear all auth-related storage
      localStorage.removeItem("supabase.auth.token")
      localStorage.removeItem("sb-auth-token")
      sessionStorage.removeItem("auth_redirect_count")
      sessionStorage.removeItem("emergency_auth_bypass")

      // Clear cookies
      document.cookie = "sb-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      document.cookie = "sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

      // Reload the page to ensure clean state
      window.location.href = "/account/login"
    } catch (err) {
      console.error("[Emergency Bypass] Error resetting auth:", err)
      setIsLoading(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-lg border border-red-500 bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-2 text-red-500">
          <AlertTriangle className="h-6 w-6" />
          <h2 className="text-xl font-bold">Authentication Loop Detected</h2>
        </div>

        <p className="mb-4 text-gray-300">
          You appear to be stuck in a login redirect loop. Use one of the options below to resolve the issue:
        </p>

        <div className="mb-6 space-y-3">
          <GamingButton onClick={handleForceRedirect} disabled={isLoading} className="w-full">
            {isLoading ? (
              <span className="flex items-center justify-center">
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <ArrowRight className="mr-2 h-4 w-4" />
                Force Navigate to Destination
              </span>
            )}
          </GamingButton>

          <GamingButton onClick={handleResetAuth} variant="destructive" disabled={isLoading} className="w-full">
            Reset Authentication State
          </GamingButton>
        </div>

        <div className="mt-4 rounded border border-gray-700 bg-gray-900 p-2">
          <p className="mb-1 text-xs text-gray-400">Debug Information:</p>
          <div className="max-h-32 overflow-auto text-xs text-gray-400">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
