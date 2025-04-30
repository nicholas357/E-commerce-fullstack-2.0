"use client"

import { useAuth } from "@/context/auth-context"
import { useState } from "react"

export function AuthDebugPanel() {
  const { user, sessionStatus, debugMode, toggleDebugMode, checkSession, refreshUserSession } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!debugMode) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleDebugMode}
          className="bg-amber-600 text-white px-3 py-2 rounded-md text-sm font-medium shadow-lg"
        >
          Show Auth Debug
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-gray-900 border border-amber-500 rounded-lg shadow-xl text-white">
      <div className="p-3 border-b border-amber-500 flex justify-between items-center">
        <h3 className="font-bold">Auth Debug Panel</h3>
        <div className="flex gap-2">
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs bg-gray-700 px-2 py-1 rounded">
            {isExpanded ? "Collapse" : "Expand"}
          </button>
          <button onClick={toggleDebugMode} className="text-xs bg-red-700 px-2 py-1 rounded">
            Close
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3 max-h-96 overflow-y-auto text-xs">
        <div className="flex justify-between">
          <span className="font-semibold">Session Status:</span>
          <span className={sessionStatus.hasSession ? "text-green-400" : "text-red-400"}>
            {sessionStatus.hasSession ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Last Checked:</span>
          <span>{sessionStatus.lastChecked ? new Date(sessionStatus.lastChecked).toLocaleTimeString() : "Never"}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Expires At:</span>
          <span>{sessionStatus.expiresAt ? new Date(sessionStatus.expiresAt).toLocaleString() : "N/A"}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Refresh Attempts:</span>
          <span>{sessionStatus.refreshAttempts}</span>
        </div>

        {isExpanded && (
          <>
            <div className="pt-2 border-t border-gray-700">
              <div className="font-semibold mb-1">User Info:</div>
              <pre className="bg-gray-800 p-2 rounded overflow-x-auto">
                {user ? JSON.stringify(user, null, 2) : "Not logged in"}
              </pre>
            </div>

            <div className="pt-2 border-t border-gray-700">
              <div className="font-semibold mb-1">Browser Cookies:</div>
              <pre className="bg-gray-800 p-2 rounded overflow-x-auto">
                {document.cookie
                  .split(";")
                  .map((cookie) => cookie.trim())
                  .join("\n")}
              </pre>
            </div>
          </>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={async () => {
              const result = await checkSession()
              console.log("[Debug] Session check result:", result)
            }}
            className="flex-1 bg-blue-600 px-3 py-1.5 rounded text-white text-xs"
          >
            Check Session
          </button>
          <button
            onClick={async () => {
              const result = await refreshUserSession()
              console.log("[Debug] Session refresh result:", result)
            }}
            className="flex-1 bg-green-600 px-3 py-1.5 rounded text-white text-xs"
          >
            Refresh Session
          </button>
        </div>
      </div>
    </div>
  )
}
