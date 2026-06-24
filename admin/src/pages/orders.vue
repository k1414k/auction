<template>
  <AdminLayout>
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex align-center justify-space-between">
        <div>
          <h1 class="text-h5 font-bold">注文一覧</h1>
          <p class="text-body-2 text-medium-emphasis mt-1">
            注文の進行状況と取引参加者を確認できます。
          </p>
        </div>
        <v-btn
          prepend-icon="mdi-refresh"
          variant="outlined"
          :loading="isLoading"
          @click="fetchOrders"
        >
          更新
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="errorMessage">
      <v-col cols="12">
        <v-alert type="error" variant="tonal">
          {{ errorMessage }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          label="注文を検索"
          placeholder="注文ID、商品名、購入者、出品者"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="statusFilter"
          label="ステータス"
          :items="filterStatusOptions"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <DataTable
          :headers="headers"
          :items="filteredOrders"
          :loading="isLoading"
          :show-actions="false"
        >
          <template #[`item.price`]="{ item }">
            ¥{{ Number(item.price).toLocaleString() }}
          </template>

          <template #[`item.status`]="{ item }">
            <v-chip :color="statusColor(item.status)" label size="small">
              {{ statusText(item.status) }}
            </v-chip>
          </template>

          <template #[`item.createdAt`]="{ item }">
            {{ formatDateTime(item.createdAt) }}
          </template>

          <template #[`item.detail`]="{ item }">
            <v-btn
              size="small"
              variant="text"
              color="primary"
              :to="`/orders/${item.id}`"
              append-icon="mdi-chevron-right"
            >
              詳細
            </v-btn>
          </template>
        </DataTable>
      </v-col>
    </v-row>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '~/components/layouts/AdminLayout.vue'
import DataTable from '~/components/common/DataTable.vue'
import type { OrderStatus, OrderSummary } from '~/types/admin'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const headers = [
  { title: '注文ID', key: 'id', width: 90 },
  { title: '商品', key: 'itemTitle' },
  { title: '価格', key: 'price', width: 120 },
  { title: 'ステータス', key: 'status', width: 150 },
  { title: '購入者', key: 'buyerNickname', width: 140 },
  { title: '出品者', key: 'sellerNickname', width: 140 },
  { title: '登録日', key: 'createdAt', width: 180 },
  { title: '詳細', key: 'detail', width: 100, sortable: false }
]

const statusOptions = [
  { value: 'waiting_payment', label: '支払い待ち' },
  { value: 'waiting_shipping', label: '発送待ち' },
  { value: 'waiting_review', label: '受取評価待ち' },
  { value: 'completed', label: '完了' }
]

const filterStatusOptions = [
  { value: 'all', label: 'すべて' },
  ...statusOptions
]

const orders = ref<OrderSummary[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const statusFilter = ref<'all' | OrderStatus>('all')

const filteredOrders = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase()

  return orders.value.filter((order) => {
    if (statusFilter.value !== 'all' && order.status !== statusFilter.value) {
      return false
    }

    if (!query) return true

    return [
      String(order.id),
      order.itemTitle,
      order.buyerNickname,
      order.sellerNickname
    ].some((value) => value.toLocaleLowerCase().includes(query))
  })
})

const fetchOrders = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    orders.value = await $fetch<OrderSummary[]>(`${apiBase}/admin/v1/orders`, {
      headers: {
        ...authStore.authHeaders,
        Accept: 'application/json'
      }
    })
  } catch (e: any) {
    errorMessage.value = e?.data?.error || '注文一覧の取得に失敗しました。'
  } finally {
    isLoading.value = false
  }
}

const statusText = (status: string) => statusOptions.find((item) => item.value === status)?.label || status

const statusColor = (status: string) => ({
  waiting_payment: 'grey',
  waiting_shipping: 'primary',
  waiting_review: 'warning',
  completed: 'success'
}[status] || 'default')

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(fetchOrders)
</script>
