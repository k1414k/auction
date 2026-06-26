<template>
  <AdminLayout>
    <v-alert
      type="info"
      variant="tonal"
      class="mb-4"
    >
      メールアドレスとロールはユーザー管理で変更します。
    </v-alert>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card class="elevation-0">
          <v-card-title>アカウント設定</v-card-title>
          <v-divider />
          <v-card-text class="pa-8">
            <v-form @submit.prevent="saveAccount">
              <v-row>
                <v-col v-if="accountMessage || accountError" cols="12">
                  <v-alert
                    :type="accountError ? 'error' : 'success'"
                    variant="tonal"
                  >
                    {{ accountError || accountMessage }}
                  </v-alert>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="accountForm.name"
                    label="名前"
                    variant="outlined"
                    :disabled="accountLoading"
                    :error-messages="accountNameErrors"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    label="メールアドレス"
                    variant="outlined"
                    :model-value="authStore.currentUser?.email || ''"
                    readonly
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    label="ロール"
                    variant="outlined"
                    :model-value="authStore.currentUser?.role || ''"
                    readonly
                  />
                </v-col>

                <v-col cols="12" class="d-flex flex-wrap ga-3">
                  <v-btn
                    color="primary"
                    variant="flat"
                    type="submit"
                    :loading="accountLoading"
                    :disabled="!canSaveAccount"
                  >
                    保存
                  </v-btn>
                  <v-btn
                    variant="text"
                    :disabled="!accountDirty || accountLoading"
                    @click="resetAccountForm"
                  >
                    元に戻す
                  </v-btn>
                </v-col>

                <v-col cols="12">
                  <v-divider class="my-4" />
                </v-col>

                <v-col cols="12">
                  <h3 class="text-h6 mb-4">パスワード変更</h3>
                </v-col>

                <v-col v-if="passwordMessage || passwordError" cols="12">
                  <v-alert
                    :type="passwordError ? 'error' : 'success'"
                    variant="tonal"
                  >
                    {{ passwordError || passwordMessage }}
                  </v-alert>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="passwordForm.currentPassword"
                    label="現在のパスワード"
                    type="password"
                    variant="outlined"
                    autocomplete="current-password"
                    :disabled="passwordLoading"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="passwordForm.newPassword"
                    label="新しいパスワード"
                    type="password"
                    variant="outlined"
                    autocomplete="new-password"
                    :disabled="passwordLoading"
                    :error-messages="newPasswordErrors"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="passwordForm.newPasswordConfirmation"
                    label="パスワード確認"
                    type="password"
                    variant="outlined"
                    autocomplete="new-password"
                    :disabled="passwordLoading"
                    :error-messages="passwordConfirmationErrors"
                    @keyup.enter="changePassword"
                  />
                </v-col>

                <v-col cols="12">
                  <v-btn
                    color="primary"
                    variant="outlined"
                    :loading="passwordLoading"
                    :disabled="!canChangePassword"
                    @click="changePassword"
                  >
                    パスワード変更
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="elevation-0">
          <v-card-title>システム設定</v-card-title>
          <v-divider />
          <v-list>
            <v-list-item disabled>
              <template #prepend>
                <v-icon icon="mdi-bell-outline" />
              </template>
              <v-list-item-title>通知設定</v-list-item-title>
              <v-list-item-subtitle>未提供</v-list-item-subtitle>
              <template #append>
                <v-chip size="small" variant="tonal">未実装</v-chip>
              </template>
            </v-list-item>

            <v-list-item disabled>
              <template #prepend>
                <v-icon icon="mdi-lock-outline" />
              </template>
              <v-list-item-title>セキュリティ</v-list-item-title>
              <v-list-item-subtitle>未提供</v-list-item-subtitle>
              <template #append>
                <v-chip size="small" variant="tonal">未実装</v-chip>
              </template>
            </v-list-item>

            <v-list-item disabled>
              <template #prepend>
                <v-icon icon="mdi-cloud-outline" />
              </template>
              <v-list-item-title>バックアップ</v-list-item-title>
              <v-list-item-subtitle>未提供</v-list-item-subtitle>
              <template #append>
                <v-chip size="small" variant="tonal">未実装</v-chip>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-information-outline" />
              </template>
              <v-list-item-title>バージョン情報</v-list-item-title>
              <v-list-item-subtitle>v1.0.0</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card class="elevation-0 mt-6">
          <v-card-title>ログアウト</v-card-title>
          <v-card-text>
            <p class="text-sm text-gray-600 mb-4">
              このセッションからログアウトします。
            </p>
            <v-btn
              color="error"
              variant="outlined"
              block
              @click="handleLogout"
            >
              ログアウト
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </AdminLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import type { AdminUser } from '@/types/admin'
import AdminLayout from '~/components/layouts/AdminLayout.vue'

type AuthUpdateResponse = {
  data?: {
    id?: number
    email?: string
    name?: string
    nickname?: string
    role?: AdminUser['role']
  }
}

const router = useRouter()
const authStore = useAuthStore()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const accountLoading = ref(false)
const accountMessage = ref('')
const accountError = ref('')
const savedAccountName = ref('')
const accountForm = reactive({
  name: ''
})

const passwordLoading = ref(false)
const passwordMessage = ref('')
const passwordError = ref('')
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  newPasswordConfirmation: ''
})

const normalizedAccountName = computed(() => accountForm.name.trim())
const accountNameErrors = computed(() =>
  normalizedAccountName.value.length === 0 ? ['名前を入力してください。'] : []
)
const accountDirty = computed(() => normalizedAccountName.value !== savedAccountName.value)
const canSaveAccount = computed(() =>
  accountNameErrors.value.length === 0 &&
  accountDirty.value &&
  !accountLoading.value
)

const newPasswordErrors = computed(() => {
  if (!passwordForm.newPassword) return []
  return passwordForm.newPassword.length < 6 ? ['6文字以上で入力してください。'] : []
})
const passwordConfirmationErrors = computed(() => {
  if (!passwordForm.newPasswordConfirmation) return []
  return passwordForm.newPassword === passwordForm.newPasswordConfirmation
    ? []
    : ['新しいパスワードと一致しません。']
})
const canChangePassword = computed(() =>
  passwordForm.currentPassword.length > 0 &&
  passwordForm.newPassword.length >= 6 &&
  passwordForm.newPassword === passwordForm.newPasswordConfirmation &&
  !passwordLoading.value
)

watch(
  () => authStore.currentUser,
  (user) => {
    const name = user?.name || ''
    accountForm.name = name
    savedAccountName.value = name.trim()
  },
  { immediate: true }
)

const readFetchError = (e: unknown, fallback: string) => {
  const error = e as {
    data?: {
      errors?: string[] | Record<string, string[]>
      error?: string
      message?: string
    }
    message?: string
  }
  const errors = error.data?.errors
  if (Array.isArray(errors) && errors[0]) return errors[0]
  if (errors && typeof errors === 'object') {
    const first = Object.values(errors).flat()[0]
    if (first) return String(first)
  }
  return error.data?.error || error.data?.message || error.message || fallback
}

const applyCurrentUserUpdate = (data: AuthUpdateResponse['data'], fallbackName: string) => {
  const currentUser = authStore.currentUser
  if (!currentUser) return fallbackName

  const nextName = data?.name || fallbackName
  authStore.updateCurrentUser({
    id: data?.id ?? currentUser.id,
    email: data?.email ?? currentUser.email,
    name: nextName,
    role: data?.role ?? currentUser.role
  })
  return nextName
}

const saveAccount = async () => {
  if (!canSaveAccount.value) return
  accountLoading.value = true
  accountMessage.value = ''
  accountError.value = ''
  const name = normalizedAccountName.value

  try {
    const res = await $fetch.raw<AuthUpdateResponse>(`${apiBase}/auth`, {
      method: 'PUT',
      body: { name },
      headers: {
        ...authStore.authHeaders,
        Accept: 'application/json'
      }
    })
    authStore.updateTokenFromHeaders(res.headers)
    const nextName = applyCurrentUserUpdate(res._data?.data, name)
    accountForm.name = nextName
    savedAccountName.value = nextName.trim()
    accountMessage.value = 'アカウント設定を保存しました。'
  } catch (e: unknown) {
    accountError.value = readFetchError(e, 'アカウント設定の保存に失敗しました。')
  } finally {
    accountLoading.value = false
  }
}

const resetAccountForm = () => {
  accountForm.name = savedAccountName.value
  accountMessage.value = ''
  accountError.value = ''
}

const changePassword = async () => {
  if (!canChangePassword.value) return
  passwordLoading.value = true
  passwordMessage.value = ''
  passwordError.value = ''
  try {
    const res = await $fetch.raw<AuthUpdateResponse>(`${apiBase}/auth`, {
      method: 'PUT',
      body: {
        current_password: passwordForm.currentPassword,
        password: passwordForm.newPassword,
        password_confirmation: passwordForm.newPasswordConfirmation
      },
      headers: {
        ...authStore.authHeaders,
        Accept: 'application/json'
      }
    })
    authStore.updateTokenFromHeaders(res.headers)
    applyCurrentUserUpdate(res._data?.data, authStore.currentUser?.name || '')
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.newPasswordConfirmation = ''
    passwordMessage.value = 'パスワードを変更しました。'
  } catch (e: unknown) {
    passwordError.value = readFetchError(e, 'パスワード変更に失敗しました。')
  } finally {
    passwordLoading.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
