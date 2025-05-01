"use client"

import type { ReactNode } from "react"
import { useState, useEffect } from "react"
import { SessionContextProvider } from "@supabase/auth-helpers-react"
import { getSupabaseClient, resetClient, getConnectionStatus, checkConnection } from "@/lib/supabase/client-client"
import { ToastProvider } from "@/components/ui/toast-provider"
import { LoadingProvider } from "@/context/loading-context"
import { AuthProvider } from "@/context/auth-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { CartProvider } from "@/context/cart-context"

export function Providers({ children }: { children: ReactNode }) {
  const [supabase, setSupabase] = useState(() => getSupabaseClient())
  const [isOnline, setIsOnline] = useState(true)

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log("[Providers] Browser is online, reconnecting...")
      setIsOnline(true)
      // Reset the client to establish a fresh connection
      setSupabase(resetClient())
    }

    const handleOffline = () => {
      console.log("[Providers] Browser is offline")
      setIsOnline(false)
    }

    // Handle page visibility changes (tab switching, etc.)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        console.log("[Providers] Page became visible, checking connection")
        const connectionStatus = getConnectionStatus()

        // If it's been more than 5 minutes since last connection or connection is lost
        if (
          !connectionStatus.isConnected ||
          (connectionStatus.lastConnected &&
            new Date().getTime() - connectionStatus.lastConnected.getTime() > 5 * 60 * 1000)
        ) {
          console.log("[Providers] Refreshing connection after visibility change")
          setSupabase(resetClient())
          await checkConnection()
        }
      }
    }

    // Set up event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Set initial online status
    setIsOnline(navigator.onLine)

    // Clean up event listeners
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // Periodically check and refresh the connection
  useEffect(() => {
    if (!isOnline) return

    const periodicConnectionCheck = async () => {
      const connectionStatus = getConnectionStatus()

      // If connection is lost or stale, reset it
      if (
        !connectionStatus.isConnected ||
        (connectionStatus.lastConnected &&
          new Date().getTime() - connectionStatus.lastConnected.getTime() > 10 * 60 * 1000)
      ) {
        console.log("[Providers] Refreshing stale connection")
        setSupabase(resetClient())
        await checkConnection()
      }
    }

    // Check connection every 5 minutes
    const interval = setInterval(periodicConnectionCheck, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isOnline])

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={null}>
      <ToastProvider>
        <LoadingProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>{children}</CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </LoadingProvider>
      </ToastProvider>
    </SessionContextProvider>
  )
}
