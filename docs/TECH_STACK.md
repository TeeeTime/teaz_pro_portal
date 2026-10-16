# Tech stack & conventions

This repo (`portal`) is the first app in a planned ecosystem of several
apps, each sharing the same stack and conventions. This doc is the
reference for that stack — what each app is built from, how it's scaffolded,
how it's run, and the decisions that should carry over to the next app
rather than being re-derived or re-debated each time.

If/when the ecosystem splits into one repo per app, copy this file (and
update it) into each new app's repo.

## Stack

| Layer    | Choice                                              |
| -------- | ---------------------------------------------------- |
| Frontend | Vue 3 + TypeScript, scaffolded via `create-vue`, built with Vite |
| Backend  | Spring Boot (Maven), Java 21                          |
| Layout   | One repo per app, each with a `frontend/` and `backend/` folder |

Current versions (portal, as of this writing): Vue `^3.5`, Vite `^8.2`,
TypeScript `~6.0`, Spring Boot `4.1.1`, Java `21`. Pin whatever the
Initializr/`create-vue` default is at scaffold time for a new app — don't
chase matching portal's exact versions later.

## Scaffolding a new app

Replace `<app>` below with the new app's name (lowercase, matches
`artifactId`).

**Frontend:**

```sh
npm create vue@latest frontend -- --typescript
```

Only `--typescript` is used — no router/Pinia/ESLint/testing added by
default. Add those per-app only if that app actually needs them (e.g. a
multi-page app needs `--router`); don't add them reflexively.

**Backend**, via Spring Initializr (check `https://start.spring.io/metadata/client`
first for the current default `bootVersion` — it moves, and the Initializr
only serves `.zip`s for currently-supported Spring Boot versions, not
arbitrary past ones):

```sh
curl -s https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=<current default from metadata> \
  -d baseDir=backend \
  -d groupId=pro.teaz \
  -d artifactId=<app> \
  -d name=<app> \
  -d packageName=pro.teaz.<app> \
  -d javaVersion=21 \
  -d dependencies=web \
  -o backend.zip && unzip -q backend.zip -d . && rm backend.zip
```

- `groupId` is always `pro.teaz`.
- `artifactId`/`packageName` match the app name.
- Add more `-d dependencies=` values (comma-separated) only for what that
  app actually needs (e.g. `web,data-jpa,postgresql` if it has a database —
  portal doesn't, it only links out to other apps).

**House convention:** rename the generated main class from
`<App>Application` to plain `Application` (and its test class to
`ApplicationTests`). Keeps the entry point name uniform across every app
regardless of app name.

```sh
cd backend
mv src/main/java/pro/teaz/<app>/<App>Application.java src/main/java/pro/teaz/<app>/Application.java
mv src/test/java/pro/teaz/<app>/<App>ApplicationTests.java src/test/java/pro/teaz/<app>/ApplicationTests.java
sed -i '' 's/<App>Application/Application/g' src/main/java/pro/teaz/<app>/Application.java src/test/java/pro/teaz/<app>/ApplicationTests.java
```

Verify both halves build before moving on:

```sh
cd backend && ./mvnw -q compile
cd frontend && npm install && npm run build
```

## Running locally

No Docker for local dev — it's unnecessary overhead for a Vite dev server
and a Spring Boot app that both already hot-reload on their own. Plain:

```sh
cd backend && ./mvnw spring-boot:run
cd frontend && npm run dev
```

### IntelliJ run configurations

Checked-in run configs live in `.idea/runConfigurations/` and show up in
IntelliJ's Run dropdown automatically — no manual setup needed, since Maven
and npm run configs only need the `pom.xml` / `package.json` path, not a
pre-imported module.

Portal has three:

- **Backend (Spring Boot)** — Maven run config, goal `spring-boot:run`,
  working dir `backend/`.
- **Frontend (npm run dev)** — npm run config, script `dev`, package.json
  in `frontend/`.
- **Run All (Frontend + Backend)** — compound config launching both.

To add the same three for a new app, copy the three XML files from
`.idea/runConfigurations/`, rename them and the `name=` attributes inside,
and the `$PROJECT_DIR$/backend` / `$PROJECT_DIR$/frontend` paths stay
correct as-is as long as the new app follows the same folder layout.

Note: `.idea/workspace.xml` and a few other local-state files are
gitignored (see `.idea/.gitignore`); `.idea/runConfigurations/` is not —
it's meant to be shared via git so every clone gets the same run configs.

### Project JDK

`.idea/misc.xml` sets the project SDK to a JDK named `ms-21` at
`languageLevel="JDK_21"`, matching the backend's `java.version=21`. That
name only resolves to an actual JDK if IntelliJ's global JDK table on the
machine happens to have an SDK registered under that exact name. On a
different machine (or if IntelliJ still shows "Project JDK is not
specified"), open **Project Structure → Project** and point it at any
locally installed JDK 21 — the name is cosmetic, the version is what
matters.

## Frontend conventions

- **Visual style**: simple over decorative, functionality/usability first —
  no rounded corners, no emoji (a small hand-drawn SVG icon set instead),
  IBM Plex Sans as the house typeface, every layout designed to work at
  mobile widths and at a half-desktop-screen width, not just full desktop.
  This applies to every app, not just portal. Full guide, including the
  reasoning and the icon/token mechanics: `frontend/docs/STYLE_GUIDE.md`.
- **Theming**: every themeable value is a CSS custom property defined in
  `frontend/src/styles/themes.css`, scoped per theme under
  `:root[data-theme="..."]`. Three themes exist today: `light`, `dark`,
  `dark-blue`. Components never hardcode a color. Full token reference and
  the checklist for adding a theme/token: `frontend/docs/COLOR_SCHEMES.md`.
- **Reusable layout primitives**: generic, app-agnostic components (e.g.
  `frontend/src/components/grid/GridLayout.vue` + `GridItem.vue`, and
  `frontend/src/components/layout/TopBar.vue`) are kept free of any
  app-specific knowledge on purpose — they're candidates to be pulled into
  a standalone component library shared across apps later. When building a
  new generic UI piece, ask "does this know anything about what app it's
  in?" — if yes, that knowledge belongs in a wrapper component (e.g.
  `AppTile.vue`) or a slot, not the primitive itself. See
  `frontend/src/components/grid/README.md` for a worked example.
- Scaffolding note: `create-vue`'s default boilerplate (welcome page, demo
  icons, Vue-green theme in `base.css`) gets deleted, not kept around — it
  isn't part of this stack's conventions.

## Auth

Login goes through the shared Keycloak at `https://auth.teaz.pro`, realm
`teazpro`. Apps never build their own login screen; they redirect to
Keycloak's hosted login page. Local dev stays offline and login-free via a
mock, and prod uses the real integration. Both sit behind the same interface:

- **Frontend** (`frontend/src/auth/`): components only call `useAuth()`
  (`user`, `logout()`, `getToken()`). `index.ts` picks `keycloakAuth.ts`
  when `VITE_KEYCLOAK_URL` is set, otherwise `mockAuth.ts`.
  `.env.production` sets it, so `npm run build` gets Keycloak and
  `npm run dev` gets the mock. Keycloak runs in `login-required` mode with
  PKCE: the app only mounts after a successful login.
- **Backend** (`backend/.../security/`): with the `prod` Spring profile,
  `SecurityConfig` makes every request require a Keycloak Bearer JWT
  (issuer from `application-prod.properties`). Without it,
  `MockSecurityConfig` permits everything.

Keycloak client setup for an app (Clients → Create client in realm `teazpro`):

- Client ID = app name (`portal`), **Client authentication off** (public
  client), only **Standard flow** enabled.
- Advanced → **PKCE Method `S256`**.
- Valid redirect URIs `https://<app>.teaz.pro/*`, Valid post logout
  redirect URIs `https://<app>.teaz.pro/*`, Web origins
  `https://<app>.teaz.pro`.

To test against the real Keycloak from your machine, add
`http://localhost:5173/*` and `http://localhost:5173` to the client
temporarily and run `npm run dev -- --mode production`.

## Deployment

Portal deploys with `compose.yml` at the repo root. On the VPS:

```sh
git pull && docker compose up -d --build
```

- `frontend/Dockerfile`: `npm run build` (bakes in `.env.production`),
  served by nginx with an SPA fallback (`frontend/nginx.conf`).
- `backend/Dockerfile`: Spring Boot jar, run with `SPRING_PROFILES_ACTIVE=prod`.
- Traefik routes `portal.teaz.pro` to the frontend and
  `portal.teaz.pro/api/*` to the backend (same origin, so no CORS needed).
  It expects the external Docker network `proxy` and the cert resolver `le`.

Shape shared by every app:

- One server hosts every app in the ecosystem.
- Each app gets its own subdomain (e.g. `portal.teaz.pro`,
  `inventory.teaz.pro`); a single shared **Traefik** instance on the server
  routes by `Host` header to whichever app's containers claim it. Traefik
  was the pick over hand-written Nginx server blocks specifically because
  adding the next app means adding Docker labels to its own compose file,
  not editing a shared proxy config.
- Apps don't run their own reverse proxy — just join the shared Docker
  network and label their containers with their subdomain.
- No database unless an app actually needs one (portal doesn't — it only
  links out to other apps). A database, if needed, belongs to that app's own
  compose file, not a shared instance.

Docker is for deployment only. Local dev stays Docker-free.
