<template>
  <AdminLayout>
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h5 font-bold">商品一覧</h1>
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
          :items="items"
          :loading="isLoading"
          :show-actions="true"
          @delete="openDeleteDialog"
        >
          <template #[`item.price`]="{ item }">
            ¥{{ Number(item.price).toLocaleString() }}
          </template>

          <template #[`item.status`]="{ item }">
            <v-chip :color="statusColor(item.status)" label size="small">
              {{ statusText(item.status) }}
            </v-chip>
          </template>

          <template #[`item.image`]="{ item }">
            <div class="d-flex align-center">
              <v-avatar v-if="item.image" size="40">
                <v-img :src="item.image" alt="item image" cover />
              </v-avatar>
              <span v-else>-</span>
            </div>
          </template>
        </DataTable>
      </v-col>
    </v-row>

    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title>商品削除</v-card-title>

        <v-card-text>
          <p class="mb-2">
            「{{ deleteTarget?.title }}」を削除しますか？
          </p>
          <p class="text-caption text-medium-emphasis">
            この操作は元に戻せません。
          </p>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn
            variant="text"
            :disabled="isLoading"
            @click="closeDeleteDialog"
          >
            キャンセル
          </v-btn>

          <v-btn
            color="error"
            :loading="isLoading"
            @click="deleteItem"
          >
            削除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '~/components/layouts/AdminLayout.vue'
import DataTable from '~/components/common/DataTable.vue'
import type { Item } from '~/types/admin'
import { debugLog } from '@/lib/debugLog'
import { useAuthStore } from '@/stores/auth'

type ApiItem = {
  id: number
  title: string
  description: string
  price: number
  trading_status: string
  user_nickname?: string
  category_name?: string
  image?: string | null
  created_at: string
  updated_at: string
}

const authStore = useAuthStore()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const headers = [
  { title: '商品名', key: 'title' },
  { title: '価格', key: 'price', width: 120 },
  { title: 'ステータス', key: 'status', width: 120 },
  { title: 'カテゴリ', key: 'category', width: 140 },
  { title: '画像', key: 'image', width: 100, sortable: false },
  { title: '出品者', key: 'seller', width: 140 },
  { title: '登録日', key: 'createdAt', width: 180 },
  { title: '操作', key: 'actions', width: 120, sortable: false }
]

const items = ref<Item[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const deleteDialog = ref(false)
const deleteTarget = ref<Item | null>(null)

const mapApiToItem = (api: ApiItem): Item => ({
  id: api.id,
  title: api.title,
  description: api.description || '',
  price: api.price,
  category: api.category_name || '-',
  status: api.trading_status === 'sold' ? 'sold' : 'active',
  seller: api.user_nickname || '-',
  image: api.image || undefined,
  createdAt: api.created_at,
  updatedAt: api.updated_at
})

const statusText = (s: string) => {
  return {
    active: 'アクティブ',
    sold: '売却済み',
    removed: '削除済み'
  }[s] || s
}

const statusColor = (s: string) => {
  return {
    active: 'success',
    sold: 'warning',
    removed: 'error'
  }[s] || 'default'
}

const fetchItems = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    debugLog({
      hypothesisId: 'H3',
      location: 'admin/src/pages/items.vue:fetchItems',
      message: 'items_fetch_start',
      data: {
        origin: process.client ? window.location.origin : 'server',
        apiBase,
        url: `${apiBase}/admin/v1/items`
      }
    })

    const data = await $fetch<ApiItem[]>(`${apiBase}/admin/v1/items`, {
      headers: {
        ...authStore.authHeaders,
        Accept: 'application/json'
      }
    })

    items.value = data.map(mapApiToItem)
  } catch (e) {
    console.error(e)

    debugLog({
      hypothesisId: 'H3_H4',
      location: 'admin/src/pages/items.vue:fetchItems:catch',
      message: 'items_fetch_failed',
      data: {
        origin: process.client ? window.location.origin : 'server',
        apiBase,
        errorMessage: (e as any)?.message || null,
        errorStatus: (e as any)?.status || null
      }
    })

    errorMessage.value = '商品一覧の取得に失敗しました。'
  } finally {
    isLoading.value = false
  }
}

const openDeleteDialog = (item: Item) => {
  deleteTarget.value = item
  deleteDialog.value = true
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
  deleteTarget.value = null
}

const deleteItem = async () => {
  if (!deleteTarget.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    await $fetch(`${apiBase}/admin/v1/items/${deleteTarget.value.id}`, {
      method: 'DELETE',
      headers: {
        ...authStore.authHeaders,
        Accept: 'application/json'
      }
    })

    closeDeleteDialog()
    await fetchItems()
  } catch (e: any) {
    console.error('Failed to delete item:', e)
    errorMessage.value = e?.data?.error || '商品の削除に失敗しました。'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchItems)
</script>