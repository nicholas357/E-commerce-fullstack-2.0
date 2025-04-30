"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, RefreshCw, AlertTriangle, Zap } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { GoogleLoginButton } from "@/components/google-login-button"
import { useAuth } from "@/context/auth-context"
import { EmergencyAuthBypass } from "@/components/emergency-auth-bypass"
import { forceAuthentication, getUserFromCookie, isDirectlyAuthenticated } from "@/lib/direct-auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [sessionChecking, setSessionChecking] = useState(false)
  const { signIn, user, checkSession, refreshUserSession } = useAuth()
  const router = useRouter()
  const [redirectPath, setRedirectPath] = useState("/account")
  const [sessionCheckCount, setSessionCheckCount] = useState(0)
  const [bypassEnabled, setBypassEnabled] = useState(false)
  const [isDirectAuth, setIsDirectAuth] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Check if direct auth is working
  useEffect(() => {
    const directUser = getUserFromCookie()
    setIsDirectAuth(Boolean(directUser))

    if (directUser) {
      console.log("[Login] Found directly authenticated user:", directUser.id)
      collectDebugInfo()
    }
  }, [])

  // Check if there's a redirect path in localStorage or URL
  useEffect(() => {
    const storedRedirectPath = localStorage.getItem("redirectAfterLogin")
    if (storedRedirectPath) {
      console.log("[Login] Found redirect path in localStorage:", storedRedirectPath)
      setRedirectPath(storedRedirectPath)
      localStorage.removeItem("redirectAfterLogin")
    }

    // Check for URL params
    const urlParams = new URLSearchParams(window.location.search)
    const redirectTo = urlParams.get("redirectTo")
    if (redirectTo) {
      console.log("[Login] Found redirectTo in URL:", redirectTo)
      setRedirectPath(redirectTo)
    }

    // Check if emergency bypass is enabled
    const bypass = sessionStorage.getItem("emergency_auth_bypass")
    if (bypass === "true") {
      console.log("[Login] Emergency auth bypass is enabled")
      setBypassEnabled(true)
    }

    // Check cookie status
    collectDebugInfo()
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
        directAuth: isDirectlyAuthenticated(),
        user: getUserFromCookie(),
      }

      // Collect localStorage items related to auth
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          (key.includes("supabase") || key.includes("auth") || key.includes("sb-") || key.includes("turgame"))
        ) {
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

      setDebugInfo(info)
      console.log("[Login] Debug info:", info)
    } catch (err) {
      console.error("[Login] Error collecting debug info:", err)
    }
  }

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log("[Login] User already logged in, redirecting to:", redirectPath)
      router.push(redirectPath)
    }
  }, [user, router, redirectPath])

  // Check session status on load and periodically if needed
  useEffect(() => {
    const verifySession = async () => {
      try {
        setSessionChecking(true)
        console.log("[Login] Verifying session, attempt:", sessionCheckCount + 1)

        const hasSession = await checkSession()

        if (hasSession) {
          console.log("[Login] Valid session found, refreshing")
          await refreshUserSession()

          // If we still don't have a user after refresh but have a session,
          // we might need to force reload the page to break the loop
          if (!user && sessionCheckCount >= 2) {
            console.log("[Login] Session found but no user after refresh, forcing reload")
            window.location.href = redirectPath
            return
          }
        } else {
          console.log("[Login] No valid session found")
        }

        setSessionCheckCount((prev) => prev + 1)
      } catch (err) {
        console.error("[Login] Error verifying session:", err)
      } finally {
        setSessionChecking(false)
      }
    }

    verifySession()

    // Set up periodic check if we're potentially in a loop
    const checkInterval = sessionCheckCount < 3 ? 2000 : null

    let intervalId: NodeJS.Timeout | null = null
    if (checkInterval) {
      intervalId = setInterval(verifySession, checkInterval)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [checkSession, refreshUserSession, sessionCheckCount, user, redirectPath])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!email || !password) {
      setFormError("Please fill in all fields")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("[Login] Submitting login form")
      const { error } = await signIn(email, password)
      if (error) {
        console.error("[Login] Sign in error:", error)
        setFormError(error)
      } else {
        console.log("[Login] Sign in successful, will redirect via useEffect")
        // Force a session check immediately after successful login
        await checkSession()
      }
    } catch (error: any) {
      console.error("[Login] Exception during sign in:", error)
      setFormError(error.message || "An error occurred during sign in")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSessionCheck = async () => {
    setSessionChecking(true)
    try {
      console.log("[Login] Manual session check")
      await checkSession()
      collectDebugInfo()
    } catch (err) {
      console.error("[Login] Error in manual session check:", err)
    } finally {
      setSessionChecking(false)
    }
  }

  const handleSessionRefresh = async () => {
    setSessionChecking(true)
    try {
      console.log("[Login] Manual session refresh")
      await refreshUserSession()
      collectDebugInfo()
    } catch (err) {
      console.error("[Login] Error in manual session refresh:", err)
    } finally {
      setSessionChecking(false)
    }
  }

  const handleForceRedirect = () => {
    console.log("[Login] Forcing redirect to:", redirectPath)
    // Set emergency bypass flag
    sessionStorage.setItem("emergency_auth_bypass", "true")
    document.cookie = `emergency_auth_bypass=true; path=/; max-age=${60 * 60}` // 1 hour
    // Force navigation
    window.location.href = redirectPath
  }

  const handleEnableBypass = () => {
    console.log("[Login] Enabling emergency auth bypass")
    sessionStorage.setItem("emergency_auth_bypass", "true")
    document.cookie = `emergency_auth_bypass=true; path=/; max-age=${60 * 60}` // 1 hour
    setBypassEnabled(true)
    collectDebugInfo()
  }

  const handleForceAuth = async () => {
    setIsSubmitting(true)
    try {
      console.log("[Login] Forcing authentication")
      const success = await forceAuthentication(redirectPath)
      if (!success) {
        setFormError("Failed to force authentication. Please try again.")
      }
    } catch (err) {
      console.error("[Login] Error forcing authentication:", err)
      setFormError("An error occurred while forcing authentication")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      {/* Add the emergency auth bypass component */}
      <EmergencyAuthBypass />

      <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Sign In</h1>
          <p className="mt-2 text-gray-400">Welcome back! Please sign in to your account.</p>
          {bypassEnabled && (
            <div className="mt-2 rounded-md bg-green-500/10 p-1 text-xs text-green-500">
              Emergency bypass mode enabled
            </div>
          )}
          {isDirectAuth && (
            <div className="mt-2 rounded-md bg-blue-500/10 p-1 text-xs text-blue-500">Direct authentication active</div>
          )}
        </div>

        {formError && (
          <div className="mb-6 rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
            {formError}
          </div>
        )}

        {isDirectAuth ? (
          <div className="mb-6 space-y-4">
            <div className="rounded-md border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-500">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <p className="font-medium">You appear to be already authenticated</p>
              </div>
              <p className="mt-1">
                Your user credentials are stored, but the session might not be working correctly. Use the options below
                to access your account.
              </p>
            </div>

            <GamingButton onClick={handleForceRedirect} className="w-full">
              Continue to Account
            </GamingButton>

            <GamingButton onClick={handleForceAuth} variant="outline" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Zap className="mr-2 h-4 w-4" />
                  Force Authentication
                </span>
              )}
            </GamingButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-400">
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-border bg-background py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-400">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-border bg-background py-2 pl-10 pr-10 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-amber-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border bg-background text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>
              <Link href="/account/forgot-password" className="text-sm text-amber-500 hover:text-amber-400">
                Forgot password?
              </Link>
            </div>

            <GamingButton type="submit" variant="amber" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </GamingButton>
          </form>
        )}

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={handleSessionCheck}
            disabled={sessionChecking}
            className="flex items-center text-xs text-amber-500 hover:text-amber-400"
          >
            {sessionChecking ? (
              <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-1 h-3 w-3" />
            )}
            Check Session
          </button>
          <span className="text-gray-500">|</span>
          <button
            onClick={handleSessionRefresh}
            disabled={sessionChecking}
            className="flex items-center text-xs text-amber-500 hover:text-amber-400"
          >
            {sessionChecking ? (
              <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-1 h-3 w-3" />
            )}
            Refresh Session
          </button>
          <span className="text-gray-500">|</span>
          <button
            onClick={handleForceRedirect}
            className="flex items-center text-xs text-amber-500 hover:text-amber-400"
          >
            Force Redirect
          </button>
          <span className="text-gray-500">|</span>
          <button
            onClick={handleEnableBypass}
            className="flex items-center text-xs text-amber-500 hover:text-amber-400"
          >
            Enable Bypass
          </button>
          <span className="text-gray-500">|</span>
          <button onClick={handleForceAuth} className="flex items-center text-xs text-amber-500 hover:text-amber-400">
            Force Auth
          </button>
        </div>

        {!isDirectAuth && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleLoginButton />
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/account/signup" className="font-medium text-amber-500 hover:text-amber-400">
            Sign up
          </Link>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div
            className="mt-6 cursor-pointer rounded border border-gray-700 bg-gray-800/50 p-2"
            onClick={collectDebugInfo}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-400">Debug Information (click to refresh)</p>
            </div>
            <div className="mt-1 max-h-40 overflow-auto">
              <pre className="text-xs text-gray-500">
                {JSON.stringify(
                  {
                    isDirectAuth: debugInfo.directAuth,
                    hasUser: Boolean(debugInfo.user),
                    sessionChecks: sessionCheckCount,
                    cookiesPresent: Boolean(debugInfo.cookies),
                    url: debugInfo.url,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
