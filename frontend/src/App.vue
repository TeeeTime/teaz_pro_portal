<script setup lang="ts">
import { TopBar, useTheme } from '@teeetime/teaz-pro-ui'
import type { TopBarMenuItem } from '@teeetime/teaz-pro-ui'
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
  <TopBar
    app-name="Portal"
    :user-name="auth.user.value?.name"
    @select="onMenuSelect"
  />
  <DashboardView />
</template>
