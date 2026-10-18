import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import { useAuth } from '@/auth'

// Response of Transit's GET /api/board (see teaz_pro_transit README), only the fields the tile uses.
interface TransitBoardResponse {
  station: { id: string; name: string } | null
  departures: {
    tripId: string
    line: string
    destination: string
    plannedTime: string
    delayMinutes: number | null
    canceled: boolean
  }[]
  attribution: string
}

export interface TransitDeparture {
  key: string
  /** "08:04", planned time. */
  time: string
  line: string
  destination: string
  /** Minutes late, only when realtime says so (> 0). */
  delay?: number
  canceled?: boolean
}

export interface TransitBoard {
  /** Null: the user hasn't picked a stop in Transit yet. */
  station: string | null
  departures: TransitDeparture[]
  /** Shown when departures is empty. */
  emptyText: string
  /** Data sources; the license asks for it wherever departures are shown. */
  attribution: string
}

const REFRESH_MS = 60_000
// Enough for the tallest the tile gets; it shows as many as fit.
const LIMIT = 8
const TIME = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' })

/**
 * The user's stop and its next departures from Teaz Transit, for the Transit
 * tile, refreshed every minute. Returns null when VITE_TRANSIT_URL is unset
 * (plain `npm run dev`), so the tile keeps its mock rows, like the mock auth.
 * No role check: every Teaz user may use Transit.
 */
export function useTransitBoard(): Ref<TransitBoard | null> {
  const transitUrl = import.meta.env.VITE_TRANSIT_URL
  const board = ref<TransitBoard | null>(null)
  if (!transitUrl) return board

  async function load() {
    try {
      const token = await useAuth().getToken()
      const response = await fetch(`${transitUrl}/api/board?limit=${LIMIT}&minutes=90`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error(`${response.status}`)
      const data: TransitBoardResponse = await response.json()
      board.value = {
        station: data.station?.name ?? null,
        departures: data.departures.map((d) => ({
          key: `${d.tripId}@${d.plannedTime}`,
          time: TIME.format(new Date(d.plannedTime)),
          line: d.line,
          destination: d.destination,
          delay: d.delayMinutes !== null && d.delayMinutes > 0 ? d.delayMinutes : undefined,
          canceled: d.canceled,
        })),
        emptyText: data.station ? 'No departures in the next 90 minutes.' : 'Pick your stop in Transit.',
        attribution: data.attribution,
      }
    } catch (error) {
      console.warn('Transit board not available', error)
      board.value = { station: null, departures: [], emptyText: 'Transit is not reachable right now.', attribution: '' }
    }
  }

  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    load()
    timer = setInterval(load, REFRESH_MS)
  })
  onBeforeUnmount(() => clearInterval(timer))

  return board
}
