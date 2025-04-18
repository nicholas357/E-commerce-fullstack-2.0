"use client"

import { motion } from "framer-motion"
import { ProductCard } from "@/components/product-card"
import { gamePoints } from "@/data/game-points"

export default function GamePointsPage() {
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
        Game Points
      </motion.h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {gamePoints.map((item, index) => (
          <ProductCard key={item.id} product={item} index={index} />
        ))}
      </div>
    </motion.div>
  )
}
