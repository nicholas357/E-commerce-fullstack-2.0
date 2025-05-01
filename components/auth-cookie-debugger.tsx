"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Save, Trash } from "lucide-react"
import { getAuthFromCookie, setAuthCookie, clearAuthCookie, AUTH_COOKIE_NAME } from "@/lib/auth-cookies"
import { useAuth } from "@/context/auth-context"

export function AuthCookieDebugger() {
  const [isOpen, setIsOpen] = useState(false)
  const [cookieData, setCookieData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  // Load cookie data
  const loadCookieData = () => {
    try {
      const data = getAuthFromCookie()
      setCookieData(data)
      return data
    } catch (err) {
      console.error("[Auth Cookie Debugger] Error loading cookie data:", err)
      setCookieData(null)
      return null
    }
  }

  // Load cookie data on mount
  useEffect(() => {
    loadCookieData()
  }, [])

  // Save cookie data
  const saveCookieData = () => {
    try {
      setIsLoading(true)
      const success = setAuthCookie(cookieData)
      console.log("[Auth Cookie Debugger] Cookie saved:", success)
      setTimeout(() => setIsLoading(false), 500)
    } catch (err) {
      console.error("[Auth Cookie Debugger] Error saving cookie:", err)
      setIsLoading(false)
    }
  }

  // Clear cookie data
  const clearCookieData = () => {
    try {
      setIsLoading(true)
      clearAuthCookie()
      setCookieData(null)
      console.log("[Auth Cookie Debugger] Cookie cleared")
      setTimeout(() => setIsLoading(false), 500)
    } catch (err) {
      console.error("[Auth Cookie Debugger] Error clearing cookie:", err)
      setIsLoading(false)
    }
  }

  // Sync with user data
  const syncWithUserData = () => {
    try {
      setIsLoading(true)
      if (user) {
        setCookieData(user)
        const success = setAuthCookie(user)
        console.log("[Auth Cookie Debugger] Synced with user data:", success)
      } else {
        console.error("[Auth Cookie Debugger] No user data to sync with")
      }
      setTimeout(() => setIsLoading(false), 500)
    } catch (err) {
      console.error("[Auth Cookie Debugger] Error syncing with user data:", err)
      setIsLoading(false)
    }
  }

  // Refresh cookie data
  const refreshCookieData = () => {
    setIsLoading(true)
    const data = loadCookieData()
    console.log("[Auth Cookie Debugger] Cookie data refreshed:", Boolean(data))
    setTimeout(() => setIsLoading(false), 500)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-amber-500 p-2 text-white shadow-lg hover:bg-amber-600"
      >
        <span className="sr-only">Open Auth Debugger</span>🔑
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border border-amber-500 bg-card p-4 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-amber-500">Auth Cookie Debugger</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-300">
          ✕
        </button>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Cookie Name:</span>
          <span className="text-sm font-mono text-amber-500">{AUTH_COOKIE_NAME}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Cookie Exists:</span>
          <span className={`text-sm ${cookieData ? "text-green-500" : "text-red-500"}`}>
            {cookieData ? "Yes" : "No"}
          </span>
        </div>
      </div>

      <div className="mb-4 max-h-40 overflow-auto rounded border border-gray-700 bg-gray-900 p-2">
        <pre className="text-xs text-gray-300">{JSON.stringify(cookieData, null, 2)}</pre>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={refreshCookieData}
          disabled={isLoading}
          className="flex items-center rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Refresh
        </button>
        <button
          onClick={syncWithUserData}
          disabled={isLoading || !user}
          className="flex items-center rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
        >
          <Save className="mr-1 h-3 w-3" />
          Sync with User
        </button>
        <button
          onClick={saveCookieData}
          disabled={isLoading || !cookieData}
          className="flex items-center rounded bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-700"
        >
          <Save className="mr-1 h-3 w-3" />
          Save
        </button>
        <button
          onClick={clearCookieData}
          disabled={isLoading || !cookieData}
          className="flex items-center rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
        >
          <Trash className="mr-1 h-3 w-3" />
          Clear
        </button>
      </div>
    </div>
  )
}
