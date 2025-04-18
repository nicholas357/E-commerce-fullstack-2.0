import Cookies from "js-cookie"

export const setCookie = (name: string, value: any, options?: Cookies.CookieAttributes) => {
  const defaultOptions: Cookies.CookieAttributes = {
    expires: 30, // 30 days
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  }

  const cookieOptions = { ...defaultOptions, ...options }

  if (typeof value === "object") {
    Cookies.set(name, JSON.stringify(value), cookieOptions)
  } else {
    Cookies.set(name, value, cookieOptions)
  }
}

export const getCookie = (name: string) => {
  const cookieValue = Cookies.get(name)

  if (!cookieValue) return null

  try {
    return JSON.parse(cookieValue)
  } catch (e) {
    return cookieValue
  }
}

export const removeCookie = (name: string) => {
  Cookies.remove(name, { path: "/" })
}
