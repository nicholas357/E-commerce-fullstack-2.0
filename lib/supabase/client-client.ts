import { createBrowserClient } from "@supabase/ssr";
import { getEnv } from "@/lib/config";

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function getClientClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or anon key is missing in environment variables");
  }

  // Create browser client with proper cookie settings
  supabaseClient = createBrowserClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        // Parse cookies from document.cookie
        const cookies = document.cookie.split(";").reduce(
          (acc, cookie) => {
            const [key, value] = cookie.trim().split("=");
            if (key) acc[key] = decodeURIComponent(value || "");
            return acc;
          },
          {} as Record<string, string>
        );
        return cookies[name];
      },
      set(name, value, options) {
        // Set cookie with proper attributes
        document.cookie = `${name}=${encodeURIComponent(value)}; path=${options?.path || "/"}; max-age=${options?.maxAge || 315360000}${options?.domain ? `; domain=${options.domain}` : ""}${options?.sameSite ? `; samesite=${options.sameSite}` : "; samesite=lax"}${options?.secure || location.protocol === "https:" ? "; secure" : ""}`;
      },
      remove(name, options) {
        // Remove cookie by setting expiry in the past
        document.cookie = `${name}=; path=${options?.path || "/"}; max-age=-1${options?.domain ? `; domain=${options.domain}` : ""}${options?.sameSite ? `; samesite=${options.sameSite}` : "; samesite=lax"}${options?.secure || location.protocol === "https:" ? "; secure" : ""}`;
      },
    },
  });

  return supabaseClient;
}

// Add the missing export with the expected name
export const getSupabaseClient = getClientClient;
