import Cookies from "js-cookie"

// Default cookie options
const DEFAULT_OPTIONS = {
  expires: 30, // 30 days
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
}

/**
 * Set a cookie with the given name and value
 */
export function setCookie(name: string, value: any, options = {}) {
  try {
    const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value)
    return Cookies.set(name, stringValue, { ...DEFAULT_OPTIONS, ...options })
  } catch (error) {
    console.error(`Error setting cookie ${name}:`, error)
    return null
  }
}

/**
 * Get a cookie by name
 */
export function getCookie(name: string) {
  try {
    const value = Cookies.get(name)
    if (!value) return null

    // Try to parse as JSON, if it fails return the string value
    try {
      return JSON.parse(value)
    } catch (error) {
      // If it's not valid JSON, return the raw value
      return value
    }
  } catch (error) {
    console.error(`Error getting cookie ${name}:`, error)
    return null
  }
}

/**
 * Remove a cookie by name
 */
export function removeCookie(name: string, options = {}) {
  try {
    return Cookies.remove(name, { ...options, path: "/" })
  } catch (error) {
    console.error(`Error removing cookie ${name}:`, error)
    return null
  }
}
