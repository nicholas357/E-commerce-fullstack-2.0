"use client"

import { motion } from "framer-motion"
import { GiftCardGrid } from "@/components/gift-card-grid"

export default function GiftCardsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="py-8">
      <GiftCardGrid />
    </motion.div>
  )
}
