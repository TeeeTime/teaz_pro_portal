import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import type { StatusRow } from '@teeetime/teaz-pro-ui'
import { useAuth } from '@/auth'

// Response of Pulse's GET /api/health (see teaz_pro_pulse README).
interface PulseHealth {
  status: StatusRow['state']
  checkedAt: string
  apps: { name: string; status: StatusRow['state']; running: number; total: number }[]
}

const REFRESH_MS = 60_000
const SEVERITY: Record<StatusRow['state'], number> = { critical: 0, warning: 1, good: 2 }

/**
 * Live app health from Teaz Pulse for the status tile, refreshed every
 * minute. Returns null when VITE_PULSE_URL is unset (plain `npm run dev`),
 * so the tile keeps its mock rows, like the mock auth.
 *
 * Rows are sorted worst first, so problems are always on the tile's first
 * page when the list needs paging.
 */
export function usePulseStatuses(): Ref<StatusRow[] | null> {
  const pulseUrl = import.meta.env.VITE_PULSE_URL
  const statuses = ref<StatusRow[] | null>(null)
  if (!pulseUrl) return statuses

  async function load() {
    try {
      const token = await useAuth().getToken()
      const response = await fetch(`${pulseUrl}/api/health`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error(`${response.status}`)
      const health: PulseHealth = await response.json()
      statuses.value = health.apps
        .map((app) => ({
          label: app.name,
          state: app.status,
          // Running/total only where an app has several containers (e.g. frontend + backend).
          detail: app.total > 1 ? `(${app.running}/${app.total})` : undefined,
        }))
        .sort((a, b) => SEVERITY[a.state] - SEVERITY[b.state])
    } catch (error) {
      console.warn('Pulse health not available', error)
      statuses.value = [{ label: 'Pulse unreachable', state: 'critical' }]
    }
  }

  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    load()
    timer = setInterval(load, REFRESH_MS)
  })
  onBeforeUnmount(() => clearInterval(timer))

  return statuses
}
