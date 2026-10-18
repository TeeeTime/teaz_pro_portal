<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@teeetime/teaz-pro-ui'
import type { TransitBoard } from '@/data/transitBoard'

export interface TransitTileProps {
  icon: string
  name: string
  board: TransitBoard
}

const props = defineProps<TransitTileProps>()

/*
 * Next departures at the user's stop (from Teaz Transit). Portal-only: it
 * knows Transit's data. Shows as many rows as fit the tile's height instead
 * of paging: past the first few, later departures matter little here, and
 * the full board is one click away.
 */
const ROW_HEIGHT = 30
const listEl = ref<HTMLElement | null>(null)
const fitting = ref(3)
let observer: ResizeObserver | undefined

onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    if (entry) fitting.value = Math.max(1, Math.floor(entry.contentRect.height / ROW_HEIGHT))
  })
  if (listEl.value) observer.observe(listEl.value)
})
onBeforeUnmount(() => observer?.disconnect())

const visible = computed(() => props.board.departures.slice(0, fitting.value))
</script>

<template>
  <div class="transit-tile">
    <div class="transit-tile__header">
      <Icon class="transit-tile__icon" :name="icon" />
      <span class="transit-tile__name">{{ name }}</span>
    </div>
    <p v-if="board.station" class="transit-tile__station" :title="board.station">{{ board.station }}</p>

    <div ref="listEl" class="transit-tile__body">
      <p v-if="!board.departures.length" class="transit-tile__empty">{{ board.emptyText }}</p>
      <ol v-else class="transit-tile__list">
        <li
          v-for="departure in visible"
          :key="departure.key"
          class="transit-tile__row"
          :class="{ 'transit-tile__row--canceled': departure.canceled }"
        >
          <span class="transit-tile__time">{{ departure.time }}</span>
          <span class="transit-tile__line" :title="departure.line">{{ departure.line }}</span>
          <span class="transit-tile__destination" :title="departure.destination">{{ departure.destination }}</span>
          <!-- Delay and cancellation as text, never color alone (COLOR_SCHEMES.md). -->
          <span v-if="departure.canceled" class="transit-tile__alert" title="Canceled" aria-label="Canceled">X</span>
          <span v-else-if="departure.delay" class="transit-tile__alert">+{{ departure.delay }}</span>
        </li>
      </ol>
    </div>

    <p v-if="board.attribution" class="transit-tile__attribution" :title="board.attribution">
      {{ board.attribution }}
    </p>
  </div>
</template>

<style scoped>
.transit-tile {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  padding: 16px;
}

.transit-tile__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.transit-tile__icon {
  width: 28px;
  height: 28px;
  color: var(--color-text-secondary);
}

.transit-tile__name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.transit-tile__station {
  margin: 8px 0 0;
  overflow: hidden;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--color-text-secondary);
}

/* Takes whatever height is left; measured to decide how many rows fit. */
.transit-tile__body {
  flex: 1;
  min-height: 0;
  margin-top: 6px;
  overflow: hidden;
}

.transit-tile__empty {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.transit-tile__list {
  list-style: none;
  padding: 0;
}

.transit-tile__row {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  font-size: 0.78rem;
}

.transit-tile__row + .transit-tile__row {
  border-top: 1px solid var(--color-border);
}

.transit-tile__time {
  flex-shrink: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
}

.transit-tile__line {
  flex-shrink: 0;
  max-width: 4.5em;
  padding: 0 4px;
  overflow: hidden;
  font-weight: 700;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.transit-tile__destination {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--color-text-primary);
}

.transit-tile__alert {
  flex-shrink: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-status-critical);
}

.transit-tile__row--canceled .transit-tile__time,
.transit-tile__row--canceled .transit-tile__destination {
  text-decoration: line-through;
  color: var(--color-text-secondary);
}

.transit-tile__attribution {
  margin: 6px 0 0;
  overflow: hidden;
  font-size: 0.62rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--color-text-secondary);
}
</style>
