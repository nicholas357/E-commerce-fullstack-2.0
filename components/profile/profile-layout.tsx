import type React from "react"
import { ProfileNav } from "./profile-nav"

interface ProfileLayoutProps {
  children: React.ReactNode
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
          <ProfileNav />
        </div>
        <div className="w-full md:w-3/4">{children}</div>
      </div>
    </div>
  )
}
