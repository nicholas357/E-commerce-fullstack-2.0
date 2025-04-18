"use client"

import { useState } from "react"
import { Star, Trash } from "lucide-react"
import { type PaymentMethod, paymentMethodService } from "@/lib/payment-method-service"
import { useToast } from "@/hooks/use-toast"
import { GamingButton } from "../ui/gaming-button"

const PAYMENT_ICONS: Record<string, string> = {
  esewa: "/images/esewa-logo.png",
  khalti: "/images/khalti-logo.png",
  connectips: "/images/connectips-logo.png",
  internet_banking: "/images/internet-banking-logo.png",
}

const PAYMENT_NAMES: Record<string, string> = {
  esewa: "eSewa",
  khalti: "Khalti",
  connectips: "ConnectIPS",
  internet_banking: "Internet Banking",
}

export function PaymentMethodCard({
  paymentMethod,
  onDelete,
  onSetDefault,
}: {
  paymentMethod: PaymentMethod
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSettingDefault, setIsSettingDefault] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (paymentMethod.is_default) {
      toast({
        title: "Cannot Delete Default",
        description: "Please set another payment method as default first",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)
    try {
      const success = await paymentMethodService.deletePaymentMethod(paymentMethod.id)
      if (success) {
        onDelete(paymentMethod.id)
        toast({
          title: "Success",
          description: "Payment method deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete payment method",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting payment method:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSetDefault = async () => {
    if (paymentMethod.is_default) return

    setIsSettingDefault(true)
    try {
      const success = await paymentMethodService.setDefaultPaymentMethod(paymentMethod.id)
      if (success) {
        onSetDefault(paymentMethod.id)
        toast({
          title: "Success",
          description: "Default payment method updated",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update default payment method",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error setting default payment method:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSettingDefault(false)
    }
  }

  const icon = PAYMENT_ICONS[paymentMethod.payment_type] || "/images/visa-logo.png"
  const name = PAYMENT_NAMES[paymentMethod.payment_type] || paymentMethod.payment_type

  return (
    <div
      className={`relative rounded-lg border p-4 transition-all ${
        paymentMethod.is_default ? "border-amber-500 bg-amber-500/10" : "border-border bg-card"
      }`}
    >
      {paymentMethod.is_default && (
        <div className="absolute right-2 top-2 flex items-center rounded-full bg-amber-500 px-2 py-1">
          <Star className="mr-1 h-3 w-3 text-black" />
          <span className="text-xs font-medium text-black">Default</span>
        </div>
      )}

      <div className="mb-4 flex items-center">
        <div className="mr-3 h-10 w-10 overflow-hidden rounded-md">
          <img src={icon || "/placeholder.svg"} alt={name} className="h-full w-full object-contain" />
        </div>
        <div>
          <h3 className="font-medium text-white">{name}</h3>
          {paymentMethod.account_name && <p className="text-sm text-gray-400">{paymentMethod.account_name}</p>}
        </div>
      </div>

      <div className="mb-4 space-y-1">
        {paymentMethod.account_number && (
          <p className="text-sm text-gray-300">
            <span className="font-medium">Account:</span> {paymentMethod.account_number}
          </p>
        )}
        {paymentMethod.phone_number && (
          <p className="text-sm text-gray-300">
            <span className="font-medium">Phone:</span> {paymentMethod.phone_number}
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <GamingButton
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting || paymentMethod.is_default}
        >
          <Trash className="mr-1 h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete"}
        </GamingButton>

        {!paymentMethod.is_default && (
          <GamingButton variant="amber" size="sm" onClick={handleSetDefault} disabled={isSettingDefault}>
            <Star className="mr-1 h-4 w-4" />
            {isSettingDefault ? "Setting..." : "Set Default"}
          </GamingButton>
        )}
      </div>
    </div>
  )
}
