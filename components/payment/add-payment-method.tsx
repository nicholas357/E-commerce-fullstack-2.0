"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Wallet } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { type NewPaymentMethod, paymentMethodService } from "@/lib/payment-method-service"
import { useToast } from "@/hooks/use-toast"

const PAYMENT_TYPES = [
  { id: "esewa", name: "eSewa", icon: "/images/esewa-logo.png" },
  { id: "khalti", name: "Khalti", icon: "/images/khalti-logo.png" },
  { id: "connectips", name: "ConnectIPS", icon: "/images/connectips-logo.png" },
  { id: "internet_banking", name: "Internet Banking", icon: "/images/internet-banking-logo.png" },
]

export function AddPaymentMethod({ onSuccess }: { onSuccess: () => void }) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [accountName, setAccountName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedType) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const newPaymentMethod: NewPaymentMethod = {
        payment_type: selectedType,
        is_default: isDefault,
        account_name: accountName || undefined, // Only include if it has a value
        account_number: accountNumber || undefined, // Only include if it has a value
        phone_number: phoneNumber || undefined, // Only include if it has a value
      }

      const result = await paymentMethodService.addPaymentMethod(newPaymentMethod)

      if (result) {
        toast({
          title: "Success",
          description: "Payment method added successfully",
        })
        onSuccess()
      } else {
        toast({
          title: "Error",
          description: "Failed to add payment method. Please make sure you're logged in.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding payment method:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-center">
        <Wallet className="mr-3 h-5 w-5 text-amber-400" />
        <h2 className="text-lg font-medium text-white">Add New Payment Method</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-300">Select Payment Method</label>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {PAYMENT_TYPES.map((type) => (
              <div
                key={type.id}
                className={`relative flex cursor-pointer flex-col items-center rounded-lg border p-4 transition-all ${
                  selectedType === type.id
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-border bg-card hover:border-amber-500/50"
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                {selectedType === type.id && (
                  <div className="absolute right-2 top-2 rounded-full bg-amber-500 p-1">
                    <Check className="h-3 w-3 text-black" />
                  </div>
                )}
                <div className="mb-2 h-8 w-8">
                  <img src={type.icon || "/placeholder.svg"} alt={type.name} className="h-full w-full object-contain" />
                </div>
                <span className="text-center text-sm font-medium text-gray-200">{type.name}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedType && (
          <>
            <div className="mb-4">
              <label htmlFor="accountName" className="mb-2 block text-sm font-medium text-gray-300">
                Account Name
              </label>
              <input
                id="accountName"
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                placeholder="Enter account name"
              />
            </div>

            {(selectedType === "internet_banking" || selectedType === "connectips") && (
              <div className="mb-4">
                <label htmlFor="accountNumber" className="mb-2 block text-sm font-medium text-gray-300">
                  Account Number
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="Enter account number"
                />
              </div>
            )}

            {(selectedType === "esewa" || selectedType === "khalti") && (
              <div className="mb-4">
                <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-gray-300">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="Enter phone number"
                />
              </div>
            )}

            <div className="mb-6 flex items-center">
              <input
                id="isDefault"
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="isDefault" className="ml-2 text-sm font-medium text-gray-300">
                Set as default payment method
              </label>
            </div>
          </>
        )}

        <div className="flex justify-end">
          <GamingButton type="submit" variant="amber" disabled={!selectedType || isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Payment Method"}
          </GamingButton>
        </div>
      </form>
    </div>
  )
}
