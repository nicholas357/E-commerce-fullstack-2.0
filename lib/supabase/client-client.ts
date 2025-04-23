import { createBrowserClient } from "@supabase/ssr";
import { getEnv } from "@/lib/config";

// Singleton instance
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

function getClientClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or anon key is missing in environment variables");
  }

  supabaseClient = createBrowserClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        const cookies = document.cookie.split(";").map((c) => c.trim());
        const cookie = cookies.find((c) => c.startsWith(`${name}=`));
        if (!cookie) return null;

        const encoded = cookie.split("=")[1];
        try {
          const decoded = atob(decodeURIComponent(encoded)); // base64 decode
          return JSON.parse(decoded);
        } catch (err) {
          console.error("Failed to parse cookie", err);
          return null;
        }
      },
      set(name, value, options) {
        try {
          const json = JSON.stringify(value);
          const base64 = btoa(json);
          const encodedValue = encodeURIComponent(base64);
          const maxAge = options?.maxAge || 31536000; // 1 year
          const path = options?.path || "/";
          const secure = location.protocol === "https:" ? " Secure;" : "";
          document.cookie = `${name}=${encodedValue}; path=${path}; max-age=${maxAge}; SameSite=Lax;${secure}`;
        } catch (err) {
          console.error("Failed to encode cookie", err);
        }
      },
      remove(name, options) {
        const path = options?.path || "/";
        const secure = location.protocol === "https:" ? " Secure;" : "";
        document.cookie = `${name}=; path=${path}; max-age=0; SameSite=Lax;${secure}`;
      },
    },
  });

  return supabaseClient;
}

export const getSupabaseClient = getClientClient;
