import Link from "next/link"
import { GamingButton } from "@/components/ui/gaming-button"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10">
        <ShieldAlert className="h-12 w-12 text-red-500" />
      </div>
      <h1 className="mb-4 text-3xl font-bold text-white">Access Denied</h1>
      <p className="mb-8 max-w-md text-gray-400">
        You don't have permission to access this page. Please contact an administrator if you believe this is an error.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link href="/">
          <GamingButton variant="amber">Return to Home</GamingButton>
        </Link>
        <Link href="/account/login">
          <GamingButton variant="outline">Sign In</GamingButton>
        </Link>
      </div>
    </div>
  )
}
