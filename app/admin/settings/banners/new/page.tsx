import type { Metadata } from "next"
import BannerForm from "@/components/admin/settings/banner-form"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

export const metadata: Metadata = {
  title: "Add New Banner",
  description: "Create a new homepage banner",
}

export default function NewBannerPage() {
  return (
    <div className="container mx-auto py-6">
      <AdminPageHeader
        title="Add New Banner"
        description="Create a banner to display on the homepage carousel"
        icon="star"
      />

      <div className="bg-card border border-border rounded-lg shadow-lg p-6 mt-6">
        <BannerForm />
      </div>
    </div>
  )
}
