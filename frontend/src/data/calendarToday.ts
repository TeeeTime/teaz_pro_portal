import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import { useAuth } from '@/auth'

// Response of Calendar's GET /api/events/today (see teaz_pro_calendar README), only the fields the tile uses.
interface TodayResponse {
  connected: boolean
  /** Today in Berlin, e.g. 2026-10-23 */
  date: string
  calendars: { id: number; color: string | null }[]
  events: {
    id: number
    calendarId: number
    title: string
    allDay: boolean
    /** Timed: 2026-10-23T09:30:00+02:00 (Berlin). All-day: the first day, 2026-10-23. */
    start: string
    end: string
  }[]
}

export interface CalendarTodayEvent {
  key: string
  title: string
  allDay: boolean
  /** "09:00–09:15", "until 01:30" (began yesterday), "from 21:00" (ends tomorrow); empty for all-day */
  time: string
  /** The calendar's #rrggbb from iCloud; null = the accent color. */
  color: string | null
  /** Minutes since midnight in Berlin, cut to today; all-day events span the whole day. */
  start: number
  end: number
}

export interface CalendarToday {
  /** "Fri 23 Oct" */
  date: string
  /** All-day first, then by start, as Calendar sends them. Empty: see emptyText. */
  events: CalendarTodayEvent[]
  emptyText: string
}

const REFRESH_MS = 5 * 60_000
const NOT_CONNECTED = 'Connect your Apple calendar in Calendar.'
const UNREACHABLE = 'Calendar is not reachable right now.'
const DAY = 24 * 60

// Plain dates are midnight UTC, so they're formatted in UTC; nothing shifts them.
const DATE = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })

/** Wall-clock minutes of a Calendar time: it's written with Berlin's offset, so the text before it is Berlin time. */
function minutes(dateTime: string): number {
  return Number(dateTime.slice(11, 13)) * 60 + Number(dateTime.slice(14, 16))
}

function event(e: TodayResponse['events'][number], today: string, colors: Map<number, string>): CalendarTodayEvent {
  const base = { key: String(e.id), title: e.title, allDay: e.allDay, color: colors.get(e.calendarId) ?? null }
  if (e.allDay) return { ...base, time: '', start: 0, end: DAY }
  const startsToday = e.start.slice(0, 10) === today
  const endsToday = e.end.slice(0, 10) === today
  const from = e.start.slice(11, 16)
  const until = e.end.slice(11, 16)
  return {
    ...base,
    time: startsToday && endsToday ? `${from}–${until}` : startsToday ? `from ${from}` : endsToday ? `until ${until}` : 'all day',
    start: startsToday ? minutes(e.start) : 0,
    end: endsToday ? minutes(e.end) : DAY,
  }
}

/**
 * The user's events today from Teaz Calendar, for the Calendar tile,
 * refreshed every five minutes (Calendar refreshes its copy from iCloud when
 * it's older than two) and right after midnight. Stays null when
 * VITE_CALENDAR_URL is unset (plain `npm run dev`), so the tile keeps its mock
 * data, like the mock auth. No role check: every Teaz user may use Calendar.
 */
export function useCalendarToday(): Ref<CalendarToday | null> {
  const calendarUrl = import.meta.env.VITE_CALENDAR_URL
  const today = ref<CalendarToday | null>(null)
  if (!calendarUrl) return today

  let loadedFor = ''

  async function load() {
    try {
      const token = await useAuth().getToken()
      const response = await fetch(`${calendarUrl}/api/events/today`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error(`${response.status}`)
      const data: TodayResponse = await response.json()
      const colors = new Map(data.calendars.flatMap((c) => (c.color ? [[c.id, c.color] as const] : [])))
      loadedFor = data.date
      today.value = {
        date: DATE.format(new Date(`${data.date}T00:00:00Z`)),
        events: data.events.map((e) => event(e, data.date, colors)),
        emptyText: data.connected ? 'Nothing today.' : NOT_CONNECTED,
      }
    } catch (error) {
      console.warn('Calendar events not available', error)
      today.value = { date: '', events: [], emptyText: UNREACHABLE }
    }
  }

  const BERLIN_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' })
  let timer: ReturnType<typeof setInterval> | undefined
  let midnight: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    load()
    timer = setInterval(load, REFRESH_MS)
    // A new day in Berlin: load its events instead of waiting for the next refresh.
    midnight = setInterval(() => {
      if (loadedFor && BERLIN_DAY.format(new Date()) !== loadedFor) load()
    }, 60_000)
  })
  onBeforeUnmount(() => {
    clearInterval(timer)
    clearInterval(midnight)
  })

  return today
}
