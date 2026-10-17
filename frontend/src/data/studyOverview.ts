import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Ref } from 'vue'
import type { ProgressRow } from '@teeetime/teaz-pro-ui'
import { useAuth } from '@/auth'

// Response of Study's GET /api/overview (see teaz_pro_study README).
interface StudyOverview {
  courses: { id: string; title: string; percent: number }[]
}

export interface StudyCourses {
  rows: ProgressRow[]
  /** Shown when rows is empty: no courses yet, or Study not reachable. */
  emptyText: string
}

const REFRESH_MS = 5 * 60_000

/**
 * The learner's Study courses with progress in percent, for the Study tile.
 * Returns null when VITE_STUDY_URL is unset (plain `npm run dev`), so the tile
 * keeps its mock rows, like the mock auth. Only asks Study when the user has
 * its role: without it the dashboard shows a NoAccessTile instead.
 */
export function useStudyCourses(requiredRole: string): Ref<StudyCourses | null> {
  const studyUrl = import.meta.env.VITE_STUDY_URL
  const courses = ref<StudyCourses | null>(null)
  const auth = useAuth()
  if (!studyUrl || !auth.user.value?.roles.includes(requiredRole)) return courses

  async function load() {
    try {
      const token = await auth.getToken()
      const response = await fetch(`${studyUrl}/api/overview`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error(`${response.status}`)
      const overview: StudyOverview = await response.json()
      courses.value = {
        rows: overview.courses.map((course) => ({ label: course.title, percent: course.percent })),
        emptyText: 'No courses yet.',
      }
    } catch (error) {
      console.warn('Study overview not available', error)
      courses.value = { rows: [], emptyText: 'Study is not reachable right now.' }
    }
  }

  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    load()
    timer = setInterval(load, REFRESH_MS)
  })
  onBeforeUnmount(() => clearInterval(timer))

  return courses
}
