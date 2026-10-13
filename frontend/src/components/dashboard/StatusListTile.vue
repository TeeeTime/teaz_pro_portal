<script setup lang="ts">
import Icon from '@/components/icons/Icon.vue'
import type { StatusRow } from '@/data/mockApps'

export interface StatusListTileProps {
  icon: string
  name: string
  statuses: StatusRow[]
}

defineProps<StatusListTileProps>()

// Short, visible state words — not color alone. The warning swatch in
// particular is low-contrast on a light surface as a lone mark (see
// themes.css), so the text label is the real carrier, the swatch a
// secondary cue for at-a-glance scanning.
const STATE_LABEL: Record<StatusRow['state'], string> = {
  good: 'Operational',
  warning: 'Degraded',
  critical: 'Down',
}
</script>

<template>
  <div class="status-tile">
    <div class="status-tile__header">
      <Icon class="status-tile__icon" :name="icon" />
      <span class="status-tile__name">{{ name }}</span>
    </div>

    <ul class="status-tile__list">
      <li v-for="row in statuses" :key="row.label" class="status-tile__row">
        <span class="status-tile__label">{{ row.label }}</span>
        <span class="status-tile__state">
          <span class="status-tile__swatch" :class="`status-tile__swatch--${row.state}`" aria-hidden="true" />
          {{ STATE_LABEL[row.state] }}
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.status-tile {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px;
}

.status-tile__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-tile__icon {
  width: 28px;
  height: 28px;
  color: var(--color-text-secondary);
}

.status-tile__name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.status-tile__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  list-style: none;
}

.status-tile__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.78rem;
}

.status-tile__label {
  color: var(--color-text-primary);
}

.status-tile__state {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary);
}

.status-tile__swatch {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

.status-tile__swatch--good {
  background-color: var(--color-status-good);
}

.status-tile__swatch--warning {
  background-color: var(--color-status-warning);
}

.status-tile__swatch--critical {
  background-color: var(--color-status-critical);
}
</style>
