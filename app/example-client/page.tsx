"use client"

// This is a Client Component in the App Router
import { createBrowserSupabaseClient } from "@/lib/supabase/client-client"
import { useState, useEffect } from "react"

export default function ClientComponent() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createBrowserSupabaseClient()
      const { data } = await supabase.from("examples").select("*")
      setData(data)
    }

    fetchData()
  }, [])

  return (
    <div>
      <h1>Client Component Example</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
