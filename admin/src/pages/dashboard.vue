<template>
  <AdminLayout>
    <v-row class="mb-6">
      <!-- 統計カード -->
      <v-col cols="12" sm="6" lg="3">
        <StatCard
          title="総ユーザー数"
          :value="dashboardStore.stats?.totalUsers || 0"
          icon="mdi-account-multiple-outline"
          color="primary"
          :change="dashboardStore.stats?.growthRate.users"
          format="number"
        />
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <StatCard
          title="総商品数"
          :value="dashboardStore.stats?.totalItems || 0"
          icon="mdi-package-variant-outline"
          color="success"
          :change="dashboardStore.stats?.growthRate.items"
          format="number"
        />
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <StatCard
          title="総注文数"
          :value="dashboardStore.stats?.totalOrders || 0"
          icon="mdi-cart-outline"
          color="warning"
          :change="dashboardStore.stats?.growthRate.orders"
          format="number"
        />
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <StatCard
          title="総売上"
          :value="dashboardStore.stats?.totalRevenue || 0"
          icon="mdi-cash-multiple"
          color="error"
          :change="dashboardStore.stats?.growthRate.revenue"
          format="currency"
        />
      </v-col>
    </v-row>

    <!-- グラフセクション -->
    <v-row class="mb-6">
      <v-col cols="12" lg="8">
        <v-card class="elevation-0">
          <v-card-title>売上推移</v-card-title>
          <v-card-text>
            <div class="h-80 bg-gray-50 rounded pa-4 d-flex align-end ga-3">
              <div
                v-for="point in salesTrend"
                :key="point.date"
                class="d-flex flex-column align-center flex-1 h-100 justify-end"
              >
                <div class="text-caption mb-2">
                  ¥{{ Number(point.revenue).toLocaleString() }}
                </div>
                <div
                  class="w-100 rounded bg-primary"
                  :style="{ height: `${trendHeight(point.revenue)}%`, minHeight: point.revenue > 0 ? '12px' : '4px', opacity: point.revenue > 0 ? 1 : 0.25 }"
                />
                <div class="text-caption mt-2 text-medium-emphasis">
                  {{ shortDate(point.date) }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="elevation-0">
          <v-card-title>最近の活動</v-card-title>
          <v-list v-if="recentActivities.length > 0">
            <v-list-item
              v-for="activity in recentActivities"
              :key="activity.id"
              density="compact"
              prepend-icon="mdi-history"
            >
              <v-list-item-title class="text-sm">
                {{ activity.title }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-xs">
                {{ activity.body }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-card-text v-else class="text-medium-emphasis">
            最近の活動はありません
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 最近のデータ -->
    <v-row>
      <v-col cols="12">
        <v-card class="elevation-0">
          <v-card-title class="d-flex justify-space-between align-center">
            最近の注文
            <v-btn
              text="すべて表示"
              variant="text"
              to="/orders"
              append-icon="mdi-arrow-right"
            />
          </v-card-title>
          <v-card-text>
            <DataTable
              :headers="orderHeaders"
              :items="recentOrders"
              :show-actions="false"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDashboardStore } from '~/stores/dashboard'
import AdminLayout from '~/components/layouts/AdminLayout.vue'
import StatCard from '~/components/common/StatCard.vue'
import DataTable from '~/components/common/DataTable.vue'

const dashboardStore = useDashboardStore()

const orderHeaders = [
  { title: '注文ID', key: 'id', width: 80 },
  { title: '商品', key: 'itemTitle' },
  { title: '価格', key: 'price' },
  { title: 'ステータス', key: 'status' },
  { title: '日時', key: 'createdAt' }
]

const recentOrders = computed(() => dashboardStore.recentOrders)
const salesTrend = computed(() => dashboardStore.salesTrend)
const recentActivities = computed(() => dashboardStore.recentActivities)
const maxRevenue = computed(() => Math.max(...salesTrend.value.map((point) => point.revenue), 0))

const trendHeight = (revenue: number) => {
  if (maxRevenue.value <= 0) return 4
  return Math.max(8, Math.round((revenue / maxRevenue.value) * 100))
}

const shortDate = (value: string) => {
  const date = new Date(value)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

onMounted(async () => {
  await dashboardStore.fetchStats()
})
</script>
