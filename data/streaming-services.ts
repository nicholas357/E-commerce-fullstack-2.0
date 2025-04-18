import type { ProductProps } from "@/components/product-card"

// Define types for streaming plans and durations
export interface StreamingPlan {
  id: string
  name: string
  screens: number
  quality: string
  description: string
  durations: StreamingDuration[]
}

export interface StreamingDuration {
  id: string
  name: string
  months: number
  price: number
  discount: number
}

export const streamingServices: ProductProps[] = [
  {
    id: "netflix-1",
    name: "Netflix Subscription",
    image: "/images/streaming/netflix.png",
    price: 2499, // Standard plan price (default display price)
    minPrice: 1999,
    maxPrice: 3499,
    rating: 4.9,
    reviewCount: 512,
    category: "Streaming Services",
    inStock: true,
    isSubscription: true,
    description:
      "Watch unlimited movies, TV shows, and more on thousands of internet-connected devices. Stream on up to 4 screens at once in Ultra HD with the Premium plan.",
    streamingPlans: [
      {
        id: "basic",
        name: "Basic",
        screens: 1,
        quality: "SD",
        description: "1 screen, Standard Definition",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 1999, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 5499, discount: 8 },
          { id: "6months", name: "6 Months", months: 6, price: 10499, discount: 12 },
          { id: "12months", name: "12 Months", months: 12, price: 19999, discount: 16 },
        ],
      },
      {
        id: "standard",
        name: "Standard",
        screens: 2,
        quality: "HD",
        description: "2 screens, High Definition",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 2499, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 6999, discount: 7 },
          { id: "6months", name: "6 Months", months: 6, price: 13499, discount: 10 },
          { id: "12months", name: "12 Months", months: 12, price: 25999, discount: 13 },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        screens: 4,
        quality: "UHD",
        description: "4 screens, Ultra HD",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 3499, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 9999, discount: 5 },
          { id: "6months", name: "6 Months", months: 6, price: 18999, discount: 9 },
          { id: "12months", name: "12 Months", months: 12, price: 35999, discount: 14 },
        ],
      },
    ],
  },
  {
    id: "disney-1",
    name: "Disney+ Subscription",
    image: "/images/streaming/disney.png",
    price: 1999,
    minPrice: 1999,
    maxPrice: 2999,
    rating: 4.7,
    reviewCount: 324,
    category: "Streaming Services",
    inStock: true,
    isSubscription: true,
    description:
      "Stream exclusive Disney originals, Marvel, Star Wars, Pixar, National Geographic and more. Download content to watch offline. Stream on up to 4 devices at once.",
    streamingPlans: [
      {
        id: "basic",
        name: "Basic",
        screens: 2,
        quality: "HD",
        description: "2 screens, High Definition with ads",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 1499, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 3999, discount: 11 },
          { id: "6months", name: "6 Months", months: 6, price: 7499, discount: 16 },
          { id: "12months", name: "12 Months", months: 12, price: 13999, discount: 22 },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        screens: 4,
        quality: "UHD",
        description: "4 screens, Ultra HD, no ads",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 1999, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 5499, discount: 8 },
          { id: "6months", name: "6 Months", months: 6, price: 10499, discount: 12 },
          { id: "12months", name: "12 Months", months: 12, price: 19999, discount: 16 },
        ],
      },
      {
        id: "bundle",
        name: "Bundle",
        screens: 4,
        quality: "UHD",
        description: "Disney+, Hulu, and ESPN+ bundle",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 2999, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 8499, discount: 5 },
          { id: "6months", name: "6 Months", months: 6, price: 15999, discount: 11 },
          { id: "12months", name: "12 Months", months: 12, price: 29999, discount: 16 },
        ],
      },
    ],
  },
  {
    id: "hulu-1",
    name: "Hulu Subscription",
    image: "/images/streaming/hulu.png",
    price: 1499,
    minPrice: 1499,
    maxPrice: 2999,
    rating: 4.5,
    reviewCount: 287,
    category: "Streaming Services",
    inStock: true,
    isSubscription: true,
    description:
      "Stream thousands of shows and movies, with plans starting at $7.99/month. Stream on your favorite devices and switch plans or cancel anytime.",
    streamingPlans: [
      {
        id: "basic",
        name: "Basic",
        screens: 2,
        quality: "HD",
        description: "2 screens, with ads",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 1499, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 3999, discount: 11 },
          { id: "6months", name: "6 Months", months: 6, price: 7499, discount: 16 },
          { id: "12months", name: "12 Months", months: 12, price: 13999, discount: 22 },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        screens: 2,
        quality: "HD",
        description: "2 screens, no ads",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 2499, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 6999, discount: 7 },
          { id: "6months", name: "6 Months", months: 6, price: 13499, discount: 10 },
          { id: "12months", name: "12 Months", months: 12, price: 25999, discount: 13 },
        ],
      },
      {
        id: "live",
        name: "Live TV",
        screens: 2,
        quality: "HD",
        description: "Live TV + Hulu library with ads",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 6999, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 19999, discount: 5 },
          { id: "6months", name: "6 Months", months: 6, price: 38999, discount: 7 },
          { id: "12months", name: "12 Months", months: 12, price: 74999, discount: 11 },
        ],
      },
    ],
  },
  {
    id: "prime-1",
    name: "Amazon Prime Video",
    image: "/images/streaming/prime.png",
    price: 1999,
    minPrice: 1999,
    maxPrice: 2999,
    rating: 4.6,
    reviewCount: 356,
    category: "Streaming Services",
    inStock: true,
    isSubscription: true,
    description:
      "Watch movies, TV, and sports, including Amazon Originals like The Boys, The Wheel of Time, and the upcoming The Lord of the Rings series.",
    streamingPlans: [
      {
        id: "video",
        name: "Prime Video",
        screens: 3,
        quality: "UHD",
        description: "Prime Video only",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 1499, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 3999, discount: 11 },
          { id: "6months", name: "6 Months", months: 6, price: 7499, discount: 16 },
          { id: "12months", name: "12 Months", months: 12, price: 13999, discount: 22 },
        ],
      },
      {
        id: "prime",
        name: "Prime",
        screens: 3,
        quality: "UHD",
        description: "Prime Video + free shipping and more",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 1999, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 5499, discount: 8 },
          { id: "6months", name: "6 Months", months: 6, price: 10499, discount: 12 },
          { id: "12months", name: "12 Months", months: 12, price: 19999, discount: 16 },
        ],
      },
    ],
  },
  {
    id: "hbo-1",
    name: "HBO Max Subscription",
    image: "/images/streaming/hbo.png",
    price: 2499,
    minPrice: 2499,
    maxPrice: 3499,
    rating: 4.8,
    reviewCount: 298,
    category: "Streaming Services",
    inStock: true,
    isSubscription: true,
    description:
      "Stream all of HBO together with even more of your favorite movies, series, and Max Originals in one place. Watch on multiple devices and create up to 5 viewer profiles.",
    streamingPlans: [
      {
        id: "basic",
        name: "With Ads",
        screens: 2,
        quality: "HD",
        description: "2 screens, with ads",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 1999, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 5499, discount: 8 },
          { id: "6months", name: "6 Months", months: 6, price: 10499, discount: 12 },
          { id: "12months", name: "12 Months", months: 12, price: 19999, discount: 16 },
        ],
      },
      {
        id: "premium",
        name: "Ad-Free",
        screens: 3,
        quality: "UHD",
        description: "3 screens, no ads, 4K UHD",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 2499, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 6999, discount: 7 },
          { id: "6months", name: "6 Months", months: 6, price: 13499, discount: 10 },
          { id: "12months", name: "12 Months", months: 12, price: 25999, discount: 13 },
        ],
      },
      {
        id: "ultimate",
        name: "Ultimate",
        screens: 4,
        quality: "UHD",
        description: "4 screens, no ads, 4K UHD, 100+ channels",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 3499, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 9999, discount: 5 },
          { id: "6months", name: "6 Months", months: 6, price: 18999, discount: 9 },
          { id: "12months", name: "12 Months", months: 12, price: 35999, discount: 14 },
        ],
      },
    ],
  },
  {
    id: "apple-1",
    name: "Apple TV+ Subscription",
    image: "/images/streaming/apple.png",
    price: 1499,
    minPrice: 1499,
    maxPrice: 2499,
    rating: 4.4,
    reviewCount: 187,
    category: "Streaming Services",
    inStock: true,
    isSubscription: true,
    description:
      "Stream award-winning Apple Originals on the Apple TV app. Watch on Apple devices, smart TVs, and streaming devices. Share with up to 5 family members.",
    streamingPlans: [
      {
        id: "individual",
        name: "Individual",
        screens: 1,
        quality: "UHD",
        description: "For one person",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 1499, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 3999, discount: 11 },
          { id: "6months", name: "6 Months", months: 6, price: 7499, discount: 16 },
          { id: "12months", name: "12 Months", months: 12, price: 13999, discount: 22 },
        ],
      },
      {
        id: "family",
        name: "Family",
        screens: 6,
        quality: "UHD",
        description: "Share with up to 5 family members",
        durations: [
          { id: "1month", name: "1 Month", months: 1, price: 2499, discount: 0 },
          { id: "3months", name: "3 Months", months: 3, price: 6999, discount: 7 },
          { id: "6months", name: "6 Months", months: 6, price: 13499, discount: 10 },
          { id: "12months", name: "12 Months", months: 12, price: 25999, discount: 13 },
        ],
      },
    ],
  },
]
