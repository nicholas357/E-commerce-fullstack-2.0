"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { User, Package, CreditCard, Heart } from "lucide-react"

export default function DashboardPage() {
  const { user, isLoading, getToken } = useAuth()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      router.push("/account/login?redirectTo=/dashboard")
    }

    // Fetch user profile data
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const token = await getToken()
          if (!token) throw new Error("No token available")

          const response = await fetch("/api/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            throw new Error("Failed to fetch profile data")
          }

          const data = await response.json()
          setUserProfile(data)
        } catch (error) {
          console.error("Error fetching profile:", error)
        } finally {
          setIsLoadingProfile(false)
        }
      }
    }

    if (user) {
      fetchUserProfile()
    }
  }, [user, isLoading, router, getToken])

  // Show loading state
  if (isLoading || isLoadingProfile) {
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-white glow-text-amber">My Dashboard</h1>

      <div className="mb-8 rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url || "/placeholder.svg"}
                alt={user.full_name || "User"}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.full_name || "User"}</h2>
            <p className="text-gray-400">{user?.email}</p>
            {user?.role === "admin" && (
              <span className="mt-1 inline-block rounded bg-amber-500 px-2 py-0.5 text-xs font-medium text-black">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex h-full items-center rounded-lg border border-border bg-card p-6 shadow-lg transition-colors hover:border-amber-500/50 hover:bg-amber-500/5">
          <Package className="mr-4 h-8 w-8 text-amber-400" />
          <div>
            <h3 className="text-lg font-medium text-white">My Orders</h3>
            <p className="text-sm text-gray-400">View your order history and track deliveries</p>
          </div>
        </div>

        <div className="flex h-full items-center rounded-lg border border-border bg-card p-6 shadow-lg transition-colors hover:border-amber-500/50 hover:bg-amber-500/5">
          <CreditCard className="mr-4 h-8 w-8 text-amber-400" />
          <div>
            <h3 className="text-lg font-medium text-white">Payment Methods</h3>
            <p className="text-sm text-gray-400">Manage your payment options</p>
          </div>
        </div>

        <div className="flex h-full items-center rounded-lg border border-border bg-card p-6 shadow-lg transition-colors hover:border-amber-500/50 hover:bg-amber-500/5">
          <Heart className="mr-4 h-8 w-8 text-amber-400" />
          <div>
            <h3 className="text-lg font-medium text-white">My Wishlist</h3>
            <p className="text-sm text-gray-400">View and manage your saved items</p>
          </div>
        </div>

        <div className="flex h-full items-center rounded-lg border border-border bg-card p-6 shadow-lg transition-colors hover:border-amber-500/50 hover:bg-amber-500/5">
          <User className="mr-4 h-8 w-8 text-amber-400" />
          <div>
            <h3 className="text-lg font-medium text-white">Account Settings</h3>
            <p className="text-sm text-gray-400">Update your profile and preferences</p>
          </div>
        </div>
      </div>
    </div>
  )
}
