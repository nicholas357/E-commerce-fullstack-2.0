import { GamingButton } from "@/components/ui/gaming-button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { GiftCardsClientWrapper } from "@/components/admin/gift-cards-client-wrapper"

export const metadata = {
  title: "Gift Cards Management | Admin",
}

export default function GiftCardsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gift Cards</h1>
        <Link href="/admin/gift-cards/new">
          <GamingButton variant="amber">
            <Plus className="mr-2 h-4 w-4" />
            Add Gift Card
          </GamingButton>
        </Link>
      </div>

      <GiftCardsClientWrapper />
    </div>
  )
}
