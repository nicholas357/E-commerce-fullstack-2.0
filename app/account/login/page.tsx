"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, RefreshCw } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { GoogleLoginButton } from "@/components/google-login-button"
import { useAuth } from "@/context/auth-context"
import { checkSessionStatus, refreshSession } from "@/lib/supabase/client-client"

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

  // Check if there's a redirect path in localStorage
  useEffect(() => {
    const storedRedirectPath = localStorage.getItem("redirectAfterLogin")
    if (storedRedirectPath) {
      console.log("[Login] Found redirect path:", storedRedirectPath)
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
  }, [])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log("[Login] User already logged in, redirecting to:", redirectPath)
      router.push(redirectPath)
    }
  }, [user, router, redirectPath])

  // Check session status on load
  useEffect(() => {
    const verifySession = async () => {
      try {
        setSessionChecking(true)
        console.log("[Login] Verifying session on page load")

        const { data, error } = await checkSessionStatus()

        if (error) {
          console.error("[Login] Session verification error:", error)
          return
        }

        if (data.session) {
          console.log("[Login] Valid session found, refreshing")
          await refreshSession()
        } else {
          console.log("[Login] No valid session found")
        }
      } catch (err) {
        console.error("[Login] Error verifying session:", err)
      } finally {
        setSessionChecking(false)
      }
    }

    verifySession()
  }, [])

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
        // Successful login will redirect via the useEffect
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
    } catch (err) {
      console.error("[Login] Error in manual session refresh:", err)
    } finally {
      setSessionChecking(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Sign In</h1>
          <p className="mt-2 text-gray-400">Welcome back! Please sign in to your account.</p>
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

        <div className="mt-4 flex justify-center space-x-2">
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
