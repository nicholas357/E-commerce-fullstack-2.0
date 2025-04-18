"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FuturisticButton } from "@/components/ui/futuristic-button"
import { ChevronDown, Search, Filter, X, ShoppingCart, Package, Archive } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  product_type: string
}

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  payment_method: string
  total: number
  created_at: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            items:order_items(*)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching orders:", error)
          return
        }

        setOrders(data || [])
        setFilteredOrders(data || [])
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    filterOrders(term, statusFilter)
  }

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status)
    filterOrders(searchTerm, status)
  }

  const filterOrders = (term: string, status: string | null) => {
    let filtered = orders

    if (term) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(term.toLowerCase()) ||
          order.items.some((item) => item.product_name.toLowerCase().includes(term.toLowerCase())),
      )
    }

    if (status) {
      filtered = filtered.filter((order) => order.status === status)
    }

    setFilteredOrders(filtered)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter(null)
    setFilteredOrders(orders)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "payment_verification":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "shipped":
        return "bg-indigo-100 text-indigo-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "payment_verification":
        return "Payment Verification"
      case "processing":
        return "Processing"
      case "shipped":
        return "Shipped"
      case "delivered":
        return "Delivered"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      case "refunded":
        return "Refunded"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "verification_required":
        return "bg-orange-100 text-orange-800"
      case "verification_submitted":
        return "bg-blue-100 text-blue-800"
      case "verified":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "verification_required":
        return "Verification Required"
      case "verification_submitted":
        return "Verification Submitted"
      case "verified":
        return "Verified"
      case "failed":
        return "Failed"
      case "refunded":
        return "Refunded"
      default:
        return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Credit Card"
      case "esewa":
        return "eSewa"
      case "khalti":
        return "Khalti"
      case "connectips":
        return "ConnectIPS"
      case "bank_transfer":
        return "Bank Transfer"
      case "cash_on_delivery":
        return "Cash on Delivery"
      default:
        return method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
              <div className="mt-4 flex justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
              </div>
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Animation variants for Framer Motion
  const contentVariants = {
    hidden: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
        opacity: { duration: 0.3 },
      },
    },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
        opacity: { duration: 0.4, delay: 0.1 },
      },
    },
  }

  const tableRowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  }

  const renderOrderContent = (order: Order, tabName: string) => (
    <div key={order.id} className="overflow-hidden rounded-lg border border-border bg-card">
      <div
        className="flex cursor-pointer flex-col justify-between p-4 sm:flex-row sm:items-center"
        onClick={() => toggleOrderExpand(order.id)}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">Order #{order.order_number}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{format(new Date(order.created_at), "MMM d, yyyy")}</p>
        </div>

        <div className="mt-2 flex items-center justify-between sm:mt-0">
          <div className="mr-4 text-right">
            <p className="font-medium">NPR {(order.total || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500">
              {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex h-6 w-6 items-center justify-center">
            <motion.div
              animate={{ rotate: expandedOrder === order.id ? 180 : 0 }}
              transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            >
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expandedOrder === order.id && (
          <motion.div
            key={`${order.id}-content`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={contentVariants}
            className="border-t border-border bg-background overflow-hidden"
          >
            <div className="p-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mb-4 grid gap-4 sm:grid-cols-3"
              >
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
                  <p>{getPaymentMethodLabel(order.payment_method)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Payment Status</h4>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getPaymentStatusBadgeClass(
                      order.payment_status,
                    )}`}
                  >
                    {getPaymentStatusLabel(order.payment_status)}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Order Date</h4>
                  <p>{format(new Date(order.created_at), "MMMM d, yyyy")}</p>
                </div>
              </motion.div>

              <motion.h4
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mb-2 font-medium"
              >
                Order Items
              </motion.h4>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mb-4 overflow-x-auto"
              >
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-background">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {order.items?.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={tableRowVariants}
                      >
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium">{item.product_name}</div>
                              <div className="text-xs text-gray-500">{item.product_type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm">NPR {(item.unit_price || 0).toLocaleString()}</div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm">{item.quantity}</div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="text-sm">NPR {((item.unit_price || 0) * item.quantity).toLocaleString()}</div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="mt-4 flex justify-between border-t border-border pt-4"
              >
                <div>
                  <Button variant="outline" size="sm">
                    Need Help?
                  </Button>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Order Total</p>
                  <p className="text-lg font-medium">NPR {(order.total || 0).toLocaleString()}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setStatusFilter(statusFilter ? null : "pending")}
            >
              <Filter className="h-4 w-4" />
              {statusFilter ? getStatusLabel(statusFilter) : "All Statuses"}
            </Button>
            {statusFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0"
                onClick={() => handleStatusFilter(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {(searchTerm || statusFilter) && (
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center"
            >
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100/10">
                <ShoppingCart className="h-12 w-12 text-purple-500/80" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No Orders Found</h3>
              <p className="mb-4 text-gray-500">
                {orders.length === 0 ? "You haven't placed any orders yet." : "No orders match your current filters."}
              </p>
              <Link href="/">
                <FuturisticButton>Start Shopping</FuturisticButton>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-4"
            >
              {filteredOrders.map((order) => renderOrderContent(order, "all"))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-0">
          {filteredOrders.filter((order) =>
            ["pending", "payment_verification", "processing", "shipped"].includes(order.status),
          ).length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center"
            >
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100/10">
                <Package className="h-12 w-12 text-blue-500/80" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No Active Orders</h3>
              <p className="mb-4 text-gray-500">You don't have any active orders at the moment.</p>
              <Link href="/">
                <FuturisticButton>Start Shopping</FuturisticButton>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-4"
            >
              {filteredOrders
                .filter((order) => ["pending", "payment_verification", "processing", "shipped"].includes(order.status))
                .map((order) => renderOrderContent(order, "active"))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          {filteredOrders.filter((order) => ["delivered", "completed", "cancelled", "refunded"].includes(order.status))
            .length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center"
            >
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100/10">
                <Archive className="h-12 w-12 text-green-500/80" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No Completed Orders</h3>
              <p className="mb-4 text-gray-500">You don't have any completed orders yet.</p>
              <Link href="/">
                <FuturisticButton>Start Shopping</FuturisticButton>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-4"
            >
              {filteredOrders
                .filter((order) => ["delivered", "completed", "cancelled", "refunded"].includes(order.status))
                .map((order) => renderOrderContent(order, "completed"))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
