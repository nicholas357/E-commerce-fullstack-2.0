"use client"

import { useState, useEffect } from "react"
import type { User } from "@/types/user"

interface Props {
  user: User | null
  profile: any
}

// Example component
export default function ExampleAuthClient({ user, profile }: Props) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [user, profile])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Protected Page</h1>
      <p>Welcome, {profile?.full_name || user?.email}</p>
    </div>
  )
}
