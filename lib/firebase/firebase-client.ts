"use client"

import { firebaseConfig } from "./config"

// Types for Firebase services
export type FirebaseApp = any
export type Auth = any
export type Firestore = any
export type Storage = any
export type Analytics = any

// Lazy loading Firebase modules
let firebasePromise: Promise<{
  app: FirebaseApp
  auth: Auth
  firestore: Firestore
  storage: Storage
  analytics: Analytics | null
}> | null = null

// Initialize Firebase lazily
export const initializeFirebase = async () => {
  // Only run in browser
  if (typeof window === "undefined") {
    return {
      app: null,
      auth: null,
      firestore: null,
      storage: null,
      analytics: null,
    }
  }

  // Return existing promise if already initializing
  if (firebasePromise) {
    return firebasePromise
  }

  // Create new promise for initialization
  firebasePromise = new Promise(async (resolve) => {
    try {
      // Dynamically import Firebase modules
      const firebaseApp = await import("firebase/app")

      // Initialize Firebase app
      let app
      if (!firebaseApp.getApps().length) {
        app = firebaseApp.initializeApp(firebaseConfig)
      } else {
        app = firebaseApp.getApp()
      }

      // Import and initialize Firebase services
      const authModule = await import("firebase/auth")
      const firestoreModule = await import("firebase/firestore")
      const storageModule = await import("firebase/storage")

      const auth = authModule.getAuth(app)
      const firestore = firestoreModule.getFirestore(app)
      const storage = storageModule.getStorage(app)

      // Initialize analytics only in browser
      let analytics = null
      try {
        const analyticsModule = await import("firebase/analytics")
        analytics = analyticsModule.getAnalytics(app)
      } catch (error) {
        console.log("Analytics not available:", error)
      }

      resolve({
        app,
        auth,
        firestore,
        storage,
        analytics,
      })
    } catch (error) {
      console.error("Error initializing Firebase:", error)
      resolve({
        app: null,
        auth: null,
        firestore: null,
        storage: null,
        analytics: null,
      })
    }
  })

  return firebasePromise
}

// Helper function to get Firebase services
export const getFirebase = async () => {
  return await initializeFirebase()
}
