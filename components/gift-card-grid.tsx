"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { giftCardService, type GiftCard } from "@/lib/gift-card-service"
import { Spinner } from "@/components/ui/spinner"

export function GiftCardGrid() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGiftCards = async () => {
      try {
        setLoading(true)
        // Use getActiveGiftCards instead of getGiftCards
        const data = await giftCardService.getActiveGiftCards()
        setGiftCards(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching gift cards:", err)
        setError("Failed to load gift cards. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchGiftCards()
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section className="relative overflow-hidden bg-background py-16">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(245,158,11,0.05),transparent_70%)]"></div>

      {/* Grid lines */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, #f59e0b 1px, transparent 1px), linear-gradient(to bottom, #f59e0b 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center text-4xl font-bold"
        >
          <span className="text-white glow-text-amber">Gift Cards</span>
        </motion.h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        ) : giftCards.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">No gift cards available at the moment.</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {giftCards.map((card, index) => (
              <motion.div
                key={card.id}
                variants={item}
                className="animate-float"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <Link
                  href={`/gift-cards/${card.slug}`}
                  className="group relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-border bg-card p-6 shadow-lg transition-all hover:border-glow-amber hover:glow-border-amber"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent_70%)]"></div>

                  {/* Decorative elements */}
                  <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-amber-500/10 blur-xl"></div>
                  <div className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-amber-500/10 blur-xl"></div>

                  <div className="relative h-24 w-24 overflow-hidden rounded-full border border-amber-500/50 bg-black p-1 animate-pulse-glow">
                    <div className="relative h-full w-full overflow-hidden rounded-full">
                      <Image
                        src={card.image || "/placeholder.svg"}
                        alt={card.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  <span className="mt-4 text-center font-bold text-white transition-all group-hover:glow-text-amber">
                    {card.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
