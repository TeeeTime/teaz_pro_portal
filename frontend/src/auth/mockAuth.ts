import { readonly, ref } from 'vue'
import type { AuthService, AuthUser } from './types'

/*
 * Local-dev stand-in for Keycloak: always "logged in" as a fixed user, no
 * network calls. Used whenever VITE_KEYCLOAK_URL is not set.
 */
export function createMockAuth(): AuthService {
  const user = ref<AuthUser | null>(null)

  return {
    user: readonly(user),
    async init() {
      // Has every role the portal checks, so all tiles stay usable in dev.
      user.value = {
        name: 'Jordan Lee',
        username: 'jlee',
        email: 'jordan.lee@example.com',
        roles: ['pulse-admin'],
      }
    },
    async logout() {
      user.value = null
      window.location.reload()
    },
    async getToken() {
      return undefined
    },
  }
}
