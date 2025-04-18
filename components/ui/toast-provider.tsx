"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Toast, ToastClose, ToastTitle, ToastDescription, ToastAction } from "@/components/ui/toast"

type ToastType = "default" | "success" | "error" | "warning" | "info"

interface ToastProps {
  id: string
  title?: string
  description?: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])
  const router = useRouter()

  const addToast = useCallback(
    ({ title, description, type = "default", duration = 3000, action }: Omit<ToastProps, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, title, description, type, duration, action }])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [],
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[200] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[320px]">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              layout
              className="pointer-events-auto"
            >
              <Toast variant={toast.type as any}>
                <div className="flex-1 pr-4">
                  {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
                  {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
                </div>
                {toast.action && <ToastAction onClick={toast.action.onClick}>{toast.action.label}</ToastAction>}
                <ToastClose onClick={() => removeToast(toast.id)} />
              </Toast>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
