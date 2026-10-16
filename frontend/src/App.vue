<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import TopBar from '@/components/layout/TopBar.vue'
import type { TopBarMenuItem } from '@/components/layout/TopBar.vue'
import DashboardView from '@/views/DashboardView.vue'
import { useAuth } from '@/auth'

// Applies the persisted/system theme to <html data-theme> on first render.
useTheme()

const auth = useAuth()

function onMenuSelect(item: TopBarMenuItem) {
  if (item.label === 'Sign out') auth.logout()
}
</script>

<template>
  <TopBar :user-name="auth.user.value?.name" @select="onMenuSelect">
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
