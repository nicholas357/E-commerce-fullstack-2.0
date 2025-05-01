"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/toast-provider"
import { FcGoogle } from "react-icons/fc"

export function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithGoogle } = useAuth()
  const { addToast } = useToast()

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)

      // Store the current URL for returning after auth
      const currentPath = window.location.pathname
      localStorage.setItem("authReturnPath", currentPath)

      // Also set a cookie for the server to read
      document.cookie = `authReturnPath=${currentPath}; path=/; max-age=3600`

      console.log("[Google Login] Starting Google sign in, current path:", currentPath)

      const { error } = await signInWithGoogle()

      if (error) {
        console.error("[Google Login] Error initiating Google sign in:", error)
        addToast({
          title: "Error",
          description: error,
          type: "error",
        })
      }
    } catch (err) {
      console.error("[Google Login] Exception during Google sign in:", err)
      addToast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background py-2 px-4 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {isLoading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
      ) : (
        <FcGoogle className="h-5 w-5" />
      )}
      <span>Google</span>
    </button>
  )
}
