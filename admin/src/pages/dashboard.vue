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
            <div class="h-80 d-flex align-center justify-center bg-gray-50 rounded">
              <p class="text-gray-500">グラフはここに表示されます（Chart.js等で実装）</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="elevation-0">
          <v-card-title>最近の活動</v-card-title>
          <v-list>
            <v-list-item density="compact" prepend-icon="mdi-account-plus-outline">
              <v-list-item-title class="text-sm">
                デバイスログイン
              </v-list-item-title>
              <v-list-item-subtitle class="text-xs">
                たった今
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
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

onMounted(async () => {
  await dashboardStore.fetchStats()
})
</script>
