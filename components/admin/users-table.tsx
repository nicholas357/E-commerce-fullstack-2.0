"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Trash2, Edit, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { handleDeleteUser } from "@/lib/user-service"
import { useToast } from "@/components/ui/toast-provider"

type User = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  created_at: string | null
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { addToast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setUsers(data || [])
    } catch (error: any) {
      console.error("Error fetching users:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUserDelete(userId: string) {
    try {
      const { success, error } = await handleDeleteUser(userId)

      if (!success) {
        throw new Error(error)
      }

      addToast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
        type: "success",
      })

      // Refresh the users list
      fetchUsers()
    } catch (error: any) {
      console.error("Error deleting user:", error)
      addToast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        type: "error",
      })
    }
  }

  function handleViewUser(userId: string) {
    router.push(`/admin/users/${userId}`)
  }

  function handleEditUser(userId: string) {
    router.push(`/admin/users/edit/${userId}`)
  }

  if (loading) {
    return <div className="p-4">Loading users...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-3 text-left text-white">Name</th>
            <th className="p-3 text-left text-white">Email</th>
            <th className="p-3 text-left text-white">Role</th>
            <th className="p-3 text-left text-white">Created At</th>
            <th className="p-3 text-left text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/30">
              <td className="p-3">{user.full_name || "N/A"}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    user.role === "admin" ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/20 text-blue-500"
                  }`}
                >
                  {user.role || "user"}
                </span>
              </td>
              <td className="p-3">{new Date(user.created_at || "").toLocaleDateString()}</td>
              <td className="p-3 flex space-x-2">
                <button
                  onClick={() => handleViewUser(user.id)}
                  className="p-1 rounded-full hover:bg-gray-600"
                  title="View User"
                >
                  <Eye className="h-4 w-4 text-blue-400" />
                </button>
                <button
                  onClick={() => handleEditUser(user.id)}
                  className="p-1 rounded-full hover:bg-gray-600"
                  title="Edit User"
                >
                  <Edit className="h-4 w-4 text-amber-400" />
                </button>
                <button
                  onClick={() => handleUserDelete(user.id)}
                  className="p-1 rounded-full hover:bg-gray-600"
                  title="Delete User"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="p-3 text-center text-gray-400">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
