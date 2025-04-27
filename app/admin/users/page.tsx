"use client"

import UsersTable from "@/components/admin/users-table"

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="bg-gray-800/50 rounded-lg shadow-lg p-6">
        <UsersTable />
      </div>
    </div>
  )
}
