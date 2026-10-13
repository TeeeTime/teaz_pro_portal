<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/icons/Icon.vue'

export interface SearchFieldTileProps {
  icon: string
  name: string
}

defineProps<SearchFieldTileProps>()

const query = ref('')
</script>

<template>
  <div class="search-tile">
    <span class="search-tile__label">{{ name }}</span>

    <!-- see QuickFormTile for why click/keydown are stopped here rather
         than left to bubble into the surrounding clickable GridItem -->
    <div class="search-tile__field" @click.stop @keydown.stop>
      <Icon class="search-tile__icon" :name="icon" />
      <input v-model="query" type="search" placeholder="Search ecosystem…" :aria-label="name" />
    </div>
  </div>
</template>

<style scoped>
.search-tile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  padding: 16px;
}

.search-tile__label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.search-tile__field {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.search-tile__icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-secondary);
}

.search-tile__field input {
  flex: 1;
  min-width: 0;
  font: inherit;
  font-size: 0.85rem;
  color: var(--color-text-primary);
  background: transparent;
  border: none;
}

.search-tile__field input:focus {
  outline: none;
}

.search-tile__field:focus-within {
  border-color: var(--color-accent);
}

.search-tile__field input::placeholder {
  color: var(--color-text-secondary);
}
</style>
