# teaz_pro_portal
Teaz Pro Portal, at `https://portal.teaz.pro`.

Monorepo: `frontend/` (Vue 3 + TypeScript) and `backend/` (Spring Boot, `pro.teaz:portal`).

Stack, conventions, style guide and color tokens shared by every Teaz app
live in **`teaz_pro`**: start with `docs/TECH_STACK.md` there. This
README only covers what is specific to portal.

## Running locally

```sh
cd backend && ./mvnw spring-boot:run
cd frontend && npm run dev
```

Or use the IntelliJ run configs in `.idea/runConfigurations/`:
**Backend (Spring Boot)**, **Frontend (npm run dev)** and
**Run All (Frontend + Backend)**. Locally, auth is mocked on both sides, so
no Keycloak is needed.

## Shared UI

`TopBar`, `GridLayout`/`GridItem`, `Icon`, the dashboard tiles, `useTheme()`
and the theme tokens come from **`teaz_pro_ui`**
(`@teeetime/teaz-pro-ui`, installed from GitHub, pinned to a tag in
`frontend/package.json`). Only portal-specific pieces stay here
(`QuickFormTile`, the mock data, the dashboard view). To pick up a new
release: `npm install github:TeeeTime/teaz_pro_ui#v<version>` in
`frontend/` (editing the tag and running a plain `npm install` keeps the
old version from the lock file).

## Status tile

The dashboard's Status tile shows every app's health from Teaz Pulse
(`GET https://pulse.teaz.pro/api/health` with the user's token, refreshed
every minute, worst first). Set by `VITE_PULSE_URL` in `.env.production`;
in `npm run dev` it's unset and the tile shows mock rows. Pulse must list
`https://portal.teaz.pro` in `pulse.cors.allowed-origins` (it does).

## Study tile

Top row, next to Inventory: the learner's Study courses with progress in
percent, from `GET https://study.teaz.pro/api/overview` (refreshed every 5
minutes). Set by `VITE_STUDY_URL` in `.env.production`; in `npm run dev` the
tile shows mock rows. Users without the realm role `study-user` get a
non-clickable "no access" tile instead, and portal doesn't call Study for
them. Study must list `https://portal.teaz.pro` in
`study.cors.allowed-origins` (it does).

## Transit tile

Second row, fourth column (1x1): the user's stop and its next departures
from `GET https://transit.teaz.pro/api/board` (refreshed every minute), as
many as fit the tile, with delays and cancellations and the data
attribution the license asks for. Users without a stop get "Pick your stop
in Transit."; the tile opens Transit. Set by `VITE_TRANSIT_URL` in
`.env.production`; in `npm run dev` the tile shows mock rows. No role
needed. Transit must list `https://portal.teaz.pro` in
`transit.cors.allowed-origins` (it does). The tile
(`components/dashboard/TransitTile.vue`) stays in portal, as it knows
Transit's data.

## Fitness tiles

Two tiles from Teaz Fitness (the user's Strava runs), both opening Fitness:

- **Latest run**, first row, first column (1x1): name, date, distance,
  pace and moving time from `GET https://fitness.teaz.pro/api/runs/latest`.
- **Weekly km**, first two rows, second and third column (2x2): this week's
  and last week's kilometers and a bar per week for the last 12 weeks
  (current week in the accent color) from
  `GET https://fitness.teaz.pro/api/runs/weekly?weeks=12`.

Both refresh every five minutes and show "Powered by Strava". Users
without a linked Strava account get "Connect Strava in Fitness.". Set by
`VITE_FITNESS_URL` in `.env.production`; in `npm run dev` the tiles show
mock data. No role needed. Fitness lists `https://portal.teaz.pro` in
`fitness.cors.allowed-origins`. Data in `data/fitnessRuns.ts`, tiles in
`components/dashboard/FitnessLatestTile.vue` and `FitnessWeeklyTile.vue`.
The tile positions come from the order in `data/mockApps.ts` (dense grid
flow); its comment shows the resulting layout.

## Calendar tile

Third row, fourth and fifth column (2x1): the user's events today from
`GET https://calendar.teaz.pro/api/events/today` (refreshed every five
minutes and right after midnight), drawn like Teaz Calendar's own views:
each event in its iCloud calendar's color, all-day events first, the "now"
line between what's over and what's next, past events faded. As many as fit;
when that's not all, the ones that are over go first and "+n more" counts the
rest. Users without a connected Apple calendar get "Connect your Apple
calendar in Calendar."; the tile opens Calendar. Set by `VITE_CALENDAR_URL`
in `.env.production`; in `npm run dev` the tile shows mock events. No role
needed. Calendar lists `https://portal.teaz.pro` in
`calendar.cors.allowed-origins`. Data in `data/calendarToday.ts`, tile in
`components/dashboard/CalendarTile.vue`.

## Auth

- Frontend `frontend/src/auth/`: Keycloak (`.env.production`: `auth.teaz.pro`,
  realm `teazpro`, client `portal`) in builds, mock user in `npm run dev`.
- Backend `backend/src/main/java/pro/teaz/portal/security/`: Bearer JWT
  required with the `prod` profile, everything permitted otherwise.

Keycloak client setup: see the Auth section in `teaz_pro/docs/TECH_STACK.md`.

## Deployment

On the VPS:

```sh
git pull && docker compose up -d --build
```

`compose.yml` routes `portal.teaz.pro` to the frontend (nginx) and
`portal.teaz.pro/api/*` to the backend, via the shared Traefik
(network `proxy`, cert resolver `le`).
