"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { GamingButton } from "@/components/ui/gaming-button"
import { Eye, Trash, Search, AlertCircle, Mail, Shield, ShieldOff, Ban, UserPlus, RefreshCw } from "lucide-react"
import { UsersTableSkeleton } from "@/components/admin/users-table-skeleton"
import { useToast } from "@/components/ui/toast-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type User = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  created_at: string | null
  banned: boolean | null
  avatar_url: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { addToast } = useToast()
  const [totalUsers, setTotalUsers] = useState(0)
  const [adminCount, setAdminCount] = useState(0)
  const [bannedCount, setBannedCount] = useState(0)

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showUserDetailDialog, setShowUserDetailDialog] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailContent, setEmailContent] = useState("")
  const [processingAction, setProcessingAction] = useState(false)
  const [showNewUserDialog, setShowNewUserDialog] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserName, setNewUserName] = useState("")
  const [newUserRole, setNewUserRole] = useState("user")

  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (error) throw new Error(`Error fetching users: ${error.message}`)

      setUsers(data || [])
      setTotalUsers(data?.length || 0)
      setAdminCount(data?.filter((user) => user.role === "admin").length || 0)
      setBannedCount(data?.filter((user) => user.banned).length || 0)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleChangeRole = async () => {
    if (!selectedUser) return

    try {
      setProcessingAction(true)
      const newRole = selectedUser.role === "admin" ? "user" : "admin"

      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", selectedUser.id)

      if (error) throw error

      // Update local state
      setUsers(users.map((user) => (user.id === selectedUser.id ? { ...user, role: newRole } : user)))
      setAdminCount(newRole === "admin" ? adminCount + 1 : adminCount - 1)

      addToast({
        title: "Role Updated",
        description: `User ${selectedUser.full_name} is now a ${newRole}`,
        type: "success",
      })

      setShowRoleDialog(false)
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

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setProcessingAction(true)

      // First delete related shipping addresses
      const { error: shippingAddressError } = await supabase
        .from("shipping_addresses")
        .delete()
        .eq("user_id", selectedUser.id)

      if (shippingAddressError) {
        console.warn("Error deleting shipping addresses:", shippingAddressError)
        // Continue anyway, as there might not be any shipping addresses
      }

      // Check for other potential foreign key constraints
      // Delete any payment methods
      const { error: paymentMethodError } = await supabase
        .from("payment_methods")
        .delete()
        .eq("user_id", selectedUser.id)

      if (paymentMethodError) {
        console.warn("Error deleting payment methods:", paymentMethodError)
        // Continue anyway
      }

      // Delete any orders (this might require deleting order items first)
      const { error: orderError } = await supabase.from("orders").delete().eq("user_id", selectedUser.id)

      if (orderError) {
        console.warn("Error deleting orders:", orderError)
        // Continue anyway
      }

      // Then delete from profiles table
      const { error: profileError } = await supabase.from("profiles").delete().eq("id", selectedUser.id)

      if (profileError) throw profileError

      // Then delete the auth user (requires admin key, might not work with anon key)
      // This is a best effort - if it fails, the profile is still deleted
      try {
        await supabase.auth.admin.deleteUser(selectedUser.id)
      } catch (authError) {
        console.warn("Could not delete auth user (requires admin key):", authError)
      }

      // Update local state
      setUsers(users.filter((user) => user.id !== selectedUser.id))
      setTotalUsers(totalUsers - 1)
      if (selectedUser.role === "admin") setAdminCount(adminCount - 1)
      if (selectedUser.banned) setBannedCount(bannedCount - 1)

      addToast({
        title: "User Deleted",
        description: `User ${selectedUser.full_name} has been deleted`,
        type: "success",
      })

      setShowDeleteDialog(false)
    } catch (err) {
      console.error("Error deleting user:", err)
      addToast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete user",
        type: "error",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const handleBanUser = async () => {
    if (!selectedUser) return

    try {
      setProcessingAction(true)
      const newBanStatus = !selectedUser.banned

      const { error } = await supabase.from("profiles").update({ banned: newBanStatus }).eq("id", selectedUser.id)

      if (error) throw error

      // Update local state
      setUsers(users.map((user) => (user.id === selectedUser.id ? { ...user, banned: newBanStatus } : user)))
      setBannedCount(newBanStatus ? bannedCount + 1 : bannedCount - 1)

      addToast({
        title: newBanStatus ? "User Banned" : "User Unbanned",
        description: `User ${selectedUser.full_name} has been ${newBanStatus ? "banned" : "unbanned"}`,
        type: "success",
      })

      setShowBanDialog(false)
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

  const handleSendEmail = async () => {
    if (!selectedUser || !selectedUser.email) return

    try {
      setProcessingAction(true)

      // Send email using Supabase Edge Functions (requires setup)
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: selectedUser.email,
          subject: emailSubject,
          content: emailContent,
        },
      })

      if (error) throw error

      addToast({
        title: "Email Sent",
        description: `Email has been sent to ${selectedUser.email}`,
        type: "success",
      })

      setShowEmailDialog(false)
      setEmailSubject("")
      setEmailContent("")
    } catch (err) {
      console.error("Error sending email:", err)
      addToast({
        title: "Error",
        description: "Failed to send email. Make sure Supabase Edge Functions are set up correctly.",
        type: "error",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      setProcessingAction(true)

      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUserEmail,
        password: Math.random().toString(36).slice(-8), // Random password
        email_confirm: true,
        user_metadata: {
          full_name: newUserName,
        },
      })

      if (error) throw error

      if (data.user) {
        // Update the role if needed
        if (newUserRole === "admin") {
          const { error: roleError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", data.user.id)

          if (roleError) throw roleError
        }

        // Refresh the user list
        fetchUsers()

        addToast({
          title: "User Created",
          description: `User ${newUserName} has been created successfully`,
          type: "success",
        })

        setShowNewUserDialog(false)
        setNewUserEmail("")
        setNewUserName("")
        setNewUserRole("user")
      }
    } catch (err) {
      console.error("Error creating user:", err)
      addToast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create user",
        type: "error",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return <UsersTableSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-500 mb-2">Error Loading Users</h3>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-amber-500 text-black rounded-md hover:bg-amber-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white glow-text-amber">User Management</h1>
        <div className="flex gap-2">
          <GamingButton variant="outline" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </GamingButton>
          <GamingButton variant="amber" onClick={() => setShowNewUserDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New User
          </GamingButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{adminCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Banned Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{bannedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-white">{user.full_name || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-white">{user.email || "N/A"}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.role === "admin" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {user.role || "user"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.banned ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {user.banned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                            title="View User Details"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowUserDetailDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-amber-500 transition-colors"
                            title={user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                            onClick={() => {
                              setSelectedUser(user)
                              setShowRoleDialog(true)
                            }}
                          >
                            {user.role === "admin" ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-amber-500 transition-colors"
                            title="Send Email"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowEmailDialog(true)
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
                            title={user.banned ? "Unban User" : "Ban User"}
                            onClick={() => {
                              setSelectedUser(user)
                              setShowBanDialog(true)
                            }}
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete User"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                      No users found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          Showing {filteredUsers.length} of {users.length} users
        </div>
        <div className="flex gap-2">
          <GamingButton variant="outline" size="sm" disabled>
            Previous
          </GamingButton>
          <GamingButton variant="outline" size="sm" disabled>
            Next
          </GamingButton>
        </div>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={showUserDetailDialog} onOpenChange={setShowUserDetailDialog}>
        <DialogContent className="bg-card border-border text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4 space-y-4">
              <div className="flex flex-col items-center space-y-3 mb-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-2xl font-bold text-white">
                  {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : "U"}
                </div>
                <h3 className="text-xl font-semibold">{selectedUser.full_name || "Unknown"}</h3>
                <div className="flex space-x-2">
                  <Badge variant={selectedUser.role === "admin" ? "default" : "outline"}>
                    {selectedUser.role || "User"}
                  </Badge>
                  <Badge variant={selectedUser.banned ? "destructive" : "success"}>
                    {selectedUser.banned ? "Banned" : "Active"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 bg-background p-4 rounded-md">
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium">{selectedUser.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">User ID</p>
                  <p className="font-medium text-xs break-all">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Joined</p>
                  <p className="font-medium">
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleDateString() +
                        " " +
                        new Date(selectedUser.created_at).toLocaleTimeString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetailDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="bg-card border-border text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-500">
              {selectedUser?.role === "admin" ? "Demote User" : "Promote User"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedUser?.role === "admin"
                ? "Are you sure you want to remove admin privileges from this user?"
                : "Are you sure you want to grant admin privileges to this user?"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 rounded-md bg-background">
              <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                {selectedUser?.role === "admin" ? (
                  <ShieldOff className="h-5 w-5 text-amber-500" />
                ) : (
                  <Shield className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div>
                <p className="font-medium">{selectedUser?.full_name}</p>
                <p className="text-sm text-gray-400">{selectedUser?.email}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <GamingButton variant="amber" onClick={handleChangeRole} disabled={processingAction}>
              {processingAction
                ? "Processing..."
                : selectedUser?.role === "admin"
                  ? "Demote to User"
                  : "Promote to Admin"}
            </GamingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-card border-border text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-500">Delete User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to permanently delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 rounded-md bg-background">
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="font-medium">{selectedUser?.full_name}</p>
                <p className="text-sm text-gray-400">{selectedUser?.email}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={processingAction}>
              {processingAction ? "Processing..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="bg-card border-border text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-orange-500">
              {selectedUser?.banned ? "Unban User" : "Ban User"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedUser?.banned
                ? "Are you sure you want to unban this user? They will regain access to the platform."
                : "Are you sure you want to ban this user? They will lose access to the platform."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 rounded-md bg-background">
              <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Ban className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="font-medium">{selectedUser?.full_name}</p>
                <p className="text-sm text-gray-400">{selectedUser?.email}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Cancel
            </Button>
            <GamingButton
              variant={selectedUser?.banned ? "amber" : "destructive"}
              onClick={handleBanUser}
              disabled={processingAction}
            >
              {processingAction ? "Processing..." : selectedUser?.banned ? "Unban User" : "Ban User"}
            </GamingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="bg-card border-border text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-500">Send Email</DialogTitle>
            <DialogDescription className="text-gray-400">Send an email to {selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-1">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="Email subject"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-400 mb-1">
                Content
              </label>
              <textarea
                id="content"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-h-[120px]"
                placeholder="Email content"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <GamingButton
              variant="amber"
              onClick={handleSendEmail}
              disabled={processingAction || !emailSubject || !emailContent}
            >
              {processingAction ? "Sending..." : "Send Email"}
            </GamingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New User Dialog */}
      <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
        <DialogContent className="bg-card border-border text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-500">Create New User</DialogTitle>
            <DialogDescription className="text-gray-400">Add a new user to the platform</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                placeholder="Full name"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-1">
                Role
              </label>
              <select
                id="role"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
              Cancel
            </Button>
            <GamingButton
              variant="amber"
              onClick={handleCreateUser}
              disabled={processingAction || !newUserEmail || !newUserName}
            >
              {processingAction ? "Creating..." : "Create User"}
            </GamingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
