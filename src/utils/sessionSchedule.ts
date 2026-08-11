import type { SessionPeriod } from '../types/session'

const SUNDAY = 0

const sessionWindows = {
  morning: { startMinutes: 11 * 60, endMinutes: 11 * 60 + 30, closeMinutes: 12 * 60 },
  evening: { startMinutes: 18 * 60, endMinutes: 18 * 60 + 30, closeMinutes: 22 * 60 },
} as const

export interface SessionAvailability {
  available: boolean
  period: SessionPeriod | null
  scheduledCloseAt: Date | null
  nextOpeningAt: Date
}

function atMinutes(date: Date, minutes: number) {
  const result = new Date(date)
  result.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
  return result
}

function nextSunday(date: Date) {
  const result = new Date(date)
  const daysUntilSunday = (7 - result.getDay()) % 7
  result.setDate(result.getDate() + daysUntilSunday)
  return result
}

export function getSessionAvailability(now = new Date(), allowAnyTime = false): SessionAvailability {
  if (allowAnyTime) {
    return {
      available: true,
      period: now.getHours() < 15 ? 'morning' : 'evening',
      scheduledCloseAt: new Date(now.getTime() + 60 * 60 * 1000),
      nextOpeningAt: now,
    }
  }

  const minutes = now.getHours() * 60 + now.getMinutes()

  if (now.getDay() === SUNDAY) {
    for (const [period, window] of Object.entries(sessionWindows) as Array<
      [SessionPeriod, (typeof sessionWindows)[SessionPeriod]]
    >) {
      if (minutes >= window.startMinutes && minutes <= window.endMinutes) {
        return {
          available: true,
          period,
          scheduledCloseAt: atMinutes(now, window.closeMinutes),
          nextOpeningAt: now,
        }
      }
    }

    if (minutes < sessionWindows.morning.startMinutes) {
      return {
        available: false,
        period: null,
        scheduledCloseAt: null,
        nextOpeningAt: atMinutes(now, sessionWindows.morning.startMinutes),
      }
    }

    if (minutes < sessionWindows.evening.startMinutes) {
      return {
        available: false,
        period: null,
        scheduledCloseAt: null,
        nextOpeningAt: atMinutes(now, sessionWindows.evening.startMinutes),
      }
    }
  }

  const sunday = nextSunday(new Date(now.getTime() + (now.getDay() === SUNDAY ? 24 * 60 * 60 * 1000 : 0)))
  return {
    available: false,
    period: null,
    scheduledCloseAt: null,
    nextOpeningAt: atMinutes(sunday, sessionWindows.morning.startMinutes),
  }
}

export function getPeriodLabel(period: SessionPeriod) {
  return period === 'morning' ? 'Manhã' : 'Noite'
}
