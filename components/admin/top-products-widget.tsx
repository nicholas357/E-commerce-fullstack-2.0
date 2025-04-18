"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Package, ExternalLink } from "lucide-react"
import Link from "next/link"

interface TopProduct {
  id: string
  name: string
  price: number
  image: string
  order_count: number
}

export function TopProductsWidget() {
  const [products, setProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        // This is a simplified approach - in a real app, you would have a more sophisticated query
        // that counts orders for each product and sorts by that count

        // Get order items grouped by product
        const { data: orderItems, error: orderError } = await supabase
          .from("order_items")
          .select("product_id, product_name")

        if (orderError) throw new Error(`Error fetching order items: ${orderError.message}`)

        // Count occurrences of each product
        const productCounts: Record<string, { id: string; name: string; count: number }> = {}

        orderItems.forEach((item) => {
          if (!productCounts[item.product_id]) {
            productCounts[item.product_id] = {
              id: item.product_id,
              name: item.product_name,
              count: 0,
            }
          }
          productCounts[item.product_id].count++
        })

        // Convert to array and sort by count
        const sortedProducts = Object.values(productCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        // Get additional product details
        const topProducts = await Promise.all(
          sortedProducts.map(async (product) => {
            const { data, error } = await supabase.from("products").select("price, image").eq("id", product.id).single()

            if (error) {
              console.error(`Error fetching product ${product.id}:`, error)
              return {
                id: product.id,
                name: product.name,
                price: 0,
                image: "/assorted-products-display.png",
                order_count: product.count,
              }
            }

            return {
              id: product.id,
              name: product.name,
              price: data.price,
              image: data.image || "/assorted-products-display.png",
              order_count: product.count,
            }
          }),
        )

        setProducts(topProducts)
      } catch (err) {
        console.error("Error fetching top products:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchTopProducts()
  }, [])

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error loading top products: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          <Package className="mr-2 h-5 w-5 text-amber-400 inline" />
          Top Selling Products
        </CardTitle>
        <Link href="/admin/products" className="text-sm text-amber-400 hover:text-amber-300 flex items-center">
          View all
          <ExternalLink className="ml-1 h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 pb-2 border-b border-border animate-pulse">
                <div className="h-10 w-10 bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-700 rounded"></div>
                  <div className="h-3 w-16 bg-gray-700 rounded mt-1"></div>
                </div>
                <div className="h-4 w-16 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No products found</div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <Link
                href={`/admin/products/enhanced/edit/${product.id}`}
                key={product.id}
                className="flex items-center gap-3 pb-2 border-b border-border hover:bg-gray-800/30 p-2 rounded-md transition-colors block"
              >
                <div className="h-10 w-10 bg-gray-800 rounded overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/assorted-products-display.png"
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white truncate">{product.name}</div>
                  <div className="text-sm text-gray-400">
                    ${Number.parseFloat(product.price.toString()).toLocaleString()}
                  </div>
                </div>
                <div className="text-amber-400 font-medium">{product.order_count} orders</div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
