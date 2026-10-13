<script setup lang="ts">
import Icon from '@/components/icons/Icon.vue'
import type { AgendaEvent } from '@/data/mockApps'

export interface AgendaTileProps {
  icon: string
  name: string
  events: AgendaEvent[]
}

defineProps<AgendaTileProps>()
</script>

<template>
  <div class="agenda-tile">
    <div class="agenda-tile__header">
      <Icon class="agenda-tile__icon" :name="icon" />
      <span class="agenda-tile__name">{{ name }}</span>
    </div>

    <ul class="agenda-tile__list">
      <li v-for="event in events" :key="event.time + event.title" class="agenda-tile__event">
        <span class="agenda-tile__time">{{ event.time }}</span>
        <span class="agenda-tile__title">{{ event.title }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.agenda-tile {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px;
}

.agenda-tile__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.agenda-tile__icon {
  width: 28px;
  height: 28px;
  color: var(--color-text-secondary);
}

.agenda-tile__name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.agenda-tile__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  list-style: none;
}

.agenda-tile__event {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-left: 10px;
  border-left: 2px solid var(--color-accent);
  font-size: 0.85rem;
}

.agenda-tile__time {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.agenda-tile__title {
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
