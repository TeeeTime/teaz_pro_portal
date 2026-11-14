import { onBeforeUnmount, ref } from 'vue'
import type { Ref } from 'vue'

/** Whether a CSS media query matches, kept up to date (rotation, resizing). */
export function useMediaQuery(query: string): Readonly<Ref<boolean>> {
  const list = window.matchMedia(query)
  const matches = ref(list.matches)
  const update = (event: MediaQueryListEvent) => (matches.value = event.matches)
  list.addEventListener('change', update)
  onBeforeUnmount(() => list.removeEventListener('change', update))
  return matches
}
