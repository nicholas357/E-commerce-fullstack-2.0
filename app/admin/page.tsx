"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Users, ShoppingBag, Settings, LayoutDashboard } from "lucide-react"

export default function AdminPage() {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if not logged in or not an admin
    if (!isLoading && (!user || !isAdmin)) {
      router.push("/unauthorized")
    }
  }, [user, isLoading, isAdmin, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 animate-pulse rounded-full bg-amber-500/20"></div>
            <div className="mt-4 h-8 w-48 animate-pulse rounded bg-gray-700"></div>
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-700"></div>
          </div>
        </div>
      </div>
    )
  }

  // If not admin, don't render anything (will be redirected by useEffect)
  if (!isAdmin) {
    return null
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-white glow-text-amber">Admin Dashboard</h1>

      <div className="mb-8 rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url || "/placeholder.svg"}
                alt={user.full_name || "Admin"}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <Users className="h-8 w-8" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.full_name || "Admin"}</h2>
            <p className="text-gray-400">{user?.email}</p>
            <span className="mt-1 inline-block rounded bg-amber-500 px-2 py-0.5 text-xs font-medium text-black">
              Admin
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex h-full items-center rounded-lg border border-border bg-card p-6 shadow-lg transition-colors hover:border-amber-500/50 hover:bg-amber-500/5">
          <LayoutDashboard className="mr-4 h-8 w-8 text-amber-400" />
          <div>
            <h3 className="text-lg font-medium text-white">Dashboard</h3>
            <p className="text-sm text-gray-400">View site statistics and analytics</p>
          </div>
        </div>

        <div className="flex h-full items-center rounded-lg border border-border bg-card p-6 shadow-lg transition-colors hover:border-amber-500/50 hover:bg-amber-500/5">
          <Users className="mr-4 h-8 w-8 text-amber-400" />
          <div>
            <h3 className="text-lg font-medium text-white">Users</h3>
            <p className="text-sm text-gray-400">Manage user accounts and permissions</p>
          </div>
        </div>

        <div className="flex h-full items-center rounded-lg border border-border bg-card p-6 shadow-lg transition-colors hover:border-amber-500/50 hover:bg-amber-500/5">
          <ShoppingBag className="mr-4 h-8 w-8 text-amber-400" />
          <div>
            <h3 className="text-lg font-medium text-white">Products</h3>
            <p className="text-sm text-gray-400">Manage products and inventory</p>
          </div>
        </div>

        <div className="flex h-full items-center rounded-lg border border-border bg-card p-6 shadow-lg transition-colors hover:border-amber-500/50 hover:bg-amber-500/5">
          <Settings className="mr-4 h-8 w-8 text-amber-400" />
          <div>
            <h3 className="text-lg font-medium text-white">Settings</h3>
            <p className="text-sm text-gray-400">Configure site settings and options</p>
          </div>
        </div>
      </div>
    </div>
  )
}
