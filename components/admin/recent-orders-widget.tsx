"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { ShoppingBag, ExternalLink } from "lucide-react"
import Link from "next/link"

interface RecentOrder {
  id: string
  order_number: string
  created_at: string
  total: number
  status: string
  user?: {
    full_name: string | null
    email: string | null
  }
}

export function RecentOrdersWidget() {
  const [orders, setOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        // Get recent orders
        const { data, error } = await supabase
          .from("orders")
          .select(`
            id,
            order_number,
            created_at,
            total,
            status,
            user_id
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) throw new Error(`Error fetching orders: ${error.message}`)

        // Get user information for each order
        const ordersWithUsers = await Promise.all(
          data.map(async (order) => {
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", order.user_id)
              .single()

            if (userError) {
              console.error(`Error fetching user for order ${order.id}:`, userError)
              return {
                ...order,
                user: {
                  full_name: "Unknown",
                  email: "unknown@example.com",
                },
              }
            }

            return {
              ...order,
              user: userData,
            }
          }),
        )

        setOrders(ordersWithUsers)
      } catch (err) {
        console.error("Error fetching recent orders:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchRecentOrders()

    // Refresh every 5 minutes
    const intervalId = setInterval(fetchRecentOrders, 5 * 60 * 1000)
    return () => clearInterval(intervalId)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500"
      case "processing":
        return "text-blue-500"
      case "cancelled":
        return "text-red-500"
      case "pending":
        return "text-yellow-500"
      default:
        return "text-gray-500"
    }
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error loading recent orders: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          <ShoppingBag className="mr-2 h-5 w-5 text-amber-400 inline" />
          Recent Orders
        </CardTitle>
        <Link href="/admin/orders" className="text-sm text-amber-400 hover:text-amber-300 flex items-center">
          View all
          <ExternalLink className="ml-1 h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center pb-2 border-b border-border animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-700 rounded"></div>
                  <div className="h-3 w-32 bg-gray-700 rounded"></div>
                </div>
                <div className="h-4 w-16 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No orders found</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                href={`/admin/orders/${order.id}`}
                key={order.id}
                className="flex justify-between items-center pb-2 border-b border-border hover:bg-gray-800/30 p-2 rounded-md transition-colors block"
              >
                <div>
                  <div className="font-medium text-white">{order.order_number}</div>
                  <div className="text-sm text-gray-400">
                    {order.user?.full_name || "Unknown"} • {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-3">
                    ${Number.parseFloat(order.total.toString()).toLocaleString()}
                  </span>
                  <span className={`text-sm ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
