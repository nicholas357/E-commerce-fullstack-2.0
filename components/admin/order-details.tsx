"use client"

import { useState, useEffect } from "react"
import { adminService } from "@/lib/admin-service"
import {
  Loader2,
  X,
  ExternalLink,
  XCircle,
  MapPin,
  Truck,
  Package,
  Trash2,
  AlertTriangle,
  Mail,
  Phone,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils"
import { OrderActions } from "./order-actions"
import { AdminNotesForm } from "./admin-notes-form"
import { OrderItemActions } from "./order-item-actions"
import { PaymentVerification } from "./payment-verification"
import { orderService } from "@/lib/order-service"
import { useToast } from "@/components/ui/toast-provider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface OrderDetailsProps {
  orderId: string
  onClose: () => void
  onOrderUpdated: () => void
}

export function OrderDetails({ orderId, onClose, onOrderUpdated }: OrderDetailsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    setIsLoading(true)
    try {
      const orderData = await adminService.getOrderById(orderId)
      setOrder(orderData)

      // Debug payment proof data
      if (orderData?.payment_proof && orderData.payment_proof.length > 0) {
        console.log("Payment proof data:", orderData.payment_proof[0])
        console.log("Payment proof URL:", orderData.payment_proof[0].file_url)
      } else {
        console.log("No payment proof found for this order")
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get the first payment proof from the array (if it exists)
  const getPaymentProof = () => {
    if (order?.payment_proof && Array.isArray(order.payment_proof) && order.payment_proof.length > 0) {
      return order.payment_proof[0]
    }
    return null
  }

  // Handle dialog close with refresh
  const handleClose = () => {
    onOrderUpdated() // Refresh parent component data
    onClose()
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Get product type display name
  const getProductTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      gift_card: "Gift Card",
      game_points: "Game Points",
      xbox_game: "Xbox Game",
      streaming_service: "Streaming Service",
      software: "Software",
    }
    return typeMap[type] || type
  }

  // Get status badge
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

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500">Verified</Badge>
      case "refunded":
        return <Badge className="bg-purple-500">Refunded</Badge>
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>
      case "verification_submitted":
        return <Badge className="bg-blue-500">Verification Submitted</Badge>
      case "verification_required":
        return <Badge className="bg-amber-500">Verification Required</Badge>
      case "pending":
      default:
        return <Badge className="bg-amber-500">Pending</Badge>
    }
  }

  // Check if payment needs verification
  const needsVerification = () => {
    return (
      order &&
      (order.payment_status === "verification_submitted" ||
        order.payment_status === "verification_required" ||
        order.payment_status === "pending" ||
        order.payment_method === "bank_transfer" ||
        order.payment_method === "esewa" ||
        order.payment_method === "khalti")
    )
  }

  // Check if order needs shipping
  const needsShipping = () => {
    if (!order || !order.items) return false

    // Check if any physical products that need shipping
    return order.items.some(
      (item: any) =>
        item.product_type === "xbox_game" || item.product_type === "software" || item.product_type === "gift_card",
    )
  }

  const handleDeleteOrder = async () => {
    try {
      const { success, error } = await orderService.deleteOrder(orderId)

      if (success) {
        addToast({
          title: "Order Deleted",
          description: "The order has been successfully deleted",
          type: "success",
        })
        onOrderUpdated() // Refresh the parent component
        onClose() // Close the dialog
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
    }
  }

  // Get the payment proof
  const paymentProof = getPaymentProof()

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Order Details {order && <span className="text-amber-500">#{order.order_number}</span>}
            {order && getStatusBadge(order.status)}
          </DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : order ? (
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">Order Details</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="shipping" className="relative">
                Shipping
                {needsShipping() && (
                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="payment" className="relative">
                Payment
                {needsVerification() && (
                  <span className="absolute -right-1 -top-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* Order Details Tab */}
            <TabsContent value="details" className="mt-4">
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 text-sm">
                        <span className="text-gray-500">Order Number:</span>
                        <span className="font-medium">{order.order_number}</span>
                      </div>
                      <div className="grid grid-cols-2 text-sm">
                        <span className="text-gray-500">Date:</span>
                        <span>{formatDate(order.created_at || null)}</span>
                      </div>
                      <div className="grid grid-cols-2 text-sm">
                        <span className="text-gray-500">Status:</span>
                        <span>{getStatusBadge(order.status)}</span>
                      </div>
                      <div className="grid grid-cols-2 text-sm">
                        <span className="text-gray-500">Payment Status:</span>
                        <span>{getPaymentStatusBadge(order.payment_status)}</span>
                      </div>
                      <div className="grid grid-cols-2 text-sm">
                        <span className="text-gray-500">Payment Method:</span>
                        <span className="capitalize">{order.payment_method}</span>
                      </div>
                      <div className="grid grid-cols-2 text-sm">
                        <span className="text-gray-500">Total:</span>
                        <span className="font-medium">{formatCurrency(order.total)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 text-sm">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">{order.user?.full_name || "Unknown"}</span>
                      </div>
                      <div className="grid grid-cols-2 text-sm">
                        <span className="text-gray-500">Email:</span>
                        <span>{order.user?.email || "Unknown"}</span>
                      </div>
                      {order.shipping_address && (
                        <>
                          <Separator className="my-2" />
                          <div className="text-sm font-medium">Shipping Address:</div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-gray-500">Phone:</span>
                            <span>{order.shipping_address.phone}</span>
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-gray-500">Address:</span>
                            <span>
                              {order.shipping_address.address_line1}
                              {order.shipping_address.address_line2 && `, ${order.shipping_address.address_line2}`}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-gray-500">City/State:</span>
                            <span>
                              {order.shipping_address.city}, {order.shipping_address.state || "N/A"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 text-sm">
                            <span className="text-gray-500">Country/Postal:</span>
                            <span>
                              {order.shipping_address.country}{" "}
                              {order.shipping_address.postal_code && `(${order.shipping_address.postal_code})`}
                            </span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Order Actions</CardTitle>
                    <CardDescription>Update the status of this order</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <OrderActions
                      orderId={order.id}
                      paymentProofId={paymentProof?.id}
                      currentStatus={order.status}
                      currentPaymentStatus={order.payment_status}
                      onOrderUpdated={fetchOrderDetails}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Order Items Tab */}
            <TabsContent value="items" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Order Items</CardTitle>
                  <CardDescription>Products included in this order</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items &&
                          order.items.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.product_name}</TableCell>
                              <TableCell>{getProductTypeDisplay(item.product_type)}</TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                              <TableCell className="text-center">
                                {item.is_delivered ? (
                                  <Badge className="bg-green-500">Delivered</Badge>
                                ) : (
                                  <Badge variant="outline">Pending</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <OrderItemActions
                                  itemId={item.id}
                                  isDelivered={item.is_delivered}
                                  onItemUpdated={fetchOrderDetails}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <div className="w-64 space-y-1 rounded-md border p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal:</span>
                        <span>{formatCurrency(order.subtotal || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Shipping:</span>
                        <span>{formatCurrency(order.shipping_fee || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tax:</span>
                        <span>{formatCurrency(order.tax || 0)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Discount:</span>
                          <span className="text-red-500">-{formatCurrency(order.discount)}</span>
                        </div>
                      )}
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shipping Tab */}
            <TabsContent value="shipping" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                  <CardDescription>Details for shipping this order</CardDescription>
                </CardHeader>
                <CardContent>
                  {order.shipping_address ? (
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-lg border p-4 space-y-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-500" />
                            <h3 className="font-medium">Shipping Address</h3>
                          </div>

                          <div className="space-y-2 pl-7">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <p className="font-medium">{order.shipping_address.full_name}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <p className="text-blue-600">{order.user?.email || "No email provided"}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <p>{order.shipping_address.phone}</p>
                            </div>

                            <div className="pt-2">
                              <p>{order.shipping_address.address_line1}</p>
                              {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                              <p>
                                {order.shipping_address.city}
                                {order.shipping_address.state && `, ${order.shipping_address.state}`}
                                {order.shipping_address.postal_code && ` ${order.shipping_address.postal_code}`}
                              </p>
                              <p>{order.shipping_address.country}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border p-4 space-y-4">
                          <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-500" />
                            <h3 className="font-medium">Shipping Items</h3>
                          </div>

                          <div className="space-y-2 pl-7">
                            <ul className="list-disc pl-5 space-y-1">
                              {order.items &&
                                order.items
                                  .filter(
                                    (item: any) =>
                                      item.product_type === "xbox_game" ||
                                      item.product_type === "software" ||
                                      item.product_type === "gift_card",
                                  )
                                  .map((item: any) => (
                                    <li key={item.id}>
                                      {item.product_name} ({item.quantity}x) -{" "}
                                      {getProductTypeDisplay(item.product_type)}
                                    </li>
                                  ))}
                            </ul>

                            {order.items &&
                              !order.items.some(
                                (item: any) =>
                                  item.product_type === "xbox_game" ||
                                  item.product_type === "software" ||
                                  item.product_type === "gift_card",
                              ) && <p className="text-gray-500 italic">No physical items to ship in this order.</p>}
                          </div>
                        </div>
                      </div>

                      {/* Contact Information Card */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-amber-500" />
                                <span className="font-medium">Customer:</span>
                                <span>{order.user?.full_name || "Unknown"}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-amber-500" />
                                <span className="font-medium">Email:</span>
                                <a href={`mailto:${order.user?.email}`} className="text-blue-600 hover:underline">
                                  {order.user?.email || "No email provided"}
                                </a>
                              </div>

                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-amber-500" />
                                <span className="font-medium">Phone:</span>
                                <a href={`tel:${order.shipping_address.phone}`} className="hover:underline">
                                  {order.shipping_address.phone}
                                </a>
                              </div>
                            </div>

                            <div>
                              {order.notes && (
                                <div className="space-y-2">
                                  <span className="font-medium">Customer Notes:</span>
                                  <p className="text-gray-600 bg-gray-50 p-2 rounded-md">{order.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="rounded-lg border p-4 space-y-2">
                        <h3 className="font-medium">Shipping Status</h3>
                        <div className="flex items-center gap-4">
                          <div>
                            {order.status === "shipped" ? (
                              <Badge className="bg-purple-500">Shipped</Badge>
                            ) : order.status === "delivered" ? (
                              <Badge className="bg-green-500">Delivered</Badge>
                            ) : (
                              <Badge variant="outline">Not Shipped</Badge>
                            )}
                          </div>

                          {order.status !== "shipped" && order.status !== "delivered" && (
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600"
                              onClick={() => {
                                adminService
                                  .updateOrderStatus(order.id, "shipped")
                                  .then(() => {
                                    fetchOrderDetails()
                                  })
                                  .catch((error) => {
                                    console.error("Error updating order status:", error)
                                  })
                              }}
                            >
                              <Truck className="mr-2 h-4 w-4" />
                              Mark as Shipped
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                      <XCircle className="mb-2 h-10 w-10 text-gray-300" />
                      <h3 className="text-lg font-medium">No Shipping Information</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        This order does not have shipping information or may be a digital-only order.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="mt-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Payment Information</CardTitle>
                    <CardDescription>Details about the payment for this order</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      <div className="space-y-2 rounded-md border p-3">
                        <div className="text-sm font-medium">Method</div>
                        <div className="text-lg capitalize">{order.payment_method}</div>
                      </div>
                      <div className="space-y-2 rounded-md border p-3">
                        <div className="text-sm font-medium">Status</div>
                        <div>{getPaymentStatusBadge(order.payment_status)}</div>
                      </div>
                      <div className="space-y-2 rounded-md border p-3">
                        <div className="text-sm font-medium">Amount</div>
                        <div className="text-lg font-medium">{formatCurrency(order.total)}</div>
                      </div>
                    </div>

                    {paymentProof ? (
                      <div className="mt-6">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium">Payment Proof</h3>
                            {paymentProof.verified === true ? (
                              <Badge className="bg-green-500">Verified</Badge>
                            ) : paymentProof.verified === false ? (
                              <Badge className="bg-red-500">Rejected</Badge>
                            ) : (
                              <Badge className="bg-amber-500">Pending Verification</Badge>
                            )}
                          </div>
                          {/* Make sure we have a valid URL before trying to display or link to it */}
                          {paymentProof?.file_url && (
                            <a
                              href={paymentProof.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                            >
                              View Full Image <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="relative aspect-video overflow-hidden rounded-md border bg-gray-50">
                            {paymentProof?.file_url ? (
                              // Using a regular img tag instead of Next.js Image for more reliable external URL handling
                              <div className="relative w-full h-full">
                                <img
                                  src={paymentProof.file_url || "/placeholder.svg"}
                                  alt="Payment proof"
                                  className="absolute inset-0 w-full h-full object-contain"
                                  onError={(e) => {
                                    console.error("Failed to load payment proof image:", paymentProof.file_url)
                                    e.currentTarget.src = "/cardboard-void.png"
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <XCircle className="h-12 w-12 text-gray-300" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div className="rounded-md border p-4 space-y-2">
                              <div className="grid grid-cols-2 text-sm">
                                <span className="text-gray-500">Uploaded:</span>
                                <span>{formatDate(paymentProof.uploaded_at || null)}</span>
                              </div>
                              <div className="grid grid-cols-2 text-sm">
                                <span className="text-gray-500">Transaction ID:</span>
                                <span>{paymentProof.transaction_id || "Not provided"}</span>
                              </div>
                              {paymentProof.verified_at && (
                                <div className="grid grid-cols-2 text-sm">
                                  <span className="text-gray-500">Verified:</span>
                                  <span>{formatDate(paymentProof.verified_at)}</span>
                                </div>
                              )}
                            </div>

                            {needsVerification() && !paymentProof.verified && (
                              <PaymentVerification
                                orderId={order.id}
                                paymentProofId={paymentProof.id}
                                onVerified={fetchOrderDetails}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                          <XCircle className="mb-2 h-10 w-10 text-gray-300" />
                          <h3 className="text-lg font-medium">No Payment Proof</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            The customer has not uploaded any payment proof yet.
                          </p>
                        </div>

                        {/* Show verification options even without payment proof */}
                        {needsVerification() && (
                          <Card className="mt-4">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Manual Payment Verification</CardTitle>
                              <CardDescription>You can manually verify this payment even without proof</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <PaymentVerification orderId={order.id} onVerified={fetchOrderDetails} />
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Admin Notes</CardTitle>
                    <CardDescription>Private notes visible only to administrators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminNotesForm
                      orderId={order.id}
                      initialNotes={order.admin_notes || ""}
                      onNotesUpdated={fetchOrderDetails}
                    />
                  </CardContent>
                </Card>

                {order.notes && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Customer Notes</CardTitle>
                      <CardDescription>Notes provided by the customer during checkout</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border p-4">
                        <p className="text-sm text-gray-600">{order.notes}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p className="text-gray-500">Order not found</p>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Confirm Deletion
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this order? This action cannot be undone and will remove all
                  associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteOrder} className="bg-red-500 hover:bg-red-600">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
