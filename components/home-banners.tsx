"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { type Banner, bannerService } from "@/lib/banner-service"
import { Spinner } from "@/components/ui/spinner"

export default function HomeBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentBanner, setCurrentBanner] = useState(0)

  useEffect(() => {
    const loadBanners = async () => {
      setIsLoading(true)
      const data = await bannerService.getActiveBanners()
      setBanners(data)
      setIsLoading(false)
    }

    loadBanners()
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 5000) // Change banner every 5 seconds

    return () => clearInterval(interval)
  }, [banners.length])

  if (isLoading) {
    return (
      <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <div className="relative w-full">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentBanner * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="w-full flex-shrink-0">
              {banner.link_url ? (
                <Link href={banner.link_url}>
                  <div className="relative w-full aspect-[16/5]">
                    <Image
                      src={banner.image_url || "/placeholder.svg"}
                      alt={banner.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    {(banner.title || banner.description) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                        {banner.title && <h2 className="text-xl font-bold">{banner.title}</h2>}
                        {banner.description && <p className="text-sm mt-1">{banner.description}</p>}
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <div
                  className="relative w-full aspect-[16/5]"
                  style={{
                    backgroundImage: `url(${banner.image_url || "/placeholder.svg"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {(banner.title || banner.description) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                      {banner.title && <h2 className="text-xl font-bold">{banner.title}</h2>}
                      {banner.description && <p className="text-sm mt-1">{banner.description}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${index === currentBanner ? "bg-white" : "bg-white/50"}`}
              onClick={() => setCurrentBanner(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
