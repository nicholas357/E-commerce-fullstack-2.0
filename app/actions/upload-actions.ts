"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function uploadPaymentProof(file: File) {
  try {
    // Create a server-side Supabase client
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key to bypass RLS
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: "", ...options })
            } catch (error) {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    )

    // Generate a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${crypto.randomUUID()}-${Date.now()}.${fileExt}`
    const filePath = `payment-proofs/${fileName}`

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from("payment-proofs").upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      console.error("Error uploading file:", error)
      throw new Error(`File upload failed: ${error.message}`)
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("payment-proofs").getPublicUrl(filePath)

    return { success: true, filePath, publicUrl }
  } catch (error) {
    console.error("Error in uploadPaymentProof:", error)
    return {
      success: false,
      error:
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "Failed to upload payment proof",
    }
  }
}
