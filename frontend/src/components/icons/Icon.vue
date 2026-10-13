<script setup lang="ts">
import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  CreditCard,
  FileBarChart,
  FileText,
  Headphones,
  LogOut,
  MessageSquare,
  Package,
  Search,
  Settings,
  Shield,
  SunMoon,
  TrendingDown,
  TrendingUp,
  User,
} from '@lucide/vue'

/*
 * House icon set, on top of lucide-vue (@lucide/vue) — see
 * frontend/docs/STYLE_GUIDE.md. The name-based API below is unchanged from
 * the hand-drawn set this replaced, so no call site (mockApps.ts, any
 * tile component) needed to change — only this lookup's internals did.
 *
 * Sizing is still controlled by consumers via CSS (width/height on the
 * `.icon` class, e.g. `.app-tile__icon { width: 28px; height: 28px; }`),
 * not Lucide's `size` prop — a CSS rule always overrides an SVG
 * presentation attribute, so this keeps every existing per-component size
 * working unchanged. Stroke width/line caps are Lucide's own defaults
 * (stroke-width 2, round caps/joins) — that's the library's visual
 * identity and is left as-is, distinct from and unrelated to the
 * no-rounded-*corners* rule, which is about UI chrome (cards, buttons,
 * inputs), not icon glyph rendering.
 */
const ICONS = {
  analytics: BarChart3,
  box: Package,
  card: CreditCard,
  person: User,
  calendar: Calendar,
  headset: Headphones,
  docs: FileText,
  chat: MessageSquare,
  report: FileBarChart,
  archive: Archive,
  shield: Shield,
  gear: Settings,
  pulse: Activity,
  search: Search,
  bell: Bell,
  'chevron-down': ChevronDown,
  user: User,
  logout: LogOut,
  theme: SunMoon,
  'trend-up': TrendingUp,
  'trend-down': TrendingDown,
} as const

export interface IconProps {
  name: keyof typeof ICONS | (string & {})
}

const props = defineProps<IconProps>()
</script>

<template>
  <component :is="ICONS[props.name as keyof typeof ICONS]" class="icon" aria-hidden="true" />
</template>

<style scoped>
.icon {
  width: 1.5em;
  height: 1.5em;
  flex-shrink: 0;
}
</style>
