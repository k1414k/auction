import { defineStore } from 'pinia'
import type { AdminUser } from '@/types/admin'

interface AuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  token: {
    'access-token': string
    client: string
    uid: string
  } | null
}

type LoginResponseBody = {
  data?: {
    id?: number
    email?: string
    name?: string
    nickname?: string
    role?: AdminUser['role']
  }
}

type MyProfileResponse = {
  name?: string
  nickname?: string
  email?: string
  role?: AdminUser['role']
}

const STORAGE_KEY = 'admin_auth'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: null
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    authHeaders: (state): Record<string, string> => {
      if (!state.token) return {}
      return {
        'access-token': state.token['access-token'],
        client: state.token.client,
        uid: state.token.uid
      }
    }
  },

  actions: {
    restoreFromStorage() {
      if (!process.client) return

      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return

      try {
        const parsed = JSON.parse(raw) as { user: AdminUser; token: AuthState['token'] }
        this.user = parsed.user
        this.token = parsed.token
        this.isAuthenticated = !!parsed.user && !!parsed.token
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    },

    persistToStorage() {
      if (!process.client) return
      if (!this.user || !this.token) return
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: this.user, token: this.token }))
    },

    clearStorage() {
      if (!process.client) return
      localStorage.removeItem(STORAGE_KEY)
    },

    async login(email: string, password: string) {
      this.isLoading = true
      try {
        const config = useRuntimeConfig()
        const apiBase = config.public.apiBase as string

        const res = await $fetch.raw<LoginResponseBody>(`${apiBase}/auth/sign_in`, {
          method: 'POST',
          body: { email, password },
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        })

        const accessToken = String(res.headers.get('access-token') || '')
        const client = String(res.headers.get('client') || '')
        const uid = String(res.headers.get('uid') || '')

        if (!accessToken || !client || !uid) {
          throw new Error('Missing auth headers')
        }

        this.token = {
          'access-token': accessToken,
          client,
          uid
        }

        // role 判定はサーバー側の current_user を信頼する（sign_in のボディに含まれない構成でも動く）
        const profile = await $fetch<MyProfileResponse>(`${apiBase}/auction/v1/user`, {
          headers: {
            ...this.authHeaders,
            Accept: 'application/json'
          }
        })

        const role = (profile.role || res._data?.data?.role || 'user') as AdminUser['role']
        const name =
          (profile.nickname || profile.name || res._data?.data?.nickname || res._data?.data?.name || email) as string
        const id = Number(res._data?.data?.id || 0)

        this.user = {
          id: id || 0,
          email: profile.email || email,
          name,
          role,
          isActive: true,
          lastLogin: new Date().toISOString()
        }

        this.isAuthenticated = true
        this.persistToStorage()
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        const config = useRuntimeConfig()
        const apiBase = config.public.apiBase as string

        if (this.token) {
          await $fetch(`${apiBase}/auth/sign_out`, {
            method: 'DELETE',
            headers: {
              ...this.authHeaders,
              Accept: 'application/json'
            }
          })
        }
      } catch {
        // best-effort
      } finally {
        this.user = null
        this.token = null
        this.isAuthenticated = false
        this.clearStorage()
      }
    },

    async checkSession() {
      this.restoreFromStorage()

      if (!this.token) {
        this.user = null
        this.isAuthenticated = false
        return
      }

      try {
        const config = useRuntimeConfig()
        const apiBase = config.public.apiBase as string

        const res = await $fetch.raw(`${apiBase}/auth/validate_token`, {
          method: 'GET',
          headers: {
            ...this.authHeaders,
            Accept: 'application/json'
          }
        })

        const nextAccessToken = res.headers.get('access-token')
        const nextClient = res.headers.get('client')
        const nextUid = res.headers.get('uid')

        if (nextAccessToken && nextClient && nextUid) {
          this.token = {
            'access-token': String(nextAccessToken),
            client: String(nextClient),
            uid: String(nextUid)
          }
          this.persistToStorage()
        }

        this.isAuthenticated = true
      } catch {
        this.user = null
        this.token = null
        this.isAuthenticated = false
        this.clearStorage()
      }
    }
  }
})
