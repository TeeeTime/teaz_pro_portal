<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@teeetime/teaz-pro-ui'

export interface TimeTileProps {
  icon: string
  name: string
}

defineProps<TimeTileProps>()

/*
 * The current time with seconds, from the device's own clock and time zone:
 * no app behind it, nothing fetched. Ticks on each full second, so the
 * seconds change together with the system clock instead of drifting.
 */
const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
const DATE = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

const time = ref('')
const date = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

function tick() {
  const now = new Date()
  time.value = TIME.format(now)
  date.value = DATE.format(now)
  timer = setTimeout(tick, 1000 - now.getMilliseconds())
}

onMounted(tick)
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="time-tile">
    <div class="time-tile__header">
      <Icon class="time-tile__icon" :name="icon" />
      <span class="time-tile__name">{{ name }}</span>
    </div>

    <div class="time-tile__body">
      <p class="time-tile__time">
        <time>{{ time }}</time>
      </p>
      <p class="time-tile__date">{{ date }}</p>
    </div>
  </div>
</template>

<style scoped>
.time-tile {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  padding: 16px;
}

.time-tile__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-tile__icon {
  width: 28px;
  height: 28px;
  color: var(--color-text-secondary);
}

.time-tile__name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.time-tile__body {
  margin-top: auto;
  min-width: 0;
}

/* Tabular digits, so the width doesn't jump every second. Scales with the tile, like a clock face. */
.time-tile__time {
  margin: 0;
  font-size: clamp(1.4rem, 17cqi, 2.4rem);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
  white-space: nowrap;
  color: var(--color-text-primary);
}

.time-tile__date {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}
</style>
