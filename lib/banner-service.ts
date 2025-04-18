"use client"

import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"

export type Banner = {
  id: string
  title: string
  description: string | null
  image_url: string
  link_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type BannerFormData = {
  title: string
  description?: string
  image_url: string
  link_url?: string
  is_active: boolean
  display_order: number
}

export const bannerService = {
  // Get all banners
  getAllBanners: async (): Promise<Banner[]> => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase.from("banners").select("*").order("display_order", { ascending: true })

      if (error) {
        console.error("Error fetching banners:", error)
        toast({
          title: "Error",
          description: `Failed to fetch banners: ${error.message}`,
          variant: "destructive",
        })
        return []
      }

      return data || []
    } catch (error: any) {
      console.error("Error fetching banners:", error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
      return []
    }
  },

  // Get active banners for the homepage
  getActiveBanners: async (): Promise<Banner[]> => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })

      if (error) {
        console.error("Error fetching active banners:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching active banners:", error)
      return []
    }
  },

  // Get a banner by ID
  getBannerById: async (id: string): Promise<Banner | null> => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase.from("banners").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching banner:", error)
        toast({
          title: "Error",
          description: `Failed to fetch banner: ${error.message}`,
          variant: "destructive",
        })
        return null
      }

      return data
    } catch (error: any) {
      console.error("Error fetching banner:", error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
      return null
    }
  },

  // Create a new banner
  createBanner: async (bannerData: BannerFormData): Promise<Banner | null> => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase.from("banners").insert([bannerData]).select().single()

      if (error) {
        console.error("Error creating banner:", error)
        toast({
          title: "Error",
          description: `Failed to create banner: ${error.message}`,
          variant: "destructive",
        })
        return null
      }

      toast({
        title: "Success",
        description: "Banner created successfully",
      })

      return data
    } catch (error: any) {
      console.error("Error creating banner:", error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
      return null
    }
  },

  // Update an existing banner
  updateBanner: async (id: string, bannerData: Partial<BannerFormData>): Promise<Banner | null> => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("banners")
        .update({
          ...bannerData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating banner:", error)
        toast({
          title: "Error",
          description: `Failed to update banner: ${error.message}`,
          variant: "destructive",
        })
        return null
      }

      toast({
        title: "Success",
        description: "Banner updated successfully",
      })

      return data
    } catch (error: any) {
      console.error("Error updating banner:", error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
      return null
    }
  },

  // Delete a banner
  deleteBanner: async (id: string): Promise<boolean> => {
    try {
      const supabase = createClient()

      const { error } = await supabase.from("banners").delete().eq("id", id)

      if (error) {
        console.error("Error deleting banner:", error)
        toast({
          title: "Error",
          description: `Failed to delete banner: ${error.message}`,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Success",
        description: "Banner deleted successfully",
      })

      return true
    } catch (error: any) {
      console.error("Error deleting banner:", error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
      return false
    }
  },

  // Upload banner image
  uploadBannerImage: async (file: File): Promise<string | null> => {
    try {
      const supabase = createClient()

      // Skip bucket creation - bucket should be created in Supabase dashboard
      // Generate a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload the file
      const { error: uploadError, data: uploadData } = await supabase.storage.from("banners").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        console.error("Error uploading image:", uploadError)

        // Check if error is related to missing bucket
        if (uploadError.message.includes("bucket not found")) {
          toast({
            title: "Storage Error",
            description: "The 'banners' bucket doesn't exist. Please contact an administrator to create it.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: `Failed to upload image: ${uploadError.message}`,
            variant: "destructive",
          })
        }
        return null
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("banners").getPublicUrl(filePath)

      return publicUrl
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
      return null
    }
  },

  // Delete banner image
  deleteBannerImage: async (imageUrl: string): Promise<boolean> => {
    try {
      const supabase = createClient()

      // Extract the file path from the URL
      const urlParts = imageUrl.split("/")
      const filePath = urlParts[urlParts.length - 1]

      const { error } = await supabase.storage.from("banners").remove([filePath])

      if (error) {
        console.error("Error deleting image:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error deleting image:", error)
      return false
    }
  },

  // Reorder banners
  reorderBanners: async (bannerIds: string[]): Promise<boolean> => {
    try {
      const supabase = createClient()

      // Update each banner with its new order
      const promises = bannerIds.map((id, index) => {
        return supabase
          .from("banners")
          .update({ display_order: index, updated_at: new Date().toISOString() })
          .eq("id", id)
      })

      await Promise.all(promises)

      toast({
        title: "Success",
        description: "Banner order updated successfully",
      })

      return true
    } catch (error: any) {
      console.error("Error reordering banners:", error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
      return false
    }
  },
}
