"use client"

import { useEffect, useState } from "react"
import { resetClient, getConnectionStatus } from "@/lib/supabase/client-client"
import { useToast } from "@/components/ui/toast-provider"

export function ConnectionRecovery() {
  const [isOnline, setIsOnline] = useState(true)
  const [isRecovering, setIsRecovering] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    // Handle online status changes
    const handleOnline = () => {
      console.log("[Connection] Browser is online")
      setIsOnline(true)
      recoverConnection()
    }

    const handleOffline = () => {
      console.log("[Connection] Browser is offline")
      setIsOnline(false)
      addToast({
        title: "You're offline",
        description: "Please check your internet connection",
        type: "error",
      })
    }

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[Connection] Page became visible, checking connection")
        checkAndRecoverConnection()
      }
    }

    // Set up event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Set initial online status
    setIsOnline(navigator.onLine)

    // Initial connection check
    checkAndRecoverConnection()

    // Periodic connection check
    const interval = setInterval(checkAndRecoverConnection, 30000) // Every 30 seconds

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      clearInterval(interval)
    }
  }, [addToast])

  // Check connection status and recover if needed
  const checkAndRecoverConnection = async () => {
    if (!isOnline) return

    const connectionStatus = getConnectionStatus()

    // If connection is lost or stale (more than 5 minutes old)
    if (
      !connectionStatus.isConnected ||
      (connectionStatus.lastConnected &&
        new Date().getTime() - connectionStatus.lastConnected.getTime() > 5 * 60 * 1000)
    ) {
      recoverConnection()
    }
  }

  // Recover the connection
  const recoverConnection = async () => {
    if (isRecovering) return

    try {
      setIsRecovering(true)
      console.log("[Connection] Attempting to recover database connection")

      // Reset the client to establish a fresh connection
      const client = resetClient()

      // Test the connection with a simple query
      const { error } = await client.from("profiles").select("count", { count: "exact", head: true })

      if (error) {
        console.error("[Connection] Recovery failed:", error)
        addToast({
          title: "Connection issue",
          description: "Having trouble connecting to the server. Please refresh the page.",
          type: "error",
        })
      } else {
        console.log("[Connection] Connection recovered successfully")
        // Only show toast if we were previously offline
        if (!isOnline) {
          addToast({
            title: "Connection restored",
            description: "You're back online!",
            type: "success",
          })
        }
      }
    } catch (err) {
      console.error("[Connection] Recovery exception:", err)
    } finally {
      setIsRecovering(false)
    }
  }

  // This component doesn't render anything visible
  return null
}
