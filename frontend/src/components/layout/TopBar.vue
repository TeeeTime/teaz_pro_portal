<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import Icon from '@/components/icons/Icon.vue'
import { useTheme } from '@/composables/useTheme'

export interface TopBarMenuItem {
  label: string
  icon?: string
}

export interface TopBarProps {
  userName?: string
  menuItems?: TopBarMenuItem[]
}

/*
 * Meant to be reused as-is across every app in the ecosystem — see
 * frontend/docs/STYLE_GUIDE.md. The default slot on the left is where an
 * app would put its own branding/name, so this component carries no
 * portal-specific content. Theme cycling lives here (not as a prop/slot)
 * specifically so every app gets working, consistent theme switching for
 * free just by using TopBar — nothing to wire up per app.
 */
const props = withDefaults(defineProps<TopBarProps>(), {
  userName: 'Guest User',
  menuItems: () => [
    { label: 'Profile', icon: 'user' },
    { label: 'Settings', icon: 'gear' },
    { label: 'Sign out', icon: 'logout' },
  ],
})

const emit = defineEmits<{ select: [TopBarMenuItem] }>()

const { theme, themeLabels, cycleTheme } = useTheme()

const initials = computed(() =>
  props.userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join(''),
)

const isOpen = ref(false)
const rootEl = ref<HTMLElement | null>(null)

function close() {
  isOpen.value = false
  document.removeEventListener('click', handleOutsideClick, true)
  document.removeEventListener('keydown', handleKeydown)
}

function open() {
  isOpen.value = true
  // Capture phase + next-tick-free: the click that opened the menu has
  // already fired by the time this listener is attached synchronously
  // after it, so it won't immediately close itself.
  document.addEventListener('click', handleOutsideClick, true)
  document.addEventListener('keydown', handleKeydown)
}

function toggle() {
  if (isOpen.value) close()
  else open()
}

function handleOutsideClick(event: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) close()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

function selectItem(item: TopBarMenuItem) {
  emit('select', item)
  close()
}

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick, true)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <header ref="rootEl" class="topbar">
    <div class="topbar__start">
      <slot />
    </div>

    <div class="topbar__profile">
      <button
        type="button"
        class="topbar__avatar"
        :aria-expanded="isOpen"
        aria-haspopup="menu"
        :aria-label="`Account menu for ${userName}`"
        @click="toggle"
      >
        {{ initials }}
      </button>

      <ul v-if="isOpen" class="topbar__menu" role="menu">
        <li role="none">
          <!--
            Cycles on repeated clicks rather than closing the menu, unlike
            the action items below — clicking it once to preview a theme
            then having to reopen the menu to try the next one would be
            tedious, and cycling is idempotent/non-destructive to repeat.
          -->
          <button type="button" class="topbar__menu-item" role="menuitem" @click="cycleTheme">
            <Icon name="theme" class="topbar__menu-icon" />
            Theme: {{ themeLabels[theme] }}
          </button>
        </li>
        <li class="topbar__menu-divider" role="separator" />
        <li v-for="item in menuItems" :key="item.label" role="none">
          <button type="button" class="topbar__menu-item" role="menuitem" @click="selectItem(item)">
            <Icon v-if="item.icon" :name="item.icon" class="topbar__menu-icon" />
            {{ item.label }}
          </button>
        </li>
      </ul>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 20px;
  height: 56px;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.topbar__start {
  display: flex;
  align-items: center;
  min-width: 0;
}

.topbar__profile {
  position: relative;
  flex-shrink: 0;
}

.topbar__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  /* Deliberate exception to the no-rounded-corners rule — see
     STYLE_GUIDE.md. An avatar is conventionally round; this is the one
     UI-chrome element where that convention wins over the house default. */
  border-radius: 50%;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-on-accent);
  background-color: var(--color-accent);
  border: none;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.topbar__avatar:hover {
  background-color: var(--color-accent-hover);
}

.topbar__avatar:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.topbar__menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 190px;
  padding: 4px;
  list-style: none;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 12px var(--color-shadow-strong);
}

.topbar__menu-divider {
  height: 1px;
  margin: 4px 6px;
  background-color: var(--color-border);
}

.topbar__menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  font: inherit;
  font-size: 0.85rem;
  text-align: left;
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.topbar__menu-item:hover {
  background-color: var(--color-surface-hover);
}

.topbar__menu-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
}

@media (max-width: 420px) {
  .topbar {
    padding: 0 12px;
  }
}
</style>
