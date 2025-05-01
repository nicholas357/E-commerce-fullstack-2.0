"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, RefreshCw } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { GoogleLoginButton } from "@/components/google-login-button"
import { useAuth } from "@/context/auth-context"
import { EmergencyAuthBypass } from "@/components/emergency-auth-bypass"
import { useToast } from "@/components/ui/toast-provider"
import { AuthSuccessHandler } from "@/components/auth-success-handler"

// Import the auth cookie utilities
import { setAuthCookie, getAuthFromCookie } from "@/lib/auth-cookies"

// Add a function to manually set auth data after the imports
const manuallySetAuthData = (userData: any) => {
  try {
    console.log("[Login] Manually setting auth data for user:", userData.id)
    return setAuthCookie(userData)
  } catch (err) {
    console.error("[Login] Error manually setting auth data:", err)
    return false
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [sessionChecking, setSessionChecking] = useState(false)
  const { signIn, user, checkSession, refreshUserSession } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [redirectPath, setRedirectPath] = useState("/account")
  const [sessionCheckCount, setSessionCheckCount] = useState(0)
  const [bypassEnabled, setBypassEnabled] = useState(false)
  const { addToast } = useToast()
  const [initialCheckDone, setInitialCheckDone] = useState(false)

  // Check for OAuth success on mount
  useEffect(() => {
    const authSuccess = searchParams.get("auth_success")

    if (authSuccess === "true") {
      console.log("[Login] Detected successful authentication, refreshing session")

      // Remove the query parameters
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)

      // Force session refresh and redirect
      const refreshAndRedirect = async () => {
        try {
          await refreshUserSession()

          // Get the redirect path
          const storedRedirectPath = localStorage.getItem("authReturnPath") || "/account"

          // Redirect to the appropriate page
          console.log("[Login] Redirecting after OAuth success to:", storedRedirectPath)
          router.push(storedRedirectPath)
        } catch (err) {
          console.error("[Login] Error refreshing session after OAuth:", err)

          // Force a page reload as a fallback
          window.location.reload()
        }
      }

      refreshAndRedirect()
    }
  }, [searchParams, refreshUserSession, router])

  // Check for OAuth errors on mount
  useEffect(() => {
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")
    const message = searchParams.get("message")

    if (error) {
      console.error("[Login] OAuth error detected:", error, errorDescription)
      setFormError(errorDescription || "There was an error signing in with Google. Please try again.")

      // Clean up the URL
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    } else if (message) {
      addToast({
        title: "Success",
        description: message,
        type: "success",
      })

      // Clean up the URL
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }

    // Store the current path for OAuth returns
    if (typeof window !== "undefined") {
      // Store in both localStorage and cookie for redundancy
      localStorage.setItem("authReturnPath", window.location.pathname)
      document.cookie = `authReturnPath=${window.location.pathname}; path=/; max-age=3600`
    }
  }, [addToast, searchParams])

  // CRITICAL FIX: Check for auth cookie on mount and redirect if found - only once
  useEffect(() => {
    if (initialCheckDone) return

    const authCookie = getAuthFromCookie()
    if (authCookie && authCookie.id) {
      console.log("[Login] Auth cookie found on mount, redirecting to:", redirectPath)
      router.push(redirectPath)
    }
    setInitialCheckDone(true)
  }, [initialCheckDone, redirectPath, router])

  // Check if there's a redirect path in localStorage or URL - only once on mount
  useEffect(() => {
    const storedRedirectPath = localStorage.getItem("redirectAfterLogin")
    if (storedRedirectPath) {
      console.log("[Login] Found redirect path in localStorage:", storedRedirectPath)
      setRedirectPath(storedRedirectPath)
      localStorage.removeItem("redirectAfterLogin")
    }

    // Check for URL params
    const redirectTo = searchParams.get("redirectTo")
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
  }, [searchParams])

  // Redirect if already logged in - with user dependency
  useEffect(() => {
    if (user) {
      console.log("[Login] User already logged in, redirecting to:", redirectPath)

      // CRITICAL FIX: Ensure the auth cookie is set before redirecting
      manuallySetAuthData(user)

      router.push(redirectPath)
    }
  }, [user, router, redirectPath])

  // Check session status on load - only once
  useEffect(() => {
    if (sessionCheckCount > 0 || !initialCheckDone) return

    const verifySession = async () => {
      try {
        setSessionChecking(true)
        console.log("[Login] Initial session verification")

        const hasSession = await checkSession()

        if (hasSession) {
          console.log("[Login] Valid session found, refreshing")
          await refreshUserSession()
        } else {
          console.log("[Login] No valid session found")
        }

        setSessionCheckCount(1)
      } catch (err) {
        console.error("[Login] Error verifying session:", err)
      } finally {
        setSessionChecking(false)
      }
    }

    verifySession()
  }, [checkSession, refreshUserSession, sessionCheckCount, initialCheckDone])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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

          // CRITICAL FIX: Force redirect after successful login
          if (user) {
            manuallySetAuthData(user)
            router.push(redirectPath)
          } else {
            // If we don't have a user yet, force a page reload to get fresh state
            window.location.href = redirectPath
          }
        }
      } catch (error: any) {
        console.error("[Login] Exception during sign in:", error)
        setFormError(error.message || "An error occurred during sign in")
      } finally {
        setIsSubmitting(false)
      }
    },
    [email, password, signIn, checkSession, user, router, redirectPath],
  )

  const handleSessionCheck = useCallback(async () => {
    setSessionChecking(true)
    try {
      console.log("[Login] Manual session check")
      await checkSession()
    } catch (err) {
      console.error("[Login] Error in manual session check:", err)
    } finally {
      setSessionChecking(false)
    }
  }, [checkSession])

  const handleSessionRefresh = useCallback(async () => {
    setSessionChecking(true)
    try {
      console.log("[Login] Manual session refresh")
      await refreshUserSession()
    } catch (err) {
      console.error("[Login] Error in manual session refresh:", err)
    } finally {
      setSessionChecking(false)
    }
  }, [refreshUserSession])

  const handleForceRedirect = useCallback(() => {
    console.log("[Login] Forcing redirect to:", redirectPath)

    // If we have user data, set the auth cookie
    if (user) {
      manuallySetAuthData(user)
    }

    // Set emergency bypass flag
    sessionStorage.setItem("emergency_auth_bypass", "true")
    document.cookie = "emergency_auth_bypass=true; path=/; max-age=300" // 5 minutes

    // Force navigation
    window.location.href = redirectPath
  }, [redirectPath, user])

  const handleEnableBypass = useCallback(() => {
    console.log("[Login] Enabling emergency auth bypass")
    sessionStorage.setItem("emergency_auth_bypass", "true")
    document.cookie = "emergency_auth_bypass=true; path=/; max-age=300" // 5 minutes
    setBypassEnabled(true)
  }, [])

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      {/* Add the auth success handler */}
      <AuthSuccessHandler />

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
        </div>

        {formError && (
          <div className="mb-6 rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
            {formError}
          </div>
        )}

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
          <button
            onClick={() => {
              if (user) {
                const success = manuallySetAuthData(user)
                if (success) {
                  addToast({
                    title: "Auth cookie set",
                    description: "Auth cookie has been manually set",
                    type: "success",
                  })
                }
              } else {
                addToast({
                  title: "No user data",
                  description: "No user data available to set cookie",
                  type: "error",
                })
              }
            }}
            className="flex items-center text-xs text-amber-500 hover:text-amber-400"
          >
            Set Auth Cookie
          </button>
        </div>

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

        <div className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/account/signup" className="font-medium text-amber-500 hover:text-amber-400">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
