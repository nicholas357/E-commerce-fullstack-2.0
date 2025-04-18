"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface OrderItemActionsProps {
  itemId: string
  isDelivered: boolean
  onItemUpdated: () => void
}

export function OrderItemActions({ itemId, isDelivered, onItemUpdated }: OrderItemActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const markItemDelivered = async () => {
    if (isDelivered) return

    setIsUpdating(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("order_items")
        .update({
          is_delivered: true,
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId)

      if (error) {
        console.error("Error marking item as delivered:", error)
        toast({
          title: "Error",
          description: `Failed to mark item as delivered: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Item marked as delivered",
      })
      onItemUpdated()
    } catch (error: any) {
      console.error("Error marking item as delivered:", error)
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
    <Button
      size="sm"
      variant={isDelivered ? "ghost" : "outline"}
      onClick={markItemDelivered}
      disabled={isUpdating || isDelivered}
      className={`h-8 ${isDelivered ? "text-green-500" : ""}`}
    >
      {isUpdating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isDelivered ? (
        <Check className="h-4 w-4" />
      ) : (
        "Mark Delivered"
      )}
    </Button>
  )
}
