"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Star, Heart, ShoppingBag, LogOut } from "lucide-react"
import { useAuth } from "@/context/auth-context"

const profileLinks = [
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "My Reviews",
    href: "/profile/reviews",
    icon: Star,
  },
  {
    name: "Wishlist",
    href: "/profile/wishlist",
    icon: Heart,
  },
  {
    name: "Orders",
    href: "/profile/orders",
    icon: ShoppingBag,
  },
]

export function ProfileNav() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <nav className="flex flex-col space-y-1">
      {profileLinks.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
              isActive ? "bg-amber-500 text-black" : "text-gray-300 hover:bg-muted hover:text-white"
            }`}
          >
            <link.icon className="mr-2 h-4 w-4" />
            {link.name}
          </Link>
        )
      })}
      <button
        onClick={() => signOut()}
        className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-muted hover:text-white"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </button>
    </nav>
  )
}
