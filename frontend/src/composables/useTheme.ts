import { readonly, ref } from 'vue'

export const THEMES = ['light', 'dark', 'dark-blue'] as const
export type ThemeName = (typeof THEMES)[number]

export const THEME_LABELS: Record<ThemeName, string> = {
  light: 'Light',
  dark: 'Dark',
  'dark-blue': 'Dark Blue',
}

const STORAGE_KEY = 'teaz-portal-theme'

function isThemeName(value: string | null): value is ThemeName {
  return THEMES.includes(value as ThemeName)
}

function resolveInitialTheme(): ThemeName {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (isThemeName(stored)) return stored

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

const activeTheme = ref<ThemeName>('light')
let initialized = false

function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme
  localStorage.setItem(STORAGE_KEY, theme)
  activeTheme.value = theme
}

/**
 * Shared theme state: every call site reads/writes the same active theme,
 * applied to <html data-theme="..."> for themes.css to pick up.
 */
export function useTheme() {
  if (!initialized) {
    initialized = true
    applyTheme(resolveInitialTheme())
  }

  function setTheme(theme: ThemeName) {
    applyTheme(theme)
  }

  function cycleTheme() {
    const currentIndex = THEMES.indexOf(activeTheme.value)
    const next = THEMES[(currentIndex + 1) % THEMES.length] ?? THEMES[0]
    setTheme(next)
  }

  return {
    theme: readonly(activeTheme),
    themes: THEMES,
    themeLabels: THEME_LABELS,
    setTheme,
    cycleTheme,
  }
}
