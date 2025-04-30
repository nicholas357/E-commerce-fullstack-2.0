"use client"

import { useSession } from "@/hooks/use-session"
import type { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  adminOnly?: boolean
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { session, isLoading } = useSession()
  const isAdmin = session?.user?.role === "admin"

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="text-lg text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Authentication Required</h1>
          <p className="mt-2 text-gray-400">Please sign in to access this page.</p>
        </div>
      </div>
    )
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="mt-2 text-gray-400">You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
