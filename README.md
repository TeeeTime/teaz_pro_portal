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

## Theme tokens

`frontend/src/styles/themes.css` is a copy of
`teaz_pro/tokens/themes.css`. Change the tokens there, then copy the
file here again.

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
