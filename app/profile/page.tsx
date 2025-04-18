import { ProfileLayout } from "@/components/profile/profile-layout"
import { UserReviews } from "@/components/profile/user-reviews"

export const metadata = {
  title: "My Profile",
  description: "Manage your account settings and preferences",
}

export default function ProfilePage() {
  return (
    <ProfileLayout>
      <UserReviews />
    </ProfileLayout>
  )
}
