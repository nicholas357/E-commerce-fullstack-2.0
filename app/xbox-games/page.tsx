"use client"

import { motion } from "framer-motion"
import { ProductCard } from "@/components/product-card"
import { games } from "@/data/xbox-games"

export default function XboxGamesPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-7xl px-4 py-12"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center text-3xl font-bold glow-text-amber"
      >
        Xbox Games
      </motion.h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game, index) => (
          <ProductCard key={game.id} product={game} index={index} />
        ))}
      </div>
    </motion.div>
  )
}
