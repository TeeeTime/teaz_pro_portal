<script setup lang="ts">
import Icon from '@/components/icons/Icon.vue'

export interface AppTileProps {
  icon: string
  name: string
  description?: string
  /** Larger tiles (2x1+) show the description; small 1x1 tiles stay icon + name only. */
  compact?: boolean
}

defineProps<AppTileProps>()
</script>

<template>
  <div class="app-tile" :class="{ 'app-tile--compact': compact }">
    <Icon class="app-tile__icon" :name="icon" />
    <span class="app-tile__name">{{ name }}</span>
    <span v-if="description && !compact" class="app-tile__description">{{ description }}</span>
  </div>
</template>

<style scoped>
.app-tile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 100%;
  padding: 16px;
  text-align: left;
}

.app-tile--compact {
  align-items: center;
  justify-content: center;
  text-align: center;
}

.app-tile__icon {
  width: 28px;
  height: 28px;
  color: var(--color-text-secondary);
}

.app-tile__name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.app-tile__description {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
</style>
