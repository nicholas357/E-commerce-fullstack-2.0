"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function AuthSessionRecovery() {
  const [isChecking, setIsChecking] = useState(true)
  const [sessionStatus, setSessionStatus] = useState<{
    hasSession: boolean
    userId: string | null
    error: string | null
  }>({
    hasSession: false,
    userId: null,
    error: null,
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAndRecoverSession = async () => {
      try {
        console.log("[Recovery] Checking for session recovery needs")

        // Check if we're in a redirect loop
        const url = new URL(window.location.href)
        const redirectTo = url.searchParams.get("redirectTo")
        const isLoginPage = window.location.pathname.includes("/account/login")

        if (!isLoginPage) {
          console.log("[Recovery] Not on login page, no recovery needed")
          setIsChecking(false)
          return
        }

        // Check for session
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("[Recovery] Session check error:", error)
          setSessionStatus({
            hasSession: false,
            userId: null,
            error: error.message,
          })
          setIsChecking(false)
          return
        }

        const hasSession = Boolean(data.session)
        const userId = data.session?.user?.id || null

        setSessionStatus({
          hasSession,
          userId,
          error: null,
        })

        console.log("[Recovery] Session check:", { hasSession, userId, redirectTo })

        // If we have a session but we're on the login page with a redirectTo,
        // we're likely in a redirect loop - break it by forcing navigation
        if (hasSession && isLoginPage && redirectTo) {
          console.log("[Recovery] Breaking redirect loop, navigating to:", redirectTo)
          // Use window.location for a full page reload to break any potential loop
          window.location.href = redirectTo
          return
        }

        setIsChecking(false)
      } catch (err) {
        console.error("[Recovery] Error in session recovery:", err)
        setSessionStatus({
          hasSession: false,
          userId: null,
          error: err instanceof Error ? err.message : "Unknown error",
        })
        setIsChecking(false)
      }
    }

    checkAndRecoverSession()
  }, [supabase, router])

  // Only render debug info if we're checking or have an error
  if (!isChecking && !sessionStatus.error && !sessionStatus.hasSession) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md rounded-lg border border-amber-500 bg-background p-4 shadow-lg">
      <h3 className="mb-2 text-sm font-bold text-amber-500">Session Recovery</h3>

      {isChecking ? (
        <p className="text-xs text-gray-400">Checking session status...</p>
      ) : sessionStatus.error ? (
        <div>
          <p className="text-xs text-red-500">Error: {sessionStatus.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded bg-amber-500 px-2 py-1 text-xs text-black"
          >
            Reload Page
          </button>
        </div>
      ) : sessionStatus.hasSession ? (
        <div>
          <p className="text-xs text-green-500">Session detected (User: {sessionStatus.userId?.substring(0, 6)}...)</p>
          <p className="mt-1 text-xs text-gray-400">Breaking redirect loop...</p>
        </div>
      ) : null}
    </div>
  )
}
