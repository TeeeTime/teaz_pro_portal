<script setup lang="ts">
import { AppTile, GridItem, GridLayout, NoAccessTile, ProgressListTile, StatusListTile } from '@teeetime/teaz-pro-ui'
import CalendarTile from '@/components/dashboard/CalendarTile.vue'
import FitnessLatestTile from '@/components/dashboard/FitnessLatestTile.vue'
import FitnessWeeklyTile from '@/components/dashboard/FitnessWeeklyTile.vue'
import PerformanceTile from '@/components/dashboard/PerformanceTile.vue'
import TimeTile from '@/components/dashboard/TimeTile.vue'
import TransitTile from '@/components/dashboard/TransitTile.vue'
import { mockApps } from '@/data/mockApps'
import type { EcosystemApp } from '@/data/mockApps'
import { useCalendarToday } from '@/data/calendarToday'
import { useFitnessTiles } from '@/data/fitnessRuns'
import { usePulseStatuses } from '@/data/pulseHealth'
import { usePulseLoad } from '@/data/pulseLoad'
import { useStudyCourses } from '@/data/studyOverview'
import { useTransitBoard } from '@/data/transitBoard'
import { useAuth } from '@/auth'

// Live from Teaz Pulse in builds; null in dev, where the mock rows stay.
const pulseStatuses = usePulseStatuses()
// Live from Teaz Pulse in builds; null in dev, where the mock chart stays.
const pulseLoad = usePulseLoad()
// Live from Study in builds (if the user has its role); null in dev.
const studyCourses = useStudyCourses('study-user')
// Live from Transit in builds; null in dev.
const transitBoard = useTransitBoard()
// Live from Fitness in builds; null in dev.
const fitness = useFitnessTiles()
// Live from Calendar in builds; null in dev.
const calendarToday = useCalendarToday()

const auth = useAuth()

function hasRole(app: EcosystemApp): boolean {
  return !app.requiredRole || (auth.user.value?.roles.includes(app.requiredRole) ?? false)
}

function canOpen(app: EcosystemApp): boolean {
  return app.href !== undefined && hasRole(app)
}

function locked(app: EcosystemApp): boolean {
  return app.withoutRole === 'locked' && !hasRole(app)
}

function openApp(app: EcosystemApp) {
  if (canOpen(app)) window.location.href = app.href!
}
</script>

<template>
  <div class="dashboard">
    <header class="dashboard__header">
      <h1 class="dashboard__title">Teaz Ecosystem</h1>
    </header>

    <!--
      Every tile lives in a clickable GridItem regardless of variant —
      clicking anywhere on the card opens the app. The exceptions stay
      visible but aren't clickable: a tile without an app behind it (Time)
      and an app with a requiredRole the user lacks.
    -->
    <GridLayout :columns="5" :gap="16">
      <GridItem
        v-for="app in mockApps"
        :key="app.id"
        :col-span="app.colSpan"
        :row-span="app.rowSpan"
        :clickable="canOpen(app)"
        :aria-label="app.name"
        @click="openApp(app)"
      >
        <NoAccessTile v-if="locked(app)" :icon="app.icon" :name="app.name" />
        <TimeTile v-else-if="app.variant === 'time'" :icon="app.icon" :name="app.name" />
        <CalendarTile
          v-else-if="app.variant === 'calendar' && app.calendar"
          :icon="app.icon"
          :name="app.name"
          :today="calendarToday ?? app.calendar"
        />
        <PerformanceTile
          v-else-if="app.variant === 'performance' && app.performance"
          :icon="app.icon"
          :name="app.name"
          :load="pulseLoad ?? app.performance"
        />
        <StatusListTile v-else-if="app.variant === 'status' && app.statuses" :icon="app.icon" :name="app.name" :statuses="pulseStatuses ?? app.statuses" />
        <ProgressListTile
          v-else-if="app.variant === 'progress' && app.progress"
          :icon="app.icon"
          :name="app.name"
          :items="studyCourses?.rows ?? app.progress"
          :empty-text="studyCourses?.emptyText"
        />
        <TransitTile
          v-else-if="app.variant === 'transit' && app.transit"
          :icon="app.icon"
          :name="app.name"
          :board="transitBoard ?? app.transit"
        />
        <FitnessLatestTile
          v-else-if="app.variant === 'fitness-latest' && app.fitnessLatest"
          :icon="app.icon"
          :name="app.name"
          :latest="fitness.latest.value ?? app.fitnessLatest"
        />
        <FitnessWeeklyTile
          v-else-if="app.variant === 'fitness-weekly' && app.fitnessWeekly"
          :icon="app.icon"
          :name="app.name"
          :weekly="fitness.weekly.value ?? app.fitnessWeekly"
        />
        <AppTile
          v-else
          :icon="app.icon"
          :name="app.name"
          :description="app.description"
          :compact="(app.colSpan ?? 1) === 1 && (app.rowSpan ?? 1) === 1"
        />
      </GridItem>
    </GridLayout>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}

.dashboard__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
}

.dashboard__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
}
</style>
