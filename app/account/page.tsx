"use client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Package, CreditCard, Heart, LogOut, ArrowRight } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { useAuth } from "@/context/auth-context"

export default function AccountPage() {
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()

  // If not logged in, show login prompt
  if (!user && !isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
          <div className="flex flex-col items-center justify-center text-center">
            <User className="mb-4 h-16 w-16 text-amber-500" />
            <h1 className="mb-2 text-2xl font-bold text-white">Account Access</h1>
            <p className="mb-6 text-gray-400">Please sign in to access your account details and orders.</p>
            <div className="flex gap-4">
              <Link href="/account/login">
                <GamingButton variant="amber">Sign In</GamingButton>
              </Link>
              <Link href="/account/signup">
                <GamingButton variant="outline">Create Account</GamingButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

  // Account dashboard for logged in users
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-white glow-text-amber">My Account</h1>

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
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/account/orders" className="group">
          <div className="flex h-full items-center rounded-lg border border-border bg-card p-6 shadow-lg transition-colors hover:border-amber-500/50 hover:bg-amber-500/5">
            <Package className="mr-4 h-8 w-8 text-amber-400" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white group-hover:text-amber-400 group-hover:glow-text-amber">
                My Orders
              </h3>
              <p className="text-sm text-gray-400">View your order history and track deliveries</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-amber-400" />
          </div>
        </Link>

        <Link href="/account/payment-methods" className="group">
          <div className="flex h-full items-center rounded-lg border border-border bg-card p-6 shadow-lg transition-colors hover:border-amber-500/50 hover:bg-amber-500/5">
            <CreditCard className="mr-4 h-8 w-8 text-amber-400" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white group-hover:text-amber-400 group-hover:glow-text-amber">
                Payment Methods
              </h3>
              <p className="text-sm text-gray-400">Manage your payment options</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-amber-400" />
          </div>
        </Link>

        <Link href="/wishlist" className="group">
          <div className="flex h-full items-center rounded-lg border border-border bg-card p-6 shadow-lg transition-colors hover:border-amber-500/50 hover:bg-amber-500/5">
            <Heart className="mr-4 h-8 w-8 text-amber-400" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white group-hover:text-amber-400 group-hover:glow-text-amber">
                My Wishlist
              </h3>
              <p className="text-sm text-gray-400">View and manage your saved items</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-amber-400" />
          </div>
        </Link>

        <Link href="/account/settings" className="group">
          <div className="flex h-full items-center rounded-lg border border-border bg-card p-6 shadow-lg transition-colors hover:border-amber-500/50 hover:bg-amber-500/5">
            <User className="mr-4 h-8 w-8 text-amber-400" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white group-hover:text-amber-400 group-hover:glow-text-amber">
                Account Settings
              </h3>
              <p className="text-sm text-gray-400">Update your profile and preferences</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-amber-400" />
          </div>
        </Link>
      </div>

      <div className="mt-8">
        <GamingButton variant="ghost" onClick={() => signOut()} className="text-gray-400 hover:text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </GamingButton>
      </div>
    </div>
  )
}
