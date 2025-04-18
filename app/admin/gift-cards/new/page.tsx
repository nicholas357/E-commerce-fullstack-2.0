import { GiftCardForm } from "@/components/admin/gift-card-form"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

export const metadata = {
  title: "Add New Gift Card | Admin",
  description: "Add a new gift card to your store",
}

export default function NewGiftCardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminPageHeader
        title="Add New Gift Card"
        description="Create a new gift card for your store"
        backHref="/admin/gift-cards"
      />

      <div className="mt-6">
        <GiftCardForm />
      </div>
    </div>
  )
}
