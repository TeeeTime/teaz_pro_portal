<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/icons/Icon.vue'
import type { AppStat } from '@/data/mockApps'

export interface StatSparklineTileProps {
  icon: string
  name: string
  description?: string
  stat: AppStat
}

const props = defineProps<StatSparklineTileProps>()

/*
 * dataviz skill, "stat tile" contract: label + value + delta + a 12-point
 * sparkline in the de-emphasis hue, current period in the accent. The full
 * line stays in --color-text-secondary (never a chart-series color doing
 * double duty as text or vice versa); only the latest point gets the accent
 * dot, standing in for "current period."
 *
 * No hover/tooltip here even though a sparkline is technically a plot (the
 * skill's interaction step expects one on any plotted form): this lives
 * inside an already-clickable launcher tile, where a competing hover target
 * would conflict with the tile's own click-to-open behavior. The real,
 * fully interactive chart belongs to the Analytics app this tile opens —
 * this is only a glanceable preview of it.
 */
const VIEW_W = 120
const VIEW_H = 36
const PAD = 4

const points = computed(() => {
  const trend = props.stat.trend
  if (trend.length < 2) return ''
  const min = Math.min(...trend)
  const max = Math.max(...trend)
  const range = max - min || 1
  const stepX = (VIEW_W - PAD * 2) / (trend.length - 1)
  return trend
    .map((v, i) => {
      const x = PAD + i * stepX
      const y = VIEW_H - PAD - ((v - min) / range) * (VIEW_H - PAD * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

const lastPoint = computed(() => {
  const [x, y] = (points.value.split(' ').pop() ?? '0,0').split(',').map(Number)
  return { x, y }
})
</script>

<template>
  <div class="stat-tile">
    <div class="stat-tile__header">
      <Icon class="stat-tile__icon" :name="icon" />
      <span class="stat-tile__name">{{ name }}</span>
    </div>
    <p v-if="description" class="stat-tile__description">{{ description }}</p>

    <div class="stat-tile__figures">
      <span class="stat-tile__value">{{ stat.value }}</span>
      <span class="stat-tile__delta" :class="{ 'stat-tile__delta--good': stat.deltaGood }">
        <Icon :name="stat.deltaGood ? 'trend-up' : 'trend-down'" class="stat-tile__delta-icon" />
        {{ stat.deltaLabel }}
      </span>
    </div>

    <svg class="stat-tile__sparkline" :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`" preserveAspectRatio="none" aria-hidden="true">
      <polyline :points="points" fill="none" stroke="var(--color-text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <circle :cx="lastPoint.x" :cy="lastPoint.y" r="4" fill="var(--color-accent)" />
    </svg>
  </div>
</template>

<style scoped>
.stat-tile {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px;
}

.stat-tile__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-tile__icon {
  width: 28px;
  height: 28px;
  color: var(--color-text-secondary);
}

.stat-tile__name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.stat-tile__description {
  margin-top: 6px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.stat-tile__figures {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: auto;
}

.stat-tile__value {
  font-size: 2rem;
  font-weight: 600;
  font-variant-numeric: proportional-nums;
  color: var(--color-text-primary);
}

.stat-tile__delta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.stat-tile__delta-icon {
  width: 14px;
  height: 14px;
}

.stat-tile__delta--good {
  color: var(--color-status-good);
}

.stat-tile__sparkline {
  width: 100%;
  height: 36px;
  margin-top: 12px;
  overflow: visible;
}
</style>
