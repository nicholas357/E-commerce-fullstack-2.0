import type { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName } = await req.json()

    // Validate required fields
    if (!userId || !email || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create a Supabase client with server-side permissions
    const supabase = createServerClient()

    // Check if profile already exists
    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", userId).single()

    if (existingProfile) {
      // Profile already exists, return success
      return NextResponse.json({ success: true, message: "Profile already exists" }, { status: 200 })
    }

    // Create the profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
      email: email,
      role: "user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      return NextResponse.json({ error: `Failed to create profile: ${profileError.message}` }, { status: 500 })
    }

    // Return success
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Error in create-profile API:", error)
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 })
  }
}
