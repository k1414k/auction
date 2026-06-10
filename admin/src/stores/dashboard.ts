import { defineStore } from 'pinia'
import type { DashboardStats } from '@/types/admin'
import { useAuthStore } from '@/stores/auth'

interface DashboardOrderSummary {
  id: number
  itemTitle: string
  price: number
  status: string
  createdAt: string
}

interface DashboardState {
  stats: DashboardStats | null
  recentOrders: DashboardOrderSummary[]
  isLoading: boolean
}

interface DashboardResponse {
  stats: DashboardStats
  recent_orders: DashboardOrderSummary[]
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    stats: null,
    recentOrders: [],
    isLoading: false
  }),

  getters: {
    getStats: (state) => state.stats
  },

  actions: {
    async fetchStats() {
      this.isLoading = true
      try {
        const config = useRuntimeConfig()
        const apiBase = config.public.apiBase as string
        const authStore = useAuthStore()

        const data = await $fetch<DashboardResponse>(`${apiBase}/admin/v1/dashboard`, {
          headers: {
            ...authStore.authHeaders,
            Accept: 'application/json'
          }
        })

        this.stats = data.stats
        this.recentOrders = data.recent_orders
      } finally {
        this.isLoading = false
      }
    }
  }
})
