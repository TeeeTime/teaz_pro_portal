import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import { useAuth } from '@/auth'

// Responses of Fitness's GET /api/runs/latest and /api/runs/weekly (see teaz_pro_fitness README),
// only the fields the tiles use.
interface LatestRunResponse {
  connected: boolean
  run: {
    name: string
    startTime: string
    distanceKm: number
    movingTimeSeconds: number
    paceSecondsPerKm: number | null
  } | null
  attribution: string
}

interface WeeklyDistanceResponse {
  connected: boolean
  weeks: { weekStart: string; distanceKm: number }[]
  thisWeekKm: number
  lastWeekKm: number
  attribution: string
}

export interface FitnessLatestRun {
  /** Null: no Strava linked yet, no runs, or Fitness not reachable (see emptyText). */
  run: {
    name: string
    /** "Sun 18 Oct" */
    date: string
    /** "17.8" */
    distance: string
    /** "5:33 /km · 1:38:32" */
    detail: string
  } | null
  emptyText: string
  attribution: string
}

export interface FitnessWeekly {
  /** Oldest first, the last one is the current week so far. Empty: see emptyText. */
  weeks: { weekStart: string; km: number }[]
  /** "8.4" */
  thisWeek: string
  lastWeek: string
  emptyText: string
  attribution: string
}

export interface FitnessTiles {
  latest: Ref<FitnessLatestRun | null>
  weekly: Ref<FitnessWeekly | null>
}

const REFRESH_MS = 5 * 60_000
const WEEKS = 12
const NOT_CONNECTED = 'Connect Strava in Fitness.'
const UNREACHABLE = 'Fitness is not reachable right now.'

const DATE = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Berlin' })
const ONE_DECIMAL = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

function duration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = String(seconds % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

function pace(secondsPerKm: number | null): string | null {
  return secondsPerKm === null ? null : `${Math.floor(secondsPerKm / 60)}:${String(secondsPerKm % 60).padStart(2, '0')} /km`
}

/**
 * The user's latest run and weekly kilometers from Teaz Fitness, for the two
 * Fitness tiles, refreshed every five minutes (Fitness itself syncs from
 * Strava every 15). Both refs stay null when VITE_FITNESS_URL is unset (plain
 * `npm run dev`), so the tiles keep their mock data, like the mock auth. No
 * role check: every Teaz user may use Fitness.
 */
export function useFitnessTiles(): FitnessTiles {
  const fitnessUrl = import.meta.env.VITE_FITNESS_URL
  const latest = ref<FitnessLatestRun | null>(null)
  const weekly = ref<FitnessWeekly | null>(null)
  if (!fitnessUrl) return { latest, weekly }

  async function get<T>(path: string): Promise<T> {
    const token = await useAuth().getToken()
    const response = await fetch(`${fitnessUrl}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    if (!response.ok) throw new Error(`${response.status}`)
    return response.json()
  }

  async function loadLatest() {
    try {
      const data = await get<LatestRunResponse>('/api/runs/latest')
      const run = data.run
      latest.value = {
        run: run && {
          name: run.name,
          date: DATE.format(new Date(run.startTime)),
          distance: ONE_DECIMAL.format(run.distanceKm),
          detail: [pace(run.paceSecondsPerKm), duration(run.movingTimeSeconds)].filter(Boolean).join(' · '),
        },
        emptyText: data.connected ? 'No runs yet.' : NOT_CONNECTED,
        attribution: data.attribution,
      }
    } catch (error) {
      console.warn('Fitness latest run not available', error)
      latest.value = { run: null, emptyText: UNREACHABLE, attribution: '' }
    }
  }

  async function loadWeekly() {
    try {
      const data = await get<WeeklyDistanceResponse>(`/api/runs/weekly?weeks=${WEEKS}`)
      weekly.value = {
        weeks: data.connected ? data.weeks.map((w) => ({ weekStart: w.weekStart, km: w.distanceKm })) : [],
        thisWeek: ONE_DECIMAL.format(data.thisWeekKm),
        lastWeek: ONE_DECIMAL.format(data.lastWeekKm),
        emptyText: NOT_CONNECTED,
        attribution: data.attribution,
      }
    } catch (error) {
      console.warn('Fitness weekly distance not available', error)
      weekly.value = { weeks: [], thisWeek: '', lastWeek: '', emptyText: UNREACHABLE, attribution: '' }
    }
  }

  function load() {
    loadLatest()
    loadWeekly()
  }

  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    load()
    timer = setInterval(load, REFRESH_MS)
  })
  onBeforeUnmount(() => clearInterval(timer))

  return { latest, weekly }
}
