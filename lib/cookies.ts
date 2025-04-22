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
  const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value)
  return Cookies.set(name, stringValue, { ...DEFAULT_OPTIONS, ...options })
}

/**
 * Get a cookie by name
 */
export function getCookie(name: string) {
  const value = Cookies.get(name)
  if (!value) return null

  // Try to parse as JSON, if it fails return the string value
  try {
    return JSON.parse(value)
  } catch (error) {
    return value
  }
}

/**
 * Remove a cookie by name
 */
export function removeCookie(name: string, options = {}) {
  return Cookies.remove(name, { ...options, path: "/" })
}
