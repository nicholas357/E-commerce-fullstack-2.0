"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Users, ShoppingBag, Package, TrendingUp, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { DashboardSkeleton } from "@/components/admin/dashboard-skeleton"
import { StatsCard } from "@/components/admin/stats-card"
import { RecentOrdersWidget } from "@/components/admin/recent-orders-widget"
import { TopProductsWidget } from "@/components/admin/top-products-widget"
import Link from "next/link"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    recentOrders: 0,
    revenue: 0,
    growth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        // Get total users count
        const { count: usersCount, error: usersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })

        if (usersError) throw new Error(`Error fetching users: ${usersError.message}`)

        // Get total products count
        const { count: productsCount, error: productsError } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })

        if (productsError) throw new Error(`Error fetching products: ${productsError.message}`)

        // Get total orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })

        if (ordersError) throw new Error(`Error fetching orders: ${ordersError.message}`)

        // Get recent orders (last 24 hours)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayISOString = yesterday.toISOString()

        const { count: recentOrdersCount, error: recentOrdersError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .gte("created_at", yesterdayISOString)

        if (recentOrdersError) throw new Error(`Error fetching recent orders: ${recentOrdersError.message}`)

        // Calculate revenue from completed orders
        const { data: completedOrders, error: revenueError } = await supabase
          .from("orders")
          .select("total")
          .in("status", ["completed", "delivered"])

        if (revenueError) throw new Error(`Error calculating revenue: ${revenueError.message}`)

        const totalRevenue =
          completedOrders?.reduce((sum, order) => sum + (Number.parseFloat(order.total) || 0), 0) || 0

        // Calculate month-over-month growth (simplified example)
        // In a real app, you would compare current month's revenue with previous month
        const { data: lastMonthOrders, error: growthError } = await supabase
          .from("orders")
          .select("total, created_at")
          .in("status", ["completed", "delivered"])

        if (growthError) throw new Error(`Error calculating growth: ${growthError.message}`)

        // Get current month's revenue
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const currentMonthOrders = lastMonthOrders?.filter((order) => {
          const orderDate = new Date(order.created_at)
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
        })
        const currentMonthRevenue =
          currentMonthOrders?.reduce((sum, order) => sum + (Number.parseFloat(order.total) || 0), 0) || 0

        // Get previous month's revenue
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
        const prevMonthOrders = lastMonthOrders?.filter((order) => {
          const orderDate = new Date(order.created_at)
          return orderDate.getMonth() === prevMonth && orderDate.getFullYear() === prevYear
        })
        const prevMonthRevenue =
          prevMonthOrders?.reduce((sum, order) => sum + (Number.parseFloat(order.total) || 0), 0) || 1 // Avoid division by zero

        // Calculate growth percentage
        const growthRate =
          prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0

        setStats({
          totalUsers: usersCount || 0,
          totalProducts: productsCount || 0,
          totalOrders: ordersCount || 0,
          recentOrders: recentOrdersCount || 0,
          revenue: totalRevenue,
          growth: Number.parseFloat(growthRate.toFixed(1)),
        })
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Set up a refresh interval (every 5 minutes)
    const intervalId = setInterval(fetchStats, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-red-500 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-amber-500 text-black rounded-md hover:bg-amber-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white glow-text-amber">Admin Dashboard</h1>
        <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleString()}</span>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard title="Total Users" value={stats.totalUsers} description="Registered accounts" icon={Users} />

            <StatsCard
              title="Total Products"
              value={stats.totalProducts}
              description="Active listings"
              icon={Package}
            />

            <StatsCard title="Total Orders" value={stats.totalOrders} description="All time" icon={ShoppingBag} />

            <StatsCard title="Recent Orders" value={stats.recentOrders} description="Last 24 hours" icon={TrendingUp} />

            <StatsCard
              title="Revenue"
              value={`$${stats.revenue.toLocaleString()}`}
              description="From completed orders"
              icon={DollarSign}
            />

            <StatsCard
              title="Growth"
              value={`${stats.growth > 0 ? "+" : ""}${stats.growth}%`}
              description="Month over month"
              icon={BarChart}
              trend={{
                value: stats.growth,
                isPositive: stats.growth >= 0,
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Detailed analytics will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Report generation will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <TopProductsWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersWidget />

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/admin/products/enhanced/new"
                className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 text-white hover:bg-amber-500/20 transition-colors block text-center"
              >
                <Package className="h-6 w-6 mb-2 mx-auto text-amber-400" />
                <span>Add Product</span>
              </Link>
              <Link
                href="/admin/users"
                className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 text-white hover:bg-amber-500/20 transition-colors block text-center"
              >
                <Users className="h-6 w-6 mb-2 mx-auto text-amber-400" />
                <span>Manage Users</span>
              </Link>
              <Link
                href="/admin/orders"
                className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 text-white hover:bg-amber-500/20 transition-colors block text-center"
              >
                <ShoppingBag className="h-6 w-6 mb-2 mx-auto text-amber-400" />
                <span>View Orders</span>
              </Link>
              <Link
                href="/admin/categories"
                className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 text-white hover:bg-amber-500/20 transition-colors block text-center"
              >
                <BarChart className="h-6 w-6 mb-2 mx-auto text-amber-400" />
                <span>Categories</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
