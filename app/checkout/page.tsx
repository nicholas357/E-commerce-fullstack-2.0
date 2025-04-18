"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { ShippingForm } from "@/components/checkout/shipping-form"
import { PaymentMethod } from "@/components/checkout/payment-method"
import { PaymentProof } from "@/components/checkout/payment-proof"
import { CheckoutSummary } from "@/components/checkout/checkout-summary"
import { useToast } from "@/components/ui/toast-provider"
import { AnimatePresence, motion } from "framer-motion"
import { CheckoutSteps } from "@/components/checkout/checkout-steps"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type CheckoutStep = "shipping" | "payment" | "proof"

// Valid product types according to the database constraint
type ValidProductType = "gift_card" | "game_points" | "xbox_game" | "streaming_service" | "software"

// Helper function to map category to valid product type
function mapCategoryToProductType(category: string): ValidProductType {
  // Map the category to a valid product type
  const categoryMap: Record<string, ValidProductType> = {
    "gift-cards": "gift_card",
    "gift cards": "gift_card",
    "Gift Cards": "gift_card",
    "game-points": "game_points",
    "game points": "game_points",
    "Game Points": "game_points",
    "xbox-games": "xbox_game",
    "xbox games": "xbox_game",
    "Xbox Games": "xbox_game",
    "streaming-services": "streaming_service",
    "streaming services": "streaming_service",
    "Streaming Services": "streaming_service",
    software: "software",
    Software: "software",
    // Add more mappings as needed
  }

  // Return the mapped product type or a default one if not found
  return categoryMap[category] || "software"
}

// Helper function to normalize database category to valid product type
function normalizeDatabaseCategory(category: string): ValidProductType {
  if (!category) return "software"

  // Convert to lowercase for case-insensitive matching
  const lowerCategory = category.toLowerCase()

  if (lowerCategory.includes("gift") || lowerCategory.includes("card")) return "gift_card"
  if (lowerCategory.includes("game") && lowerCategory.includes("point")) return "game_points"
  if (lowerCategory.includes("xbox") || lowerCategory.includes("game")) return "xbox_game"
  if (lowerCategory.includes("stream")) return "streaming_service"
  if (lowerCategory.includes("software")) return "software"

  return "software" // Default fallback
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping")
  const [isLoading, setIsLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)

  // Use refs to track state without causing re-renders
  const navigationAttemptedRef = useRef(false)

  // Form data
  const [shippingData, setShippingData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  })
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("esewa")

  // Initial page load effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Check for empty cart and user authentication
  useEffect(() => {
    // Skip navigation checks if we're already navigating away
    if (navigationAttemptedRef.current) return

    // Redirect to cart if cart is empty
    if (items.length === 0) {
      router.push("/cart")
      return
    }

    // Redirect to login if not logged in
    if (!user) {
      localStorage.setItem("redirectAfterLogin", "/checkout")
      router.push("/account/login")
      return
    }

    // Pre-fill email if available
    if (user?.email) {
      setShippingData((prev) => ({
        ...prev,
        email: user.email || "",
      }))
    }
  }, [items.length, user, router])

  // Handle successful order completion and navigation
  const handleOrderSuccess = (orderId: string) => {
    // Prevent multiple navigation attempts
    if (navigationAttemptedRef.current) return
    navigationAttemptedRef.current = true

    // Store the order ID for the success page
    sessionStorage.setItem("lastOrderId", orderId)
    sessionStorage.setItem("cartCleared", "true")

    // Clear the cart
    clearCart()

    // Use Next.js router for a smoother transition
    router.push(`/checkout/success?orderId=${orderId}`)
  }

  const handleShippingSubmit = (data: typeof shippingData) => {
    setIsTransitioning(true)
    setShippingData(data)

    // Add a small delay to create a smooth transition effect
    setTimeout(() => {
      setCurrentStep("payment")
      window.scrollTo({ top: 0, behavior: "smooth" })
      setIsTransitioning(false)
    }, 300)
  }

  const handlePaymentMethodSelect = (method: string) => {
    setIsTransitioning(true)
    setSelectedPaymentMethod(method)

    // Add a small delay to create a smooth transition effect
    setTimeout(() => {
      setCurrentStep("proof")
      window.scrollTo({ top: 0, behavior: "smooth" })
      setIsTransitioning(false)
    }, 300)
  }

  const handlePaymentProofSubmit = async (file: File, txnId: string) => {
    // Prevent multiple submissions
    if (isLoading || navigationAttemptedRef.current) return

    console.log("Payment proof submission handler started")

    if (!file) {
      addToast({
        title: "Error",
        description: "Please upload a payment proof image",
        type: "error",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create a unique filename
      const supabase = createClient()
      const userId = user?.id

      if (!userId) {
        throw new Error("User not authenticated")
      }

      // Check if the bucket exists first
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((bucket) => bucket.name === "payment-proofs")

      if (!bucketExists) {
        try {
          await supabase.storage.createBucket("payment-proofs", {
            public: false,
            fileSizeLimit: 5242880, // 5MB
          })
        } catch (bucketError) {
          console.error("Error creating bucket:", bucketError)
          // Continue anyway, the bucket might already exist
        }
      }

      // Create a unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `payment-proofs/${fileName}`

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, file)

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
        throw new Error(`Failed to upload payment proof: ${uploadError.message}`)
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("payment-proofs").getPublicUrl(filePath)

      // 2. Create shipping address
      const { data: shippingAddressData, error: shippingAddressError } = await supabase
        .from("shipping_addresses")
        .insert({
          user_id: userId,
          full_name: shippingData.fullName,
          phone: shippingData.phone,
          address_line1: shippingData.address,
          city: shippingData.city,
          country: "Nepal", // Default
          is_default: true,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (shippingAddressError) {
        console.error("Error creating shipping address:", shippingAddressError)
        throw new Error("Failed to create shipping address: " + shippingAddressError.message)
      }

      // 3. Create the order
      const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
        Math.random() * 10000,
      )
        .toString()
        .padStart(4, "0")}`

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: userId,
          status: "pending",
          payment_status: "verification_submitted",
          payment_method: selectedPaymentMethod,
          subtotal: Math.round(totalPrice), // Convert to integer
          shipping_fee: 0,
          tax: 0,
          discount: 0,
          total: Math.round(totalPrice), // Convert to integer
          shipping_address_id: shippingAddressData.id,
          billing_address_id: shippingAddressData.id,
          notes: shippingData.notes,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (orderError) {
        console.error("Error creating order:", orderError)
        throw new Error("Failed to create order: " + orderError.message)
      }

      // 4. First, check if the products exist in the database
      const productIds = await Promise.all(
        items.map(async (item) => {
          // Check if the product exists
          const { data: existingProducts, error: queryError } = await supabase
            .from("products")
            .select("id, category")
            .eq("name", item.name)
            .limit(1)

          if (queryError) {
            console.error("Error querying products:", queryError)
            throw new Error("Failed to query products: " + queryError.message)
          }

          // If the product exists, use its ID
          if (existingProducts && existingProducts.length > 0) {
            return {
              id: existingProducts[0].id,
              // Normalize the category from the database to ensure it matches the constraint
              productType: normalizeDatabaseCategory(existingProducts[0].category),
            }
          }

          // If the product doesn't exist, create it
          const productType = mapCategoryToProductType(item.category)

          // Generate a UUID for the product
          const { data: uuidData } = await supabase.rpc("uuid_generate_v4")
          const productId = uuidData

          const { data: newProduct, error: insertError } = await supabase
            .from("products")
            .insert({
              id: productId,
              name: item.name,
              description: `${item.name} - ${productType}`,
              price: Math.round(item.price),
              category: productType, // Use the normalized product type as the category
              image: item.image || null,
              is_featured: false,
              in_stock: true,
              is_new: false,
              created_at: new Date().toISOString(),
            })
            .select("id")
            .single()

          if (insertError) {
            console.error("Error creating product:", insertError)
            throw new Error("Failed to create product: " + insertError.message)
          }

          return {
            id: newProduct.id,
            productType,
          }
        }),
      )

      // 5. Create order items with the actual product IDs and correct product types
      const orderItems = items.map((item, index) => {
        return {
          order_id: orderData.id,
          product_id: productIds[index].id,
          product_name: item.name,
          product_type: productIds[index].productType, // Use the normalized product type
          quantity: item.quantity,
          unit_price: Math.round(item.price), // Convert to integer
          subtotal: Math.round(item.price * item.quantity), // Convert to integer
          is_delivered: false,
          created_at: new Date().toISOString(),
        }
      })

      // Log the order items for debugging
      console.log("Creating order items:", JSON.stringify(orderItems, null, 2))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("Error creating order items:", itemsError)
        throw new Error("Failed to create order items: " + itemsError.message)
      }

      // 6. Upload payment proof
      const { error: proofError } = await supabase.from("payment_proofs").insert({
        order_id: orderData.id,
        file_url: publicUrl,
        payment_method: selectedPaymentMethod,
        transaction_id: txnId || null,
        amount: Math.round(totalPrice), // Convert to integer
        uploaded_at: new Date().toISOString(),
        notes: `Payment proof uploaded by user for ${selectedPaymentMethod}`,
        verified: false,
      })

      if (proofError) {
        console.error("Error creating payment proof:", proofError)
        throw new Error("Failed to upload payment proof: " + proofError.message)
      }

      // Show success message
      addToast({
        title: "Order Placed Successfully",
        description: "Your order has been placed and is awaiting verification.",
        type: "success",
      })

      // Handle successful order completion
      handleOrderSuccess(orderData.id)
    } catch (error) {
      console.error("Error processing order:", error)

      // Log detailed error information
      if (error instanceof Error) {
        console.error("Error name:", error.name)
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      }

      // Show a more specific error message to the user
      let errorMessage = "There was an error processing your order. Please try again."

      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes("storage")) {
          errorMessage = "There was a problem uploading your payment proof. Please try a different image."
        } else if (error.message.includes("permission") || error.message.includes("access")) {
          errorMessage = "You don't have permission to complete this action. Please log in again."
        } else if (error.message.includes("constraint")) {
          errorMessage = "There was a problem with your order data. Please check your information and try again."
        }
      }

      addToast({
        title: "Error",
        description: errorMessage,
        type: "error",
      })
    } finally {
      console.log("Setting loading state to false")
      setIsLoading(false)
    }
  }

  const goBack = (step: CheckoutStep) => {
    setIsTransitioning(true)

    setTimeout(() => {
      setCurrentStep(step)
      window.scrollTo({ top: 0, behavior: "smooth" })
      setIsTransitioning(false)
    }, 300)
  }

  if (!pageLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-10 w-1/4 bg-muted rounded"></div>
          <div className="h-4 w-1/2 bg-muted rounded"></div>

          <div className="flex justify-between items-center">
            <div className="h-8 w-24 bg-muted rounded"></div>
            <div className="h-8 w-24 bg-muted rounded"></div>
            <div className="h-8 w-24 bg-muted rounded"></div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-border bg-card p-6 min-h-[400px]">
                <div className="space-y-6">
                  <div className="h-8 w-1/3 bg-muted rounded"></div>
                  <div className="space-y-4">
                    <div className="h-10 bg-muted rounded"></div>
                    <div className="h-10 bg-muted rounded"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="rounded-lg border border-border bg-card p-6 min-h-[300px]">
                <div className="space-y-4">
                  <div className="h-6 w-1/2 bg-muted rounded"></div>
                  <div className="h-20 bg-muted rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-6 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-2 text-gray-500">Complete your purchase by following these steps</p>
      </div>

      {/* Checkout Steps */}
      <CheckoutSteps currentStep={currentStep} />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-card p-6 relative min-h-[400px] shadow-sm">
            {isTransitioning && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10 backdrop-blur-sm rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            )}

            <AnimatePresence mode="wait">
              {currentStep === "shipping" && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <ShippingForm initialData={shippingData} onSubmit={handleShippingSubmit} />
                </motion.div>
              )}

              {currentStep === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <PaymentMethod
                    onSelect={handlePaymentMethodSelect}
                    selectedMethod={selectedPaymentMethod}
                    onBack={() => goBack("shipping")}
                  />
                </motion.div>
              )}

              {currentStep === "proof" && (
                <motion.div
                  key="proof"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <PaymentProof
                    paymentMethod={selectedPaymentMethod}
                    onSubmit={handlePaymentProofSubmit}
                    isLoading={isLoading}
                    onBack={() => goBack("payment")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CheckoutSummary
              items={items}
              totalPrice={totalPrice}
              shippingDetails={currentStep !== "shipping" ? shippingData : undefined}
              paymentMethod={currentStep === "proof" ? selectedPaymentMethod : undefined}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
