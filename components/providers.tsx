"use client"

import type { ReactNode } from "react"
import { SessionContextProvider } from "@supabase/auth-helpers-react"
import { getSupabaseClient } from "@/lib/supabase/client-client"
import { ToastProvider } from "@/components/ui/toast-provider"
import { LoadingProvider } from "@/context/loading-context"
import { AuthProvider } from "@/context/auth-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { CartProvider } from "@/context/cart-context"

export function Providers({ children }: { children: ReactNode }) {
  const supabase = getSupabaseClient()

  return (
    <SessionContextProvider supabaseClient={supabase}>
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
