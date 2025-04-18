"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProductsTable } from "@/components/admin/products-table"
import { productService, type Product } from "@/lib/product-service"
import { useAuth } from "@/context/auth-context"
import { GamingButton } from "@/components/ui/gaming-button"
import { Plus } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { isAdmin, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return

    if (!isAdmin) {
      router.push("/account/login")
      return
    }

    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts()
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [isAdmin, router, authLoading])

  const handleDelete = async (id: string) => {
    try {
      await productService.deleteProduct(id)
      setProducts(products.filter((product) => product.id !== id))
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white glow-text-amber">Products</h1>
        <Link href="/admin/products/new">
          <GamingButton variant="amber" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </GamingButton>
        </Link>
      </div>

      <ProductsTable products={products} onDelete={handleDelete} />
    </div>
  )
}
