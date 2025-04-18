"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface OrderActionsProps {
  orderId: string
  paymentProofId?: string
  currentStatus: string
  currentPaymentStatus: string
  onOrderUpdated: () => void
}

export function OrderActions({ orderId, currentStatus, currentPaymentStatus, onOrderUpdated }: OrderActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  // Update order status
  const updateOrderStatus = async (status: string) => {
    setIsUpdating(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) {
        console.error("Error updating order status:", error)
        toast({
          title: "Error",
          description: `Failed to update order status: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      })
      onOrderUpdated()
    } catch (error: any) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant={currentStatus === "processing" ? "default" : "outline"}
        onClick={() => updateOrderStatus("processing")}
        disabled={isUpdating || currentStatus === "processing"}
        className={currentStatus === "processing" ? "bg-blue-500 hover:bg-blue-600" : ""}
      >
        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Mark Processing
      </Button>
      <Button
        variant={currentStatus === "shipped" ? "default" : "outline"}
        onClick={() => updateOrderStatus("shipped")}
        disabled={isUpdating || currentStatus === "shipped" || currentPaymentStatus !== "paid"}
        className={currentStatus === "shipped" ? "bg-purple-500 hover:bg-purple-600" : ""}
      >
        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Mark Shipped
      </Button>
      <Button
        variant={currentStatus === "completed" ? "default" : "outline"}
        onClick={() => updateOrderStatus("completed")}
        disabled={isUpdating || currentStatus === "completed"}
        className={currentStatus === "completed" ? "bg-green-500 hover:bg-green-600" : ""}
      >
        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Complete Order
      </Button>
      <Button
        variant={currentStatus === "cancelled" ? "default" : "outline"}
        onClick={() => updateOrderStatus("cancelled")}
        disabled={isUpdating || currentStatus === "cancelled"}
        className={currentStatus === "cancelled" ? "bg-red-500 hover:bg-red-600" : ""}
      >
        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Cancel Order
      </Button>
    </div>
  )
}
