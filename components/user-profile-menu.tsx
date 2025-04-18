"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, LogOut, Heart, ShoppingCart, Settings, CreditCard, Package, LayoutDashboard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"

export function UserProfileMenu() {
  const { user, profile, signOut } = useAuth()
  const { items: cartItems } = useCart()
  const { items: wishlistItems } = useWishlist()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const isAdmin = profile?.role === "admin"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-white hover:bg-amber-500/20 transition-colors"
          aria-label="User menu"
        >
          {profile?.full_name ? (
            <span className="text-sm font-medium">{profile.full_name[0].toUpperCase()}</span>
          ) : (
            <User className="h-5 w-5" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-card border-border text-white" align="end">
        <DropdownMenuLabel>
          {user ? (
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              {isAdmin && (
                <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-md w-fit mt-1">Admin</span>
              )}
            </div>
          ) : (
            "My Account"
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        {user ? (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/account" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/wishlist" className="cursor-pointer">
                  <Heart className="mr-2 h-4 w-4" />
                  <span>Wishlist</span>
                  {wishlistItems.length > 0 && (
                    <span className="ml-auto bg-amber-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/cart" className="cursor-pointer">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  <span>Cart</span>
                  {cartItems.length > 0 && (
                    <span className="ml-auto bg-amber-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/account/orders" className="cursor-pointer">
                  <Package className="mr-2 h-4 w-4" />
                  <span>Orders</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/account/payment-methods" className="cursor-pointer">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Payment Methods</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/account/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>

              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/account/login" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Sign In</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
