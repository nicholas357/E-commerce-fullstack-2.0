"use client"

import { getFirebase } from "./firebase-client"
import type { User } from "@/types/user"

// Helper function to convert Firebase user to our User type
const mapFirebaseUser = (firebaseUser: any, role = "user"): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    name: firebaseUser.displayName || "",
    role,
  }
}

export const authService = {
  // Get current user
  getCurrentUser: async (): Promise<{ user: User | null; error: string | null }> => {
    try {
      const { auth, firestore } = await getFirebase()
      if (!auth) {
        return { user: null, error: "Firebase Auth not initialized" }
      }

      return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged(
          async (firebaseUser: any) => {
            unsubscribe()
            if (!firebaseUser) {
              resolve({ user: null, error: null })
              return
            }

            try {
              if (!firestore) {
                const user = mapFirebaseUser(firebaseUser)
                resolve({ user, error: null })
                return
              }

              const userDoc = await firestore.collection("users").doc(firebaseUser.uid).get()
              const userData = userDoc.exists ? userDoc.data() : null
              const role = userData?.role || "user"

              const user = mapFirebaseUser(firebaseUser, role)
              resolve({ user, error: null })
            } catch (error: any) {
              console.error("Error getting user data:", error)
              resolve({ user: null, error: error.message })
            }
          },
          (error: any) => {
            console.error("Auth state change error:", error)
            resolve({ user: null, error: error.message })
          },
        )
      })
    } catch (error: any) {
      console.error("Error in getCurrentUser:", error)
      return { user: null, error: error.message }
    }
  },

  // Sign in with email and password
  signInWithEmail: async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    try {
      const { auth, firestore } = await getFirebase()
      if (!auth) {
        return { user: null, error: "Firebase Auth not initialized" }
      }

      const userCredential = await auth.signInWithEmailAndPassword(email, password)
      const firebaseUser = userCredential.user

      if (!firestore) {
        const user = mapFirebaseUser(firebaseUser)
        return { user, error: null }
      }

      const userDoc = await firestore.collection("users").doc(firebaseUser.uid).get()
      const userData = userDoc.exists ? userDoc.data() : null
      const role = userData?.role || "user"

      const user = mapFirebaseUser(firebaseUser, role)
      return { user, error: null }
    } catch (error: any) {
      console.error("Sign in error:", error)
      return { user: null, error: error.message }
    }
  },

  // Sign up with email and password
  signUpWithEmail: async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ user: User | null; error: string | null }> => {
    try {
      const { auth, firestore } = await getFirebase()
      if (!auth) {
        return { user: null, error: "Firebase Auth not initialized" }
      }

      const userCredential = await auth.createUserWithEmailAndPassword(email, password)
      const firebaseUser = userCredential.user

      // Update profile with name
      await firebaseUser.updateProfile({ displayName: name })

      if (firestore) {
        // Create user document in Firestore
        await firestore.collection("users").doc(firebaseUser.uid).set({
          name,
          email,
          role: "user",
          createdAt: new Date(),
        })
      }

      const user = mapFirebaseUser(firebaseUser)
      return { user, error: null }
    } catch (error: any) {
      console.error("Sign up error:", error)
      return { user: null, error: error.message }
    }
  },

  // Sign in with Google
  signInWithGoogle: async (): Promise<{ user: User | null; error: string | null }> => {
    try {
      const { auth, firestore } = await getFirebase()
      if (!auth) {
        return { user: null, error: "Firebase Auth not initialized" }
      }

      const GoogleAuthProvider = (await import("firebase/auth")).GoogleAuthProvider
      const provider = new GoogleAuthProvider()

      const userCredential = await auth.signInWithPopup(provider)
      const firebaseUser = userCredential.user

      if (firestore) {
        // Check if user document exists
        const userDoc = await firestore.collection("users").doc(firebaseUser.uid).get()

        if (!userDoc.exists) {
          // Create user document if it doesn't exist
          await firestore.collection("users").doc(firebaseUser.uid).set({
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            role: "user",
            createdAt: new Date(),
          })
        }

        const userData = userDoc.exists ? userDoc.data() : null
        const role = userData?.role || "user"
        const user = mapFirebaseUser(firebaseUser, role)
        return { user, error: null }
      }

      const user = mapFirebaseUser(firebaseUser)
      return { user, error: null }
    } catch (error: any) {
      console.error("Google sign in error:", error)
      return { user: null, error: error.message }
    }
  },

  // Sign out
  signOut: async (): Promise<{ error: string | null }> => {
    try {
      const { auth } = await getFirebase()
      if (!auth) {
        return { error: "Firebase Auth not initialized" }
      }

      await auth.signOut()
      return { error: null }
    } catch (error: any) {
      console.error("Sign out error:", error)
      return { error: error.message }
    }
  },

  // Check if user is admin
  isAdmin: (user: User | null): boolean => {
    return user?.role === "admin"
  },
}
