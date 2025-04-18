import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { path: string } }) {
  try {
    const supabase = createClient()

    // Get the file path from the URL
    const path = params.path

    if (!path) {
      return new NextResponse("File path is required", { status: 400 })
    }

    // Get the file from Supabase Storage
    const { data, error } = await supabase.storage.from("payment_proofs").download(path)

    if (error) {
      console.error("Error fetching payment proof:", error)
      return new NextResponse("File not found", { status: 404 })
    }

    // Return the file with appropriate content type
    const headers = new Headers()
    headers.set("Content-Type", getContentType(path))
    headers.set("Cache-Control", "public, max-age=31536000, immutable")

    return new NextResponse(data, { headers })
  } catch (error) {
    console.error("Error in payment proof API:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// Helper function to determine content type
function getContentType(path: string): string {
  const extension = path.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "png":
      return "image/png"
    case "jpg":
    case "jpeg":
      return "image/jpeg"
    case "gif":
      return "image/gif"
    case "webp":
      return "image/webp"
    case "pdf":
      return "application/pdf"
    default:
      return "application/octet-stream"
  }
}
