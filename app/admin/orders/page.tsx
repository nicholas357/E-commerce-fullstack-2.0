"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { adminService } from "@/lib/admin-service"
import { useAuth } from "@/context/auth-context"
import { Loader2, Search, Filter, Eye, CheckCircle, XCircle, AlertTriangle, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { OrderDetails } from "@/components/admin/order-details"
import { formatDate, formatCurrency } from "@/lib/utils"

// Add these imports at the top
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/toast-provider"

// Define types for our data
interface Order {
  id: string
  order_number: string
  user_id: string
  status: string
  payment_status: string
  payment_method: string
  total: number
  created_at: string
  items: any[]
  payment_proof: any
  user?: {
    id: string
    full_name: string
    email: string
  }
}

// Function to check if an order is new (less than 24 hours old)
const isNewOrder = (createdAt: string): boolean => {
  const orderDate = new Date(createdAt)
  const now = new Date()
  const diffTime = now.getTime() - orderDate.getTime()
  const diffHours = diffTime / (1000 * 60 * 60)
  return diffHours < 24 // Consider orders less than 24 hours old as "new"
}

export default function AdminOrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  // Add these state variables inside the AdminOrdersPage component
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        router.push("/account/login")
        return
      }

      const isUserAdmin = await adminService.isAdmin()

      if (!isUserAdmin) {
        console.error("Not authorized as admin")
        router.push("/")
        return
      }

      setIsAdmin(true)
      fetchOrders()
    }

    checkAdminStatus()
  }, [user, router])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const ordersData = await adminService.getAllOrders()

      // Log to verify we're getting the email
      console.log("Orders with user data:", ordersData)

      setOrders(ordersData)
      setFilteredOrders(ordersData)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters and search
  useEffect(() => {
    let result = [...orders]

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(
        (order) =>
          order.order_number.toLowerCase().includes(search) ||
          order.user?.email?.toLowerCase().includes(search) ||
          order.user?.full_name?.toLowerCase().includes(search),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter)
    }

    // Apply payment status filter
    if (paymentStatusFilter !== "all") {
      result = result.filter((order) => order.payment_status === paymentStatusFilter)
    }

    setFilteredOrders(result)
  }, [orders, searchTerm, statusFilter, paymentStatusFilter])

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false)
    setSelectedOrder(null)
  }

  const handleOrderUpdated = () => {
    fetchOrders()
    setShowOrderDetails(false)
    setSelectedOrder(null)
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>
      case "shipped":
        return <Badge className="bg-purple-500">Shipped</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      case "pending":
      default:
        return <Badge className="bg-amber-500">Pending</Badge>
    }
  }

  // Get payment status badge color
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>
      case "refunded":
        return <Badge className="bg-purple-500">Refunded</Badge>
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>
      case "verification_submitted":
        return <Badge className="bg-blue-500">Verification Submitted</Badge>
      case "pending":
      default:
        return <Badge className="bg-amber-500">Pending</Badge>
    }
  }

  // Add this function inside the AdminOrdersPage component
  const handleDeleteClick = (orderId: string) => {
    setDeleteOrderId(orderId)
    setIsDeleteDialogOpen(true)
  }

  // Add this function inside the AdminOrdersPage component
  const confirmDeleteOrder = async () => {
    if (!deleteOrderId) return

    try {
      const result = await adminService.deleteOrder(deleteOrderId)

      if (result.success) {
        // Remove the order from the local state
        setOrders(orders.filter((order) => order.id !== deleteOrderId))
        setFilteredOrders(filteredOrders.filter((order) => order.id !== deleteOrderId))

        addToast({
          title: "Order Deleted",
          description: "The order has been successfully deleted",
          type: "success",
        })
      } else {
        addToast({
          title: "Delete Failed",
          description: result.error || "There was a problem deleting the order",
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

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Order Management</h1>

      {/* Filters and Search */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verification_submitted">Verification Submitted</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={fetchOrders} variant="outline" className="flex items-center gap-2">
          <Loader2 className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
          <h3 className="text-lg font-medium">No Orders Found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm || statusFilter !== "all" || paymentStatusFilter !== "all"
              ? "Try adjusting your filters or search term"
              : "There are no orders in the system yet"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {order.order_number}
                      {isNewOrder(order.created_at) && <Badge className="bg-green-500 text-white">New</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.user?.full_name || "Unknown"}</div>
                      <div className="text-xs text-gray-500">
                        {order.user?.email ? (
                          <a href={`mailto:${order.user.email}`} className="hover:underline">
                            {order.user.email}
                          </a>
                        ) : (
                          "Unknown email"
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(order.created_at || null)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getPaymentStatusBadge(order.payment_status)}
                      <span className="text-xs text-gray-500 capitalize">{order.payment_method}</span>
                    </div>
                  </TableCell>
                  <TableCell>{order.items?.length || 0}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    {order.payment_proof ? (
                      order.payment_proof.verified ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)} className="h-8 w-8 p-0">
                      <span className="sr-only">View order</span>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(order.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <span className="sr-only">Delete order</span>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetails
          orderId={selectedOrder.id}
          onClose={handleCloseOrderDetails}
          onOrderUpdated={handleOrderUpdated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone and will remove all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteOrder} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
