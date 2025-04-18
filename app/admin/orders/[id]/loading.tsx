import { OrderDetailSkeleton } from "@/components/admin/order-detail-skeleton"

export default function OrderDetailLoading() {
  return (
    <div className="p-6">
      <OrderDetailSkeleton />
    </div>
  )
}
