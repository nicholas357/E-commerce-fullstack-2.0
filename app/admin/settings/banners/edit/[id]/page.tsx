import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import BannerForm from "@/components/admin/settings/banner-form"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

interface PageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: "Edit Banner",
  description: "Edit homepage banner",
}

export default async function EditBannerPage({ params }: PageProps) {
  const { id } = params
  const supabase = createClient()

  const { data: banner, error } = await supabase.from("banners").select("*").eq("id", id).single()

  if (error || !banner) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <AdminPageHeader title="Edit Banner" description={`Update banner: ${banner.title}`} icon="star" />

      <div className="bg-card border border-border rounded-lg shadow-lg p-6 mt-6">
        <BannerForm banner={banner} />
      </div>
    </div>
  )
}
