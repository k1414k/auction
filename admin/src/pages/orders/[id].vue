<template>
  <AdminLayout>
    <v-row class="mb-4">
      <v-col cols="12">
        <v-btn
          to="/orders"
          variant="text"
          prepend-icon="mdi-arrow-left"
          class="mb-2"
        >
          注文一覧へ戻る
        </v-btn>

        <div class="d-flex flex-wrap align-center ga-3">
          <h1 class="text-h5 font-bold">
            注文 #{{ route.params.id }}
          </h1>
          <v-chip
            v-if="order"
            :color="statusColor(order.status)"
            label
            size="small"
          >
            {{ statusText(order.status) }}
          </v-chip>
        </div>
      </v-col>
    </v-row>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
      <template #append>
        <v-btn variant="text" size="small" @click="fetchOrder">
          再読み込み
        </v-btn>
      </template>
    </v-alert>

    <v-row v-if="isLoading">
      <v-col cols="12">
        <v-skeleton-loader type="article, list-item-three-line, actions" />
      </v-col>
    </v-row>

    <template v-else-if="order">
      <v-row>
        <v-col cols="12" lg="8">
          <v-card>
            <v-card-title>注文情報</v-card-title>
            <v-divider />
            <v-list lines="two">
              <v-list-item title="商品" :subtitle="order.item.title">
                <template #append>
                  <strong>{{ formatPrice(order.item.price) }}</strong>
                </template>
              </v-list-item>
              <v-divider />
              <v-list-item title="販売方式" :subtitle="saleTypeText(order.item.saleType)" />
              <v-divider />
              <v-list-item title="配送先" :subtitle="order.shippingAddress || '未登録'" />
              <v-divider />
              <v-list-item title="注文日時" :subtitle="formatDateTime(order.createdAt)" />
              <v-divider />
              <v-list-item title="最終更新" :subtitle="formatDateTime(order.updatedAt)" />
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card>
            <v-card-title>取引状況</v-card-title>
            <v-divider />
            <v-card-text>
              <v-chip :color="statusColor(order.status)" label class="mb-4">
                {{ statusText(order.status) }}
              </v-chip>

              <template v-if="order.canUpdate">
                <v-select
                  v-model="selectedStatus"
                  label="ステータス"
                  :items="statusOptions"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  :disabled="isUpdating"
                />
                <v-btn
                  color="primary"
                  block
                  :loading="isUpdating"
                  :disabled="selectedStatus === order.status"
                  @click="updateStatus"
                >
                  ステータスを保存
                </v-btn>
              </template>

              <p v-else class="text-body-2 text-medium-emphasis">
                この注文を更新する権限はありません。
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-card height="100%">
            <v-card-title>購入者</v-card-title>
            <v-divider />
            <v-list>
              <v-list-item title="ユーザーID" :subtitle="String(order.buyer.id)" />
              <v-list-item title="ニックネーム" :subtitle="order.buyer.nickname" />
              <v-list-item title="メールアドレス" :subtitle="order.buyer.email" />
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card height="100%">
            <v-card-title>出品者</v-card-title>
            <v-divider />
            <v-list>
              <v-list-item title="ユーザーID" :subtitle="String(order.seller.id)" />
              <v-list-item title="ニックネーム" :subtitle="order.seller.nickname" />
              <v-list-item title="メールアドレス" :subtitle="order.seller.email" />
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="4">
          <v-card height="100%">
            <v-card-title>取引メッセージ</v-card-title>
            <v-divider />
            <v-card-text class="text-center py-8">
              <div class="text-h3 font-weight-bold">{{ order.messagesCount }}</div>
              <div class="text-body-2 text-medium-emphasis mt-2">メッセージ</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card height="100%">
            <v-card-title>評価</v-card-title>
            <v-divider />
            <v-card-text v-if="order.reviews.length === 0" class="text-medium-emphasis">
              評価はまだありません。
            </v-card-text>
            <v-list v-else lines="three">
              <template v-for="(review, index) in order.reviews" :key="review.id">
                <v-list-item
                  :title="reviewText(review.rating)"
                  :subtitle="review.comment || 'コメントなし'"
                >
                  <template #append>
                    <span class="text-caption text-medium-emphasis">
                      {{ formatDateTime(review.createdAt) }}
                    </span>
                  </template>
                </v-list-item>
                <v-divider v-if="index < order.reviews.length - 1" />
              </template>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-snackbar v-model="showSuccess" color="success" timeout="3000">
      注文ステータスを更新しました。
    </v-snackbar>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminLayout from '~/components/layouts/AdminLayout.vue'
import type { OrderDetail, OrderStatus } from '~/types/admin'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const statusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: 'waiting_payment', label: '支払い待ち' },
  { value: 'waiting_shipping', label: '発送待ち' },
  { value: 'waiting_review', label: '受取評価待ち' },
  { value: 'completed', label: '完了' }
]

const order = ref<OrderDetail | null>(null)
const selectedStatus = ref<OrderStatus>('waiting_payment')
const isLoading = ref(false)
const isUpdating = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)

const fetchOrder = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const data = await $fetch<OrderDetail>(`${apiBase}/admin/v1/orders/${route.params.id}`, {
      headers: {
        ...authStore.authHeaders,
        Accept: 'application/json'
      }
    })
    order.value = data
    selectedStatus.value = data.status
  } catch (error: any) {
    if (error?.status === 404 || error?.statusCode === 404) {
      errorMessage.value = '注文が見つかりません。'
    } else {
      errorMessage.value = error?.data?.error || '注文詳細の取得に失敗しました。'
    }
  } finally {
    isLoading.value = false
  }
}

const updateStatus = async () => {
  if (!order.value || !order.value.canUpdate || selectedStatus.value === order.value.status) return

  isUpdating.value = true
  errorMessage.value = ''

  try {
    const updated = await $fetch<OrderDetail>(`${apiBase}/admin/v1/orders/${order.value.id}`, {
      method: 'PATCH',
      body: { status: selectedStatus.value },
      headers: {
        ...authStore.authHeaders,
        Accept: 'application/json'
      }
    })
    order.value = updated
    selectedStatus.value = updated.status
    showSuccess.value = true
  } catch (error: any) {
    errorMessage.value = error?.data?.error || '注文ステータスの更新に失敗しました。'
  } finally {
    isUpdating.value = false
  }
}

const statusText = (status: string) =>
  statusOptions.find((item) => item.value === status)?.label || status

const statusColor = (status: string) => ({
  waiting_payment: 'grey',
  waiting_shipping: 'primary',
  waiting_review: 'warning',
  completed: 'success'
}[status] || 'default')

const saleTypeText = (saleType: OrderDetail['item']['saleType']) => ({
  fixed_price: '固定価格',
  auction: 'オークション',
  negotiation: '価格交渉'
}[saleType])

const reviewText = (rating: 'bad' | 'good') => rating === 'good' ? '良かった' : '残念だった'

const formatPrice = (price: number) => `¥${Number(price).toLocaleString('ja-JP')}`

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

onMounted(fetchOrder)
</script>
