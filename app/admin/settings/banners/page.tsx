import type { Metadata } from "next"
import BannersTable from "@/components/admin/settings/banners-table"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

export const metadata: Metadata = {
  title: "Banner Management",
  description: "Manage homepage banners",
}

export default function BannersPage() {
  return (
    <div className="container mx-auto py-6">
      <AdminPageHeader
        title="Banner Management"
        description="Create and manage banners for the homepage carousel"
        icon="star"
      />

      <div className="mt-6">
        <BannersTable />
      </div>
    </div>
  )
}
