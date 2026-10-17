# Grid components

`GridLayout` + `GridItem` are the two pieces of this dashboard meant to be
lifted into a shared Vue component library later. They have no knowledge of
"apps", "dashboards", or anything else app-specific — keep it that way.

Both are pure CSS for sizing — no `ResizeObserver`, no JS pixel measuring,
no lifecycle hooks. Everything resolves synchronously in one browser layout
pass via container queries. This wasn't the original design (see "History"
below) — it's the result of chasing a real, reproducible bug through two
wrong fixes first.

## GridLayout

Props:

| Prop         | Type               | Default | Notes                                             |
| ------------ | ------------------ | ------- | -------------------------------------------------- |
| `columns`    | `number`           | `5`     | Column count at full width.                       |
| `gap`        | `number \| string` | `16`    | Number = pixels. String passes through (`'1rem'`). |
| `responsive` | `boolean`          | `true`  | Shrinks columns on narrow containers, see below.   |
| `dense`      | `boolean`          | `true`  | `grid-auto-flow: dense` — later items fill gaps left by multi-span cells. |

Renders two nested elements, not one: an outer `.grid-root` (just a
`container-type: inline-size` carrier) wrapping the inner `.grid-layout`
(the actual `display: grid`). This split exists because **a container
cannot be queried against its own size for its own styling** — `@container`
conditions only ever match descendants of the element that establishes the
container, never that element itself. Putting `container-type` and the
`@container` breakpoint rules on the same element silently never matches
anything; the fix is for the breakpoints to target a child instead.

Responsive behavior caps the column count (never above `columns`) at three
breakpoints, measured against the grid's own width via container queries —
not `@media`/the viewport, since this component doesn't assume it's the
full page: ≤1024px → 3, ≤640px → 2, ≤420px → 1, expressed as `--grid-columns:
min(var(--grid-columns-configured), N) !important`. Both the `!important`
and the `min()` are load-bearing:

- `!important` — `--grid-columns-configured` is set via an inline style
  (Vue's `:style`, carrying the `columns` prop), and inline styles beat
  stylesheet rules regardless of specificity, container queries included,
  unless the stylesheet rule is `!important`.
- `min(configured, cap)` — so a smaller explicit `columns` prop is still
  respected at every width; a breakpoint only ever caps further down, never
  pushes the count back up past what was configured.

## GridItem

Props:

| Prop         | Type      | Default | Notes                                        |
| ------------ | --------- | ------- | --------------------------------------------- |
| `colSpan`    | `number`  | `1`     | Columns to span.                              |
| `rowSpan`    | `number`  | `1`     | Rows to span.                                 |
| `clickable`  | `boolean` | `false` | Adds button semantics, hover/focus affordance. |
| `disabled`   | `boolean` | `false` | Dims and disables interaction.                |
| `ariaLabel`  | `string`  | —       | For `clickable` items without visible text.    |

Emits `click: [MouseEvent | KeyboardEvent]`. Sets only `grid-column: span N`
/ `grid-row: span N` — deliberately **no** `aspect-ratio` (see below for
why that's not just unnecessary but actively wrong here).

### Why the cells are square

`GridLayout` computes one `--cell-size`: `(100cqw - gap * (columns - 1)) /
columns`, using container query units (`cqw`, 1% of `.grid-root`'s measured
inline size) — not a JS-measured pixel value. That one expression is used
for **both** `grid-auto-rows` and every column in `grid-template-columns`.
A `colSpan × rowSpan` item's box then works out to exactly `(colSpan *
cellSize + (colSpan-1) * gap)` by `(rowSpan * cellSize + (rowSpan-1) *
gap)` — square whenever `colSpan === rowSpan`, with columns and rows
structurally unable to disagree, since they're the same calc() evaluated
once by the engine, not two separately-computed values that merely ought
to match.

### History: two real bugs on the way here

This took three iterations to get right, each confirmed by a real,
reproducible failure — worth recording so the same traps don't get walked
into again if this is ever touched or extracted:

1. **`aspect-ratio: colSpan/rowSpan` alone, no sizing mechanism beyond
   that.** Ignores the gap between spanned cells, so multi-span items came
   out very slightly non-square — and since row height is shared across
   every item in a row, the error spread into a visibly uneven grid rather
   than staying contained to one odd tile.
2. **JS-measured `cellSize` (via `ResizeObserver` + `el.clientWidth`)
   applied to row height only, columns left on `1fr`/`minmax(0, 1fr)`.**
   This looked right in automated headless screenshots at 1x device pixel
   ratio, but was visibly wrong on an actual Retina display: the JS-computed
   float and the browser's native `fr`-unit track distribution are two
   independent calculations, and nothing guarantees they round to the same
   device pixel once DPR > 1. Confirmed by diffing the same page at 1x vs.
   2x vs. 3x `deviceScaleFactor` — identical at 1x, diverging above it.
   Fixed by switching to the single shared `cqw`-based `--cell-size`
   described above, removing the JS measurement entirely.
3. **Leftover `aspect-ratio: colSpan/rowSpan` on `GridItem`, kept "just as
   a fallback" after (2).** Once `GridLayout` no longer had any async
   measurement gap to bridge, this had no job left to do — but it wasn't
   inert. Verified with a script reading every tile's actual
   `getBoundingClientRect()` against its `grid-column`/`grid-row` span:
   every item where `colSpan !== rowSpan` (a 2×1 tile, a 1×2 tile) rendered
   with the wrong width, while every item where `colSpan === rowSpan`
   (including 1×1s) was pixel-exact — because a 1:1 ratio happens to match
   what default `stretch` alignment produces anyway, masking the conflict
   for square spans only. `aspect-ratio` on a grid item is **not** inert
   just because the grid area is definite-sized in both axes via `stretch`
   — removing it outright (not replacing it) was the actual fix.

Also hit along the way, not sizing-related but worth keeping in mind for
mock/demo data: `grid-auto-flow: dense` only *rearranges* items into
existing empty cells — if the sum of every item's `colSpan * rowSpan`
doesn't divide evenly into the grid, some cells are left with nothing
placed in them at all, rendering as an empty hole indistinguishable at a
glance from "the gaps look inconsistent."

### Verifying changes to this pair

Eyeballing a screenshot was not sufficient to catch bug 2 — it only showed
up at DPR > 1, which a default headless screenshot doesn't exercise. If
touching the sizing logic again, verify by reading real
`getBoundingClientRect()` values back out via a headless browser (Playwright
covers Chromium and WebKit — the latter is Safari's actual engine) across:
multiple `deviceScaleFactor`s (1, 2, 3+), multiple widths including
non-round ones and ones that land in each responsive breakpoint, and derive
the *expected* size per item from its own `colSpan`/`rowSpan` and the
grid's own resolved track widths — not by comparing tiles to each other,
which silently passes over bugs that affect a whole class of tile
uniformly (bug 3 above affected every non-square span identically, so nothing
looked "inconsistent" relative to its own kind, only relative to the grid's
actual geometry).

### Styling

All colors come from the CSS custom properties defined in
`src/styles/themes.css` (see `teaz_pro/docs/COLOR_SCHEMES.md`). Nothing in
either component hardcodes a color — that's what makes them theme-agnostic.
If this pair moves to its own package, `themes.css` (or an equivalent token
set) has to move with it, or be provided by the consuming app.
