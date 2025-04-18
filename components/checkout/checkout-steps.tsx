"use client"

import { motion } from "framer-motion"
import { Check, CreditCard, Truck, Upload } from "lucide-react"

interface CheckoutStepsProps {
  currentStep: "shipping" | "payment" | "proof"
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const steps = [
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "proof", label: "Confirmation", icon: Upload },
  ]

  const getStepStatus = (stepId: string) => {
    if (stepId === "shipping" && currentStep !== "shipping") return "completed"
    if (stepId === "payment" && currentStep === "proof") return "completed"
    if (stepId === currentStep) return "current"
    return "upcoming"
  }

  return (
    <div className="w-full py-4">
      <div className="relative mx-auto max-w-3xl px-6">
        {/* Background Track */}
        <div
          className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gray-200 rounded-full mx-8 md:mx-12 z-0"
          style={{ top: "calc(50% + 12px)" }}
        ></div>

        {/* Animated Progress Bar */}
        <motion.div
          className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full mx-8 md:mx-12 z-0"
          initial={{ width: "0%" }}
          animate={{
            width: currentStep === "shipping" ? "0%" : currentStep === "payment" ? "50%" : "100%",
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            transformOrigin: "left center",
            boxShadow: "0 1px 3px rgba(245, 158, 11, 0.3)",
            top: "calc(50% + 12px)",
          }}
        />

        {/* Steps Container */}
        <div className="relative z-10 flex justify-between items-start pt-2">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id)
            const StepIcon = step.icon

            return (
              <div key={step.id} className="relative flex flex-col items-center">
                {/* White background circle to prevent progress bar showing through */}

                {/* Step Circle */}
                <motion.div
                  className={`relative z-20 flex h-14 w-14 items-center justify-center rounded-full border-3 ${
                    status === "completed"
                      ? "border-amber-500 bg-amber-500 text-white"
                      : status === "current"
                        ? "border-amber-500 bg-white text-amber-500"
                        : "border-gray-300 bg-white text-gray-400"
                  }`}
                  initial={{ scale: 1, y: 0 }}
                  animate={{
                    scale: status === "current" ? [1, 1.05, 1] : 1,
                    y: status === "current" ? [0, -2, 0] : 0,
                    backgroundColor: status === "completed" ? "#f59e0b" : status === "current" ? "#ffffff" : "#ffffff",
                    borderColor: status === "completed" || status === "current" ? "#f59e0b" : "#d1d5db",
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: status === "current" ? Number.POSITIVE_INFINITY : 0,
                    repeatDelay: 5,
                  }}
                >
                  {status === "completed" ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Check className="h-7 w-7" />
                    </motion.div>
                  ) : (
                    <StepIcon className="h-7 w-7" />
                  )}
                </motion.div>

                {/* Step Label */}
                <div className="mt-3 text-center">
                  <motion.p
                    className={`text-sm font-medium ${
                      status === "completed" || status === "current" ? "text-amber-500" : "text-gray-500"
                    }`}
                    animate={{
                      color: status === "completed" || status === "current" ? "#f59e0b" : "#6b7280",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {step.label}
                  </motion.p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block text-xs text-gray-400 mt-1">
                      {index === 0 ? "Delivery details" : index === 1 ? "Choose method" : ""}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
