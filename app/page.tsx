"use client"

import { useState, useEffect } from "react"
import { HeroBanner } from "@/components/hero-banner"
import { FeaturedProducts } from "@/components/featured-products"
import { GiftCardGrid } from "@/components/gift-card-grid"
import { productService } from "@/lib/product-service"
import { categoryService } from "@/lib/category-service"
import type { Product, Category } from "@/types/product"
import HomeBanners from "@/components/home-banners"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch featured products from the database
        const products = await productService.getFeaturedProducts(8)
        setFeaturedProducts(products)

        // Fetch categories from the database
        const cats = await categoryService.getCategories()
        setCategories(cats)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      
      <HeroBanner />
      <GiftCardGrid />
      <FeaturedProducts products={featuredProducts} loading={loading} />
    </div>
  )
}
