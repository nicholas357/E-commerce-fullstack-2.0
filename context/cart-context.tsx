"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast-provider"
import { useLoading } from "@/context/loading-context"
import { setCookie, getCookie } from "@/lib/cookies"

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  category: string
  planId?: string
  durationId?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string, planId?: string, durationId?: string) => void
  updateQuantity: (id: string, quantity: number, planId?: string, durationId?: string) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { addToast } = useToast()
  const router = useRouter()
  const { setIsLoading } = useLoading()

  // Load cart from cookies on initial render
  useEffect(() => {
    const savedCart = getCookie("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from cookies:", error)
      }
    }
  }, [])

  // Save cart to cookies whenever it changes
  useEffect(() => {
    setCookie("cart", items)
  }, [items])

  const navigateToCart = () => {
    setIsLoading(true)
    router.push("/cart")
  }

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      // For streaming services with plans, check if the exact plan and duration already exists
      if (newItem.planId && newItem.durationId) {
        const existingItemIndex = prevItems.findIndex(
          (item) => item.id === newItem.id && item.planId === newItem.planId && item.durationId === newItem.durationId,
        )

        if (existingItemIndex > -1) {
          // Item with same plan and duration exists, update quantity
          const updatedItems = [...prevItems]
          updatedItems[existingItemIndex].quantity += 1

          addToast({
            title: "Added to cart",
            description: `${newItem.name} (${updatedItems[existingItemIndex].quantity})`,
            type: "success",
            action: {
              label: "View Cart",
              onClick: navigateToCart,
            },
          })

          return updatedItems
        } else {
          // Item with this plan and duration doesn't exist, add new item
          addToast({
            title: "Added to cart",
            description: newItem.name,
            type: "success",
            action: {
              label: "View Cart",
              onClick: navigateToCart,
            },
          })

          return [...prevItems, { ...newItem, quantity: 1 }]
        }
      } else {
        // Regular item, check if it already exists by ID
        const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id)

        if (existingItemIndex > -1) {
          // Item exists, update quantity
          const updatedItems = [...prevItems]
          updatedItems[existingItemIndex].quantity += 1

          addToast({
            title: "Added to cart",
            description: `${newItem.name} (${updatedItems[existingItemIndex].quantity})`,
            type: "success",
            action: {
              label: "View Cart",
              onClick: navigateToCart,
            },
          })

          return updatedItems
        } else {
          // Item doesn't exist, add new item
          addToast({
            title: "Added to cart",
            description: newItem.name,
            type: "success",
            action: {
              label: "View Cart",
              onClick: navigateToCart,
            },
          })

          return [...prevItems, { ...newItem, quantity: 1 }]
        }
      }
    })
  }

  const removeItem = (id: string, planId?: string, durationId?: string) => {
    setItems((prevItems) => {
      // For streaming services with plans, remove the specific plan and duration
      if (planId && durationId) {
        const itemToRemove = prevItems.find(
          (item) => item.id === id && item.planId === planId && item.durationId === durationId,
        )

        if (itemToRemove) {
          addToast({
            title: "Item removed",
            description: itemToRemove.name,
            type: "info",
          })
        }

        return prevItems.filter((item) => !(item.id === id && item.planId === planId && item.durationId === durationId))
      } else {
        // Regular item, remove by ID
        const itemToRemove = prevItems.find((item) => item.id === id)
        if (itemToRemove) {
          addToast({
            title: "Item removed",
            description: itemToRemove.name,
            type: "info",
          })
        }
        return prevItems.filter((item) => item.id !== id)
      }
    })
  }

  const updateQuantity = (id: string, quantity: number, planId?: string, durationId?: string) => {
    if (quantity < 1) return

    setItems((prevItems) => {
      if (planId && durationId) {
        // Update quantity for specific plan and duration
        return prevItems.map((item) =>
          item.id === id && item.planId === planId && item.durationId === durationId ? { ...item, quantity } : item,
        )
      } else {
        // Update quantity for regular item
        return prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      }
    })
  }

  const clearCart = () => {
    setItems([])
    addToast({
      title: "Cart cleared",
      description: "All items have been removed",
      type: "info",
    })
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
