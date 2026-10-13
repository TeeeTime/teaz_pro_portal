<script setup lang="ts">
import { computed } from 'vue'

export interface GridLayoutProps {
  /** Number of columns at full width. */
  columns?: number
  /** Gap between cells. Number is treated as pixels. */
  gap?: number | string
  /** Reduce column count on smaller containers, never exceeding `columns`. */
  responsive?: boolean
  /** Let later items fill earlier gaps left by multi-span cells. */
  dense?: boolean
}

const props = withDefaults(defineProps<GridLayoutProps>(), {
  columns: 5,
  gap: 16,
  responsive: true,
  dense: true,
})

const gapCss = computed(() => (typeof props.gap === 'number' ? `${props.gap}px` : props.gap))
</script>

<template>
  <div class="grid-root" :style="{ '--grid-columns-configured': columns, '--grid-gap': gapCss }">
    <div class="grid-layout" :class="{ 'grid-layout--dense': dense, 'grid-layout--responsive': responsive }">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/*
 * Everything here is plain CSS — no ResizeObserver, no JS-computed pixel
 * values, no onMounted/lifecycle timing at all. An earlier version measured
 * `el.clientWidth` in JS to compute a cell size, applied it to row height,
 * and left column width to the browser's native `1fr` distribution. Those
 * are two independent calculations (a JS float vs. the engine's own
 * fr-unit resolution) that aren't guaranteed to round to the same device
 * pixel — invisible at 1x DPR, visible as uneven gutters on a HiDPI
 * display, which is exactly the kind of thing that differs between a
 * headless test and someone's actual Retina screen.
 *
 * Instead, both axes are driven by the exact same calc() expression, via
 * container query units (cqw = 1% of the query container's measured
 * inline size). It's one computation, done once by the browser's layout
 * engine, substituted into two properties — not two computations that
 * merely ought to agree.
 *
 * Two nested elements, not one: a query container cannot be queried
 * against its own size for its own styling — @container conditions only
 * match descendants of the container, never the container element itself.
 * .grid-root establishes the container; .grid-layout (its child) is what
 * actually gets sized/queried, including by the breakpoint rules below.
 */
.grid-root {
  container-type: inline-size;
}

.grid-layout {
  --grid-columns: var(--grid-columns-configured);
  --cell-size: calc((100cqw - (var(--grid-gap) * (var(--grid-columns) - 1))) / var(--grid-columns));
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), minmax(0, var(--cell-size, 1fr)));
  grid-auto-rows: var(--cell-size, auto);
  gap: var(--grid-gap);
  align-items: stretch;
}

.grid-layout--dense {
  grid-auto-flow: row dense;
}

/*
 * min(configured, cap): a smaller explicit `columns` prop is still
 * respected at every width (never pushed back up by a breakpoint), only
 * ever capped further down.
 *
 * !important is required: --grid-columns-configured is set via an inline
 * style (Vue's :style, from the `columns` prop), and inline styles beat
 * stylesheet rules regardless of specificity — including container/media
 * query rules — unless the stylesheet rule is !important. Safe here
 * because it only ever writes --grid-columns (derived), never the
 * configured value itself.
 */
@container (max-width: 1024px) {
  .grid-layout--responsive {
    --grid-columns: min(var(--grid-columns-configured), 3) !important;
  }
}

@container (max-width: 640px) {
  .grid-layout--responsive {
    --grid-columns: min(var(--grid-columns-configured), 2) !important;
  }
}

@container (max-width: 420px) {
  .grid-layout--responsive {
    --grid-columns: min(var(--grid-columns-configured), 1) !important;
  }
}

/*
 * Explicit, valid fallback for browsers without container query support
 * (Safari <16, Chrome <105, Firefox <110 — none expected for this app, but
 * worth not collapsing to grid-template-columns: none for). Without this,
 * an unrecognized `cqw` unit makes --cell-size invalid wherever it's
 * substituted, which for grid-template-columns resolves to its *initial*
 * value (none) rather than the var()'s own fallback argument — var()
 * fallbacks only apply when the custom property is unset, not when its
 * value is substituted somewhere it can't be used. Falls back to the
 * original aspect-ratio-based approximation on GridItem instead.
 */
@supports not (container-type: inline-size) {
  .grid-layout {
    grid-template-columns: repeat(var(--grid-columns), minmax(0, 1fr));
    grid-auto-rows: auto;
  }
}
</style>
