"use server"

import { createServerClient } from "@supabase/supabase-js"

export async function processCheckout(formData: FormData) {
  try {
    // Create a Supabase client with service role key to bypass RLS
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        persistSession: false,
      },
      db: {
        schema: "public",
      },
      global: {
        fetch: fetch.bind(globalThis),
      },
    })

    // Extract data from form
    const userId = formData.get("userId") as string
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const notes = formData.get("notes") as string
    const paymentMethod = formData.get("paymentMethod") as string
    const transactionId = formData.get("transactionId") as string
    const totalPrice = Number.parseInt(formData.get("totalPrice") as string)
    const cartItems = JSON.parse(formData.get("cartItems") as string)
    const paymentProofFile = formData.get("paymentProof") as File

    // Validate required fields
    if (!userId || !fullName || !email || !phone || !address || !city || !paymentMethod || !paymentProofFile) {
      return {
        success: false,
        error: "Missing required fields. Please fill in all required information.",
      }
    }

    // Validate file
    if (!paymentProofFile || !(paymentProofFile instanceof File)) {
      return {
        success: false,
        error: "Payment proof file is missing or invalid. Please upload your payment proof again.",
      }
    }

    // Generate order number early to use in file path
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
      Math.random() * 10000,
    )
      .toString()
      .padStart(4, "0")}`

    // 1. Prepare file upload (but don't upload yet)
    const fileExt = paymentProofFile.name.split(".").pop()
    const fileName = `${orderNumber}-${Date.now()}.${fileExt}`
    const filePath = `payment-proofs/${fileName}`
    const arrayBuffer = await paymentProofFile.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // 2. Start parallel operations for better performance
    // Create shipping address and upload file in parallel
    const [shippingAddressResult, fileUploadResult] = await Promise.all([
      // Create shipping address
      supabase
        .from("shipping_addresses")
        .insert({
          user_id: userId,
          full_name: fullName,
          phone: phone,
          address_line1: address,
          city: city,
          country: "Nepal", // Default
          is_default: true,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single(),

      // Upload file
      supabase.storage
        .from("payment-proofs")
        .upload(filePath, fileBuffer, {
          contentType: paymentProofFile.type,
          upsert: true, // Use upsert to avoid conflicts
          cacheControl: "3600",
        }),
    ])

    // Check for shipping address error
    if (shippingAddressResult.error) {
      console.error("Error creating shipping address:", shippingAddressResult.error)
      return { success: false, error: "Failed to create shipping address" }
    }

    // Check for file upload error
    if (fileUploadResult.error) {
      console.error("Error uploading file:", fileUploadResult.error)
      return { success: false, error: `File upload failed: ${fileUploadResult.error.message}` }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("payment-proofs").getPublicUrl(filePath)

    // 3. Create the order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userId,
        status: "pending",
        payment_status: "verification_submitted",
        payment_method: paymentMethod,
        subtotal: totalPrice,
        shipping_fee: 0,
        tax: 0,
        discount: 0,
        total: totalPrice,
        shipping_address_id: shippingAddressResult.data.id,
        billing_address_id: shippingAddressResult.data.id,
        notes: notes,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return { success: false, error: "Failed to create order" }
    }

    // 4. Prepare order items
    const orderItems = cartItems.map((item: any) => ({
      order_id: orderData.id,
      product_id: item.id,
      product_name: item.name,
      product_type: item.category,
      quantity: item.quantity,
      unit_price: Math.round(item.price),
      subtotal: Math.round(item.price * item.quantity),
      plan_id: item.planId || null,
      duration_id: item.durationId || null,
      is_delivered: false,
      created_at: new Date().toISOString(),
    }))

    // 5. Create payment proof and order items in parallel
    const [orderItemsResult, paymentProofResult] = await Promise.all([
      // Insert order items
      supabase
        .from("order_items")
        .insert(orderItems),

      // Create payment proof
      supabase
        .from("payment_proofs")
        .insert({
          order_id: orderData.id,
          file_url: publicUrl,
          payment_method: paymentMethod,
          transaction_id: transactionId || null,
          amount: totalPrice,
          uploaded_at: new Date().toISOString(),
          notes: `Payment proof uploaded by user for ${paymentMethod}`,
          verified: false,
        }),
    ])

    // Check for order items error
    if (orderItemsResult.error) {
      console.error("Error creating order items:", orderItemsResult.error)
      return { success: false, error: "Failed to create order items" }
    }

    // Check for payment proof error
    if (paymentProofResult.error) {
      console.error("Error creating payment proof:", paymentProofResult.error)
      return { success: false, error: "Failed to upload payment proof" }
    }

    return { success: true, orderId: orderData.id }
  } catch (error) {
    console.error("Error processing order:", error)
    return {
      success: false,
      error:
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "There was an error processing your order. Please try again.",
    }
  }
}
