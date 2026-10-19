<script setup lang="ts">
import { Icon } from '@teeetime/teaz-pro-ui'
import type { FitnessLatestRun } from '@/data/fitnessRuns'

export interface FitnessLatestTileProps {
  icon: string
  name: string
  latest: FitnessLatestRun
}

defineProps<FitnessLatestTileProps>()

/* The user's latest run (from Teaz Fitness). Portal-only: it knows Fitness's data. */
</script>

<template>
  <div class="latest-tile">
    <div class="latest-tile__header">
      <Icon class="latest-tile__icon" :name="icon" />
      <span class="latest-tile__name">{{ name }}</span>
    </div>

    <div v-if="latest.run" class="latest-tile__body">
      <p class="latest-tile__run" :title="latest.run.name">{{ latest.run.name }} · {{ latest.run.date }}</p>
      <p class="latest-tile__distance">{{ latest.run.distance }} <span class="latest-tile__unit">km</span></p>
      <p class="latest-tile__detail">{{ latest.run.detail }}</p>
    </div>
    <p v-else class="latest-tile__empty">{{ latest.emptyText }}</p>

    <p v-if="latest.attribution" class="latest-tile__attribution">{{ latest.attribution }}</p>
  </div>
</template>

<style scoped>
.latest-tile {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  padding: 16px;
}

.latest-tile__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.latest-tile__icon {
  width: 28px;
  height: 28px;
  color: var(--color-text-secondary);
}

.latest-tile__name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.latest-tile__body {
  margin-top: auto;
  min-width: 0;
}

.latest-tile__run,
.latest-tile__detail {
  margin: 0;
  overflow: hidden;
  font-size: 0.78rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--color-text-secondary);
}

.latest-tile__distance {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-text-primary);
}

.latest-tile__unit {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.latest-tile__empty {
  margin: auto 0 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.latest-tile__attribution {
  margin: 6px 0 0;
  font-size: 0.62rem;
  color: var(--color-text-secondary);
}
</style>
