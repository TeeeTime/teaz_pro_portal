<script setup lang="ts">
import GridLayout from '@/components/grid/GridLayout.vue'
import GridItem from '@/components/grid/GridItem.vue'
import AppTile from '@/components/dashboard/AppTile.vue'
import StatSparklineTile from '@/components/dashboard/StatSparklineTile.vue'
import AgendaTile from '@/components/dashboard/AgendaTile.vue'
import QuickFormTile from '@/components/dashboard/QuickFormTile.vue'
import SearchFieldTile from '@/components/dashboard/SearchFieldTile.vue'
import StatusListTile from '@/components/dashboard/StatusListTile.vue'
import { mockApps } from '@/data/mockApps'

function openApp(href: string) {
  if (href === '#') return
  window.location.href = href
}
</script>

<template>
  <div class="dashboard">
    <header class="dashboard__header">
      <h1 class="dashboard__title">Teaz Ecosystem</h1>
    </header>

    <!--
      Every tile still lives in a clickable GridItem regardless of variant —
      clicking the card (header, padding, background) opens the app. Tiles
      with real embedded controls (form, search) stop click/keydown
      propagation around just those controls so interacting with them
      doesn't also trigger the card's own "navigate" activation; see each
      component for that handling.
    -->
    <GridLayout :columns="5" :gap="16">
      <GridItem
        v-for="app in mockApps"
        :key="app.id"
        :col-span="app.colSpan"
        :row-span="app.rowSpan"
        clickable
        :aria-label="app.name"
        @click="openApp(app.href)"
      >
        <StatSparklineTile v-if="app.variant === 'stat' && app.stat" :icon="app.icon" :name="app.name" :description="app.description" :stat="app.stat" />
        <AgendaTile v-else-if="app.variant === 'agenda' && app.events" :icon="app.icon" :name="app.name" :events="app.events" />
        <QuickFormTile v-else-if="app.variant === 'form'" :icon="app.icon" :name="app.name" />
        <SearchFieldTile v-else-if="app.variant === 'search'" :icon="app.icon" :name="app.name" />
        <StatusListTile v-else-if="app.variant === 'status' && app.statuses" :icon="app.icon" :name="app.name" :statuses="app.statuses" />
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
