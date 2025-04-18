export interface Product {
  id: string
  name: string
  description?: string
  price: number
  category: string
  image?: string
  featured: boolean
  stock: number
  original_price?: number
  min_price?: number
  max_price?: number
  in_stock: boolean
  is_new: boolean
  is_digital: boolean
  is_subscription: boolean
  is_gift_card: boolean
  rating?: number
  reviewCount?: number
  streamingPlans?: StreamingPlan[]

  // Gift card specific
  redemption_instructions?: string
  validity_days?: number
  denominations?: GiftCardDenomination[]

  // Game specific
  platform?: string
  release_date?: string
  publisher?: string
  genre?: string
  editions?: GameEdition[]

  // Software specific
  product_code?: string
  region?: string
  system_requirements?: string
  license_types?: SoftwareLicense[]

  // Game points specific
  points_amount?: number
  bonus_points?: number
  game_service?: string

  created_at: Date
  updated_at?: Date
}

export interface GiftCardDenomination {
  id?: string
  product_id?: string
  value: number
  is_default: boolean
  created_at?: Date
}

export interface SoftwareLicense {
  id?: string
  product_id?: string
  name: string
  duration: string
  price: number
  created_at?: Date
}

export interface GameEdition {
  id?: string
  product_id?: string
  name: string
  description?: string
  price: number
  created_at?: Date
}

export interface StreamingPlan {
  id?: string
  product_id: string
  plan_id: string
  name: string
  screens: number
  quality: string
  description?: string
  durations: StreamingDuration[]
  created_at?: Date
  updated_at?: Date
}

export interface StreamingDuration {
  id?: string
  plan_id?: string
  duration_id: string
  name: string
  months: number
  price: number
  discount: number
  created_at?: Date
  updated_at?: Date
}

export type ProductType = "standard" | "gift_card" | "streaming" | "game_points" | "software"

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parent_id?: string
  display_order: number
  is_active: boolean
  created_at: Date
  updated_at?: Date
  icon?: string
  show_in_navbar: boolean
}
