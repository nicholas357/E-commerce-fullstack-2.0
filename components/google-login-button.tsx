"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase/client-client"
import { useRouter } from "next/navigation"

interface GoogleLoginButtonProps {
  mode?: "login" | "signup"
  redirectTo?: string
  className?: string
}

export default function GoogleLoginButton({ mode = "login", redirectTo, className = "" }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Store the redirect path in localStorage and a cookie for redundancy
      if (redirectTo) {
        localStorage.setItem("redirectAfterLogin", redirectTo)
        document.cookie = `redirectAfterLogin=${redirectTo}; path=/; max-age=3600`
      }

      // Get the current origin for the callback URL
      const origin = window.location.origin
      const callbackUrl = `${origin}/auth/callback`

      console.log("[Google Login] Starting OAuth with callback URL:", callbackUrl)

      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        console.error("[Google Login] OAuth error:", error)
        setError(error.message)
      } else {
        console.log("[Google Login] OAuth initiated:", data)
      }
    } catch (err) {
      console.error("[Google Login] Exception during OAuth:", err)
      setError("Failed to connect to authentication service. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 ${className}`}
      >
        {isLoading ? (
          <span className="animate-spin">⟳</span>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18.1711 8.36788H17.5V8.33329H10V11.6666H14.6789C13.9474 13.6063 12.1053 15 10 15C7.23684 15 5 12.7632 5 10C5 7.23682 7.23684 5.00001 10 5.00001C11.2632 5.00001 12.4211 5.48684 13.3158 6.28947L15.6842 3.92104C14.1579 2.49998 12.1842 1.66667 10 1.66667C5.39474 1.66667 1.66667 5.39474 1.66667 10C1.66667 14.6052 5.39474 18.3333 10 18.3333C14.6053 18.3333 18.3333 14.6052 18.3333 10C18.3333 9.44736 18.2763 8.89473 18.1711 8.36788Z"
              fill="#FFC107"
            />
            <path
              d="M2.62793 6.12104L5.36214 8.12894C6.10003 6.29473 7.90003 5.00001 9.99982 5.00001C11.2631 5.00001 12.4209 5.48684 13.3157 6.28947L15.6841 3.92104C14.1578 2.49998 12.1841 1.66667 9.99982 1.66667C6.74588 1.66667 3.92798 3.47367 2.62793 6.12104Z"
              fill="#FF3D00"
            />
            <path
              d="M10.0002 18.3333C12.1265 18.3333 14.0581 17.5281 15.5686 16.1614L13.0107 13.9833C12.1433 14.6348 11.0823 15.0009 10.0002 15C7.90246 15 6.06719 13.6176 5.32982 11.6895L2.60938 13.7804C3.89561 16.4738 6.74404 18.3333 10.0002 18.3333Z"
              fill="#4CAF50"
            />
            <path
              d="M18.1711 8.36788H17.5V8.33329H10V11.6666H14.6789C14.3316 12.5891 13.7368 13.3828 12.975 13.9805L12.9789 13.9776L15.5368 16.1557C15.3789 16.2995 18.3333 14.1666 18.3333 10C18.3333 9.44736 18.2763 8.89473 18.1711 8.36788Z"
              fill="#1976D2"
            />
          </svg>
        )}
        <span>{isLoading ? "Connecting..." : `${mode === "login" ? "Sign in" : "Sign up"} with Google`}</span>
      </Button>

      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
    </div>
  )
}
