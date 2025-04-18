"use client"

import { useParams } from "next/navigation"
import { UserDetail } from "@/components/admin/user-detail"
import { GamingButton } from "@/components/ui/gaming-button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UserDetailPage() {
  const params = useParams()
  const userId = params.id as string

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white glow-text-amber">User Details</h1>
        <Link href="/admin/users">
          <GamingButton variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </GamingButton>
        </Link>
      </div>

      <UserDetail userId={userId} />
    </div>
  )
}
