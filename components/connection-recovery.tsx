"use client"

import { useEffect, useState } from "react"
import { checkConnection, getConnectionStatus, resetClient } from "@/lib/supabase/client-client"

export function ConnectionRecovery() {
  const [isRecovering, setIsRecovering] = useState(false)

  useEffect(() => {
    // Initial connection check
    const initialCheck = async () => {
      const status = getConnectionStatus()
      if (!status.isConnected) {
        setIsRecovering(true)
        await checkConnection()
        setIsRecovering(false)
      }
    }

    initialCheck()

    // Set up periodic checks
    const interval = setInterval(async () => {
      const status = getConnectionStatus()
      if (!status.isConnected || status.reconnectAttempts > 0) {
        setIsRecovering(true)
        await checkConnection()
        setIsRecovering(false)
      }
    }, 30000) // Check every 30 seconds

    // Handle online event
    const handleOnline = async () => {
      console.log("[ConnectionRecovery] Network online, checking database connection")
      setIsRecovering(true)
      resetClient()
      await checkConnection()
      setIsRecovering(false)
    }

    // Handle visibility change
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        console.log("[ConnectionRecovery] Page visible, checking connection")
        const status = getConnectionStatus()
        if (
          !status.isConnected ||
          (status.lastConnected && new Date().getTime() - status.lastConnected.getTime() > 2 * 60 * 1000)
        ) {
          setIsRecovering(true)
          resetClient()
          await checkConnection()
          setIsRecovering(false)
        }
      }
    }

    window.addEventListener("online", handleOnline)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener("online", handleOnline)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // This component doesn't render anything visible
  return null
}
