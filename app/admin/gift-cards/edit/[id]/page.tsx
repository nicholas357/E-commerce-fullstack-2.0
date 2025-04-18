import { GiftCardForm } from "@/components/admin/gift-card-form"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { giftCardService } from "@/lib/gift-card-service"

interface EditGiftCardPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: EditGiftCardPageProps) {
  const giftCard = await giftCardService.getGiftCardById(params.id)
  return {
    title: `Edit ${giftCard?.name || "Gift Card"} | Admin`,
    description: `Edit gift card details for ${giftCard?.name || "gift card"}`,
  }
}

export default function EditGiftCardPage({ params }: EditGiftCardPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminPageHeader title="Edit Gift Card" description="Update gift card details" backHref="/admin/gift-cards" />

      <div className="mt-6">
        <GiftCardForm giftCardId={params.id} />
      </div>
    </div>
  )
}
