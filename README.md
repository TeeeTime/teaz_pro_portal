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
