"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, ShoppingCart, Heart } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { categoryService } from "@/lib/category-service"
import type { Product } from "@/types/product"

export interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [categoryName, setCategoryName] = useState<string>(product.category || "")

  // Fetch category name if needed
  useEffect(() => {
    const fetchCategoryName = async () => {
      if (!product.category) {
        setCategoryName("Uncategorized")
        return
      }

      // If it doesn't look like a UUID, it's probably already a name
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.category)
      if (!isUUID) {
        setCategoryName(product.category)
        return
      }

      try {
        const name = await categoryService.getCategoryName(product.category)
        setCategoryName(name || "Uncategorized")
      } catch (error) {
        console.error("Error fetching category name:", error)
        // Keep the original category value if there's an error
      }
    }

    fetchCategoryName()
  }, [product.category])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking the button
    e.stopPropagation() // Stop event propagation

    if (product.in_stock) {
      setIsAddingToCart(true)

      // Simulate API call
      setTimeout(() => {
        // For streaming services, use the first plan and duration by default
        if (product.streamingPlans && product.streamingPlans.length > 0) {
          const defaultPlan = product.streamingPlans[0]
          const defaultDuration = defaultPlan.durations[0]

          addItem({
            id: product.id,
            name: `${product.name} - ${defaultPlan.name} (${defaultDuration.name})`,
            price: defaultDuration.price,
            image: product.image || "/placeholder.svg",
            category: categoryName, // Use resolved category name
          })
        } else {
          addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || "/placeholder.svg",
            category: categoryName, // Use resolved category name
          })
        }

        setIsAddingToCart(false)
      }, 600)
    }
  }

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking the button
    e.stopPropagation() // Stop event propagation

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        ...product,
        category: categoryName, // Use resolved category name
      })
    }
  }

  const inWishlist = isInWishlist(product.id)

  // Determine if we should show a price range
  const hasPriceRange = product.min_price && product.max_price && product.min_price !== product.max_price
  const isSubscription =
    product.is_subscription ||
    categoryName === "Game Points" ||
    product.name.includes("Pass") ||
    product.name.includes("Subscription") ||
    categoryName.includes("Netflix") ||
    categoryName.includes("Gift Cards") ||
    categoryName.includes("Streaming")

  // For streaming services, get the number of plans
  const hasMultiplePlans = product.streamingPlans && product.streamingPlans.length > 1
  const planCount = product.streamingPlans ? product.streamingPlans.length : 0

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -10, transition: { duration: 0.2 } }}
        className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card text-white shadow-lg transition-all hover:border-glow-amber hover:glow-border-amber"
      >
        <div className="relative">
          {/* Badges */}
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
            {product.is_new && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                className="rounded-md bg-amber-500 px-3 py-1 text-xs font-bold uppercase text-black"
              >
                New
              </motion.div>
            )}
            {discount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                className="rounded-md bg-red-500 px-3 py-1 text-xs font-bold uppercase text-white"
              >
                {discount}% Off
              </motion.div>
            )}
            {isSubscription && !product.is_new && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                className="rounded-md bg-blue-500 px-3 py-1 text-xs font-bold uppercase text-white"
              >
                Subscription
              </motion.div>
            )}
            {product.is_digital && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                className="rounded-md bg-purple-500 px-3 py-1 text-xs font-bold uppercase text-white"
              >
                Digital
              </motion.div>
            )}
            {hasMultiplePlans && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                className="rounded-md bg-purple-500 px-3 py-1 text-xs font-bold uppercase text-white"
              >
                {planCount} Plans
              </motion.div>
            )}
          </div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            className="absolute right-3 top-3 z-10"
          >
            <button
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                inWishlist ? "bg-amber-500/80 text-white backdrop-blur-sm" : "bg-black/50 text-white backdrop-blur-sm"
              } transition-colors hover:border hover:border-glow-amber hover:text-amber-400 hover:glow-border-amber`}
              onClick={toggleWishlist}
            >
              <Heart className={`h-5 w-5 ${inWishlist ? "fill-white" : ""}`} />
            </button>
          </motion.div>

          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-black">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent_80%)]"
            ></motion.div>
            <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }} className="relative h-full w-full">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-contain p-4" />
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          {/* Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
            className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-400 glow-text-amber"
          >
            {categoryName}
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            className="mb-2 line-clamp-2 min-h-[2.5rem] text-base font-bold text-white"
          >
            {product.name}
          </motion.h3>

          {/* Rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
            className="mb-3 flex items-center"
          >
            <div className="flex items-center">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < (product.rating || 4) ? "fill-amber-400 text-amber-400" : "text-gray-600"}`}
                  />
                ))}
            </div>
            <span className="ml-2 text-xs text-gray-400">({product.reviewCount || 0})</span>
          </motion.div>

          {/* Price and action */}
          <div className="mt-auto flex items-end justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              className="flex flex-col"
            >
              {hasPriceRange ? (
                <span className="text-lg font-bold text-white glow-text-amber">
                  From NPR {product.min_price?.toLocaleString()}
                </span>
              ) : (
                <span className="text-lg font-bold text-white glow-text-amber">
                  NPR {product.price.toLocaleString()}
                </span>
              )}

              {product.original_price && (
                <span className="text-sm text-gray-400 line-through">
                  NPR {product.original_price.toLocaleString()}
                </span>
              )}

              {isSubscription && !hasPriceRange && (
                <span className="text-xs text-gray-400">Various options available</span>
              )}

              {hasMultiplePlans && <span className="text-xs text-gray-400">{planCount} plans available</span>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GamingButton
                size="sm"
                disabled={!product.in_stock || isAddingToCart}
                variant={product.in_stock ? "amber" : "ghost"}
                onClick={handleAddToCart}
              >
                {isAddingToCart ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <ShoppingCart className="mr-1 h-4 w-4" />
                    {product.in_stock ? "Add" : "Out of Stock"}
                  </>
                )}
              </GamingButton>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
