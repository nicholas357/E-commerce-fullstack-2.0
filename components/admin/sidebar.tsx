"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  BarChart,
  CreditCard,
  Tag,
  MessageSquare,
  ShoppingCart,
  Gift,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { GamingButton } from "@/components/ui/gaming-button"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Tag,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Gift Cards",
    href: "/admin/gift-cards",
    icon: Gift,
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: MessageSquare,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { signOut, profile } = useAuth()

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="w-64 min-h-screen bg-card border-r border-border overflow-y-auto">
      <div className="p-6">
        <Link href="/admin/dashboard" className="flex items-center mb-8">
          <span className="text-2xl font-bold text-white glow-text-amber">turgame</span>
          <span className="ml-2 text-xs bg-amber-500 text-black px-2 py-0.5 rounded-md">ADMIN</span>
        </Link>

        <div className="mb-6 pb-6 border-b border-border">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold">
              {profile?.full_name?.[0] || profile?.email?.[0] || "A"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{profile?.full_name || "Admin User"}</p>
              <p className="text-xs text-gray-400">{profile?.email}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                isActive(item.href, item.exact)
                  ? "bg-amber-500/20 text-amber-400 glow-text-amber"
                  : "text-gray-400 hover:bg-muted hover:text-white"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-border mt-6">
          <GamingButton variant="ghost" className="w-full justify-start" onClick={signOut}>
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </GamingButton>
        </div>
      </div>
    </div>
  )
}
