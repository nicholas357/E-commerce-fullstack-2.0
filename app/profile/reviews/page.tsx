import { ProfileLayout } from "@/components/profile/profile-layout"
import { UserReviews } from "@/components/profile/user-reviews"

export const metadata = {
  title: "My Reviews",
  description: "Manage your product reviews",
}

export default function ProfileReviewsPage() {
  return (
    <ProfileLayout>
      <UserReviews />
    </ProfileLayout>
  )
}
