"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
  sendEmailVerification,
  deleteUser,
} from "firebase/auth"
import { firebaseConfig } from "./config"

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export type AuthError = {
  code: string
  message: string
}

// Sign in with email and password
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ user: FirebaseUser | null; error: AuthError | null }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error: any) {
    return {
      user: null,
      error: {
        code: error.code || "auth/unknown",
        message: error.message || "An unknown error occurred",
      },
    }
  }
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
): Promise<{ user: FirebaseUser | null; error: AuthError | null }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // Update the user's profile with their full name
    await updateProfile(userCredential.user, {
      displayName: fullName,
    })

    // Send email verification
    await sendEmailVerification(userCredential.user)

    // Create user profile in Supabase
    await createUserProfile(userCredential.user.uid, {
      full_name: fullName,
      email,
      role: "user",
    })

    return { user: userCredential.user, error: null }
  } catch (error: any) {
    return {
      user: null,
      error: {
        code: error.code || "auth/unknown",
        message: error.message || "An unknown error occurred",
      },
    }
  }
}

// Sign in with Google
export async function signInWithGoogle(): Promise<{ user: FirebaseUser | null; error: AuthError | null }> {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider)

    // Check if this is a new user (first time sign in)
    const isNewUser = userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime

    if (isNewUser) {
      // Create user profile in Supabase
      await createUserProfile(userCredential.user.uid, {
        full_name: userCredential.user.displayName || "",
        email: userCredential.user.email || "",
        avatar_url: userCredential.user.photoURL || "",
        role: "user",
      })
    }

    return { user: userCredential.user, error: null }
  } catch (error: any) {
    return {
      user: null,
      error: {
        code: error.code || "auth/unknown",
        message: error.message || "An unknown error occurred",
      },
    }
  }
}

// Sign out
export async function signOutUser(): Promise<{ error: AuthError | null }> {
  try {
    await signOut(auth)
    return { error: null }
  } catch (error: any) {
    return {
      error: {
        code: error.code || "auth/unknown",
        message: error.message || "An unknown error occurred",
      },
    }
  }
}

// Send password reset email
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    await sendPasswordResetEmail(auth, email)
    return { error: null }
  } catch (error: any) {
    return {
      error: {
        code: error.code || "auth/unknown",
        message: error.message || "An unknown error occurred",
      },
    }
  }
}

// Delete current user
export async function deleteCurrentUser(): Promise<{ error: AuthError | null }> {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("No user is currently signed in")
    }

    await deleteUser(user)
    return { error: null }
  } catch (error: any) {
    return {
      error: {
        code: error.code || "auth/unknown",
        message: error.message || "An unknown error occurred",
      },
    }
  }
}

// Get the current user
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser
}

// Listen for auth state changes
export function onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

// Get ID token for the current user
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null

  try {
    return await user.getIdToken()
  } catch (error) {
    console.error("Error getting ID token:", error)
    return null
  }
}

// Create user profile in Supabase
async function createUserProfile(uid: string, profileData: any): Promise<void> {
  try {
    const token = await getIdToken()

    const response = await fetch("/api/auth/create-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        uid,
        ...profileData,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create user profile")
    }
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw error
  }
}
