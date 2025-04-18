import { OrdersTableSkeleton } from "@/components/admin/orders-table-skeleton"

export default function OrdersLoading() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground">Manage and process customer orders</p>
      </div>

      <OrdersTableSkeleton />
    </div>
  )
}
