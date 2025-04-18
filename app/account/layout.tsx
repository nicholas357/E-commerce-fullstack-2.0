"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { User, Package, Heart, CreditCard, Settings, LogOut, ChevronRight, Menu, X } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { useToast } from "@/components/ui/toast-provider"
import { useAuth } from "@/context/auth-context"

interface AccountLayoutProps {
  children: React.ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(true) // For demo purposes
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { addToast } = useToast()
  const { user, signOut } = useAuth()

  // Close mobile nav when path changes
  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  const handleLogout = () => {
    signOut()
  }

  const navItems = [
    {
      title: "Account Overview",
      href: "/account",
      icon: User,
      exact: true,
    },
    {
      title: "My Orders",
      href: "/account/orders",
      icon: Package,
    },
    {
      title: "Wishlist",
      href: "/wishlist",
      icon: Heart,
    },
    {
      title: "Payment Methods",
      href: "/account/payment-methods",
      icon: CreditCard,
    },
    {
      title: "Account Settings",
      href: "/account/settings",
      icon: Settings,
    },
  ]

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  if (!isLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12"
      >
        <div className="w-full rounded-lg border border-border bg-card p-8 text-center shadow-lg">
          <User className="mx-auto mb-4 h-16 w-16 text-amber-500" />
          <h1 className="mb-4 text-2xl font-bold text-white">You're not logged in</h1>
          <p className="mb-6 text-gray-400">Please sign in to access your account.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/account/login" className="flex-1">
              <GamingButton variant="amber" className="w-full">
                Sign In
              </GamingButton>
            </Link>
            <Link href="/account/signup" className="flex-1">
              <GamingButton variant="ghost" className="w-full">
                Create Account
              </GamingButton>
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Mobile Navigation Toggle */}
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <h1 className="text-2xl font-bold text-white glow-text-amber">My Account</h1>
        <GamingButton variant="ghost" size="sm" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
          {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="ml-2">{mobileNavOpen ? "Close" : "Menu"}</span>
        </GamingButton>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Navigation - Desktop */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block lg:w-64"
        >
          <div className="sticky top-[125px] rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="mb-6 flex items-center">
              {user ? (
                <>
                  <div className="mr-3 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-amber-500 text-black">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url || "/placeholder.svg"}
                        alt={user.full_name || "User"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.full_name || user.email || "User",
                          )}&background=amber&color=000000`
                        }}
                      />
                    ) : (
                      <span className="text-sm font-bold">
                        {user.full_name
                          ? user.full_name[0].toUpperCase()
                          : user.email
                            ? user.email[0].toUpperCase()
                            : "U"}
                      </span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h2 className="truncate font-medium text-white">
                      {user.full_name || user.email?.split("@")[0] || "User"}
                    </h2>
                    <p className="truncate text-xs text-gray-400">{user.email || ""}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-gray-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-medium text-white">Guest User</h2>
                    <p className="text-xs text-gray-400">
                      <Link href="/account/login" className="text-amber-400 hover:underline">
                        Sign in
                      </Link>{" "}
                      to access your account
                    </p>
                  </div>
                </>
              )}
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive(item.href, item.exact)
                      ? "bg-amber-500/20 text-amber-400 glow-text-amber"
                      : "text-gray-400 hover:bg-muted hover:text-white"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.title}</span>
                  {isActive(item.href, item.exact) && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              ))}
            </nav>

            {user && (
              <div className="mt-6 border-t border-border pt-6">
                <GamingButton variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </GamingButton>
              </div>
            )}
          </div>
        </motion.aside>

        {/* Mobile Navigation - Slide Down */}
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden rounded-lg border border-border bg-card shadow-lg lg:hidden"
          >
            <div className="p-4">
              <div className="mb-4 flex items-center">
                {user ? (
                  <>
                    <div className="mr-3 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-amber-500 text-black">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url || "/placeholder.svg"}
                          alt={user.full_name || "User"}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.full_name || user.email || "User",
                            )}&background=amber&color=000000`
                          }}
                        />
                      ) : (
                        <span className="text-sm font-bold">
                          {user.full_name
                            ? user.full_name[0].toUpperCase()
                            : user.email
                              ? user.email[0].toUpperCase()
                              : "U"}
                        </span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h2 className="truncate font-medium text-white">
                        {user.full_name || user.email?.split("@")[0] || "User"}
                      </h2>
                      <p className="truncate text-xs text-gray-400">{user.email || ""}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-gray-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-medium text-white">Guest User</h2>
                      <p className="text-xs text-gray-400">
                        <Link href="/account/login" className="text-amber-400 hover:underline">
                          Sign in
                        </Link>{" "}
                        to access your account
                      </p>
                    </div>
                  </>
                )}
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive(item.href, item.exact)
                        ? "bg-amber-500/20 text-amber-400 glow-text-amber"
                        : "text-gray-400 hover:bg-muted hover:text-white"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Link>
                ))}
              </nav>

              {user && (
                <div className="mt-4 border-t border-border pt-4">
                  <GamingButton variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                  </GamingButton>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
