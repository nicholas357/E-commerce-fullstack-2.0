"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { giftCardService, type GiftCard } from "@/lib/gift-card-service"
import { GamingButton } from "@/components/ui/gaming-button"
import { useToast } from "@/components/ui/toast-provider"
import { Spinner } from "@/components/ui/spinner"
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
import { Edit, Trash2, Eye, Plus } from "lucide-react"

export function GiftCardsTable() {
  const router = useRouter()
  const { addToast } = useToast()
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [tableCreated, setTableCreated] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchGiftCards = async () => {
      try {
        setError(null)
        const data = await giftCardService.getAllGiftCards()
        if (isMounted) {
          setGiftCards(data)
          setTableCreated(true)
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching gift cards:", err)
          if (err.message?.includes("does not exist")) {
            setError("The gift cards table doesn't exist yet. Click 'Create Table' to set it up.")
          } else {
            setError("Failed to load gift cards. Please try again.")
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchGiftCards()

    return () => {
      isMounted = false
    }
  }, [tableCreated])

  const handleCreateTable = () => {
    setIsLoading(true)

    giftCardService
      .initializeTable()
      .then(() => {
        setTableCreated(true)
        addToast({
          title: "Success",
          description: "Gift cards table created successfully.",
          type: "success",
        })
      })
      .catch((err) => {
        console.error("Error creating gift cards table:", err)
        setError("Failed to create gift cards table. Please try again.")
        addToast({
          title: "Error",
          description: "Failed to create gift cards table. Please try again.",
          type: "error",
        })
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleDelete = (id: string) => {
    setIsDeleting(true)

    giftCardService
      .deleteGiftCard(id)
      .then(() => {
        setGiftCards((prev) => prev.filter((card) => card.id !== id))
        addToast({
          title: "Gift card deleted",
          description: "The gift card has been deleted successfully.",
          type: "success",
        })
      })
      .catch((err) => {
        console.error("Error deleting gift card:", err)
        addToast({
          title: "Error",
          description: "Failed to delete gift card. Please try again.",
          type: "error",
        })
      })
      .finally(() => {
        setIsDeleting(false)
        setDeleteId(null)
      })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error && error.includes("doesn't exist yet")) {
    return (
      <div className="rounded-md bg-card p-6 text-center border border-border">
        <p className="text-muted-foreground mb-4">{error}</p>
        <GamingButton variant="amber" onClick={handleCreateTable} disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : "Create Table"}
        </GamingButton>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-500/10 p-6 text-center">
        <p className="text-red-500">{error}</p>
        <GamingButton variant="outline" className="mt-4" onClick={() => router.refresh()}>
          Try Again
        </GamingButton>
      </div>
    )
  }

  if (giftCards.length === 0) {
    return (
      <div className="rounded-md bg-card p-6 text-center border border-border">
        <p className="text-muted-foreground mb-4">No gift cards found.</p>
        <Link href="/admin/gift-cards/new">
          <GamingButton variant="amber">
            <Plus className="mr-2 h-4 w-4" />
            Add Gift Card
          </GamingButton>
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full">
        <thead className="bg-card">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-white">Image</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white">Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white">Denominations</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {giftCards.map((giftCard) => (
            <tr key={giftCard.id} className="bg-background hover:bg-card/50">
              <td className="px-4 py-3">
                <div className="h-12 w-12 overflow-hidden rounded-md">
                  <Image
                    src={giftCard.image || "/placeholder.svg"}
                    alt={giftCard.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-white">{giftCard.name}</p>
                  <p className="text-xs text-muted-foreground">{giftCard.slug}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    giftCard.is_active ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {giftCard.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {giftCard.denominations?.map((denom, i) => (
                    <span
                      key={i}
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        denom.is_default ? "bg-amber-500/10 text-amber-500" : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      NPR {denom.value.toLocaleString()}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex space-x-2">
                  <Link href={`/gift-cards/${giftCard.slug}`}>
                    <GamingButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </GamingButton>
                  </Link>
                  <Link href={`/admin/gift-cards/edit/${giftCard.id}`}>
                    <GamingButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </GamingButton>
                  </Link>
                  <AlertDialog open={deleteId === giftCard.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogTrigger asChild>
                      <GamingButton
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        onClick={() => setDeleteId(giftCard.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </GamingButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Gift Card</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the gift card "{giftCard.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.preventDefault()
                            handleDelete(giftCard.id)
                          }}
                          disabled={isDeleting}
                          className="bg-red-500 text-white hover:bg-red-600"
                        >
                          {isDeleting ? <Spinner size="sm" /> : "Delete"}
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
  )
}
