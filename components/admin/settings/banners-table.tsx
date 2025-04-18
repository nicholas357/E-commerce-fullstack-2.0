"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { type Banner, bannerService } from "@/lib/banner-service"
import { GamingButton } from "@/components/ui/gaming-button"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus, ExternalLink, ImageOff } from "lucide-react"

export default function BannersTable() {
  const router = useRouter()
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    setIsLoading(true)
    const data = await bannerService.getAllBanners()
    setBanners(data)
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const banner = banners.find((b) => b.id === id)
      if (banner) {
        // Delete the image first if it exists
        if (banner.image_url) {
          await bannerService.deleteBannerImage(banner.image_url)
        }
      }

      // Then delete the banner record
      const success = await bannerService.deleteBanner(id)
      if (success) {
        setBanners(banners.filter((banner) => banner.id !== id))
      }
    } finally {
      setDeletingId(null)
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return

    const newBanners = [...banners]
    const temp = newBanners[index]
    newBanners[index] = newBanners[index - 1]
    newBanners[index - 1] = temp

    // Update display order
    const updatedIds = newBanners.map((banner) => banner.id)
    await bannerService.reorderBanners(updatedIds)

    setBanners(newBanners)
  }

  const handleMoveDown = async (index: number) => {
    if (index >= banners.length - 1) return

    const newBanners = [...banners]
    const temp = newBanners[index]
    newBanners[index] = newBanners[index + 1]
    newBanners[index + 1] = temp

    // Update display order
    const updatedIds = newBanners.map((banner) => banner.id)
    await bannerService.reorderBanners(updatedIds)

    setBanners(newBanners)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Spinner size="lg" className="mb-4" />
        <p className="text-gray-400 animate-pulse">Loading banners...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Home Page Banners</h2>
        <GamingButton onClick={() => router.push("/admin/settings/banners/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Banner
        </GamingButton>
      </div>

      {banners.length === 0 ? (
        <div className="text-center py-12 border border-gray-700 rounded-lg bg-card">
          <ImageOff className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 mb-4">No banners found</p>
          <GamingButton onClick={() => router.push("/admin/settings/banners/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Banner
          </GamingButton>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-700 rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-gray-300">
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Link</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {banners.map((banner, index) => (
                <tr key={banner.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="relative w-32 h-16 rounded overflow-hidden border border-gray-700">
                      <Image
                        src={banner.image_url || "/placeholder.svg"}
                        alt={banner.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{banner.title}</td>
                  <td className="px-4 py-3">
                    {banner.link_url ? (
                      <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-amber-400 hover:text-amber-300 hover:underline"
                      >
                        {banner.link_url.substring(0, 20)}
                        {banner.link_url.length > 20 ? "..." : ""}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-gray-500">No link</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {banner.is_active ? (
                      <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-700">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-800 text-gray-400 border-gray-700">
                        Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className="mr-2 text-white">{banner.display_order}</span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-gray-400"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === banners.length - 1}
                          className="text-gray-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-gray-400"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/settings/banners/edit/${banner.id}`)}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-900/50 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-900 border-gray-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Banner</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Are you sure you want to delete this banner? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(banner.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {deletingId === banner.id ? <Spinner className="mr-2" size="sm" /> : null}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
