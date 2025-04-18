"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2, ArrowLeft, Heart, ShoppingCart, LogIn } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { useWishlist } from "@/context/wishlist-context"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/toast-provider"
import { Star } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist()
  const { addItem } = useCart()
  const { addToast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white glow-text-amber">Your Wishlist</h1>
        <Link href="/">
          <GamingButton variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </GamingButton>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
          <Heart className="mb-4 h-16 w-16 text-amber-500" />
          <h2 className="mb-2 text-2xl font-bold text-white">Your wishlist is empty</h2>
          <p className="mb-6 text-gray-400">Save items you like for later by adding them to your wishlist.</p>
          <Link href="/">
            <GamingButton variant="amber">Start Shopping</GamingButton>
          </Link>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-end">
            <GamingButton variant="ghost" size="sm" onClick={clearWishlist}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Wishlist
            </GamingButton>
          </div>

          <div>
            <div className="rounded-lg border border-border bg-card shadow-lg">
              <div className="p-6">
                <div className="mb-4 flex justify-between border-b border-border pb-4">
                  <h3 className="text-lg font-medium text-white">Wishlist Items ({items.length})</h3>
                  {!user && (
                    <Link href="/account/login?redirect=/wishlist">
                      <GamingButton variant="ghost" size="sm" className="gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign in to save wishlist
                      </GamingButton>
                    </Link>
                  )}
                </div>

                <div className="divide-y divide-border">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <h4 className="text-sm font-medium text-white">{item.name}</h4>
                        <p className="text-xs text-gray-400">{item.category}</p>

                        {/* Rating */}
                        <div className="mt-1 flex items-center">
                          <div className="flex items-center">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < item.rating ? "fill-amber-400 text-amber-400" : "text-gray-600"
                                  }`}
                                />
                              ))}
                          </div>
                          <span className="ml-2 text-xs text-gray-400">({item.reviewCount})</span>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">NPR {item.price.toLocaleString()}</span>
                            {item.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                NPR {item.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <GamingButton
                              size="sm"
                              variant="amber"
                              disabled={!item.inStock}
                              onClick={() => handleAddToCart(item)}
                            >
                              <ShoppingCart className="mr-1 h-4 w-4" />
                              {item.inStock ? "Add to Cart" : "Out of Stock"}
                            </GamingButton>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-gray-400 transition-colors hover:border-red-500 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
