"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingBag, CreditCard, Truck } from "lucide-react"

interface CheckoutSummaryProps {
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image?: string
    category?: string
  }>
  totalPrice: number
  shippingDetails?: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    notes: string
  }
  paymentMethod?: string
}

export function CheckoutSummary({ items, totalPrice, shippingDetails, paymentMethod }: CheckoutSummaryProps) {
  const formatPaymentMethod = (method?: string) => {
    if (!method) return ""

    switch (method) {
      case "esewa":
        return "eSewa"
      case "khalti":
        return "Khalti"
      case "connectips":
        return "ConnectIPS"
      case "internet_banking":
        return "Internet Banking"
      default:
        return method
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 sticky top-4 shadow-sm">
      <h2 className="mb-4 text-xl font-bold flex items-center">
        <ShoppingBag className="mr-2 h-5 w-5 text-amber-500" />
        Order Summary
      </h2>

      {/* Items */}
      <div className="mb-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
        {items.map((item) => (
          <div key={item.id} className="mb-4 flex items-center border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border">
              <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium">{item.name}</h3>
              <p className="text-xs text-gray-400">{item.category}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs">Qty: {item.quantity}</span>
                <span className="text-sm font-medium text-amber-500">
                  NPR {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Subtotal</span>
          <span>NPR {totalPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Shipping</span>
          <span className="text-green-500">Free</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Tax</span>
          <span>NPR 0</span>
        </div>
        <div className="border-t border-border pt-2">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span className="text-amber-500">NPR {totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Shipping Details */}
      {shippingDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mt-6 border-t border-border pt-4"
        >
          <h3 className="mb-2 font-medium flex items-center">
            <Truck className="mr-2 h-4 w-4 text-amber-500" />
            Shipping Details
          </h3>
          <div className="space-y-1 text-sm">
            <p>{shippingDetails.fullName}</p>
            <p>{shippingDetails.email}</p>
            <p>{shippingDetails.phone}</p>
            <p>{shippingDetails.address}</p>
            <p>{shippingDetails.city}</p>
            {shippingDetails.notes && (
              <div className="mt-2">
                <p className="font-medium">Notes:</p>
                <p className="text-gray-400">{shippingDetails.notes}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Payment Method */}
      {paymentMethod && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mt-4 border-t border-border pt-4"
        >
          <h3 className="mb-2 font-medium flex items-center">
            <CreditCard className="mr-2 h-4 w-4 text-amber-500" />
            Payment Method
          </h3>
          <p className="text-sm">{formatPaymentMethod(paymentMethod)}</p>
        </motion.div>
      )}

      <div className="mt-6 rounded-md border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
        <p className="text-amber-500 font-medium">Secure Checkout</p>
        <p className="mt-1 text-gray-400 text-xs">
          Your payment information is processed securely. We do not store credit card details.
        </p>
      </div>
    </div>
  )
}
