export interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

/**
 * Calculate time remaining from an end timestamp
 * @param endTime - End time as ISO string or timestamp in milliseconds
 */
export function calculateTimeRemaining(endTime: string | number): TimeRemaining {
  const now = Date.now()

  // Convert ISO string to timestamp if needed
  const targetEndTime = typeof endTime === "string" ? new Date(endTime).getTime() : endTime

  const remaining = targetEndTime - now

  if (remaining <= 0 || isNaN(remaining)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    }
  }

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

  return {
    days: isNaN(days) ? 0 : days,
    hours: isNaN(hours) ? 0 : hours,
    minutes: isNaN(minutes) ? 0 : minutes,
    seconds: isNaN(seconds) ? 0 : seconds,
    isExpired: false,
  }
}

/**
 * Format time remaining as a human-readable string
 */
export function formatTimeRemaining(timeRemaining: TimeRemaining): string {
  if (timeRemaining.isExpired) {
    return "Ended"
  }

  if (timeRemaining.days > 0) {
    return `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m`
  }

  return `${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`
}
