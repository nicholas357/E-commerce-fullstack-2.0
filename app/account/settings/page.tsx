"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast-provider"

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/account/login")
    }

    if (user) {
      setName(user.full_name || "")
      setEmail(user.email || "")
      setAvatar(user.avatar_url || "")
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          avatar_url: avatar,
        })
        .eq("id", user?.id)

      if (error) {
        throw error
      }

      setSuccessMessage("Profile updated successfully!")
      addToast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        type: "success",
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setErrorMessage(error.message || "Failed to update profile")
      addToast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        type: "error",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null // This will redirect in the useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[140px] md:pt-[120px]">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-100">Profile</h3>
            <p className="mt-1 text-sm text-gray-400">
              This information will be displayed publicly so be careful what you share.
            </p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-card space-y-6 sm:p-6">
                {successMessage && (
                  <div className="rounded-md bg-green-900/30 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-400">{successMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="rounded-md bg-red-900/30 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-400">{errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="shadow-sm bg-muted focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-700 rounded-md p-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      disabled
                      className="shadow-sm bg-gray-800 focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-700 rounded-md p-2 text-gray-400"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="avatar" className="block text-sm font-medium text-gray-200">
                    Avatar URL
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="avatar"
                      id="avatar"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="shadow-sm bg-muted focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-700 rounded-md p-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200">Avatar Preview</label>
                  <div className="mt-2 flex items-center">
                    {avatar ? (
                      <img
                        src={avatar || "/placeholder.svg"}
                        alt="Avatar preview"
                        className="h-16 w-16 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            name || email,
                          )}&background=random`
                        }}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-amber-600 flex items-center justify-center text-white text-xl font-medium">
                        {name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-card/50 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-700"></div>
        </div>
      </div>

      <div className="mt-10 sm:mt-0 md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-100">Password</h3>
            <p className="mt-1 text-sm text-gray-400">Update your password to keep your account secure.</p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-card space-y-6 sm:p-6">
              <p className="text-sm text-gray-400">
                Password changes are not yet implemented in this version. Please check back later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
