<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@teeetime/teaz-pro-ui'
import type { FitnessWeekly } from '@/data/fitnessRuns'

export interface FitnessWeeklyTileProps {
  icon: string
  name: string
  weekly: FitnessWeekly
}

const props = defineProps<FitnessWeeklyTileProps>()

/*
 * Kilometers per week (from Teaz Fitness) as plain bars. Portal-only: it
 * knows Fitness's data. Like StatSparklineTile, no hover/tooltip: the whole
 * tile is clickable and opens Fitness, where the full chart has them. The
 * current week (so far) is the accent bar, earlier weeks the de-emphasis
 * hue. Square bar ends, per the house rule.
 */
const max = computed(() => Math.max(...props.weekly.weeks.map((w) => w.km), 1))

function height(km: number): string {
  return `${(km / max.value) * 100}%`
}

const DAY_MONTH = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const firstLabel = computed(() => {
  const first = props.weekly.weeks[0]
  return first ? DAY_MONTH.format(new Date(`${first.weekStart}T00:00:00Z`)) : ''
})
</script>

<template>
  <div class="weekly-tile">
    <div class="weekly-tile__header">
      <Icon class="weekly-tile__icon" :name="icon" />
      <span class="weekly-tile__name">{{ name }}</span>
    </div>

    <template v-if="weekly.weeks.length">
      <div class="weekly-tile__figures">
        <span class="weekly-tile__value">{{ weekly.thisWeek }} <span class="weekly-tile__unit">km this week</span></span>
        <span class="weekly-tile__compare">Last week {{ weekly.lastWeek }} km</span>
      </div>

      <div class="weekly-tile__chart" role="img" :aria-label="`Kilometers per week, last ${weekly.weeks.length} weeks`">
        <div
          v-for="(week, i) in weekly.weeks"
          :key="week.weekStart"
          class="weekly-tile__column"
        >
          <div
            class="weekly-tile__bar"
            :class="{ 'weekly-tile__bar--current': i === weekly.weeks.length - 1 }"
            :style="{ height: height(week.km) }"
          />
        </div>
      </div>
      <div class="weekly-tile__axis" aria-hidden="true">
        <span>{{ firstLabel }}</span>
        <span>Now</span>
      </div>
    </template>
    <p v-else class="weekly-tile__empty">{{ weekly.emptyText }}</p>

    <p v-if="weekly.attribution" class="weekly-tile__attribution">{{ weekly.attribution }}</p>
  </div>
</template>

<style scoped>
.weekly-tile {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  padding: 16px;
}

.weekly-tile__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.weekly-tile__icon {
  width: 28px;
  height: 28px;
  color: var(--color-text-secondary);
}

.weekly-tile__name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.weekly-tile__figures {
  display: flex;
  flex-direction: column;
  margin-top: 12px;
}

.weekly-tile__value {
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-text-primary);
}

.weekly-tile__unit {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.weekly-tile__compare {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

/* Takes the height that's left. */
.weekly-tile__chart {
  flex: 1;
  min-height: 40px;
  display: flex;
  gap: 2px;
  margin-top: 12px;
  border-bottom: 1px solid var(--color-border);
}

.weekly-tile__column {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.weekly-tile__bar {
  width: min(24px, 70%);
  background-color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
}

/* Visible even at 0 km, so the current week is always marked. */
.weekly-tile__bar--current {
  min-height: 2px;
  background-color: var(--color-accent);
}

.weekly-tile__axis {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

.weekly-tile__empty {
  margin: auto 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.weekly-tile__attribution {
  margin: 6px 0 0;
  font-size: 0.62rem;
  color: var(--color-text-secondary);
}
</style>
