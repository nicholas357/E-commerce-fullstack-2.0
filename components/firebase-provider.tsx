"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { firebaseConfig } from "@/lib/firebase/config"

// Define types for our Firebase services
type FirebaseApp = any
type Auth = any
type Firestore = any
type Storage = any
type Analytics = any

interface FirebaseContextType {
  app: FirebaseApp | null
  auth: Auth | null
  db: Firestore | null
  storage: Storage | null
  analytics: Analytics | null
  isInitialized: boolean
}

// Create context with default values
const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  db: null,
  storage: null,
  analytics: null,
  isInitialized: false,
})

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [firebaseState, setFirebaseState] = useState<FirebaseContextType>({
    app: null,
    auth: null,
    db: null,
    storage: null,
    analytics: null,
    isInitialized: false,
  })

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return

    let isMounted = true

    const initializeFirebase = async () => {
      try {
        // Dynamically import Firebase modules
        const { initializeApp, getApps } = await import("firebase/app")

        // Initialize Firebase app first
        const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

        // Initialize Firebase services with separate dynamic imports
        const authModule = await import("firebase/auth")
        const firestoreModule = await import("firebase/firestore")
        const storageModule = await import("firebase/storage")

        const auth = authModule.getAuth(firebaseApp)
        const db = firestoreModule.getFirestore(firebaseApp)
        const storage = storageModule.getStorage(firebaseApp)

        // Only initialize analytics in browser
        let analytics = null
        if (typeof window !== "undefined") {
          const analyticsModule = await import("firebase/analytics")
          analytics = analyticsModule.getAnalytics(firebaseApp)
        }

        // Only update state if component is still mounted
        if (isMounted) {
          setFirebaseState({
            app: firebaseApp,
            auth,
            db,
            storage,
            analytics,
            isInitialized: true,
          })
          console.log("Firebase initialized successfully")
        }
      } catch (error) {
        console.error("Firebase initialization error:", error)
        if (isMounted) {
          setFirebaseState((prev) => ({ ...prev, isInitialized: false }))
        }
      }
    }

    initializeFirebase()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [])

  return <FirebaseContext.Provider value={firebaseState}>{children}</FirebaseContext.Provider>
}

export function useFirebase() {
  const context = useContext(FirebaseContext)
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider")
  }
  return context
}
