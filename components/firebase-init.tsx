"use client"

import { useEffect, useState } from "react"
import { getFirebase } from "@/lib/firebase/firebase-client"

export function FirebaseInit() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const firebase = await getFirebase()
        if (firebase.auth) {
          setIsInitialized(true)
        } else {
          setError("Failed to initialize Firebase")
        }
      } catch (err: any) {
        console.error("Firebase initialization error:", err)
        setError(err.message)
      }
    }

    initFirebase()
  }, [])

  // This component doesn't render anything visible
  return null
}
