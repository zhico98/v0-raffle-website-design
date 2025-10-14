// This file is kept for backward compatibility but is no longer the source of truth

// ⚠️ DEPRECATED: Raffle timing is now managed in Supabase
// The raffle_rounds table stores start_time and end_time for each 24-hour cycle
// All times are stored in UTC (timestamptz) and automatically converted to user's timezone

// Legacy constants (kept for reference)
export const RAFFLE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Note: DEPLOYMENT_TIME is no longer used
// Each raffle round has its own start_time and end_time in the database
