"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import GoogleLoginButton from "@/components/google-login-button"
import { getSupabaseClient } from "@/lib/supabase/client-client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get redirectTo from query params
  const redirectTo = searchParams?.get("redirectTo") || "/account"

  // Handle hash fragment for OAuth responses
  useEffect(() => {
    // Check if we have a hash fragment that contains an access_token (from OAuth)
    if (typeof window !== "undefined" && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get("access_token")

      if (accessToken) {
        console.log("[Login] Found access token in URL hash, processing...")

        // Clear the hash fragment
        window.history.replaceState(null, "", window.location.pathname + window.location.search)

        // Process the token
        const processToken = async () => {
          try {
            const supabase = getSupabaseClient()

            // Set the session using the access token
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get("refresh_token") || "",
            })

            if (error) {
              console.error("[Login] Error setting session from hash:", error)
              setError("Failed to complete authentication. Please try again.")
            } else {
              console.log("[Login] Successfully set session from hash")
              setMessage("Successfully authenticated! Redirecting...")

              // Get redirect path from localStorage or cookie
              const redirectPath = localStorage.getItem("redirectAfterLogin") || redirectTo

              // Clear stored redirect
              localStorage.removeItem("redirectAfterLogin")

              // Redirect after a short delay
              setTimeout(() => {
                router.push(redirectPath)
              }, 1000)
            }
          } catch (err) {
            console.error("[Login] Exception processing hash:", err)
            setError("An unexpected error occurred. Please try again.")
          }
        }

        processToken()
      }
    }

    // Check for error in query params
    const errorParam = searchParams?.get("error")
    const errorDescription = searchParams?.get("error_description")

    if (errorParam) {
      setError(`Authentication error: ${errorDescription || errorParam}`)
    }
  }, [router, redirectTo, searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        // Store the redirect path
        if (redirectTo) {
          localStorage.setItem("redirectAfterLogin", redirectTo)
        }

        router.push(redirectTo)
      }
    } catch (err) {
      setError("Failed to sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Sign in to your account</h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {message && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{message}</div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-t-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-b-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/account/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Don't have an account? Sign up
              </Link>
            </div>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <GoogleLoginButton redirectTo={redirectTo} />
          </div>
        </div>
      </div>
    </div>
  )
}
