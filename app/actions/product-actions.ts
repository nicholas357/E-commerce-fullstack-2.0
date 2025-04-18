"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getEnv } from "@/lib/config"

export async function uploadProductImage(formData: FormData) {
  try {
    const imageFile = formData.get("image") as File

    if (!imageFile || imageFile.size === 0) {
      return { error: "No image provided" }
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(imageFile.type)) {
      return { error: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF" }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (imageFile.size > maxSize) {
      return { error: "Image must be less than 5MB" }
    }

    // Create Supabase client with explicit URL and key
    const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL")
    const supabaseKey = getEnv("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase URL or key is missing")
    }

    const supabase = createClient()

    const fileExt = imageFile.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) {
      console.error("Error uploading image:", uploadError)
      return { error: `Image upload failed: ${uploadError.message}` }
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath)

    if (!urlData) {
      return { error: "Failed to get public URL for uploaded image" }
    }

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Error in uploadProductImage:", error)
    return { error: "An unexpected error occurred during image upload" }
  }
}

export async function saveProduct(productData: any, productId?: string) {
  try {
    const supabase = createClient()

    if (productId) {
      // Update existing product
      const { error } = await supabase
        .from("products")
        .update({
          ...productData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId)

      if (error) throw error

      revalidatePath("/admin/products")
      return { success: true, id: productId }
    } else {
      // Create new product
      const { data, error } = await supabase
        .from("products")
        .insert({
          ...productData,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (error) throw error

      revalidatePath("/admin/products")
      return { success: true, id: data.id }
    }
  } catch (error) {
    console.error("Error in saveProduct:", error)
    return { error: "Failed to save product" }
  }
}
