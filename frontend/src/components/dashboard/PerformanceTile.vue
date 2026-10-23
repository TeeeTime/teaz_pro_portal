<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Icon } from '@teeetime/teaz-pro-ui'
import type { PerformanceLoad, PerformancePoint } from '@/data/pulseLoad'

export interface PerformanceTileProps {
  icon: string
  name: string
  load: PerformanceLoad
}

const props = defineProps<PerformanceTileProps>()

/*
 * The server's CPU and memory over the last hour (from Teaz Pulse), all four
 * lines on one chart. Both are a share of the server (CPU of all cores,
 * memory of its RAM), so they fit one 0-100% axis. Color says which measure
 * (CPU accent, memory orange), the line style whose (solid the whole server,
 * dashed the Teaz containers' part of it), so nothing relies on color alone.
 * Portal-only: it knows Pulse's data. Hovering moves a crosshair and the
 * legend reads out that moment; otherwise it shows the latest values.
 */
const MARGIN = { top: 6, right: 4, bottom: 6, left: 36 }
const Y_TICKS = [0, 50, 100]

const plotEl = ref<HTMLElement | null>(null)
const width = ref(600)
const height = ref(120)
let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    if (!entry) return
    width.value = Math.max(120, entry.contentRect.width)
    height.value = Math.max(40, entry.contentRect.height)
  })
  if (plotEl.value) observer.observe(plotEl.value)
})
// The plot only exists once there are points, which can come after mounting.
watch(plotEl, (el, old) => {
  if (old) observer?.unobserve(old)
  if (el) observer?.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())

const points = computed(() => props.load.points)
const end = computed(() => points.value.at(-1)?.at ?? 0)
const start = computed(() => end.value - props.load.windowMs)

function x(at: number): number {
  const span = props.load.windowMs || 1
  return MARGIN.left + ((at - start.value) / span) * (width.value - MARGIN.left - MARGIN.right)
}

function y(percent: number): number {
  const clamped = Math.min(100, Math.max(0, percent))
  return height.value - MARGIN.bottom - (clamped / 100) * (height.value - MARGIN.top - MARGIN.bottom)
}

/** A gap of more than three intervals (Pulse was down) breaks the line. */
function line(value: (p: PerformancePoint) => number): string {
  const maxGap = 3 * (props.load.intervalMs || Infinity)
  return points.value
    .map((p, i) => {
      const prev = points.value[i - 1]
      const move = !prev || p.at - prev.at > maxGap
      return `${move ? 'M' : 'L'}${x(p.at).toFixed(1)},${y(value(p)).toFixed(1)}`
    })
    .join('')
}

const series = computed(() => [
  { key: 'cpu', label: 'CPU', d: line((p) => p.cpu), measure: 'cpu', teaz: false },
  { key: 'cpu-teaz', label: 'Teaz CPU', d: line((p) => p.cpuTeaz), measure: 'cpu', teaz: true },
  { key: 'memory', label: 'Memory', d: line((p) => p.memory), measure: 'memory', teaz: false },
  { key: 'memory-teaz', label: 'Teaz memory', d: line((p) => p.memoryTeaz), measure: 'memory', teaz: true },
])

const hovered = ref<number | null>(null)

function onPointerMove(event: PointerEvent) {
  const svg = event.currentTarget as SVGElement
  const px = event.clientX - svg.getBoundingClientRect().left
  let best = 0
  points.value.forEach((p, i) => {
    if (Math.abs(x(p.at) - px) < Math.abs(x(points.value[best]!.at) - px)) best = i
  })
  hovered.value = points.value.length ? best : null
}

const shown = computed(() => points.value[hovered.value ?? points.value.length - 1])

const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

function percent(value: number | undefined): string {
  return value === undefined ? '–' : `${Math.round(value)}%`
}

const legend = computed(() => {
  const p = shown.value
  return [
    { ...series.value[0]!, value: percent(p?.cpu) },
    { ...series.value[1]!, value: percent(p?.cpuTeaz) },
    { ...series.value[2]!, value: percent(p?.memory) },
    { ...series.value[3]!, value: percent(p?.memoryTeaz) },
  ]
})

const readoutTime = computed(() => (hovered.value === null || !shown.value ? 'Now' : TIME.format(shown.value.at)))
const windowLabel = computed(() => `−${Math.round(props.load.windowMs / 60_000)} min`)
</script>

<template>
  <div class="perf-tile">
    <div class="perf-tile__header">
      <Icon class="perf-tile__icon" :name="icon" />
      <span class="perf-tile__name">{{ name }}</span>
      <span v-if="load.server" class="perf-tile__server">{{ load.server }}</span>
    </div>

    <template v-if="points.length >= 2">
      <ul class="perf-tile__legend">
        <li v-for="item in legend" :key="item.key" class="perf-tile__legend-item">
          <svg class="perf-tile__key" viewBox="0 0 16 4" aria-hidden="true">
            <line
              x1="0"
              y1="2"
              x2="16"
              y2="2"
              :class="[`perf-tile__stroke--${item.measure}`, { 'perf-tile__stroke--teaz': item.teaz }]"
            />
          </svg>
          {{ item.label }} <span class="perf-tile__value">{{ item.value }}</span>
        </li>
        <li class="perf-tile__time">{{ readoutTime }}</li>
      </ul>

      <div ref="plotEl" class="perf-tile__plot">
        <svg
          :width="width"
          :height="height"
          role="img"
          :aria-label="`CPU and memory of the server and of the Teaz containers, last ${Math.round(load.windowMs / 60_000)} minutes`"
          @pointermove="onPointerMove"
          @pointerleave="hovered = null"
        >
          <g class="perf-tile__grid">
            <template v-for="tick in Y_TICKS" :key="tick">
              <line :x1="MARGIN.left" :x2="width - MARGIN.right" :y1="y(tick)" :y2="y(tick)" />
              <text :x="MARGIN.left - 6" :y="y(tick)" text-anchor="end" dominant-baseline="middle">{{ tick }}%</text>
            </template>
          </g>
          <path
            v-for="s in series"
            :key="s.key"
            class="perf-tile__line"
            :class="[`perf-tile__stroke--${s.measure}`, { 'perf-tile__stroke--teaz': s.teaz }]"
            :d="s.d"
          />
          <line
            v-if="hovered !== null && shown"
            class="perf-tile__cursor"
            :x1="x(shown.at)"
            :x2="x(shown.at)"
            :y1="MARGIN.top"
            :y2="height - MARGIN.bottom"
          />
        </svg>
      </div>
      <div class="perf-tile__axis" aria-hidden="true">
        <span>{{ windowLabel }}</span>
        <span>Now</span>
      </div>
    </template>
    <p v-else class="perf-tile__empty">{{ load.emptyText }}</p>
  </div>
</template>

<style scoped>
/*
 * Memory's series color: no chart tokens in themes.css yet, so set once here
 * per theme (validated against each theme's surface and accent). CPU uses
 * --color-accent.
 */
.perf-tile {
  --perf-memory: #eb6834;
}

:root[data-theme='dark'] .perf-tile,
:root[data-theme='dark-blue'] .perf-tile {
  --perf-memory: #d95926;
}

.perf-tile {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  padding: 16px;
}

.perf-tile__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.perf-tile__icon {
  width: 28px;
  height: 28px;
  color: var(--color-text-secondary);
}

.perf-tile__name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.perf-tile__server {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.perf-tile__legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px 14px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.perf-tile__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.perf-tile__key {
  width: 16px;
  height: 4px;
  overflow: visible;
}

.perf-tile__value {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
}

.perf-tile__time {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}

/* Takes the height that's left. */
.perf-tile__plot {
  flex: 1;
  min-height: 40px;
  margin-top: 6px;
  overflow: hidden;
}

.perf-tile__plot svg {
  display: block;
}

.perf-tile__grid line {
  stroke: var(--color-border);
  stroke-width: 1;
}

.perf-tile__grid text {
  font-size: 0.65rem;
  fill: var(--color-text-secondary);
}

.perf-tile__line,
.perf-tile__key line {
  fill: none;
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.perf-tile__stroke--cpu {
  stroke: var(--color-accent);
}

.perf-tile__stroke--memory {
  stroke: var(--perf-memory);
}

.perf-tile__stroke--teaz {
  stroke-dasharray: 4 3;
  stroke-linecap: butt;
}

.perf-tile__cursor {
  stroke: var(--color-text-secondary);
  stroke-width: 1;
}

.perf-tile__axis {
  display: flex;
  justify-content: space-between;
  margin-top: 2px;
  padding-left: 36px;
  font-size: 0.65rem;
  color: var(--color-text-secondary);
}

.perf-tile__empty {
  margin: auto 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}
</style>
