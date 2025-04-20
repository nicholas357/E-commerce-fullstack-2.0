"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { createBrowserClient } from "@supabase/auth-helpers-nextjs"
import { SessionContextProvider } from "@supabase/auth-helpers-react"

import { ToastProvider } from "@/components/ui/toast-provider"
import { LoadingProvider } from "@/context/loading-context"
import { AuthProvider } from "@/context/auth-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { CartProvider } from "@/context/cart-context"

export function Providers({ children }: { children: ReactNode }) {
  const [supabaseClient] = useState(() => createBrowserClient())

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
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
