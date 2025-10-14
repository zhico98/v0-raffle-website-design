import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Supabase client init - URL exists:", !!supabaseUrl)
  console.log("[v0] Supabase client init - Key exists:", !!supabaseAnonKey)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Supabase env vars missing!")
    console.error("[v0] NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl)
    console.error("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "exists" : "missing")

    // Return a mock client that won't crash the app
    throw new Error("Supabase environment variables are not configured. Please check your environment settings.")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
