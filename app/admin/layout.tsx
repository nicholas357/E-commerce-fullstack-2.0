"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Spinner } from "@/components/ui/spinner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, profile } = useAuth()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/account/login?redirectTo=/admin/dashboard")
      } else if (profile?.role !== "admin") {
        router.push("/")
      } else {
        setAuthorized(true)
      }
    }
  }, [user, isLoading, profile, router])

  if (isLoading || !authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Spinner size="lg" className="mb-4" />
        <p className="text-gray-400 animate-pulse">Loading admin panel...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 p-8 overflow-auto">{children}</div>
    </div>
  )
}
