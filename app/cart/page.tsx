"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ShoppingBag, Trash2, CreditCard, ArrowRight } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart()
  const { user } = useAuth()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const router = useRouter()

  // Update the handleCheckout function to use client-side navigation
  const handleCheckout = () => {
    setIsCheckingOut(true)

    // If user is not logged in, redirect to login
    if (!user) {
      // Store cart in localStorage before redirecting
      localStorage.setItem("redirectAfterLogin", "/checkout")
      router.push("/account/login")
      return
    }

    // Use client-side navigation for a smoother transition
    router.push("/checkout")
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
          <ShoppingBag className="mb-4 h-16 w-16 text-gray-500" />
          <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
          <p className="mb-6 text-gray-400">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/">
            <GamingButton variant="amber">Continue Shopping</GamingButton>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-card">
            <div className="p-6">
              <div className="mb-4 flex justify-between border-b border-border pb-4">
                <h2 className="text-xl font-bold">Items ({items.length})</h2>
                <button onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500">
                  Clear Cart
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center border-b border-border pb-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-border">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-400">{item.category}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-gray-400 hover:border-amber-500 hover:text-amber-400"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="mx-2 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-gray-400 hover:border-amber-500 hover:text-amber-400"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-amber-400">
                            NPR {(item.price * item.quantity).toLocaleString()}
                          </span>
                          <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">
                            <Trash2 className="h-5 w-5" />
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

        <div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-bold">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span>NPR {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shipping</span>
                <span className="text-green-400">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tax</span>
                <span>NPR 0</span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-amber-400">NPR {totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <GamingButton variant="amber" className="w-full" onClick={handleCheckout} disabled={isCheckingOut}>
                {isCheckingOut ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    {user ? "Checkout" : "Sign in to Checkout"}
                  </span>
                )}
              </GamingButton>
            </div>

            <div className="mt-4">
              <Link href="/">
                <GamingButton variant="ghost" className="w-full">
                  <span className="flex items-center justify-center">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Continue Shopping
                  </span>
                </GamingButton>
              </Link>
            </div>

            <div className="mt-6 rounded-md border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
              <p className="text-amber-400">Secure Checkout</p>
              <p className="mt-1 text-gray-400">
                Your payment information is processed securely. We do not store credit card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
