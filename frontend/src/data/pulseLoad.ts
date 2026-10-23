import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import { useAuth } from '@/auth'

// Response of Pulse's GET /api/load (see teaz_pro_pulse README).
interface PulseLoad {
  sampledAt: string
  intervalSeconds: number
  historySeconds: number
  cores: number
  memoryTotalBytes: number
  host: { cpuPercent: number | null; memoryBytes: number }
  teaz: { cpuPercent: number | null; memoryBytes: number }
  history: {
    at: string
    hostCpuPercent: number
    teazCpuPercent: number
    hostMemoryBytes: number
    teazMemoryBytes: number
  }[]
}

/** One measurement, everything in percent of the server (CPU: of all cores, memory: of its RAM). */
export interface PerformancePoint {
  /** ms since epoch */
  at: number
  cpu: number
  cpuTeaz: number
  memory: number
  memoryTeaz: number
}

export interface PerformanceLoad {
  /** Oldest first. Empty: see emptyText. */
  points: PerformancePoint[]
  /** Time between two points; a longer gap (Pulse was down) breaks the lines. */
  intervalMs: number
  /** How much time the x axis spans, ending at the last point. */
  windowMs: number
  /** "4 cores · 8 GB" */
  server: string
  emptyText: string
}

const REFRESH_MS = 30_000
const STARTING = 'Pulse is taking its first measurements.'
const UNREACHABLE = 'Pulse is not reachable right now.'
const GIB = 1024 ** 3

/** "8 GB", "7.6 GB" */
export function formatGigabytes(bytes: number): string {
  return `${Math.round((bytes / GIB) * 10) / 10} GB`
}

/**
 * The server's CPU and memory over the last hour from Teaz Pulse, for the
 * Performance tile, refreshed every 30 seconds (Pulse measures every 10).
 * Returns null when VITE_PULSE_URL is unset (plain `npm run dev`), so the
 * tile keeps its mock data, like the mock auth. Pulse lets any logged-in
 * user read it; only opening Pulse needs pulse-admin.
 */
export function usePulseLoad(): Ref<PerformanceLoad | null> {
  const pulseUrl = import.meta.env.VITE_PULSE_URL
  const load = ref<PerformanceLoad | null>(null)
  if (!pulseUrl) return load

  async function fetchLoad() {
    try {
      const token = await useAuth().getToken()
      const response = await fetch(`${pulseUrl}/api/load`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (response.status === 503) {
        load.value = { points: [], intervalMs: 0, windowMs: 0, server: '', emptyText: STARTING }
        return
      }
      if (!response.ok) throw new Error(`${response.status}`)
      const data: PulseLoad = await response.json()
      const ram = data.memoryTotalBytes || 1
      load.value = {
        points: data.history.map((p) => ({
          at: Date.parse(p.at),
          cpu: p.hostCpuPercent,
          cpuTeaz: p.teazCpuPercent,
          memory: (100 * p.hostMemoryBytes) / ram,
          memoryTeaz: (100 * p.teazMemoryBytes) / ram,
        })),
        intervalMs: data.intervalSeconds * 1000,
        windowMs: data.historySeconds * 1000,
        server: `${data.cores} cores · ${formatGigabytes(data.memoryTotalBytes)}`,
        emptyText: STARTING,
      }
    } catch (error) {
      console.warn('Pulse load not available', error)
      load.value = { points: [], intervalMs: 0, windowMs: 0, server: '', emptyText: UNREACHABLE }
    }
  }

  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    fetchLoad()
    timer = setInterval(fetchLoad, REFRESH_MS)
  })
  onBeforeUnmount(() => clearInterval(timer))

  return load
}
