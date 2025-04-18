"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
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

// Import the PaymentStatus type to ensure we use valid values
import type { PaymentStatus, OrderStatus } from "@/lib/order-service"

interface PaymentVerificationProps {
  orderId: string
  paymentProofId?: string
  onVerified: () => void
}

export function PaymentVerification({ orderId, paymentProofId, onVerified }: PaymentVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  // Verify payment proof
  const verifyPaymentProof = async (verified: boolean) => {
    setIsVerifying(true)
    try {
      const supabase = createClient()

      // Update payment proof verification status if we have a valid ID
      if (paymentProofId) {
        const { error: proofError } = await supabase
          .from("payment_proofs")
          .update({
            verified,
            verified_at: new Date().toISOString(),
          })
          .eq("id", paymentProofId)

        if (proofError) {
          console.error("Error verifying payment proof:", proofError)
          toast({
            title: "Error",
            description: `Failed to verify payment proof: ${proofError.message}`,
            variant: "destructive",
          })
          return
        }
      }

      // Use the correct payment status values from the database constraints
      // "verified" instead of "paid", "failed" remains the same
      const newPaymentStatus: PaymentStatus = verified ? "verified" : "failed"

      // Use the correct order status values
      const newOrderStatus: OrderStatus = verified ? "processing" : "pending"

      const { error: orderError } = await supabase
        .from("orders")
        .update({
          payment_status: newPaymentStatus,
          status: newOrderStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (orderError) {
        console.error("Error updating order status:", orderError)
        toast({
          title: "Error",
          description: `Failed to update order status: ${orderError.message}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: verified ? "Payment verified successfully" : "Payment rejected",
      })
      onVerified()
    } catch (error: any) {
      console.error("Error verifying payment:", error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
      setShowVerifyDialog(false)
      setShowRejectDialog(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <h3 className="font-medium">Payment Verification</h3>
        <p className="text-sm text-gray-500">
          Please verify or reject this payment. This action will update the order status accordingly.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowVerifyDialog(true)}
            disabled={isVerifying}
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Verify Payment
          </Button>
          <Button
            onClick={() => setShowRejectDialog(true)}
            disabled={isVerifying}
            variant="destructive"
            className="flex-1"
          >
            {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
            Reject Payment
          </Button>
        </div>
      </div>

      {/* Verify Payment Confirmation Dialog */}
      <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to verify this payment? This will mark the order as verified and change its status
              to processing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isVerifying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                verifyPaymentProof(true)
              }}
              disabled={isVerifying}
              className="bg-green-500 hover:bg-green-600"
            >
              {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Yes, Verify Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Payment Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Reject Payment
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this payment? This will mark the payment as failed and the order will
              remain in pending status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isVerifying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                verifyPaymentProof(false)
              }}
              disabled={isVerifying}
              className="bg-red-500 hover:bg-red-600"
            >
              {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Yes, Reject Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
