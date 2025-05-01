/**
 * Helper function to extract the Supabase project reference ID
 */

export function getProjectRef(): string {
  // Try to extract from environment variable
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    // Extract project ref from URL (usually in format https://{project-ref}.supabase.co)
    const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
    if (match && match[1]) {
      return match[1]
    }
  }

  // Fallback to a default or extracted from window location
  if (typeof window !== "undefined") {
    // Try to extract from localStorage if Supabase stored it there
    const supabaseItems = Object.keys(localStorage).filter(
      (key) => key.startsWith("sb-") && key.endsWith("-auth-token"),
    )

    if (supabaseItems.length > 0) {
      // Extract project ref from the key
      const match = supabaseItems[0].match(/sb-([^-]+)-/)
      if (match && match[1]) {
        return match[1]
      }
    }

    // Try to extract from cookies
    const cookies = document.cookie.split(";").map((c) => c.trim())
    const supabaseCookies = cookies.filter((c) => c.startsWith("sb-") && c.includes("-auth-token="))

    if (supabaseCookies.length > 0) {
      const cookieName = supabaseCookies[0].split("=")[0]
      const match = cookieName.match(/sb-([^-]+)-/)
      if (match && match[1]) {
        return match[1]
      }
    }
  }

  // If all else fails, return a hardcoded value based on your project
  // You should replace this with your actual project ref if known
  return "turgame"
}
