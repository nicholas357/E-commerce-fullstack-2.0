"use client"

import { Suspense } from "react"
import { GiftCardsTable } from "./gift-cards-table"
import { Spinner } from "@/components/ui/spinner"

export function GiftCardsClientWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      }
    >
      <GiftCardsTable />
    </Suspense>
  )
}
