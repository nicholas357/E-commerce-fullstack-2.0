"use client"

import type React from "react"

import { useState } from "react"
import { GamingButton } from "@/components/ui/gaming-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, User, Mail, Phone, MapPin, Building, FileText } from "lucide-react"

interface ShippingFormProps {
  initialData: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    notes: string
  }
  onSubmit: (data: ShippingFormProps["initialData"]) => void
}

export function ShippingForm({ initialData, onSubmit }: ShippingFormProps) {
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Special handling for phone field - only allow numbers
    if (name === "phone") {
      // Replace any non-digit character with empty string
      const numericValue = value.replace(/\D/g, "")

      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Phone number must contain only digits"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  // Handle phone input keypress to prevent non-numeric characters
  const handlePhoneKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only digits, backspace, delete, tab, arrows
    const allowedKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
    const isDigit = /^\d$/.test(e.key)

    if (!isDigit && !allowedKeys.includes(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="mb-2 text-xl font-bold">Shipping Information</h2>
      <p className="mb-6 text-sm text-gray-500">Please enter your shipping details</p>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="fullName" className="flex items-center gap-2">
            <User className="h-4 w-4 text-amber-500" />
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={`${errors.fullName ? "border-red-500" : ""} pl-3 py-2 h-11`}
          />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber-500" />
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`${errors.email ? "border-red-500" : ""} pl-3 py-2 h-11`}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-amber-500" />
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.phone}
              onChange={handleChange}
              onKeyDown={handlePhoneKeyPress}
              placeholder="Enter your phone number"
              className={`${errors.phone ? "border-red-500" : ""} pl-3 py-2 h-11`}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-500" />
            Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
            className={`${errors.address ? "border-red-500" : ""} pl-3 py-2 h-11`}
          />
          {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="city" className="flex items-center gap-2">
            <Building className="h-4 w-4 text-amber-500" />
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter your city"
            className={`${errors.city ? "border-red-500" : ""} pl-3 py-2 h-11`}
          />
          {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-500" />
            Order Notes (Optional)
          </Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any special instructions or notes about your order"
            rows={3}
            className="pl-3 py-2"
          />
        </div>

        <GamingButton type="submit" variant="amber" className="mt-4 flex items-center justify-center">
          Continue to Payment
          <ArrowRight className="ml-2 h-4 w-4" />
        </GamingButton>
      </div>
    </form>
  )
}
