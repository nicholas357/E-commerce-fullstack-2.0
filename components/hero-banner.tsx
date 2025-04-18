"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GamingButton } from "@/components/ui/gaming-button"
import { bannerService } from "@/lib/banner-service"

export function HeroBanner() {
  const [banners, setBanners] = useState([
    {
      id: 1,
      image: "/placeholder.svg",
      alt: "Loading Banner...",
      link: null,
    },
  ])
  const [currentBanner, setCurrentBanner] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Use a ref to track the interval
  const intervalRef = useRef(null)

  const nextBanner = useCallback(() => {
    if (banners.length <= 1) return

    setCurrentBanner((prev) => {
      const next = (prev + 1) % banners.length
      return next
    })
  }, [banners])

  const prevBanner = useCallback(() => {
    if (banners.length <= 1) return
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners])

  // Reset current banner when banners change
  useEffect(() => {
    setCurrentBanner(0)
  }, [banners])

  // Separate effect for fetching banners
  useEffect(() => {
    const fetchBanners = async () => {
      setIsLoading(true)
      try {
        const fetchedBanners = await bannerService.getActiveBanners()
        if (fetchedBanners && fetchedBanners.length > 0) {
          // Map to the format we need and limit to 3 banners
          const formattedBanners = fetchedBanners.slice(0, 3).map((banner) => ({
            id: banner.id,
            image: banner.image_url,
            alt: banner.title,
            link: banner.link_url || null, // Ensure link is null if not provided
          }))
          console.log("Fetched banners:", formattedBanners)
          setBanners(formattedBanners)
        } else {
          console.log("No active banners found")
        }
      } catch (error) {
        console.error("Error fetching banners:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBanners()
  }, [])

  // Completely separate effect for auto-sliding
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Only set up auto-sliding if conditions are met
    if (!isPaused && !isLoading && banners.length > 1) {
      // Create new interval
      intervalRef.current = setInterval(() => {
        nextBanner()
      }, 5000)
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPaused, isLoading, banners.length, nextBanner])

  // Don't render navigation if there's only one banner
  const showNavigation = banners.length > 1 && !isLoading

  // Get current banner
  const currentBannerData = banners[currentBanner] || { image: "/placeholder.svg", alt: "Banner", link: null }
  const hasLink = !!currentBannerData.link

  // Debug the current banner
  console.log("Current banner:", currentBannerData)

  // Handle banner click
  const handleBannerClick = () => {
    if (hasLink) {
      console.log("Banner clicked, navigating to:", currentBannerData.link)
      window.location.href = currentBannerData.link
    }
  }

  return (
    <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative aspect-[21/9] w-full overflow-hidden scanline ${hasLink ? "cursor-pointer" : ""}`}
          onClick={hasLink ? handleBannerClick : undefined}
        >
          <Image
            src={currentBannerData.image || "/placeholder.svg"}
            alt={currentBannerData.alt}
            fill
            className="object-cover"
            priority
          />

          {/* Overlay gradient - make sure it doesn't block clicks */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none"></div>

          {/* Grid overlay - make sure it doesn't block clicks */}
          <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Only show indicators if there are multiple banners */}
      {showNavigation && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-8 rounded-full transition-all ${
                index === currentBanner ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)]" : "bg-white/30"
              }`}
              onClick={() => setCurrentBanner(index)}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      )}

      {/* Only show navigation buttons if there are multiple banners */}
      {showNavigation && (
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-4 sm:px-6 md:px-8 z-10">
          <GamingButton
            variant="amber"
            size="icon"
            onClick={(e) => {
              e.stopPropagation() // Prevent triggering banner click
              prevBanner()
            }}
            className="opacity-70 transition-opacity hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </GamingButton>

          <GamingButton
            variant="amber"
            size="icon"
            onClick={(e) => {
              e.stopPropagation() // Prevent triggering banner click
              nextBanner()
            }}
            className="opacity-70 transition-opacity hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </GamingButton>
        </div>
      )}
    </div>
  )
}
