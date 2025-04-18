"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Home, ChevronRight } from "lucide-react"
import { ProductDetail } from "@/components/product-detail"
import { ProductReviews } from "@/components/product-reviews"
import { RelatedProducts } from "@/components/related-products"
import { ProductDetailSkeleton } from "@/components/product-detail-skeleton"
import { ProductReviewsSkeleton } from "@/components/product-reviews-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductSkeleton } from "@/components/product-skeleton"
import { productService } from "@/lib/product-service"
import { categoryService } from "@/lib/category-service"
import { GamingButton } from "@/components/ui/gaming-button"

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("description")
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [categoryName, setCategoryName] = useState<string>("")
  const [streamingPlans, setStreamingPlans] = useState<any[]>([])
  const [gameEditions, setGameEditions] = useState<any[]>([])
  const [giftCardDenominations, setGiftCardDenominations] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)

      try {
        if (!id) {
          setError("Product ID is missing")
          setLoading(false)
          return
        }

        // Get the product from the database
        const fetchedProduct = await productService.getProductById(id as string)

        if (!fetchedProduct) {
          setError("Product not found")
          setLoading(false)
          return
        }

        // Set the product
        setProduct(fetchedProduct)

        // Get the category name
        if (fetchedProduct.category) {
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fetchedProduct.category)
          if (isUUID) {
            const name = await categoryService.getCategoryName(fetchedProduct.category)
            setCategoryName(name || "Uncategorized")
          } else {
            setCategoryName(fetchedProduct.category)
          }
        }

        // Get additional product data based on type
        if (fetchedProduct.is_subscription) {
          const plans = await productService.getStreamingPlans(fetchedProduct.id)
          setStreamingPlans(plans)
          fetchedProduct.streamingPlans = plans
        }

        if (fetchedProduct.category && fetchedProduct.category.includes("Games")) {
          const editions = await productService.getGameEditions(fetchedProduct.id)
          setGameEditions(editions)
          fetchedProduct.editions = editions
        }

        if (fetchedProduct.is_gift_card) {
          const denominations = await productService.getGiftCardDenominations(fetchedProduct.id)
          setGiftCardDenominations(denominations)
          fetchedProduct.denominations = denominations
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        setError("Failed to load product data")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  useEffect(() => {
    if (activeTab === "reviews" && product) {
      setReviewsLoading(true)
      // Fetch reviews
      setTimeout(() => {
        setReviewsLoading(false)
      }, 1000)
    }
  }, [activeTab, product])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Breadcrumb skeleton */}
        <div className="mb-8 flex items-center space-x-2">
          <Skeleton className="h-6 w-12 bg-muted" />
          <Skeleton className="h-4 w-4 rounded-full bg-muted" />
          <Skeleton className="h-6 w-24 bg-muted" />
          <Skeleton className="h-4 w-4 rounded-full bg-muted" />
          <Skeleton className="h-6 w-32 bg-muted" />
        </div>

        <ProductDetailSkeleton />

        {/* Tabs Skeleton */}
        <div className="mt-16">
          <div className="mb-6 flex border-b border-border">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="mx-2 h-10 w-24 bg-muted" />
              ))}
          </div>
          <Skeleton className="h-96 w-full rounded-lg bg-muted" />
        </div>

        {/* Related Products Skeleton */}
        <div className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-8 w-48 bg-muted" />
            <Skeleton className="h-10 w-24 bg-muted" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Back to home button */}
        <div className="mb-8">
          <GamingButton variant="outline" onClick={() => router.push("/")} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </GamingButton>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Product Not Found</h1>
          <p className="mb-6 text-gray-400">
            {error || "The product you're looking for doesn't exist or has been removed."}
          </p>
          <GamingButton variant="amber" onClick={() => router.push("/")}>
            Return to Homepage
          </GamingButton>
        </div>
      </div>
    )
  }

  // Determine if this is a streaming product
  const isStreaming =
    (categoryName && categoryName.includes("Streaming")) ||
    product.name.includes("Netflix") ||
    product.name.includes("Disney+") ||
    product.name.includes("Hulu") ||
    product.name.includes("Prime") ||
    product.name.includes("HBO") ||
    product.is_subscription

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Breadcrumb navigation */}
      <nav className="mb-8 flex flex-wrap items-center space-x-2 text-sm">
        <Link href="/" className="flex items-center text-gray-400 hover:text-amber-400">
          <Home className="mr-1 h-4 w-4" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-600" />
        {categoryName && (
          <>
            <Link
              href={`/category/${categoryName.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-gray-400 hover:text-amber-400"
            >
              {categoryName}
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </>
        )}
        <span className="truncate text-amber-400 max-w-[200px] sm:max-w-xs md:max-w-sm">{product.name}</span>
      </nav>

      <ProductDetail
        product={product}
        categoryName={categoryName}
        streamingPlans={streamingPlans}
        gameEditions={gameEditions}
        giftCardDenominations={giftCardDenominations}
      />

      {/* Tabs for additional information */}
      <div className="mt-16">
        <div className="mb-6 flex border-b border-border">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "description"
                ? "border-b-2 border-amber-500 text-amber-400 glow-text-amber"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "specifications"
                ? "border-b-2 border-amber-500 text-amber-400 glow-text-amber"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("specifications")}
          >
            Specifications
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "reviews"
                ? "border-b-2 border-amber-500 text-amber-400 glow-text-amber"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({product.reviewCount || 0})
          </button>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg border border-border bg-card p-6 shadow-lg"
        >
          {activeTab === "description" && (
            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-bold text-white">Product Description</h3>
              <p className="text-gray-400">
                {product.description ||
                  `Experience the ultimate ${isStreaming ? "streaming" : "gaming"} adventure with ${product.name}. This premium product offers exceptional quality and value for ${isStreaming ? "entertainment enthusiasts" : "gamers"} of all levels.`}
              </p>

              {categoryName === "Game Points" && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-white">Membership Benefits</h4>
                  <ul className="mt-3 list-disc pl-5 text-gray-400">
                    <li>Access to a growing library of high-quality games</li>
                    <li>Exclusive member discounts and deals</li>
                    <li>Free monthly games to keep</li>
                    <li>Online multiplayer access</li>
                    <li>Cloud saves and early access to select titles</li>
                  </ul>
                </div>
              )}

              {isStreaming && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-white">Subscription Benefits</h4>
                  <ul className="mt-3 list-disc pl-5 text-gray-400">
                    <li>Access to thousands of movies and TV shows</li>
                    <li>Watch on multiple devices including smart TVs, phones, tablets, and computers</li>
                    <li>Create multiple profiles for different viewers</li>
                    <li>Download content to watch offline</li>
                    <li>New content added regularly</li>
                    <li>Cancel anytime - no long-term contracts</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "specifications" && (
            <div>
              <h3 className="mb-4 text-xl font-bold text-white">Technical Specifications</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-md border border-border bg-muted/30 p-4">
                  <h4 className="mb-2 text-sm font-medium text-white">Product Details</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">Category</dt>
                      <dd className="text-sm font-medium text-white">{categoryName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">Release Date</dt>
                      <dd className="text-sm font-medium text-white">{product.release_date || "2023"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">Publisher</dt>
                      <dd className="text-sm font-medium text-white">
                        {product.publisher ||
                          (isStreaming
                            ? product.name.split(" ")[0]
                            : categoryName && categoryName.includes("Xbox")
                              ? "Microsoft"
                              : "Various")}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-400">Region</dt>
                      <dd className="text-sm font-medium text-white">{product.region || "Global"}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-md border border-border bg-muted/30 p-4">
                  <h4 className="mb-2 text-sm font-medium text-white">
                    {isStreaming ? "Streaming Requirements" : "System Requirements"}
                  </h4>
                  <dl className="space-y-2">
                    {isStreaming ? (
                      <>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-400">Internet Speed</dt>
                          <dd className="text-sm font-medium text-white">5+ Mbps recommended</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-400">Supported Devices</dt>
                          <dd className="text-sm font-medium text-white">Smart TVs, Mobile, Web, Consoles</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-400">Max Resolution</dt>
                          <dd className="text-sm font-medium text-white">Up to 4K UHD</dd>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-400">Platform</dt>
                          <dd className="text-sm font-medium text-white">
                            {product.platform ||
                              (categoryName && categoryName.includes("Xbox")
                                ? "Xbox Series X|S, Xbox One"
                                : categoryName && categoryName.includes("PlayStation")
                                  ? "PlayStation 5, PlayStation 4"
                                  : "Various")}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-400">Internet</dt>
                          <dd className="text-sm font-medium text-white">Required</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-400">Storage</dt>
                          <dd className="text-sm font-medium text-white">Varies by product</dd>
                        </div>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" &&
            (reviewsLoading ? (
              <ProductReviewsSkeleton />
            ) : (
              <ProductReviews
                productId={product.id}
                rating={product.rating || 4.5}
                reviewCount={product.reviewCount || 0}
              />
            ))}
        </motion.div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <RelatedProducts currentProductId={product.id} category={product.category} />
      </div>

      {/* Back to home floating button for mobile */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <Link href="/">
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-black shadow-lg shadow-amber-500/20 hover:bg-amber-400">
            <Home className="h-6 w-6" />
          </button>
        </Link>
      </div>
    </div>
  )
}
