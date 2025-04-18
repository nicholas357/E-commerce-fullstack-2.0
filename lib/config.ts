// Hardcoded environment variables for development
export const ENV = {
  NEXT_PUBLIC_SUPABASE_URL: "https://lgfnbyurnavwxtcrftzx.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZm5ieXVybmF2d3h0Y3JmdHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTQ3NDIsImV4cCI6MjA1OTk3MDc0Mn0.4iKhdwzJeNGxV8DO3jpQ-OwmOfjKg1cvIFPUed3akOI",
  SUPABASE_SERVICE_ROLE_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnZm5ieXVybmF2d3h0Y3JmdHp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM5NDc0MiwiZXhwIjoyMDU5OTcwNzQyfQ.RNPabh0y0sL6cRlhOvuSKaoxApk2HPJ_2xK6gNHIgfI",
}

// Helper function to get environment variables
export function getEnv(key: keyof typeof ENV): string {
  return ENV[key]
}
