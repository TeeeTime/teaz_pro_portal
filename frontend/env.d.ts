/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Keycloak base URL, e.g. https://auth.teaz.pro. Unset = mock auth. */
  readonly VITE_KEYCLOAK_URL?: string
  readonly VITE_KEYCLOAK_REALM: string
  readonly VITE_KEYCLOAK_CLIENT_ID: string
  /** Teaz Pulse base URL, e.g. https://pulse.teaz.pro. Unset = mock rows in the status tile. */
  readonly VITE_PULSE_URL?: string
  /** Teaz Study base URL, e.g. https://study.teaz.pro. Unset = mock rows in the Study tile. */
  readonly VITE_STUDY_URL?: string
  /** Teaz Transit base URL, e.g. https://transit.teaz.pro. Unset = mock rows in the Transit tile. */
  readonly VITE_TRANSIT_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
