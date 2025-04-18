"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Home, ChevronRight, Clock } from "lucide-react"
import { giftCardService, type GiftCard } from "@/lib/gift-card-service"
import { GamingButton } from "@/components/ui/gaming-button"
import { Spinner } from "@/components/ui/spinner"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/toast-provider"

export default function GiftCardPage() {
  const { slug } = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const { addToast } = useToast()
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDenomination, setSelectedDenomination] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGiftCard = async () => {
      setLoading(true)
      setError(null)

      try {
        if (!slug) {
          setError("Gift card slug is missing")
          setLoading(false)
          return
        }

        const data = await giftCardService.getGiftCardBySlug(slug as string)

        if (!data) {
          setError("Gift card not found")
          setLoading(false)
          return
        }

        setGiftCard(data)

        // Set default denomination
        const defaultDenom = data.denominations.find((d) => d.is_default)
        if (defaultDenom) {
          setSelectedDenomination(defaultDenom.value)
        } else if (data.denominations.length > 0) {
          setSelectedDenomination(data.denominations[0].value)
        }
      } catch (error) {
        console.error("Error fetching gift card:", error)
        setError("Failed to load gift card data")
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchGiftCard()
    }
  }, [slug])

  const handleAddToCart = () => {
    if (!giftCard || selectedDenomination === null) return

    const denomination = giftCard.denominations.find((d) => d.value === selectedDenomination)
    if (!denomination) return

    addItem({
  id: `${giftCard.id}-${selectedDenomination}`,
  name: `${giftCard.name} - ${selectedDenomination} NPR`,
  price: selectedDenomination,
  image: giftCard.image,
  quantity: 1,
  category: "Gift Cards",
  is_gift_card: true,
  denomination: selectedDenomination,
})


    
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[500px]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !giftCard) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <GamingButton
            variant="outline"
            onClick={() => router.push("/gift-cards")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Gift Cards
          </GamingButton>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Gift Card Not Found</h1>
          <p className="mb-6 text-gray-400">
            {error || "The gift card you're looking for doesn't exist or has been removed."}
          </p>
          <GamingButton variant="amber" onClick={() => router.push("/gift-cards")}>
            Browse Gift Cards
          </GamingButton>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Breadcrumb navigation */}
      <nav className="mb-8 flex flex-wrap items-center space-x-2 text-sm">
        <Link href="/" className="flex items-center text-gray-400 hover:text-amber-400">
          <Home className="mr-1 h-4 w-4" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-600" />
        <Link href="/gift-cards" className="text-gray-400 hover:text-amber-400">
          Gift Cards
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-600" />
        <span className="truncate text-amber-400 max-w-[200px] sm:max-w-xs md:max-w-sm">{giftCard.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* Gift Card Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent_70%)]"></div>
          <Image
            src={giftCard.image || "/placeholder.svg"}
            alt={giftCard.name}
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        {/* Gift Card Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-white glow-text-amber">{giftCard.name}</h1>

          {giftCard.description && <p className="mt-4 text-gray-400">{giftCard.description}</p>}

          <div className="mt-8">
            <h3 className="mb-3 text-lg font-medium text-white">Select Denomination</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {giftCard.denominations.map((denom) => (
                <button
                  key={denom.value}
                  type="button"
                  onClick={() => setSelectedDenomination(denom.value)}
                  className={`rounded-md border p-3 text-center transition-colors ${
                    selectedDenomination === denom.value
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-border text-white hover:border-amber-500/50"
                  }`}
                >
                  <span className="block text-lg font-bold">{denom.value} NPR</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Valid for {giftCard.validity_days} days after purchase</span>
          </div>

          <div className="mt-8">
            <GamingButton
              variant="amber"
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={selectedDenomination === null}
            >
              Add to Cart
            </GamingButton>
          </div>

          {giftCard.redemption_instructions && (
            <div className="mt-8 rounded-md border border-border bg-muted/30 p-4">
              <h3 className="mb-2 text-lg font-medium text-white">Redemption Instructions</h3>
              <p className="text-gray-400">{giftCard.redemption_instructions}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
