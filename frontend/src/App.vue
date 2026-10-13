<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import TopBar from '@/components/layout/TopBar.vue'
import DashboardView from '@/views/DashboardView.vue'

// Applies the persisted/system theme to <html data-theme> on first render.
useTheme()
</script>

<template>
  <TopBar user-name="Jordan Lee">
    <span class="app-name">Teaz Portal</span>
  </TopBar>
  <DashboardView />
</template>

<style scoped>
.app-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}
</style>
