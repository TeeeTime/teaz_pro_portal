<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@teeetime/teaz-pro-ui'

export interface QuickFormTileProps {
  icon: string
  name: string
}

defineProps<QuickFormTileProps>()

// Local-only state. Nothing here fetches or submits anywhere — per the
// portal's own scope, a real version would hand this off to the Reports
// app rather than do anything with it itself.
const reportName = ref('')
const format = ref('pdf')
</script>

<template>
  <div class="form-tile">
    <div class="form-tile__header">
      <Icon class="form-tile__icon" :name="icon" />
      <span class="form-tile__name">{{ name }}</span>
    </div>

    <!--
      click/keydown stopped here, not on the tile root: the surrounding
      GridItem is clickable (background/header click still opens the app),
      but these are real form controls — without stopping propagation,
      typing a space in the text input would also trigger GridItem's own
      space-to-activate handler, since keydown bubbles from any descendant.
    -->
    <div class="form-tile__fields" @click.stop @keydown.stop>
      <label class="form-tile__field">
        <span class="form-tile__label">Report name</span>
        <input v-model="reportName" type="text" placeholder="Q3 usage summary" />
      </label>

      <label class="form-tile__field">
        <span class="form-tile__label">Format</span>
        <select v-model="format">
          <option value="pdf">PDF</option>
          <option value="csv">CSV</option>
          <option value="xlsx">XLSX</option>
        </select>
      </label>

      <button type="button" class="form-tile__submit">Generate</button>
    </div>
  </div>
</template>

<style scoped>
.form-tile {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px;
}

.form-tile__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-tile__icon {
  width: 28px;
  height: 28px;
  color: var(--color-text-secondary);
}

.form-tile__name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-tile__fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.form-tile__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-tile__label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.form-tile__fields input,
.form-tile__fields select {
  font: inherit;
  font-size: 0.85rem;
  color: var(--color-text-primary);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
}

.form-tile__fields input:focus-visible,
.form-tile__fields select:focus-visible,
.form-tile__submit:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

.form-tile__submit {
  margin-top: 4px;
  padding: 8px 12px;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-on-accent);
  background-color: var(--color-accent);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.form-tile__submit:hover {
  background-color: var(--color-accent-hover);
}
</style>
