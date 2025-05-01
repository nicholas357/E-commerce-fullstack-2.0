"use client"

import { useState, useEffect } from "react"
import { Key, RefreshCw, X, Check, AlertTriangle } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { getAuthFromCookie, setAuthCookie, clearAuthCookie } from "@/lib/auth-cookies"

export function AuthCookieDebugger() {
  const [isOpen, setIsOpen] = useState(false)
  const [cookieData, setCookieData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  // Check for cookie data on mount and when user changes
  useEffect(() => {
    const checkCookie = () => {
      try {
        const data = getAuthFromCookie()
        setCookieData(data)
      } catch (error) {
        console.error("[Auth Cookie Debugger] Error checking cookie:", error)
        setCookieData(null)
      }
    }

    checkCookie()

    // Set up interval to check cookie periodically
    const interval = setInterval(checkCookie, 5000)

    return () => clearInterval(interval)
  }, [user])

  const handleRefresh = () => {
    try {
      const data = getAuthFromCookie()
      setCookieData(data)
    } catch (error) {
      console.error("[Auth Cookie Debugger] Error refreshing cookie:", error)
      setCookieData(null)
    }
  }

  const handleSyncWithUser = () => {
    if (!user) return

    setIsLoading(true)
    try {
      const success = setAuthCookie(user)
      if (success) {
        handleRefresh()
      }
    } catch (error) {
      console.error("[Auth Cookie Debugger] Error syncing with user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearCookie = () => {
    setIsLoading(true)
    try {
      clearAuthCookie()
      handleRefresh()
    } catch (error) {
      console.error("[Auth Cookie Debugger] Error clearing cookie:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForceRedirect = () => {
    if (cookieData && cookieData.id) {
      window.location.href = "/account"
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg hover:bg-amber-600 focus:outline-none"
        title="Auth Cookie Debugger"
      >
        <Key size={20} />
      </button>

      {/* Debugger panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-80 rounded-lg border border-border bg-card p-4 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Auth Cookie Debugger</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">Cookie Status:</span>
            <div className="flex items-center">
              {cookieData ? (
                <span className="flex items-center text-xs text-green-500">
                  <Check size={14} className="mr-1" /> Present
                </span>
              ) : (
                <span className="flex items-center text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" /> Missing
                </span>
              )}
            </div>
          </div>

          {cookieData && (
            <div className="mb-2 rounded-md bg-gray-800 p-2">
              <pre className="max-h-32 overflow-auto text-xs text-gray-300">{JSON.stringify(cookieData, null, 2)}</pre>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center rounded-md bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600"
            >
              {isLoading ? (
                <RefreshCw size={12} className="mr-1 animate-spin" />
              ) : (
                <RefreshCw size={12} className="mr-1" />
              )}
              Refresh
            </button>
            <button
              onClick={handleSyncWithUser}
              disabled={isLoading || !user}
              className="flex items-center rounded-md bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-500 disabled:opacity-50"
            >
              Sync with User
            </button>
            <button
              onClick={handleClearCookie}
              disabled={isLoading || !cookieData}
              className="flex items-center rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500 disabled:opacity-50"
            >
              Clear Cookie
            </button>
            <button
              onClick={handleForceRedirect}
              disabled={isLoading || !cookieData}
              className="flex items-center rounded-md bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-500 disabled:opacity-50"
            >
              Force Redirect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
