"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { SearchIcon } from "lucide-react"
import { ProductCard, type ProductProps } from "@/components/product-card"
import { GamingButton } from "@/components/ui/gaming-button"
import { Spinner } from "@/components/ui/spinner"

// Combine all product data for search
import { dummyProducts } from "@/data/featured-products"
import { games } from "@/data/xbox-games"
import { gamePoints } from "@/data/game-points"
import { software } from "@/data/software"

const allProducts = [...dummyProducts, ...games, ...gamePoints, ...software]

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<ProductProps[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    // Simulate search delay
    setTimeout(() => {
      const results = allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setSearchResults(results)
      setIsSearching(false)
    }, 800)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

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
        Search Products
      </motion.h1>

      <div className="mx-auto mb-8 max-w-2xl">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for games, gift cards, software..."
              className="w-full rounded-md border border-border bg-background p-3 pr-10 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
          <GamingButton variant="amber" onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
            {isSearching ? <Spinner size="sm" /> : <SearchIcon className="h-5 w-5" />}
          </GamingButton>
        </div>
      </div>

      {isSearching ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
          <span className="ml-3 text-white">Searching...</span>
        </div>
      ) : hasSearched ? (
        searchResults.length > 0 ? (
          <>
            <h2 className="mb-6 text-xl font-semibold text-white">
              Search Results for "{searchTerm}" ({searchResults.length} items)
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {searchResults.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <SearchIcon className="mb-4 h-16 w-16 text-gray-500" />
            <h2 className="mb-2 text-2xl font-bold text-white">No results found</h2>
            <p className="text-gray-400">
              We couldn't find any products matching "{searchTerm}". Try different keywords or browse our categories.
            </p>
          </div>
        )
      ) : (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <SearchIcon className="mb-4 h-16 w-16 text-amber-500/50" />
          <h2 className="mb-2 text-2xl font-bold text-white">Search for products</h2>
          <p className="text-gray-400">Enter keywords to find games, gift cards, software, and more in our catalog.</p>
        </div>
      )}
    </motion.div>
  )
}
