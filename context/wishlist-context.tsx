"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/components/ui/toast-provider"
import { setCookie, getCookie } from "@/lib/cookies"

export interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  category: string
  rating: number
  reviewCount: number
  inStock: boolean
  originalPrice?: number
}

interface WishlistContextType {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  clearWishlist: () => void
  isInWishlist: (id: string) => boolean
  totalItems: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const { addToast } = useToast()

  // Load wishlist from cookies on initial render
  useEffect(() => {
    const savedWishlist = getCookie("wishlist")
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist))
      } catch (error) {
        console.error("Failed to parse wishlist from cookies:", error)
      }
    }
  }, [])

  // Save wishlist to cookies whenever it changes
  useEffect(() => {
    setCookie("wishlist", items)
  }, [items])

  const addItem = (newItem: WishlistItem) => {
    setItems((prevItems) => {
      // Check if item already exists in wishlist
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id)

      if (existingItemIndex > -1) {
        // Item exists, don't add it again
        addToast({
          title: "Already in wishlist",
          description: `${newItem.name} is already in your wishlist.`,
          type: "info",
        })
        return prevItems
      } else {
        // Item doesn't exist, add new item
        addToast({
          title: "Added to wishlist",
          description: newItem.name,
          type: "success",
        })
        return [...prevItems, newItem]
      }
    })
  }

  const removeItem = (id: string) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.id === id)
      if (itemToRemove) {
        addToast({
          title: "Removed from wishlist",
          description: itemToRemove.name,
          type: "info",
        })
      }
      return prevItems.filter((item) => item.id !== id)
    })
  }

  const clearWishlist = () => {
    setItems([])
    addToast({
      title: "Wishlist cleared",
      description: "All items have been removed from your wishlist",
      type: "info",
    })
  }

  const isInWishlist = (id: string) => {
    return items.some((item) => item.id === id)
  }

  const totalItems = items.length

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearWishlist,
        isInWishlist,
        totalItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
