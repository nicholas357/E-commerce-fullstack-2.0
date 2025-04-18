"use client"

import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, Package, CreditCard, Truck } from "lucide-react"

export function CheckoutSuccessSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Success Header Skeleton */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
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
              <Skeleton className="h-6 w-32 rounded-full bg-amber-100" />
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2">Date:</span>
              <Skeleton className="h-6 w-40 bg-muted" />
            </div>
          </div>
        </motion.div>

        {/* Order Details Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
                {/* Order Items Skeleton */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-muted px-4 py-2 font-medium">Items</div>
                  <div className="divide-y divide-border">
                    {[1, 2].map((item) => (
                      <div key={item} className="p-4 flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-md bg-muted" />
                        <div className="flex-grow">
                          <Skeleton className="h-5 w-3/4 bg-muted mb-2" />
                          <Skeleton className="h-4 w-1/4 bg-muted" />
                        </div>
                        <Skeleton className="h-5 w-20 bg-muted" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Information Skeleton */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-muted px-4 py-2 font-medium flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment Information
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Method:</span>
                      <Skeleton className="h-5 w-24 bg-muted" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <Skeleton className="h-5 w-32 rounded-full bg-amber-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Shipping Information Skeleton */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-amber-500" />
                  Shipping Information
                </h2>
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-muted px-4 py-2 font-medium">Delivery Address</div>
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4 bg-muted" />
                    <Skeleton className="h-5 w-1/2 bg-muted" />
                    <Skeleton className="h-5 w-5/6 bg-muted" />
                    <Skeleton className="h-5 w-1/3 bg-muted" />
                  </div>
                </div>
              </div>

              {/* Order Total Skeleton */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-muted px-4 py-2 font-medium">Order Total</div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal:</span>
                    <Skeleton className="h-5 w-20 bg-muted" />
                  </div>
                  <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <Skeleton className="h-6 w-24 bg-amber-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
