<template>
  <AdminLayout>
    <div class="text-gray-600 p-4 my-3">
      デモアカウントは変更できません
    </div>
    <v-row>
      <v-col cols="12" lg="8">
        <v-card class="elevation-0">
          <v-card-title>アカウント設定</v-card-title>
          <v-divider />
          <v-card-text class="pa-8">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  label="名前"
                  variant="outlined"
                  :model-value="authStore.currentUser?.name || ''"
                  readonly
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
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="passwordForm.newPassword"
                  label="新しいパスワード"
                  type="password"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="passwordForm.newPasswordConfirmation"
                  label="パスワード確認"
                  type="password"
                  variant="outlined"
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
              <v-list-item-subtitle>メール通知の設定</v-list-item-subtitle>
            </v-list-item>

            <v-list-item disabled>
              <template #prepend>
                <v-icon icon="mdi-lock-outline" />
              </template>
              <v-list-item-title>セキュリティ</v-list-item-title>
              <v-list-item-subtitle>2要素認証等</v-list-item-subtitle>
            </v-list-item>

            <v-list-item disabled>
              <template #prepend>
                <v-icon icon="mdi-cloud-outline" />
              </template>
              <v-list-item-title>バックアップ</v-list-item-title>
              <v-list-item-subtitle>自動バックアップ設定</v-list-item-subtitle>
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
import AdminLayout from '~/components/layouts/AdminLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string
const passwordLoading = ref(false)
const passwordMessage = ref('')
const passwordError = ref('')
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  newPasswordConfirmation: ''
})

const canChangePassword = computed(() =>
  passwordForm.currentPassword.length > 0 &&
  passwordForm.newPassword.length >= 6 &&
  passwordForm.newPassword === passwordForm.newPasswordConfirmation &&
  !passwordLoading.value
)

const changePassword = async () => {
  if (!canChangePassword.value) return
  passwordLoading.value = true
  passwordMessage.value = ''
  passwordError.value = ''
  try {
    await $fetch(`${apiBase}/auth/password`, {
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
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.newPasswordConfirmation = ''
    passwordMessage.value = 'パスワードを変更しました。'
  } catch (e: any) {
    passwordError.value = e?.data?.errors?.[0] || e?.data?.error || 'パスワード変更に失敗しました。'
  } finally {
    passwordLoading.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
