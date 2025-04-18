"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { GamingButton } from "@/components/ui/gaming-button"
import { useCart } from "@/context/cart-context"
import { CheckCircle, ShoppingBag, Home, Clock, CreditCard, Truck, Package } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useSearchParams } from "next/navigation"
import type { Order, OrderItem } from "@/lib/order-service"
import Image from "next/image"
import { CheckoutSuccessSkeleton } from "@/components/checkout/success-skeleton"

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const urlOrderId = searchParams.get("orderId")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add these refs to prevent multiple operations
  const dataFetchedRef = useRef(false)
  const cartClearedRef = useRef(false)

  // Get the order ID from URL params or sessionStorage
  const orderId = urlOrderId || sessionStorage.getItem("lastOrderId")

  // Effect to clear cart - only runs once
  useEffect(() => {
    if (cartClearedRef.current) return

    // Check if cart was already cleared in the checkout page
    const hasCleared = sessionStorage.getItem("cartCleared") === "true"

    if (!hasCleared) {
      try {
        clearCart()
        sessionStorage.setItem("cartCleared", "true")
      } catch (error) {
        console.error("Error clearing cart:", error)
      }
    }

    cartClearedRef.current = true
  }, [clearCart])

  // Effect to fetch order data - only runs once
  useEffect(() => {
    if (dataFetchedRef.current || !orderId) {
      if (!orderId) setLoading(false)
      return
    }

    dataFetchedRef.current = true

    async function fetchOrderDetails() {
      try {
        console.log("Fetching order details for ID:", orderId)
        const supabase = createClient()

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select(`
            *,
            items:order_items(*),
            shipping_address:shipping_addresses!orders_shipping_address_id_fkey(*)
          `)
          .eq("id", orderId)
          .single()

        if (orderError) {
          console.error("Error fetching order:", orderError)
          setLoading(false)
          return
        }

        if (orderData) {
          console.log("Order data retrieved:", orderData)
          setOrder(orderData as Order)
        }
      } catch (err) {
        console.error("Error in fetchOrderDetails:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId]) // Only depend on orderId

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get payment method display name
  const getPaymentMethodName = (method: string) => {
    const methodMap: Record<string, string> = {
      esewa: "eSewa",
      khalti: "Khalti",
      connectips: "ConnectIPS",
      bank_transfer: "Bank Transfer",
      credit_card: "Credit Card",
      cash_on_delivery: "Cash on Delivery",
    }
    return methodMap[method] || method
  }

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    const methodMap: Record<string, string> = {
      esewa: "/images/esewa-logo.png",
      khalti: "/images/khalti-logo.png",
      connectips: "/images/connectips-logo.png",
      bank_transfer: "/images/internet-banking-logo.png",
      credit_card: "/images/visa-logo.png",
    }
    return methodMap[method] || null
  }

  // Show skeleton while loading
  if (loading) {
    return <CheckoutSuccessSkeleton />
  }

  // Basic success page when no order details are available
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-8 text-center shadow-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100"
          >
            <CheckCircle className="h-12 w-12 text-green-500" />
          </motion.div>

          <h1 className="mb-4 text-3xl font-bold">Order Placed Successfully!</h1>
          <p className="mb-6 text-gray-500">
            Thank you for your purchase. Your order has been received and is now being processed.
          </p>

          <div className="mb-8 rounded-lg border border-border bg-background p-6">
            <h2 className="mb-4 text-xl font-medium">What happens next?</h2>
            <ol className="text-left text-sm text-gray-500 space-y-3">
              <li className="flex items-start">
                <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-xs">
                  1
                </span>
                <span>Our team will verify your payment proof and process your order within 24 hours.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-xs">
                  2
                </span>
                <span>You will receive an email confirmation with your order details and digital product access.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-xs">
                  3
                </span>
                <span>You can check the status of your order in your account dashboard at any time.</span>
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/account/orders">
              <GamingButton variant="amber" className="w-full sm:w-auto">
                <ShoppingBag className="mr-2 h-4 w-4" />
                View My Orders
              </GamingButton>
            </Link>
            <Link href="/">
              <GamingButton variant="outline" className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </GamingButton>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl"
      >
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-t-lg border border-border bg-card p-8 text-center shadow-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100"
          >
            <CheckCircle className="h-12 w-12 text-green-500" />
          </motion.div>

          <h1 className="mb-2 text-3xl font-bold">Order Placed Successfully!</h1>
          <p className="mb-4 text-gray-500">
            Thank you for your purchase. Your order has been received and is now being processed.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            <div className="flex items-center">
              <span className="font-semibold mr-2">Order Number:</span>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-mono">{order.order_number}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              <span className="font-semibold mr-2">Date:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
          </div>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-1 rounded-b-lg border border-t-0 border-border bg-card p-8 shadow-sm"
        >
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left Column */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-amber-500" />
                Order Summary
              </h2>

              <div className="space-y-4">
                {/* Order Items */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-muted px-4 py-2 font-medium">Items ({order.items?.length || 0})</div>
                  <div className="divide-y divide-border">
                    {order.items?.map((item: OrderItem) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 flex items-center gap-3"
                      >
                        <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                          {item.product_type === "gift_card" && <CreditCard className="h-6 w-6 text-amber-500" />}
                          {item.product_type === "game_points" && <Package className="h-6 w-6 text-amber-500" />}
                          {item.product_type === "xbox_game" && <Package className="h-6 w-6 text-amber-500" />}
                          {item.product_type === "streaming_service" && <Package className="h-6 w-6 text-amber-500" />}
                          {item.product_type === "software" && <Package className="h-6 w-6 text-amber-500" />}
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-xs text-gray-500">
                            {item.quantity} × {formatCurrency(item.unit_price)}
                          </div>
                        </div>
                        <div className="font-semibold">{formatCurrency(item.subtotal)}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-muted px-4 py-2 font-medium flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment Information
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Method:</span>
                      <div className="flex items-center">
                        {getPaymentMethodIcon(order.payment_method) && (
                          <Image
                            src={getPaymentMethodIcon(order.payment_method) || ""}
                            alt={getPaymentMethodName(order.payment_method)}
                            width={20}
                            height={20}
                            className="mr-2"
                          />
                        )}
                        <span>{getPaymentMethodName(order.payment_method)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">
                        Verification Pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Shipping Information */}
              {order.shipping_address && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-amber-500" />
                    Shipping Information
                  </h2>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="bg-muted px-4 py-2 font-medium">Delivery Address</div>
                    <div className="p-4 space-y-1">
                      <div className="font-medium">{order.shipping_address.full_name}</div>
                      <div>{order.shipping_address.phone}</div>
                      <div>{order.shipping_address.address_line1}</div>
                      <div>
                        {order.shipping_address.city}, {order.shipping_address.country}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Total */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-muted px-4 py-2 font-medium">Order Total</div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.shipping_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Shipping:</span>
                      <span>{formatCurrency(order.shipping_fee)}</span>
                    </div>
                  )}
                  {order.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tax:</span>
                      <span>{formatCurrency(order.tax)}</span>
                    </div>
                  )}
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount:</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-amber-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4"
              >
                <h3 className="font-semibold mb-2 text-amber-800">What happens next?</h3>
                <ol className="text-sm text-amber-700 space-y-2 pl-5 list-decimal">
                  <li>Our team will verify your payment proof and process your order within 24 hours.</li>
                  <li>You will receive an email confirmation with your order details and digital product access.</li>
                  <li>You can check the status of your order in your account dashboard at any time.</li>
                </ol>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/account/orders">
              <GamingButton variant="amber" className="w-full sm:w-auto">
                <ShoppingBag className="mr-2 h-4 w-4" />
                View My Orders
              </GamingButton>
            </Link>
            <Link href="/">
              <GamingButton variant="outline" className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </GamingButton>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
