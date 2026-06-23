<template>
  <AdminLayout>
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h5 font-bold">注文一覧</h1>
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
      <v-col cols="12">
        <DataTable
          :headers="headers"
          :items="orders"
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

          <template #[`item.detail`]="{ item }">
            <v-btn size="small" variant="text" color="primary" @click="openDetail(item)">
              詳細
            </v-btn>
          </template>
        </DataTable>
      </v-col>
    </v-row>

    <v-dialog v-model="detailDialog" max-width="640">
      <v-card>
        <v-card-title>注文詳細</v-card-title>
        <v-divider />
        <v-card-text v-if="selectedOrder" class="space-y-3">
          <div class="d-flex justify-space-between">
            <span class="text-medium-emphasis">注文ID</span>
            <strong>#{{ selectedOrder.id }}</strong>
          </div>
          <div class="d-flex justify-space-between">
            <span class="text-medium-emphasis">商品</span>
            <strong>{{ selectedOrder.itemTitle }}</strong>
          </div>
          <div class="d-flex justify-space-between">
            <span class="text-medium-emphasis">購入者</span>
            <span>{{ selectedOrder.buyer }}</span>
          </div>
          <div class="d-flex justify-space-between">
            <span class="text-medium-emphasis">出品者</span>
            <span>{{ selectedOrder.seller }}</span>
          </div>
          <div class="d-flex justify-space-between">
            <span class="text-medium-emphasis">価格</span>
            <strong>¥{{ Number(selectedOrder.price).toLocaleString() }}</strong>
          </div>
          <div>
            <span class="text-medium-emphasis d-block mb-1">配送先</span>
            <p>{{ selectedOrder.shippingAddress || '未登録' }}</p>
          </div>
          <v-select
            v-model="selectedStatus"
            label="ステータス"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="detailDialog = false">閉じる</v-btn>
          <v-btn color="primary" :loading="isUpdating" @click="updateStatus">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminLayout from '~/components/layouts/AdminLayout.vue'
import DataTable from '~/components/common/DataTable.vue'
import type { Order } from '~/types/admin'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const headers = [
  { title: '注文ID', key: 'id', width: 90 },
  { title: '商品', key: 'itemTitle' },
  { title: '価格', key: 'price', width: 120 },
  { title: 'ステータス', key: 'status', width: 150 },
  { title: '購入者', key: 'buyer', width: 140 },
  { title: '出品者', key: 'seller', width: 140 },
  { title: '登録日', key: 'createdAt', width: 180 },
  { title: '詳細', key: 'detail', width: 100, sortable: false }
]

const statusOptions = [
  { value: 'waiting_payment', label: '支払い待ち' },
  { value: 'waiting_shipping', label: '発送待ち' },
  { value: 'waiting_review', label: '受取評価待ち' },
  { value: 'completed', label: '完了' }
]

const orders = ref<Order[]>([])
const isLoading = ref(false)
const isUpdating = ref(false)
const errorMessage = ref('')
const detailDialog = ref(false)
const selectedOrder = ref<Order | null>(null)
const selectedStatus = ref<Order['status']>('waiting_payment')

const fetchOrders = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    orders.value = await $fetch<Order[]>(`${apiBase}/admin/v1/orders`, {
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

const openDetail = (order: Order) => {
  selectedOrder.value = order
  selectedStatus.value = order.status
  detailDialog.value = true
}

const updateStatus = async () => {
  if (!selectedOrder.value) return
  isUpdating.value = true
  try {
    const updated = await $fetch<Order>(`${apiBase}/admin/v1/orders/${selectedOrder.value.id}`, {
      method: 'PATCH',
      body: { status: selectedStatus.value },
      headers: {
        ...authStore.authHeaders,
        Accept: 'application/json'
      }
    })
    orders.value = orders.value.map((order) => order.id === updated.id ? updated : order)
    selectedOrder.value = updated
  } catch (e: any) {
    errorMessage.value = e?.data?.error || '注文の更新に失敗しました。'
  } finally {
    isUpdating.value = false
  }
}

const statusText = (status: string) => statusOptions.find((item) => item.value === status)?.label || status

const statusColor = (status: string) => ({
  waiting_payment: 'grey',
  waiting_shipping: 'primary',
  waiting_review: 'warning',
  completed: 'success'
}[status] || 'default')

onMounted(fetchOrders)
</script>
