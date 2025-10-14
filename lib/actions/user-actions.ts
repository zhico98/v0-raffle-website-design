"use server"

import { createClient } from "@/lib/supabase/server"

export async function getUserProfile(walletAddress: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single()

    if (error && error.code !== "PGRST116") throw error
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Error getting user profile:", error)
    return { success: false, data: null }
  }
}

export async function updateUserProfile(walletAddress: string, updates: { username?: string; avatar_url?: string }) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({
        wallet_address: walletAddress.toLowerCase(),
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Error updating user profile:", error)
    return { success: false, error }
  }
}

export async function getUserStats(walletAddress: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .single()

    if (error && error.code !== "PGRST116") throw error
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Error getting user stats:", error)
    return { success: false, data: null }
  }
}
