"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { GoogleLoginButton } from "@/components/google-login-button"
import { useAuth } from "@/context/auth-context"

export default function SignupPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const { signUp, user } = useAuth()
  const router = useRouter()
  const [redirectPath, setRedirectPath] = useState("/account")

  // Check if there's a redirect path in localStorage
  useEffect(() => {
    const storedRedirectPath = localStorage.getItem("redirectAfterLogin")
    if (storedRedirectPath) {
      setRedirectPath(storedRedirectPath)
      localStorage.removeItem("redirectAfterLogin")
    }
  }, [])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(redirectPath)
    }
  }, [user, router, redirectPath])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!fullName || !email || !password) {
      setFormError("Please fill in all fields")
      return
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long")
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await signUp(email, password, fullName)
      if (error) {
        setFormError(error)
      } else {
        // Successful signup will redirect via the useEffect
        // Add a small delay to ensure the auth state updates
        setTimeout(() => {
          if (!user) {
            router.push("/account/login?message=Account created. Please log in.")
          }
        }, 2000)
      }
    } catch (error: any) {
      setFormError(error.message || "An error occurred during sign up")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-gray-400">Join TurGame to start shopping for digital products.</p>
        </div>

        {formError && (
          <div className="mb-6 rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-400">
              Full Name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full rounded-md border border-border bg-background py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

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
                placeholder="Create a password"
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
            <p className="mt-1 text-xs text-gray-400">Password must be at least 6 characters long</p>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 rounded border-border bg-background text-amber-500 focus:ring-amber-500"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
              I agree to the{" "}
              <Link href="/legal/terms-of-service" className="text-amber-500 hover:text-amber-400">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy-policy" className="text-amber-500 hover:text-amber-400">
                Privacy Policy
              </Link>
            </label>
          </div>

          <GamingButton type="submit" variant="amber" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </GamingButton>
        </form>

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
          Already have an account?{" "}
          <Link href="/account/login" className="font-medium text-amber-500 hover:text-amber-400">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
