"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserActivity } from "./user-activity"
import { GamingButton } from "@/components/ui/gaming-button"
import { Shield, ShieldOff, Ban, Mail, Trash } from "lucide-react"
import { useToast } from "@/components/ui/toast-provider"

type User = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  created_at: string | null
  banned: boolean | null
  avatar_url: string | null
}

export function UserDetail({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()
  const [processingAction, setProcessingAction] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (error) throw error
        setUser(data)
      } catch (error) {
        console.error("Error fetching user:", error)
        addToast({
          title: "Error",
          description: "Failed to load user details",
          type: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [userId, supabase, addToast])

  const handleChangeRole = async () => {
    if (!user) return

    try {
      setProcessingAction(true)
      const newRole = user.role === "admin" ? "user" : "admin"

      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", user.id)

      if (error) throw error

      setUser({ ...user, role: newRole })

      addToast({
        title: "Role Updated",
        description: `User ${user.full_name} is now a ${newRole}`,
        type: "success",
      })
    } catch (err) {
      console.error("Error changing role:", err)
      addToast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update user role",
        type: "error",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const handleBanUser = async () => {
    if (!user) return

    try {
      setProcessingAction(true)
      const newBanStatus = !user.banned

      const { error } = await supabase.from("profiles").update({ banned: newBanStatus }).eq("id", user.id)

      if (error) throw error

      setUser({ ...user, banned: newBanStatus })

      addToast({
        title: newBanStatus ? "User Banned" : "User Unbanned",
        description: `User ${user.full_name} has been ${newBanStatus ? "banned" : "unbanned"}`,
        type: "success",
      })
    } catch (err) {
      console.error("Error banning user:", err)
      addToast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update user ban status",
        type: "error",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-40 bg-card animate-pulse rounded-lg"></div>
        <div className="h-60 bg-card animate-pulse rounded-lg"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold text-red-500 mb-2">User Not Found</h3>
        <p className="text-gray-400">The requested user could not be found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-amber-600 to-amber-900"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-12">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-3xl font-bold text-white border-4 border-background">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.full_name || "Unknown"}</h2>
              <p className="text-gray-400">{user.email || "No email"}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <GamingButton
                variant={user.role === "admin" ? "destructive" : "amber"}
                size="sm"
                onClick={handleChangeRole}
                disabled={processingAction}
              >
                {user.role === "admin" ? (
                  <>
                    <ShieldOff className="h-4 w-4 mr-2" />
                    Demote to User
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Promote to Admin
                  </>
                )}
              </GamingButton>
              <GamingButton
                variant={user.banned ? "amber" : "destructive"}
                size="sm"
                onClick={handleBanUser}
                disabled={processingAction}
              >
                <Ban className="h-4 w-4 mr-2" />
                {user.banned ? "Unban User" : "Ban User"}
              </GamingButton>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border md:col-span-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">User ID</h4>
                <p className="text-sm break-all bg-background p-2 rounded">{user.id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Account Created</h4>
                <p>
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString() +
                      " " +
                      new Date(user.created_at).toLocaleTimeString()
                    : "Unknown"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Role</h4>
                <p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.role === "admin" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {user.role || "user"}
                  </span>
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Status</h4>
                <p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.banned ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {user.banned ? "Banned" : "Active"}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <GamingButton variant="outline" className="w-full justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </GamingButton>
            <GamingButton variant="outline" className="w-full justify-start">
              <Trash className="h-4 w-4 mr-2" />
              Delete User
            </GamingButton>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <UserActivity userId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
