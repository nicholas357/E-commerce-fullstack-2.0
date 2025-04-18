import { Suspense } from "react"
import { notFound } from "next/navigation"
import { OrderDetail } from "@/components/admin/order-detail"
import { OrderDetailSkeleton } from "@/components/admin/order-detail-skeleton"
import { adminService } from "@/lib/admin-service"

interface OrderDetailPageProps {
  params: {
    id: string
  }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  // Fetch the order data
  try {
    const order = await adminService.getOrderById(params.id)

    if (!order) {
      return notFound()
    }

    return (
      <Suspense fallback={<OrderDetailSkeleton />}>
        <OrderDetail order={order} />
      </Suspense>
    )
  } catch (error) {
    console.error("Error fetching order:", error)
    return notFound()
  }
}
