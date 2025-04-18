"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/product-service"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Eye, Gift, Gamepad2, Tv, Code, CreditCard } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"

interface ProductsTableProps {
  products: Product[]
  onDelete: (id: string) => void
}

export function ProductsTable({ products, onDelete }: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  // Get unique categories
  const categories = Array.from(new Set(products.map((product) => product.category)))

  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "" || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleDeleteClick = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      onDelete(id)
    }
  }

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Get product type icon
  const getProductTypeIcon = (product: Product) => {
    if (product.is_gift_card) {
      return <Gift className="h-4 w-4" />
    } else if (product.is_subscription) {
      return <Tv className="h-4 w-4" />
    } else if (product.category === "Software") {
      return <Code className="h-4 w-4" />
    } else if (product.category === "Game Points") {
      return <CreditCard className="h-4 w-4" />
    } else if (["Xbox Games", "PlayStation Games", "Nintendo Games"].includes(product.category)) {
      return <Gamepad2 className="h-4 w-4" />
    }
    return null
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full p-2 border border-gray-300 rounded bg-background text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full p-2 border border-gray-300 rounded bg-background text-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full bg-card">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Image</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <div className="w-12 h-12 relative">
                      <Image
                        src={product.image || "/placeholder.svg?height=48&width=48"}
                        alt={product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white">
                    <div className="font-medium">{product.name}</div>
                    {product.is_new && (
                      <Badge variant="amber" className="mt-1">
                        New
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-white">
                    {product.is_gift_card ? (
                      <div>
                        <span>From {formatPrice(product.price)}</span>
                        {product.denominations && (
                          <div className="text-xs text-gray-400 mt-1">{product.denominations.length} denominations</div>
                        )}
                      </div>
                    ) : product.is_subscription ? (
                      <div>
                        <span>Subscription</span>
                        <div className="text-xs text-gray-400 mt-1">Various plans</div>
                      </div>
                    ) : product.category === "Game Points" ? (
                      <div>
                        <span>{formatPrice(product.price)}</span>
                        <div className="text-xs text-gray-400 mt-1">
                          {product.points_amount} points {product.bonus_points ? `+ ${product.bonus_points} bonus` : ""}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {formatPrice(product.price)}
                        {product.original_price > 0 && product.original_price > product.price && (
                          <div className="text-xs text-gray-400 line-through mt-1">
                            {formatPrice(product.original_price)}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-white">{product.category}</td>
                  <td className="py-3 px-4">
                    {product.is_subscription ? (
                      <Badge variant="blue" className="flex items-center gap-1">
                        <Tv className="h-3 w-3" />
                        <span>Subscription</span>
                      </Badge>
                    ) : product.is_gift_card ? (
                      <Badge variant="green" className="flex items-center gap-1">
                        <Gift className="h-3 w-3" />
                        <span>Gift Card</span>
                      </Badge>
                    ) : product.category === "Game Points" ? (
                      <Badge variant="purple" className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        <span>Game Points</span>
                      </Badge>
                    ) : product.category === "Software" ? (
                      <Badge variant="cyan" className="flex items-center gap-1">
                        <Code className="h-3 w-3" />
                        <span>Software</span>
                      </Badge>
                    ) : ["Xbox Games", "PlayStation Games", "Nintendo Games"].includes(product.category) ? (
                      <Badge variant="amber" className="flex items-center gap-1">
                        <Gamepad2 className="h-3 w-3" />
                        <span>Game</span>
                      </Badge>
                    ) : (
                      <Badge variant="default">Standard</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      {product.in_stock ? (
                        <Badge variant="success" className="w-fit">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="w-fit">
                          Out of Stock
                        </Badge>
                      )}

                      {product.featured && (
                        <Badge variant="outline" className="w-fit">
                          Featured
                        </Badge>
                      )}

                      {product.is_digital && (
                        <Badge variant="secondary" className="w-fit">
                          Digital
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/products/edit/${product.id}`}>
                        <GamingButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </GamingButton>
                      </Link>
                      <Link href={`/product/${product.id}`} target="_blank">
                        <GamingButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </GamingButton>
                      </Link>
                      <GamingButton
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-400"
                        onClick={() => handleDeleteClick(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </GamingButton>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-6 px-4 text-center text-gray-400">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
