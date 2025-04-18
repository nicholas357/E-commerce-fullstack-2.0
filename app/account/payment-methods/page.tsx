"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CreditCard, Plus, LogIn, Wallet } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { useAuth } from "@/context/auth-context"
import { type PaymentMethod, paymentMethodService } from "@/lib/payment-method-service"
import { AddPaymentMethod } from "@/components/payment/add-payment-method"
import { PaymentMethodCard } from "@/components/payment/payment-method-card"
import { useToast } from "@/hooks/use-toast"

export default function PaymentMethodsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (user) {
      loadPaymentMethods()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const loadPaymentMethods = async () => {
    setIsLoading(true)
    try {
      const methods = await paymentMethodService.getUserPaymentMethods()
      setPaymentMethods(methods)
    } catch (error) {
      console.error("Error loading payment methods:", error)
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    setPaymentMethods((prev) => prev.filter((method) => method.id !== id))
  }

  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        is_default: method.id === id,
      })),
    )
  }

  const handleAddSuccess = () => {
    setShowAddForm(false)
    loadPaymentMethods()
  }

  // If user is not logged in, show login message
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center"
      >
        <CreditCard className="mb-4 h-16 w-16 text-amber-500" />
        <h2 className="mb-2 text-2xl font-bold text-white">Authentication Required</h2>
        <p className="mb-6 text-gray-400">Please sign in to view and manage your payment methods</p>
        <GamingButton
          variant="amber"
          onClick={() => router.push("/account/login?redirectTo=/account/payment-methods")}
          className="gap-2"
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </GamingButton>
      </motion.div>
    )
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="mb-2 text-3xl font-bold text-white glow-text-amber">Payment Methods</h1>
        <p className="mb-8 text-gray-400">Manage your saved payment methods for faster checkout</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border border-amber-500/20 bg-amber-900/10">
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {showAddForm ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <AddPaymentMethod onSuccess={handleAddSuccess} />
              <div className="mt-4 flex justify-end">
                <GamingButton variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </GamingButton>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-lg border border-border bg-card p-6 shadow-lg"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                  <Wallet className="mr-3 h-5 w-5 text-amber-400" />
                  <h2 className="text-lg font-medium text-white">Saved Payment Methods</h2>
                </div>
                <GamingButton variant="amber" size="sm" className="gap-1" onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4" />
                  Add New
                </GamingButton>
              </div>

              {paymentMethods.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CreditCard className="mb-4 h-16 w-16 text-amber-500" />
                  <h3 className="mb-2 text-xl font-bold text-white">No payment methods yet</h3>
                  <p className="mb-6 text-gray-400">Add a payment method to make checkout faster</p>
                  <GamingButton variant="amber" className="gap-1" onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4" />
                    Add Payment Method
                  </GamingButton>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {paymentMethods.map((method) => (
                    <PaymentMethodCard
                      key={method.id}
                      paymentMethod={method}
                      onDelete={handleDelete}
                      onSetDefault={handleSetDefault}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
