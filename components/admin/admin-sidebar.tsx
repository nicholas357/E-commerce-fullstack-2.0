"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, Star, Gift, ChevronDown } from "lucide-react"
import { useState } from "react"

interface SidebarLinkProps {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  isActive?: boolean
  onClick?: () => void
}

function SidebarLink({ href, icon, children, isActive, onClick }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 text-sm transition-colors ${
        isActive ? "bg-amber-500/10 text-amber-500" : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
      }`}
      onClick={onClick}
    >
      <span className="mr-3">{icon}</span>
      {children}
    </Link>
  )
}

interface SidebarSubmenuProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  isActive: boolean
}

function SidebarSubmenu({ title, icon, children, isActive }: SidebarSubmenuProps) {
  const [isOpen, setIsOpen] = useState(isActive)

  return (
    <div>
      <button
        className={`flex w-full items-center justify-between px-4 py-3 text-sm transition-colors ${
          isActive ? "bg-amber-500/10 text-amber-500" : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <span className="mr-3">{icon}</span>
          {title}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="pl-4">{children}</div>}
    </div>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") {
      return true
    }
    return pathname !== "/admin" && pathname.startsWith(path)
  }

  return (
    <div className="w-64 bg-gray-900 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold text-white mb-6">Admin Panel</h2>
        <nav className="space-y-1">
          <SidebarLink href="/admin" icon={<LayoutDashboard className="h-5 w-5" />} isActive={pathname === "/admin"}>
            Dashboard
          </SidebarLink>

          <SidebarLink
            href="/admin/products"
            icon={<Package className="h-5 w-5" />}
            isActive={isActive("/admin/products")}
          >
            Products
          </SidebarLink>

          <SidebarLink
            href="/admin/orders"
            icon={<ShoppingCart className="h-5 w-5" />}
            isActive={isActive("/admin/orders")}
          >
            Orders
          </SidebarLink>

          <SidebarLink href="/admin/users" icon={<Users className="h-5 w-5" />} isActive={isActive("/admin/users")}>
            Users
          </SidebarLink>

          <SidebarLink href="/admin/reviews" icon={<Star className="h-5 w-5" />} isActive={isActive("/admin/reviews")}>
            Reviews
          </SidebarLink>

          <SidebarLink
            href="/admin/gift-cards"
            icon={<Gift className="h-5 w-5" />}
            isActive={isActive("/admin/gift-cards")}
          >
            Gift Cards
          </SidebarLink>

          <SidebarSubmenu
            title="Settings"
            icon={<Settings className="h-5 w-5" />}
            isActive={isActive("/admin/settings")}
          >
            <SidebarLink
              href="/admin/settings"
              icon={<span className="h-1 w-1 rounded-full bg-current" />}
              isActive={pathname === "/admin/settings"}
            >
              General
            </SidebarLink>
            <SidebarLink
              href="/admin/settings/banners"
              icon={<span className="h-1 w-1 rounded-full bg-current" />}
              isActive={isActive("/admin/settings/banners")}
            >
              Banners
            </SidebarLink>
          </SidebarSubmenu>
        </nav>
      </div>
    </div>
  )
}
