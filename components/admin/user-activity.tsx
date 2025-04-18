"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { ShoppingCart, Heart, Star, Clock } from "lucide-react"

type UserActivity = {
  userId: string
  orders: number
  wishlistItems: number
  reviews: number
  lastActive: string | null
}

export function UserActivity({ userId }: { userId: string }) {
  const [activity, setActivity] = useState<UserActivity>({
    userId,
    orders: 0,
    wishlistItems: 0,
    reviews: 0,
    lastActive: null,
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchUserActivity() {
      setLoading(true)
      try {
        // Fetch order count
        const { data: orderData, error: orderError } = await supabase.from("orders").select("id").eq("user_id", userId)

        // Fetch wishlist count
        const { data: wishlistData, error: wishlistError } = await supabase
          .from("wishlist_items")
          .select("id")
          .eq("user_id", userId)

        // Fetch reviews count
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("product_reviews")
          .select("id")
          .eq("user_id", userId)

        // Fetch last login time
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

        setActivity({
          userId,
          orders: orderData?.length || 0,
          wishlistItems: wishlistData?.length || 0,
          reviews: reviewsData?.length || 0,
          lastActive: userData?.user?.last_sign_in_at || null,
        })
      } catch (error) {
        console.error("Error fetching user activity:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserActivity()
    }
  }, [userId, supabase])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2 text-amber-500" />
            Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? <div className="h-8 w-12 bg-gray-700 animate-pulse rounded" /> : activity.orders}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Heart className="h-4 w-4 mr-2 text-red-500" />
            Wishlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? <div className="h-8 w-12 bg-gray-700 animate-pulse rounded" /> : activity.wishlistItems}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? <div className="h-8 w-12 bg-gray-700 animate-pulse rounded" /> : activity.reviews}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-500" />
            Last Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium">
            {loading ? (
              <div className="h-8 w-full bg-gray-700 animate-pulse rounded" />
            ) : activity.lastActive ? (
              new Date(activity.lastActive).toLocaleDateString()
            ) : (
              "Never"
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
