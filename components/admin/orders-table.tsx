"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Search, ArrowUpDown, Filter, Download, RefreshCw, Trash2, AlertTriangle } from "lucide-react"
import type { Order, OrderStatus, PaymentStatus } from "@/data/mock-orders"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast-provider"
import { formatCurrency } from "@/lib/utils"
import { OrderDetails } from "./order-details"
import { orderService } from "@/lib/order-service"

interface OrdersTableProps {
  orders: Order[]
}

// Function to check if an order is new (less than 24 hours old)
const isNewOrder = (createdAt: string | Date): boolean => {
  const orderDate = new Date(createdAt)
  const now = new Date()
  const diffTime = now.getTime() - orderDate.getTime()
  const diffHours = diffTime / (1000 * 60 * 60)
  return diffHours < 24 // Consider orders less than 24 hours old as "new"
}

export function OrdersTable({ orders: initialOrders }: OrdersTableProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all")
  const [sortField, setSortField] = useState<"date" | "amount">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "processing" | "completed" | "cancelled">("all")
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)

  // Refresh orders data
  const refreshOrders = async () => {
    try {
      const refreshedOrders = await orderService.getOrders()
      setOrders(refreshedOrders)
      addToast({
        title: "Orders Refreshed",
        description: "The orders list has been updated with the latest data.",
      })
    } catch (error) {
      console.error("Error refreshing orders:", error)
      addToast({
        title: "Refresh Failed",
        description: "There was a problem refreshing the orders. Please try again.",
        type: "error",
      })
    }
  }

  // Filter orders based on active tab
  const getFilteredOrdersByTab = (tab: typeof activeTab) => {
    switch (tab) {
      case "pending":
        return orders.filter((order) => order.status === "pending" || order.status === "payment_verification")
      case "processing":
        return orders.filter((order) => order.status === "processing" || order.status === "shipped")
      case "completed":
        return orders.filter((order) => order.status === "delivered" || order.status === "completed")
      case "cancelled":
        return orders.filter((order) => order.status === "cancelled" || order.status === "refunded")
      default:
        return orders
    }
  }

  // Filter and sort orders
  const filteredOrders = getFilteredOrdersByTab(activeTab)
    .filter((order) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        order.order_number.toLowerCase().includes(searchLower) ||
        order.user?.email?.toLowerCase().includes(searchLower) ||
        false ||
        order.user?.full_name?.toLowerCase().includes(searchLower) ||
        false

      // Status filter
      const matchesStatus = statusFilter === "all" || order.status === statusFilter

      // Payment filter
      const matchesPayment = paymentFilter === "all" || order.payment_status === paymentFilter

      return matchesSearch && matchesStatus && matchesPayment
    })
    .sort((a, b) => {
      if (sortField === "date") {
        return sortDirection === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else {
        return sortDirection === "asc" ? a.total - b.total : b.total - a.total
      }
    })

  const toggleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Helper function to render status badge
  const renderStatusBadge = (status: OrderStatus) => {
    const variants: Record<
      OrderStatus,
      { variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; label: string }
    > = {
      pending: { variant: "outline", label: "Pending" },
      payment_verification: { variant: "warning", label: "Verification Needed" },
      processing: { variant: "secondary", label: "Processing" },
      shipped: { variant: "secondary", label: "Shipped" },
      delivered: { variant: "success", label: "Delivered" },
      completed: { variant: "success", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
      refunded: { variant: "destructive", label: "Refunded" },
    }

    const { variant, label } = variants[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  // Helper function to render payment status badge
  const renderPaymentBadge = (status: PaymentStatus) => {
    const variants: Record<
      PaymentStatus,
      { variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"; label: string }
    > = {
      pending: { variant: "outline", label: "Pending" },
      verification_required: { variant: "warning", label: "Proof Required" },
      verification_submitted: { variant: "warning", label: "Proof Submitted" },
      verified: { variant: "success", label: "Verified" },
      failed: { variant: "destructive", label: "Failed" },
      refunded: { variant: "destructive", label: "Refunded" },
    }

    const { variant, label } = variants[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  // Handle view order click
  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsOrderDetailsOpen(true)
  }

  // Handle order details close
  const handleOrderDetailsClose = () => {
    setIsOrderDetailsOpen(false)
    setSelectedOrderId(null)
  }

  // Handle order updated
  const handleOrderUpdated = () => {
    refreshOrders()
  }

  // Handle delete order click
  const handleDeleteClick = (orderId: string) => {
    setDeleteOrderId(orderId)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete order
  const confirmDeleteOrder = async () => {
    if (!deleteOrderId) return

    try {
      const { success, error } = await orderService.deleteOrder(deleteOrderId)

      if (success) {
        // Update the local state
        setOrders(orders.filter((order) => order.id !== deleteOrderId))

        addToast({
          title: "Order Deleted",
          description: "The order has been successfully deleted",
          type: "success",
        })
      } else {
        addToast({
          title: "Delete Failed",
          description: error || "There was a problem deleting the order",
          type: "error",
        })
      }
    } catch (error) {
      console.error("Error deleting order:", error)
      addToast({
        title: "Delete Failed",
        description: "There was a problem deleting the order",
        type: "error",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteOrderId(null)
    }
  }

  // Calculate order counts for tabs
  const pendingCount = orders.filter(
    (order) => order.status === "pending" || order.status === "payment_verification",
  ).length
  const processingCount = orders.filter((order) => order.status === "processing" || order.status === "shipped").length
  const completedCount = orders.filter((order) => order.status === "delivered" || order.status === "completed").length
  const cancelledCount = orders.filter((order) => order.status === "cancelled" || order.status === "refunded").length

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Orders</CardTitle>
          <CardDescription>Manage customer orders and process payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as any)}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">
                  All Orders <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{orders.length}</span>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{pendingCount}</span>
                </TabsTrigger>
                <TabsTrigger value="processing">
                  Processing <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{processingCount}</span>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{completedCount}</span>
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{cancelledCount}</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-8 w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Filter Orders</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <p className="mb-2 text-xs font-medium">Status</p>
                      <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="payment_verification">Verification Needed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <p className="mb-2 text-xs font-medium">Payment</p>
                      <Select
                        value={paymentFilter}
                        onValueChange={(value) => setPaymentFilter(value as PaymentStatus | "all")}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Filter by payment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Payments</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="verification_required">Proof Required</SelectItem>
                          <SelectItem value="verification_submitted">Proof Submitted</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="icon" onClick={refreshOrders}>
                  <RefreshCw className="h-4 w-4" />
                </Button>

                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="all" className="mt-4">
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">Order Number</th>
                        <th className="px-4 py-3 text-left font-medium">Customer</th>
                        <th className="px-4 py-3 text-left font-medium">
                          <button className="inline-flex items-center gap-1" onClick={() => toggleSort("date")}>
                            Date
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left font-medium">
                          <button className="inline-flex items-center gap-1" onClick={() => toggleSort("amount")}>
                            Amount
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-left font-medium">Payment</th>
                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                            No orders found matching your filters
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 font-medium">
                              <div className="flex items-center gap-2">
                                {order.order_number}
                                {isNewOrder(order.created_at) && (
                                  <Badge variant="success" className="text-xs">
                                    New
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>{order.user?.full_name || "Unknown User"}</div>
                              <div className="text-xs text-muted-foreground">{order.user?.email || "No email"}</div>
                            </td>
                            <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3 font-medium">{formatCurrency(order.total)}</td>
                            <td className="px-4 py-3">{renderStatusBadge(order.status)}</td>
                            <td className="px-4 py-3">{renderPaymentBadge(order.payment_status)}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewOrder(order.id)}
                                  aria-label={`View order ${order.order_number}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(order.id)}
                                  aria-label={`Delete order ${order.order_number}`}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Other tab contents - similar structure for each tab */}
            {["pending", "processing", "completed", "cancelled"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-4">
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left font-medium">Order Number</th>
                          <th className="px-4 py-3 text-left font-medium">Customer</th>
                          <th className="px-4 py-3 text-left font-medium">Date</th>
                          <th className="px-4 py-3 text-left font-medium">Amount</th>
                          <th className="px-4 py-3 text-left font-medium">Status</th>
                          <th className="px-4 py-3 text-left font-medium">Payment</th>
                          <th className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                              No {tab} orders found
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((order) => (
                            <tr key={order.id} className="border-b hover:bg-muted/50">
                              <td className="px-4 py-3 font-medium">
                                <div className="flex items-center gap-2">
                                  {order.order_number}
                                  {isNewOrder(order.created_at) && (
                                    <Badge variant="success" className="text-xs">
                                      New
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div>{order.user?.full_name || "Unknown User"}</div>
                                <div className="text-xs text-muted-foreground">{order.user?.email || "No email"}</div>
                              </td>
                              <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                              <td className="px-4 py-3 font-medium">{formatCurrency(order.total)}</td>
                              <td className="px-4 py-3">{renderStatusBadge(order.status)}</td>
                              <td className="px-4 py-3">{renderPaymentBadge(order.payment_status)}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewOrder(order.id)}
                                    aria-label={`View order ${order.order_number}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(order.id)}
                                    aria-label={`Delete order ${order.order_number}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
          <div className="text-xs text-muted-foreground">
            Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirm Deletion
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this order? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteOrder}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      {selectedOrderId && isOrderDetailsOpen && (
        <OrderDetails orderId={selectedOrderId} onClose={handleOrderDetailsClose} onOrderUpdated={handleOrderUpdated} />
      )}
    </>
  )
}
