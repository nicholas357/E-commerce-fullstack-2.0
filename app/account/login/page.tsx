"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { GoogleLoginButton } from "@/components/google-login-button"
import { useAuth } from "@/context/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [redirectPath, setRedirectPath] = useState("/account")

  const { user, signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const storedRedirect = localStorage.getItem("redirectAfterLogin")
    if (storedRedirect) {
      setRedirectPath(storedRedirect)
      localStorage.removeItem("redirectAfterLogin")
    }
  }, [])

  useEffect(() => {
    if (user) router.push(redirectPath)
  }, [user, redirectPath, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return setFormError("Please fill in all fields")

    setIsSubmitting(true)
    setFormError("")

    try {
      const { error } = await signIn(email, password)
      if (error) setFormError(error)
    } catch (err: any) {
      setFormError(err.message || "Login error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Sign In</h1>
          <p className="mt-2 text-gray-400">Welcome back! Please sign in.</p>
        </div>

        {formError && (
          <div className="mb-6 rounded border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-gray-400">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border bg-background py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-gray-400">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border bg-background py-2 pl-10 pr-10 text-white placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-amber-500"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-400">
              <input type="checkbox" className="mr-2 rounded border-border bg-background text-amber-500 focus:ring-amber-500" />
              Remember me
            </label>
            <Link href="/account/forgot-password" className="text-sm text-amber-500 hover:text-amber-400">Forgot password?</Link>
          </div>

          <GamingButton type="submit" variant="amber" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in...
              </span>
            ) : "Sign In"}
          </GamingButton>
        </form>

        <div className="mt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-gray-400">Or continue with</span>
            </div>
          </div>

          <GoogleLoginButton />
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link href="/account/signup" className="font-medium text-amber-500 hover:text-amber-400">Sign up</Link>
        </div>
      </div>
    </div>
  )
}
