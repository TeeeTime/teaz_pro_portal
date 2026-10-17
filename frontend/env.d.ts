/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Keycloak base URL, e.g. https://auth.teaz.pro. Unset = mock auth. */
  readonly VITE_KEYCLOAK_URL?: string
  readonly VITE_KEYCLOAK_REALM: string
  readonly VITE_KEYCLOAK_CLIENT_ID: string
  /** Teaz Pulse base URL, e.g. https://pulse.teaz.pro. Unset = mock rows in the status tile. */
  readonly VITE_PULSE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
