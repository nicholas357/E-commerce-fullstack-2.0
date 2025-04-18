"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingCart, Heart, Share2, ChevronRight, Check, AlertCircle } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/toast-provider"
import { Spinner } from "@/components/ui/spinner"
import type { Product, StreamingPlan, StreamingDuration, GameEdition, GiftCardDenomination } from "@/types/product"
import { ProductReviews } from "@/components/product-reviews"

// Default membership durations for subscription products if not provided by the database
const defaultMembershipDurations = [
  { id: "1month", name: "1 Month", price: 1499, discount: 0 },
  { id: "3months", name: "3 Months", price: 3999, discount: 11 },
  { id: "6months", name: "6 Months", price: 7499, discount: 16 },
  { id: "12months", name: "12 Months", price: 13999, discount: 22 },
]

// Default game editions if not provided by the database
const defaultGameEditions = [
  { id: "standard", name: "Standard Edition", price: 0, description: "Base game" },
  { id: "deluxe", name: "Deluxe Edition", price: 2000, description: "Base game + Season Pass" },
  { id: "ultimate", name: "Ultimate Edition", price: 3500, description: "Base game + Season Pass + Exclusive Content" },
]

interface ProductDetailProps {
  product: Product
  categoryName: string
  streamingPlans?: StreamingPlan[]
  gameEditions?: GameEdition[]
  giftCardDenominations?: GiftCardDenomination[]
}

export function ProductDetail({
  product,
  categoryName,
  streamingPlans = [],
  gameEditions = [],
  giftCardDenominations = [],
}: ProductDetailProps) {
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(defaultMembershipDurations[0])
  const [selectedEdition, setSelectedEdition] = useState<GameEdition | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [selectedDenomination, setSelectedDenomination] = useState<GiftCardDenomination | null>(null)

  // Streaming service specific states
  const [selectedStreamingPlan, setSelectedStreamingPlan] = useState<StreamingPlan | null>(null)
  const [selectedStreamingDuration, setSelectedStreamingDuration] = useState<StreamingDuration | null>(null)
  const [availableStreamingDurations, setAvailableStreamingDurations] = useState<StreamingDuration[]>([])

  // Determine product category and type
  const isSubscription = product.is_subscription || categoryName === "Game Points" || product.name.includes("Pass")
  const isGame = categoryName.includes("Games") || categoryName.includes("Xbox") || categoryName.includes("PlayStation")
  const isGiftCard = product.is_gift_card || categoryName.includes("Gift Card")
  const isStreaming =
    categoryName.includes("Streaming") ||
    product.name.includes("Netflix") ||
    product.name.includes("Disney+") ||
    product.name.includes("Hulu") ||
    product.name.includes("Prime") ||
    product.name.includes("HBO") ||
    product.is_subscription

  // Initialize product options when product loads
  useEffect(() => {
    // Initialize streaming plans
    if (isStreaming && streamingPlans && streamingPlans.length > 0) {
      setSelectedStreamingPlan(streamingPlans[0])
      if (streamingPlans[0].durations && streamingPlans[0].durations.length > 0) {
        setAvailableStreamingDurations(streamingPlans[0].durations)
        setSelectedStreamingDuration(streamingPlans[0].durations[0])
      }
    }

    // Initialize game editions
    if (isGame && gameEditions && gameEditions.length > 0) {
      // Find the standard edition or use the first one
      const standardEdition =
        gameEditions.find((edition) => edition.name.toLowerCase().includes("standard")) || gameEditions[0]
      setSelectedEdition(standardEdition)
    } else if (isGame) {
      setSelectedEdition(defaultGameEditions[0] as unknown as GameEdition)
    }

    // Initialize gift card denominations
    if (isGiftCard && giftCardDenominations && giftCardDenominations.length > 0) {
      // Find the default denomination or use the first one
      const defaultDenomination = giftCardDenominations.find((denom) => denom.is_default) || giftCardDenominations[0]
      setSelectedDenomination(defaultDenomination)
    }
  }, [product, isStreaming, isGame, isGiftCard, streamingPlans, gameEditions, giftCardDenominations])

  // Update available durations when streaming plan changes
  useEffect(() => {
    if (selectedStreamingPlan && selectedStreamingPlan.durations) {
      setAvailableStreamingDurations(selectedStreamingPlan.durations)
      setSelectedStreamingDuration(selectedStreamingPlan.durations[0])
    }
  }, [selectedStreamingPlan])

  // Use product images or placeholders
  const productImages =
    product.images && product.images.length > 0 ? product.images : [product.image || "/placeholder.svg"]

  const handleAddToCart = () => {
    if (!product.in_stock) {
      addToast({
        title: "Out of Stock",
        description: "Sorry, this product is currently out of stock.",
        type: "error",
      })
      return
    }

    setIsAddingToCart(true)

    // Calculate the final price based on product type and selections
    let finalPrice = product.price
    let productName = product.name
    const productImage = product.image

    if (isStreaming && selectedStreamingPlan && selectedStreamingDuration) {
      finalPrice = selectedStreamingDuration.price
      productName += ` - ${selectedStreamingPlan.name} (${selectedStreamingDuration.name})`
    } else if (isSubscription) {
      finalPrice = selectedDuration.price
      productName += ` - ${selectedDuration.name}`
    } else if (isGame && selectedEdition) {
      finalPrice = product.price + (selectedEdition.price || 0)
      productName += ` - ${selectedEdition.name}`
    } else if (isGiftCard && selectedDenomination) {
      finalPrice = selectedDenomination.value
      productName += ` - ${selectedDenomination.value} NPR`
    }

    // Simulate API call
    setTimeout(() => {
      addItem({
        id: product.id,
        name: productName,
        price: finalPrice,
        image: productImage,
        category: categoryName,
        quantity,
        is_digital: product.is_digital,
        is_subscription: product.is_subscription,
        is_gift_card: product.is_gift_card,
      })
      setIsAddingToCart(false)

      // Show notification
      setShowNotification(true)
      setTimeout(() => {
        setShowNotification(false)
      }, 3000)
    }, 800)
  }

  const toggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        ...product,
        category: categoryName,
      })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out ${product.name} on Turgame!`,
          url: window.location.href,
        })
        .catch((error) => {
          addToast({
            title: "Sharing failed",
            description: "Could not share this product.",
            type: "error",
          })
        })
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      addToast({
        title: "Link copied",
        description: "Product link copied to clipboard!",
        type: "success",
      })
    }
  }

  const inWishlist = isInWishlist(product.id)
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  // Calculate current price based on selections
  const calculateCurrentPrice = () => {
    if (isStreaming && selectedStreamingDuration) {
      return selectedStreamingDuration.price
    } else if (isSubscription) {
      return selectedDuration.price
    } else if (isGame && selectedEdition) {
      return product.price + (selectedEdition.price || 0)
    } else if (isGiftCard && selectedDenomination) {
      return selectedDenomination.value
    }
    return product.price
  }

  const currentPrice = calculateCurrentPrice()

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Success notification */}
      <div className="fixed left-0 right-0 top-0 z-50 flex justify-center">
        <div
          className={`mt-4 transform rounded-lg bg-green-500 px-6 py-3 text-white shadow-lg transition-all duration-300 ${
            showNotification ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          }`}
        >
          <div className="flex items-center">
            <Check className="mr-2 h-5 w-5" />
            <span>Added to cart successfully!</span>
          </div>
        </div>
      </div>

      {/* Product Images */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent_80%)]"></div>
          <Image
            src={productImages[selectedImage] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain p-4"
            priority
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
            {product.is_new && (
              <div className="rounded-md bg-amber-500 px-3 py-1 text-xs font-bold uppercase text-black">New</div>
            )}
            {discount > 0 && (
              <div className="rounded-md bg-red-500 px-3 py-1 text-xs font-bold uppercase text-white">
                {discount}% Off
              </div>
            )}
            {product.is_digital && (
              <div className="rounded-md bg-blue-500 px-3 py-1 text-xs font-bold uppercase text-white">Digital</div>
            )}
            {product.is_subscription && (
              <div className="rounded-md bg-purple-500 px-3 py-1 text-xs font-bold uppercase text-white">
                Subscription
              </div>
            )}
            {!product.in_stock && (
              <div className="rounded-md bg-red-500 px-3 py-1 text-xs font-bold uppercase text-white">Out of Stock</div>
            )}
          </div>
        </div>

        {/* Thumbnail Gallery - only show when there are multiple images */}
        {productImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {productImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-md border ${
                  selectedImage === index ? "border-amber-500 glow-border-amber" : "border-border"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col">
        {/* Breadcrumbs */}
        <div className="mb-4 flex items-center text-sm text-gray-400">
          <Link href="/" className="hover:text-amber-400">
            Home
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link href={`/${categoryName.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-amber-400">
            {categoryName}
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="truncate text-amber-400">{product.name}</span>
        </div>

        {/* Category */}
        <div className="mb-2 text-sm font-bold uppercase tracking-wider text-amber-400 glow-text-amber">
          {categoryName}
        </div>

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold text-white">{product.name}</h1>

        {/* Rating */}
        <div className="mb-4 flex items-center">
          <div className="flex items-center">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < (product.rating || 4.5) ? "fill-amber-400 text-amber-400" : "text-gray-600"}`}
                />
              ))}
          </div>
          <span className="ml-2 text-sm text-gray-400">({product.reviewCount || 0} reviews)</span>
        </div>

        {/* Stock Status */}
        <div className="mb-4 flex items-center">
          {product.in_stock ? (
            <div className="flex items-center text-green-500">
              <Check className="mr-1 h-4 w-4" />
              <span className="text-sm">In Stock</span>
            </div>
          ) : (
            <div className="flex items-center text-red-500">
              <AlertCircle className="mr-1 h-4 w-4" />
              <span className="text-sm">Out of Stock</span>
            </div>
          )}
          {product.stock > 0 && (
            <span className="ml-2 text-sm text-gray-400">
              ({product.stock} {product.stock === 1 ? "unit" : "units"} available)
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-white glow-text-amber">NPR {currentPrice.toLocaleString()}</span>
            {product.original_price && !isStreaming && !isSubscription && (
              <span className="ml-2 text-lg text-gray-400 line-through">
                NPR {product.original_price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Show savings for subscription or streaming products */}
          {isSubscription && selectedDuration.discount > 0 && (
            <span className="mt-1 text-sm text-green-400">
              Save {selectedDuration.discount}% with {selectedDuration.name}
            </span>
          )}

          {isStreaming && selectedStreamingDuration && selectedStreamingDuration.discount > 0 && (
            <span className="mt-1 text-sm text-green-400">
              Save {selectedStreamingDuration.discount}% with {selectedStreamingDuration.name}
            </span>
          )}
        </div>

        {/* Product Options */}
        {/* Streaming Plans */}
        {isStreaming && streamingPlans && streamingPlans.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-white">Select Plan</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {streamingPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedStreamingPlan(plan)}
                  className={`flex flex-col rounded-md border p-3 text-left transition-colors ${
                    selectedStreamingPlan?.id === plan.id
                      ? "border-amber-500 bg-amber-500/10 glow-border-amber"
                      : "border-border bg-card hover:border-amber-500/50"
                  }`}
                >
                  <span className="font-medium text-white">{plan.name}</span>
                  <span className="text-xs text-gray-400">
                    {plan.screens} {plan.screens === 1 ? "screen" : "screens"}, {plan.quality}
                  </span>
                </button>
              ))}
            </div>

            {selectedStreamingPlan && availableStreamingDurations.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-medium text-white">Select Duration</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableStreamingDurations.map((duration) => (
                    <button
                      key={duration.id}
                      onClick={() => setSelectedStreamingDuration(duration)}
                      className={`flex flex-col rounded-md border p-3 text-left transition-colors ${
                        selectedStreamingDuration?.id === duration.id
                          ? "border-amber-500 bg-amber-500/10 glow-border-amber"
                          : "border-border bg-card hover:border-amber-500/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">{duration.name}</span>
                        <span className="text-sm font-bold text-amber-400">NPR {duration.price.toLocaleString()}</span>
                      </div>
                      {duration.discount > 0 && (
                        <span className="text-xs text-green-400">Save {duration.discount}%</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Game Editions */}
        {isGame && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-white">Select Edition</h3>
            <div className="space-y-2">
              {(gameEditions.length > 0 ? gameEditions : defaultGameEditions).map((edition, index) => (
                <button
                  key={edition.id || index}
                  onClick={() => setSelectedEdition(edition as GameEdition)}
                  className={`flex w-full flex-col rounded-md border p-3 text-left transition-colors ${
                    selectedEdition?.id === edition.id || (selectedEdition === null && index === 0)
                      ? "border-amber-500 bg-amber-500/10 glow-border-amber"
                      : "border-border bg-card hover:border-amber-500/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{edition.name}</span>
                    <span className="text-sm font-bold text-amber-400">
                      {edition.price === 0 ? "Base Price" : `+NPR ${edition.price?.toLocaleString()}`}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{edition.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gift Card Denominations */}
        {isGiftCard && giftCardDenominations && giftCardDenominations.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-white">Select Value</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {giftCardDenominations.map((denomination) => (
                <button
                  key={denomination.id}
                  onClick={() => setSelectedDenomination(denomination)}
                  className={`flex flex-col rounded-md border p-3 text-center transition-colors ${
                    selectedDenomination?.id === denomination.id
                      ? "border-amber-500 bg-amber-500/10 glow-border-amber"
                      : "border-border bg-card hover:border-amber-500/50"
                  }`}
                >
                  <span className="text-lg font-bold text-white">NPR {denomination.value.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subscription Durations */}
        {isSubscription && !isStreaming && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-white">Select Duration</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {defaultMembershipDurations.map((duration) => (
                <button
                  key={duration.id}
                  onClick={() => setSelectedDuration(duration)}
                  className={`flex flex-col rounded-md border p-3 text-left transition-colors ${
                    selectedDuration.id === duration.id
                      ? "border-amber-500 bg-amber-500/10 glow-border-amber"
                      : "border-border bg-card hover:border-amber-500/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{duration.name}</span>
                    <span className="text-sm font-bold text-amber-400">NPR {duration.price.toLocaleString()}</span>
                  </div>
                  {duration.discount > 0 && <span className="text-xs text-green-400">Save {duration.discount}%</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selector (only for physical products) */}
        {!product.is_digital && !isSubscription && !isStreaming && !isGiftCard && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-white">Quantity</h3>
            <div className="flex w-32 items-center rounded-md border border-border bg-card">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center text-gray-400 hover:text-white"
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.min(product.stock, Math.max(1, Number.parseInt(e.target.value) || 1)))
                }
                className="h-10 w-12 border-x border-border bg-transparent text-center text-white"
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="flex h-10 w-10 items-center justify-center text-gray-400 hover:text-white"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <GamingButton
            variant="amber"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={isAddingToCart || !product.in_stock}
          >
            {isAddingToCart ? (
              <span className="flex items-center">
                <Spinner size="sm" className="mr-2" />
                Adding...
              </span>
            ) : !product.in_stock ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </>
            )}
          </GamingButton>

          <GamingButton
            variant={inWishlist ? "amber" : "ghost"}
            onClick={toggleWishlist}
            className="w-12 flex-shrink-0 p-0"
          >
            <Heart className={inWishlist ? "h-5 w-5 fill-white" : "h-5 w-5"} />
          </GamingButton>

          <GamingButton variant="ghost" onClick={handleShare} className="w-12 flex-shrink-0 p-0">
            <Share2 className="h-5 w-5" />
          </GamingButton>
        </div>

        {/* Digital Product Notice */}
        {product.is_digital && (
          <div className="rounded-md bg-blue-500/10 p-4 text-sm text-blue-300">
            <p className="flex items-start">
              <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>
                This is a digital product. After purchase, you will receive a code or access instructions via email.
              </span>
            </p>
          </div>
        )}

        {/* Subscription Notice */}
        {product.is_subscription && (
          <div className="rounded-md bg-purple-500/10 p-4 text-sm text-purple-300">
            <p className="flex items-start">
              <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>
                This is a subscription product. Your subscription will begin immediately after purchase and will be
                valid for the selected duration.
              </span>
            </p>
          </div>
        )}

        {/* Gift Card Notice */}
        {product.is_gift_card && (
          <div className="rounded-md bg-green-500/10 p-4 text-sm text-green-300">
            <p className="flex items-start">
              <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>
                This is a gift card. After purchase, you will receive a code that can be redeemed on the service
                provider's website.
              </span>
            </p>
          </div>
        )}
      </div>

      
    </div>
  )
}
