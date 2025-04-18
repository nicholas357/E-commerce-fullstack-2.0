import { createClient } from "@/lib/supabase/client"

export interface GiftCard {
  id: string
  name: string
  slug: string
  image: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
  denominations?: number[]
}

export interface GiftCardInput {
  name: string
  slug: string
  image: string
  description: string
  is_active: boolean
  denominations?: number[]
}

class GiftCardService {
  private supabase = createClient()
  private tableName = "gift_cards"
  private initialized = false

  async initializeTable(): Promise<void> {
    if (this.initialized) return

    try {
      // Check if table exists
      const { error: checkError } = await this.supabase.from(this.tableName).select("id").limit(1).maybeSingle()

      if (checkError && checkError.message.includes("does not exist")) {
        // Create the table
        const { error: createError } = await this.supabase.rpc("create_gift_cards_table")

        if (createError) {
          console.error("Error creating gift cards table:", createError)
          throw new Error(`Failed to create gift cards table: ${createError.message}`)
        }

        console.log("Gift cards table created successfully")
      }

      this.initialized = true
    } catch (error) {
      console.error("Error initializing gift cards table:", error)
      throw error
    }
  }

  async getActiveGiftCards(): Promise<GiftCard[]> {
    await this.initializeTable()

    const { data, error } = await this.supabase.from(this.tableName).select("*").eq("is_active", true).order("name")

    if (error) {
      console.error("Error fetching active gift cards:", error)
      throw error
    }

    return data || []
  }

  async getAllGiftCards(): Promise<GiftCard[]> {
    await this.initializeTable()

    const { data, error } = await this.supabase.from(this.tableName).select("*").order("name")

    if (error) {
      console.error("Error fetching all gift cards:", error)
      throw error
    }

    return data || []
  }

  async getGiftCardById(id: string): Promise<GiftCard | null> {
    await this.initializeTable()

    const { data, error } = await this.supabase.from(this.tableName).select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Not found
      }
      console.error("Error fetching gift card by ID:", error)
      throw error
    }

    return data
  }

  async getGiftCardBySlug(slug: string): Promise<GiftCard | null> {
    await this.initializeTable()

    const { data, error } = await this.supabase.from(this.tableName).select("*").eq("slug", slug).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Not found
      }
      console.error("Error fetching gift card by slug:", error)
      throw error
    }

    return data
  }

  async createGiftCard(giftCard: GiftCardInput): Promise<GiftCard> {
    await this.initializeTable()

    const { data, error } = await this.supabase.from(this.tableName).insert([giftCard]).select().single()

    if (error) {
      console.error("Error creating gift card:", error)
      throw error
    }

    return data
  }

  async updateGiftCard(id: string, giftCard: Partial<GiftCardInput>): Promise<GiftCard> {
    await this.initializeTable()

    const { data, error } = await this.supabase.from(this.tableName).update(giftCard).eq("id", id).select().single()

    if (error) {
      console.error("Error updating gift card:", error)
      throw error
    }

    return data
  }

   async deleteGiftCard(id: string): Promise<void> {
    await this.initializeTable()

    const { error } = await this.supabase.from(this.tableName).delete().eq("id", id)

    if (error) {
      console.error("Error deleting gift card:", error)
      throw error
    }
  }

  async uploadGiftCardImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `${fileName}`

    const { error } = await this.supabase.storage
      .from("gift-card-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      console.error("Error uploading image:", error)
      throw new Error("Failed to upload gift card image")
    }

    const { data } = this.supabase.storage
      .from("gift-card-images")
      .getPublicUrl(filePath)

    return data.publicUrl
  }
}

export const giftCardService = new GiftCardService()
