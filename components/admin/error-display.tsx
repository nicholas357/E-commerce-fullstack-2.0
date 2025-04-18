"use client"

import { AlertCircle } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"

interface ErrorDisplayProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorDisplay({ title = "Error", message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-500 mb-2">{title}</h3>
        <p className="text-gray-400">{message}</p>
        {onRetry && (
          <GamingButton variant="amber" onClick={onRetry} className="mt-4">
            Retry
          </GamingButton>
        )}
      </div>
    </div>
  )
}
