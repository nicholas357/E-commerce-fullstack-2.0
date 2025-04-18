"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { ProductSkeleton } from "@/components/product-skeleton"
import { GamingButton } from "@/components/ui/gaming-button"
import { productService } from "@/lib/product-service"
import Link from "next/link"

export function FeaturedProducts() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])

  // Fetch products from the database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // First try to get featured products from the database
        const featuredProducts = await productService.getFeaturedProducts(8)

        if (featuredProducts.length > 0) {
          setProducts(featuredProducts)
        } else {
          // If no featured products in the database, use dummy data as fallback
          // This is just for development until the database is populated
          const { dummyProducts } = await import("@/data/featured-products")
          const { streamingServices } = await import("@/data/streaming-services")
          setProducts([...dummyProducts, ...streamingServices.slice(0, 2)])
        }
      } catch (error) {
        console.error("Error fetching featured products:", error)
        // Fallback to dummy data on error
        const { dummyProducts } = await import("@/data/featured-products")
        setProducts(dummyProducts)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <section className="relative overflow-hidden bg-background py-16">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.05),transparent_70%)]"></div>

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-2"
          >
            <span className="inline-block text-sm font-bold uppercase tracking-wider text-amber-400 glow-text-amber">
              Featured Collection
            </span>
          </motion.div>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold text-white glow-text-amber"
            >
              Featured Products
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/featured-products">
                <GamingButton variant="ghost" size="sm">
                  View All <ChevronRight className="h-4 w-4" />
                </GamingButton>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
