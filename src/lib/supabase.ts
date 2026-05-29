import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase public environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: async (url, options) => {
      try {
        const response = await fetch(url, options);
        return response;
      } catch (err) {
        // Intercept background "Failed to fetch" network exceptions in offline/ad-blocked modes
        console.warn("[Supabase Fetch Interceptor] Background Auth request gracefully caught (unreachable/offline). Fallback active.");
        
        // Return a mock offline response that Supabase handles gracefully without throwing uncaught rejections
        return new Response(
          JSON.stringify({
            error: "offline_network_error",
            message: "Supabase connection currently unreachable. Offline local fallback mode active."
          }),
          {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }
  }
});
