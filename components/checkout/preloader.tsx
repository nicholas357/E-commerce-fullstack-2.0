"use client"

import { useEffect, useState } from "react"

export function CheckoutPreloader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate preloading resources
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        <p className="mt-4 text-lg font-medium text-amber-500">Loading checkout...</p>
      </div>
    </div>
  )
}
