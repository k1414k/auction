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

interface SalesTrendPoint {
  date: string
  orders: number
  revenue: number
}

interface RecentActivity {
  id: string
  title: string
  body: string
  createdAt: string
}

interface DashboardState {
  stats: DashboardStats | null
  recentOrders: DashboardOrderSummary[]
  salesTrend: SalesTrendPoint[]
  recentActivities: RecentActivity[]
  isLoading: boolean
}

interface DashboardResponse {
  stats: DashboardStats
  recent_orders: DashboardOrderSummary[]
  sales_trend: SalesTrendPoint[]
  recent_activities: RecentActivity[]
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    stats: null,
    recentOrders: [],
    salesTrend: [],
    recentActivities: [],
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
        this.salesTrend = data.sales_trend
        this.recentActivities = data.recent_activities
      } finally {
        this.isLoading = false
      }
    }
  }
})
