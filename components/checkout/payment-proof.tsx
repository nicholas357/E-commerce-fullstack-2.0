"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { GamingButton } from "@/components/ui/gaming-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Check, AlertCircle, ArrowLeft, Loader2 } from "lucide-react"

interface PaymentProofProps {
  paymentMethod: string
  onSubmit: (file: File, transactionId: string) => void
  isLoading: boolean
  onBack: () => void
}

export function PaymentProof({ paymentMethod, onSubmit, isLoading, onBack }: PaymentProofProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Check file type
      if (!["image/jpeg", "image/png", "image/jpg"].includes(selectedFile.type)) {
        setErrors((prev) => ({
          ...prev,
          file: "Please upload a valid image file (JPG, JPEG, or PNG)",
        }))
        return
      }

      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          file: "File size should be less than 5MB",
        }))
        return
      }

      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setErrors((prev) => ({
        ...prev,
        file: "",
      }))
    }
  }

  const handleTransactionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransactionId(e.target.value)
    if (e.target.value) {
      setErrors((prev) => ({
        ...prev,
        transactionId: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!file) {
      newErrors.file = "Payment proof screenshot is required"
    }

    // Transaction ID is now optional, so we don't check if it's empty

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!file) {
      setErrors((prev) => ({
        ...prev,
        file: "Payment proof screenshot is required",
      }))
      return
    }

    try {
      await onSubmit(file, transactionId)
    } catch (error) {
      console.error("Error in payment proof submission:", error)
    }
  }

  const getQRImagePath = () => {
    switch (paymentMethod) {
      case "esewa":
        return "/esewa-payment-qr.png"
      case "khalti":
        return "/khalti-payment-screen.png"
      case "connectips":
        return "/connectips-qr-code-transaction.png"
      case "internet_banking":
        return "/secure-mobile-payment.png"
      default:
        return "/digital-payment-interface.png"
    }
  }

  const getPaymentInstructions = () => {
    switch (paymentMethod) {
      case "esewa":
        return "Scan the QR code with your eSewa app or send payment to 9841XXXXXX"
      case "khalti":
        return "Scan the QR code with your Khalti app or send payment to 9841XXXXXX"
      case "connectips":
        return "Scan the QR code with your ConnectIPS app or use merchant code: TURGAME"
      case "internet_banking":
        return "Transfer to Account: 01234567890123 (TurGame Pvt. Ltd.) at Nepal Bank"
      default:
        return "Please follow the payment instructions for your selected method"
    }
  }

  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case "esewa":
        return "eSewa"
      case "khalti":
        return "Khalti"
      case "connectips":
        return "ConnectIPS"
      case "internet_banking":
        return "Internet Banking"
      default:
        return paymentMethod
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="mb-2 text-xl font-bold">Payment Confirmation</h2>
      <p className="mb-6 text-sm text-gray-500">Complete your {getPaymentMethodName()} payment and upload proof</p>

      <div className="mb-8 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start">
          <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
          <div>
            <p className="font-medium text-amber-500">Payment Instructions</p>
            <p className="mt-1 text-sm text-gray-400">{getPaymentInstructions()}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-col md:flex-row items-center justify-center gap-8">
        <div className="text-center">
          <h3 className="font-medium mb-2">Scan QR Code to Pay</h3>
          <div className="relative h-48 w-48 overflow-hidden rounded-lg border border-border shadow-sm">
            <Image src={getQRImagePath() || "/placeholder.svg"} alt="Payment QR Code" fill className="object-cover" />
          </div>
          <p className="mt-2 text-xs text-gray-400">Or use the account details provided above</p>
        </div>

        <div className="w-full max-w-md">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="transactionId" className="font-medium">
                Transaction ID <span className="text-xs text-gray-400">(optional)</span>
              </Label>
              <Input
                id="transactionId"
                value={transactionId}
                onChange={handleTransactionIdChange}
                placeholder="Enter transaction ID (if available)"
                className={`${errors.transactionId ? "border-red-500" : ""} pl-3 py-2 h-11`}
              />
              {errors.transactionId && <p className="text-sm text-red-500">{errors.transactionId}</p>}
            </div>

            <div className="grid gap-2">
              <Label className="font-medium">
                Payment Screenshot <span className="text-red-500">*</span>
                <span className="ml-1 text-xs text-gray-400">(JPG, JPEG, PNG, max 5MB)</span>
              </Label>

              <div
                className={`relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors hover:bg-accent/50 ${errors.file ? "border-red-500" : "border-border"}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  id="paymentProof"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />

                {previewUrl ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={previewUrl || "/placeholder.svg"}
                      alt="Payment proof"
                      width={300}
                      height={200}
                      className="mx-auto max-h-[200px] w-auto rounded-lg object-contain"
                    />
                    <div className="mt-2 flex items-center justify-center">
                      <Check className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">File uploaded</span>
                    </div>
                    <p className="mt-1 text-center text-xs text-gray-400">Click to change file</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-center text-sm">Drag and drop or click to upload payment screenshot</p>
                  </>
                )}
              </div>
              {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <GamingButton type="button" variant="outline" className="flex items-center justify-center" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payment Methods
        </GamingButton>

        <GamingButton type="submit" variant="amber" className="flex-1" disabled={isLoading || !file}>
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            "Complete Order"
          )}
        </GamingButton>
      </div>
    </form>
  )
}
