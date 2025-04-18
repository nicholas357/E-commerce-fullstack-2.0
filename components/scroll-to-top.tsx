"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function ScrollToTop() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Scroll to top when pathname or search params change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant", // Use "instant" instead of "smooth" to avoid animation conflicts
    })
  }, [pathname, searchParams])

  return null // This component doesn't render anything
}
