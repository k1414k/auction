<template>
  <AdminLayout>
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h5 font-bold">カテゴリ管理</h1>
      </v-col>
    </v-row>

    <v-row v-if="errorMessage" class="mb-4">
      <v-col cols="12">
        <v-alert type="error" variant="tonal">
          {{ errorMessage }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-if="successMessage" class="mb-4">
      <v-col cols="12">
        <v-alert type="success" variant="tonal">
          {{ successMessage }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-end">
        <v-btn color="primary" @click="openCreateDialog">
          新規カテゴリ作成
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <DataTable
          :headers="headers"
          :items="categories"
          :loading="isLoading"
          :show-actions="true"
          @edit="openEditDialog"
          @delete="confirmDelete"
        >
          <template #[`item.image`]="{ item }">
            <div class="d-flex align-center">
              <v-avatar v-if="item.imageUrl" size="40">
                <v-img :src="item.imageUrl" alt="category image" cover />
              </v-avatar>
              <span v-else>-</span>
            </div>
          </template>

          <template #[`item.createdAt`]="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>
        </DataTable>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ isEditMode ? 'カテゴリ編集' : '新規カテゴリ作成' }}
        </v-card-title>

        <v-card-text>
          <v-form>
            <v-text-field
              v-model="form.name"
              label="カテゴリ名"
              variant="outlined"
              :disabled="isSubmitting"
              :rules="[v => !!v || 'カテゴリ名は必須です']"
              class="mb-4"
            />

            <v-file-input
              v-model="form.imageFile"
              label="画像（任意・JPEG/PNG/WebP）"
              variant="outlined"
              accept="image/jpeg,image/png,image/webp"
              prepend-icon="mdi-image-outline"
              :disabled="isSubmitting"
              show-size
              class="mb-2"
            />

            <div v-if="isEditMode && currentCategory?.imageUrl" class="mt-2">
              <div class="text-caption mb-1">現在の画像</div>
              <v-avatar size="56">
                <v-img
                  :src="currentCategory.imageUrl"
                  alt="current category image"
                  cover
                />
              </v-avatar>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" :disabled="isSubmitting" @click="closeDialog">
            キャンセル
          </v-btn>
          <v-btn color="primary" :loading="isSubmitting" @click="submit">
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title>カテゴリ削除</v-card-title>
        <v-card-text>
          <p class="mb-2">
            「{{ deleteTarget?.name }}」を削除しますか？
          </p>
          <p class="text-caption text-medium-emphasis">
            この操作は元に戻せません。
          </p>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" :disabled="isSubmitting" @click="closeDeleteDialog">
            キャンセル
          </v-btn>
          <v-btn color="error" :loading="isSubmitting" @click="deleteCategory">
            削除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminLayout from '~/components/layouts/AdminLayout.vue'
import DataTable from '~/components/common/DataTable.vue'
import type { Category } from '~/types/admin'
import { useAuthStore } from '@/stores/auth'

type ApiCategory = {
  id: number
  name: string
  image_url?: string | null
  created_at: string
  updated_at: string
}

const authStore = useAuthStore()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const headers = [
  { title: 'ID', key: 'id', width: 80 },
  { title: 'カテゴリ名', key: 'name' },
  { title: '画像', key: 'image', width: 120, sortable: false },
  { title: '登録日', key: 'createdAt', width: 140 },
  { title: '操作', key: 'actions', sortable: false, width: 160 }
]

const categories = ref<Category[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const dialog = ref(false)
const deleteDialog = ref(false)
const isEditMode = ref(false)

const currentCategory = ref<Category | null>(null)
const deleteTarget = ref<Category | null>(null)

const form = ref<{
  name: string
  imageFile: File | File[] | null
}>({
  name: '',
  imageFile: null
})

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const clearError = () => {
  errorMessage.value = ''
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('ja-JP')
}

const mapApiToCategory = (api: ApiCategory): Category => ({
  id: api.id,
  name: api.name,
  imageUrl: api.image_url || undefined,
  createdAt: api.created_at,
  updatedAt: api.updated_at
})

const normalizeFile = (fileInput: File | File[] | null): File | null => {
  if (!fileInput) return null
  if (Array.isArray(fileInput)) return fileInput[0] ?? null
  return fileInput
}

const fetchCategories = async () => {
  isLoading.value = true
  clearError()

  try {
    const data = await $fetch<ApiCategory[]>(`${apiBase}/admin/v1/categories`, {
      headers: {
        ...authStore.authHeaders,
        Accept: 'application/json'
      }
    })

    categories.value = data.map(mapApiToCategory)
    console.log('fetched categories:', categories.value)
  } catch (error: any) {
    console.error('Failed to fetch categories:', error)
    errorMessage.value = error?.data?.error ?? 'カテゴリ一覧の取得に失敗しました。'
    categories.value = []
  } finally {
    isLoading.value = false
  }
}

const openCreateDialog = () => {
  clearMessages()
  isEditMode.value = false
  currentCategory.value = null
  form.value = {
    name: '',
    imageFile: null
  }
  dialog.value = true
}

const openEditDialog = (category: Category) => {
  clearMessages()
  isEditMode.value = true
  currentCategory.value = category
  form.value = {
    name: category.name,
    imageFile: null
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  currentCategory.value = null
  form.value = {
    name: '',
    imageFile: null
  }
}

const buildFormData = () => {
  const fd = new FormData()
  fd.append('category[name]', form.value.name.trim())

  const file = normalizeFile(form.value.imageFile)
  if (file) {
    fd.append('category[image]', file)
  }

  return fd
}

const submit = async () => {
  if (!form.value.name.trim()) {
    errorMessage.value = 'カテゴリ名を入力してください。'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const body = buildFormData()

    const url =
      isEditMode.value && currentCategory.value
        ? `${apiBase}/admin/v1/categories/${currentCategory.value.id}`
        : `${apiBase}/admin/v1/categories`

    const method = isEditMode.value ? 'PATCH' : 'POST'

    await $fetch(url, {
      method,
      body,
      headers: {
        ...authStore.authHeaders,
        Accept: 'application/json'
      }
    })

    dialog.value = false
    await fetchCategories()
    successMessage.value = isEditMode.value
      ? 'カテゴリを更新しました。'
      : 'カテゴリを作成しました。'
  } catch (error: any) {
    console.error('Failed to submit category:', error)
    errorMessage.value =
      error?.data?.errors?.join?.('、') ||
      error?.data?.error ||
      'カテゴリの保存に失敗しました。'
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = (category: Category) => {
  clearMessages()
  deleteTarget.value = category
  deleteDialog.value = true
}

const closeDeleteDialog = () => {
  deleteDialog.value = false
  deleteTarget.value = null
}

const deleteCategory = async () => {
  if (!deleteTarget.value) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await $fetch(`${apiBase}/admin/v1/categories/${deleteTarget.value.id}`, {
      method: 'DELETE',
      headers: {
        ...authStore.authHeaders,
        Accept: 'application/json'
      }
    })

    deleteDialog.value = false
    deleteTarget.value = null
    await fetchCategories()
    successMessage.value = 'カテゴリを削除しました。'
  } catch (error: any) {
    console.error('Failed to delete category:', error)
    errorMessage.value =
      error?.data?.errors?.join?.('、') ||
      error?.data?.error ||
      'カテゴリの削除に失敗しました。'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchCategories)
</script>