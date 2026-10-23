<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@teeetime/teaz-pro-ui'
import type { CalendarToday, CalendarTodayEvent } from '@/data/calendarToday'

export interface CalendarTileProps {
  icon: string
  name: string
  today: CalendarToday
}

const props = defineProps<CalendarTileProps>()

/*
 * Today's events (from Teaz Calendar), drawn like Calendar's own views: each
 * event in its calendar's color (a strip and a tinted fill), all-day events
 * first, past events faded. Portal-only: it knows Calendar's data. Shows as
 * many rows as fit; when that's not all, the ones that are over go first.
 */
const ROW_HEIGHT = 30
const bodyEl = ref<HTMLElement | null>(null)
const fitting = ref(3)
let observer: ResizeObserver | undefined

const NOW = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Berlin' })

function nowMinutes(): number {
  const [h, m] = NOW.format(new Date()).split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

const now = ref(nowMinutes())
let clock: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    if (entry) fitting.value = Math.max(1, Math.floor(entry.contentRect.height / ROW_HEIGHT))
  })
  if (bodyEl.value) observer.observe(bodyEl.value)
  clock = setInterval(() => (now.value = nowMinutes()), 60_000)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  clearInterval(clock)
})

function past(event: CalendarTodayEvent): boolean {
  return !event.allDay && event.end <= now.value
}

const shown = computed(() => {
  let events = props.today.events
  // "+n more" sits below the measured body, so showing it already shrinks the room.
  const room = fitting.value
  // Too many: drop what's over first, then cut from the end.
  while (events.length > room && events.some(past)) {
    const index = events.findIndex(past)
    events = [...events.slice(0, index), ...events.slice(index + 1)]
  }
  const visible = events.slice(0, room)
  return { visible, more: props.today.events.length - visible.length }
})

function colorStyle(event: CalendarTodayEvent): Record<string, string> {
  return event.color ? { '--event-color': event.color } : {}
}
</script>

<template>
  <div class="calendar-tile">
    <div class="calendar-tile__header">
      <Icon class="calendar-tile__icon" :name="icon" />
      <span class="calendar-tile__name">{{ name }}</span>
      <span v-if="today.date" class="calendar-tile__date">{{ today.date }}</span>
    </div>

    <div ref="bodyEl" class="calendar-tile__body">
      <p v-if="!today.events.length" class="calendar-tile__empty">{{ today.emptyText }}</p>
      <ol v-else class="calendar-tile__list">
        <li
          v-for="event in shown.visible"
          :key="event.key"
          class="calendar-tile__event"
          :class="{ 'calendar-tile__event--past': past(event), 'calendar-tile__event--all-day': event.allDay }"
          :style="colorStyle(event)"
        >
          <span v-if="!event.allDay" class="calendar-tile__time">{{ event.time }}</span>
          <span class="calendar-tile__title" :title="event.title">{{ event.title }}</span>
        </li>
      </ol>
    </div>

    <p v-if="shown.more" class="calendar-tile__more">+{{ shown.more }} more</p>
  </div>
</template>

<style scoped>
.calendar-tile {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  padding: 16px;
}

.calendar-tile__header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.calendar-tile__icon {
  width: 28px;
  height: 28px;
  color: var(--color-text-secondary);
}

.calendar-tile__name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.calendar-tile__date {
  margin-left: auto;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  color: var(--color-text-secondary);
}

/* Takes whatever height is left; measured to decide how many rows fit. */
.calendar-tile__body {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  overflow: hidden;
}

.calendar-tile__empty {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.calendar-tile__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  list-style: none;
  padding: 0;
}

/*
 * As .event in Calendar: the calendar's color (iCloud data, not theme) as a
 * strip, and mixed into the surface as the fill, so text keeps the theme's
 * contrast in every theme.
 */
.calendar-tile__event {
  --event-color: var(--color-accent);
  display: flex;
  align-items: center;
  gap: 8px;
  height: 26px;
  padding: 0 8px;
  font-size: 0.78rem;
  color: var(--color-text-primary);
  background-color: color-mix(in srgb, var(--event-color) 18%, var(--color-surface));
  border-left: 3px solid var(--event-color);
  border-radius: var(--radius-sm);
}

.calendar-tile__event--all-day {
  font-weight: 500;
}

.calendar-tile__event--past {
  opacity: 0.55;
}

.calendar-tile__time {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}

.calendar-tile__title {
  min-width: 0;
  overflow: hidden;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.calendar-tile__event--all-day .calendar-tile__title {
  font-weight: 500;
}

.calendar-tile__more {
  margin: 6px 0 0;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}
</style>
