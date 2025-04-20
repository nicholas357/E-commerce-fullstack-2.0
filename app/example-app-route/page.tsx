// This is a Server Component in the App Router
import { createServerSupabaseClient } from "@/lib/supabase/server-client"

export default async function AppRouterPage() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from("examples").select("*")

  return (
    <div>
      <h1>App Router Example</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
