import type { Metadata } from "next"
import Link from "next/link"
import { ImageIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Admin Settings",
  description: "Manage application settings",
}

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/settings/banners" passHref>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 h-5 w-5" />
                Banner Management
              </CardTitle>
              <CardDescription>Manage homepage banners and promotional images</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Add, edit, or remove banners that appear on the homepage. Set links and control their display order.
              </p>
              <Button variant="outline" className="w-full">
                Manage Banners
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Additional settings cards can be added here */}
      </div>
    </div>
  )
}
