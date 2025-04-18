"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { GamingButton } from "@/components/ui/gaming-button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowRight, ArrowLeft } from "lucide-react"

interface PaymentMethodProps {
  onSelect: (method: string) => void
  selectedMethod: string
  onBack: () => void
}

const paymentMethods = [
  {
    id: "esewa",
    name: "eSewa",
    image: "/images/esewa-logo.png",
    description: "Pay using eSewa mobile wallet",
  },
  {
    id: "khalti",
    name: "Khalti",
    image: "/images/khalti-logo.png",
    description: "Pay using Khalti mobile wallet",
  },
  {
    id: "connectips",
    name: "ConnectIPS",
    image: "/images/connectips-logo.png",
    description: "Pay using ConnectIPS",
  },
  {
    id: "internet_banking",
    name: "Internet Banking",
    image: "/images/internet-banking-logo.png",
    description: "Pay using Internet Banking",
  },
]

export function PaymentMethod({ onSelect, selectedMethod, onBack }: PaymentMethodProps) {
  const [method, setMethod] = useState(selectedMethod)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSelect(method)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="mb-2 text-xl font-bold">Payment Method</h2>
      <p className="mb-6 text-sm text-gray-500">Select your preferred payment method</p>

      <RadioGroup value={method} onValueChange={setMethod} className="space-y-4">
        {paymentMethods.map((payment) => (
          <div
            key={payment.id}
            className={`flex items-center space-x-3 rounded-lg border p-4 transition-all hover:border-amber-500/50 hover:bg-amber-50/10 ${
              method === payment.id ? "border-amber-500 bg-amber-50/20" : "border-border"
            }`}
          >
            <RadioGroupItem value={payment.id} id={payment.id} className="h-5 w-5" />
            <Label htmlFor={payment.id} className="flex flex-1 cursor-pointer items-center">
              <div className="relative h-10 w-16 overflow-hidden">
                <Image src={payment.image || "/placeholder.svg"} alt={payment.name} fill className="object-contain" />
              </div>
              <div className="ml-4">
                <div className="font-medium">{payment.name}</div>
                <div className="text-sm text-gray-400">{payment.description}</div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <GamingButton type="button" variant="outline" className="flex items-center justify-center" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shipping
        </GamingButton>

        <GamingButton type="submit" variant="amber" className="flex items-center justify-center">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </GamingButton>
      </div>
    </form>
  )
}
