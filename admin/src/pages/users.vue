<template>
  <AdminLayout>
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h5 font-bold">ユーザー管理</h1>
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

    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="users"
          :loading="isLoading"
          item-value="id"
        >
          <template #item.role="{ item }">
            <v-chip :color="roleColor(item.role)" label size="small">
              {{ roleText(item.role) }}
            </v-chip>
          </template>

          <template #item.createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>

          <template #item.permissions="{ item }">
            <div class="text-caption">
              {{ formatPermissions(item.permissions) }}
            </div>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex ga-2">
              <v-btn
                v-if="canManageUsers"
                size="small"
                variant="outlined"
                color="primary"
                @click="openRoleDialog(item)"
              >
                role変更
              </v-btn>

              <v-btn
                v-if="canManageUsers && item.role === 'admin'"
                size="small"
                variant="outlined"
                color="secondary"
                @click="openPermissionDialog(item)"
              >
                権限変更
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-dialog v-model="roleDialog" max-width="520">
      <v-card>
        <v-card-title>role変更</v-card-title>

        <v-card-text>
          <div class="mb-4">
            対象: {{ selectedUser?.nickname }}（{{ selectedUser?.email }}）
          </div>

          <v-select
            v-model="roleForm.role"
            :items="roleOptions"
            label="role"
            variant="outlined"
            :disabled="isSubmitting"
          />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" :disabled="isSubmitting" @click="closeRoleDialog">
            キャンセル
          </v-btn>
          <v-btn color="primary" :loading="isSubmitting" @click="updateRole">
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="permissionDialog" max-width="900">
      <v-card>
        <v-card-title>権限変更</v-card-title>

        <v-card-text>
          <div class="mb-4">
            対象: {{ selectedUser?.nickname }}（{{ selectedUser?.email }}）
          </div>

          <v-table>
            <thead>
              <tr>
                <th>resource</th>
                <th>read</th>
                <th>create</th>
                <th>update</th>
                <th>destroy</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="permission in permissionForm" :key="permission.resource">
                <td>{{ permission.resource }}</td>
                <td><v-checkbox v-model="permission.can_read" hide-details /></td>
                <td><v-checkbox v-model="permission.can_create" hide-details /></td>
                <td><v-checkbox v-model="permission.can_update" hide-details /></td>
                <td><v-checkbox v-model="permission.can_destroy" hide-details /></td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" :disabled="isSubmitting" @click="closePermissionDialog">
            キャンセル
          </v-btn>
          <v-btn color="primary" :loading="isSubmitting" @click="updatePermissions">
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminLayout from '~/components/layouts/AdminLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { debugLog } from '@/lib/debugLog'

type Role = 'user' | 'admin' | 'super_admin'

type Permission = {
  resource: string
  can_read: boolean
  can_create: boolean
  can_update: boolean
  can_destroy: boolean
}

type UserRecord = {
  id: number
  nickname: string
  email: string
  role: Role
  createdAt: string
  updatedAt: string
  permissions: Permission[]
}

type ApiUserRecord = {
  id: number
  nickname: string
  email: string
  role: Role
  created_at: string
  updated_at: string
  permissions: Permission[]
}

type ApiCurrentUser = {
  id: number
  nickname: string
  email: string
  role: Role
}

type UsersIndexResponse = {
  current_user: ApiCurrentUser
  users: ApiUserRecord[]
  permission_resources: string[]
}

const authStore = useAuthStore()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const headers = [
  { title: 'ID', key: 'id', width: 80 },
  { title: 'ニックネーム', key: 'nickname', width: 160 },
  { title: 'メール', key: 'email' },
  { title: 'role', key: 'role', width: 140 },
  { title: '権限', key: 'permissions' },
  { title: '登録日', key: 'createdAt', width: 140 },
  { title: '操作', key: 'actions', sortable: false, width: 220 }
]

const users = ref<UserRecord[]>([])
const permissionResources = ref<string[]>([])
const currentUser = ref<ApiCurrentUser | null>(null)

const isLoading = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const selectedUser = ref<UserRecord | null>(null)

const roleDialog = ref(false)
const permissionDialog = ref(false)

const roleForm = ref<{ role: Role }>({ role: 'user' })
const permissionForm = ref<Permission[]>([])

const roleOptions: Role[] = ['user', 'admin', 'super_admin']

const canManageUsers = computed(() => currentUser.value?.role === 'super_admin')

const roleText = (role: Role) => {
  switch (role) {
    case 'user':
      return '一般'
    case 'admin':
      return '管理者'
    case 'super_admin':
      return 'スーパー管理者'
    default:
      return role
  }
}

const roleColor = (role: Role) => {
  switch (role) {
    case 'user':
      return 'default'
    case 'admin':
      return 'primary'
    case 'super_admin':
      return 'deep-purple'
    default:
      return 'default'
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('ja-JP')
}

const formatPermissions = (permissions: Permission[]) => {
  if (!permissions.length) return '-'

  return permissions
    .map((permission) => {
      const actions = [
        permission.can_read ? 'R' : '',
        permission.can_create ? 'C' : '',
        permission.can_update ? 'U' : '',
        permission.can_destroy ? 'D' : ''
      ]
        .filter(Boolean)
        .join('/')

      return `${permission.resource}: ${actions || '-'}`
    })
    .join(' | ')
}

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const mapUser = (user: ApiUserRecord): UserRecord => ({
  id: user.id,
  nickname: user.nickname,
  email: user.email,
  role: user.role,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
  permissions: user.permissions
})

const fetchUsers = async () => {
  isLoading.value = true
  clearMessages()

  try {
    // #region agent log
    debugLog({
      hypothesisId: 'H3_H4_H5',
      location: 'admin/src/pages/users.vue:fetchUsers',
      message: 'users_fetch_start',
      data: {
        origin: process.client ? window.location.origin : 'server',
        apiBase,
        hasAuth: !!authStore.authHeaders && Object.keys(authStore.authHeaders).length > 0
      }
    })
    // #endregion

    const data = await $fetch<UsersIndexResponse>(`${apiBase}/admin/v1/users`, {
      headers: {
        ...(authStore.authHeaders as HeadersInit),
        Accept: 'application/json'
      }
    })

    currentUser.value = data.current_user
    permissionResources.value = data.permission_resources
    users.value = data.users.map(mapUser)
  } catch (error: any) {
    console.error('Failed to fetch users:', error)
    // #region agent log
    debugLog({
      hypothesisId: 'H3_H4_H5',
      location: 'admin/src/pages/users.vue:fetchUsers:catch',
      message: 'users_fetch_failed',
      data: {
        origin: process.client ? window.location.origin : 'server',
        apiBase,
        errorMessage: error?.message || null,
        errorStatus: error?.status || null
      }
    })
    // #endregion
    errorMessage.value = error?.data?.error ?? 'ユーザー一覧の取得に失敗しました。'
    users.value = []
  } finally {
    isLoading.value = false
  }
}

const openRoleDialog = (user: UserRecord) => {
  clearMessages()
  selectedUser.value = user
  roleForm.value.role = user.role
  roleDialog.value = true
}

const closeRoleDialog = () => {
  roleDialog.value = false
  selectedUser.value = null
}

const openPermissionDialog = (user: UserRecord) => {
  clearMessages()
  selectedUser.value = user

  const currentPermissionsByResource = new Map(
    user.permissions.map((permission) => [permission.resource, permission])
  )

  permissionForm.value = permissionResources.value.map((resource) => {
    const current = currentPermissionsByResource.get(resource)

    return {
      resource,
      can_read: current?.can_read ?? false,
      can_create: current?.can_create ?? false,
      can_update: current?.can_update ?? false,
      can_destroy: current?.can_destroy ?? false
    }
  })

  permissionDialog.value = true
}

const closePermissionDialog = () => {
  permissionDialog.value = false
  selectedUser.value = null
  permissionForm.value = []
}

const updateRole = async () => {
  if (!selectedUser.value) return

  isSubmitting.value = true
  clearMessages()

  try {
    await $fetch(`${apiBase}/admin/v1/users/${selectedUser.value.id}/role`, {
      method: 'PATCH',
      body: {
        user: { role: roleForm.value.role }
      },
      headers: {
        ...authStore.authHeaders,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })

    successMessage.value = 'role を更新しました。'
    closeRoleDialog()
    await fetchUsers()
  } catch (error: any) {
    console.error('Failed to update role:', error)
    errorMessage.value = error?.data?.error ?? 'role 更新に失敗しました。'
  } finally {
    isSubmitting.value = false
  }
}

const updatePermissions = async () => {
  if (!selectedUser.value) return

  isSubmitting.value = true
  clearMessages()

  try {
    await $fetch(`${apiBase}/admin/v1/users/${selectedUser.value.id}/permissions`, {
      method: 'PATCH',
      body: {
        permissions: permissionForm.value
      },
      headers: {
        ...authStore.authHeaders,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })

    successMessage.value = '権限を更新しました。'
    closePermissionDialog()
    await fetchUsers()
  } catch (error: any) {
    console.error('Failed to update permissions:', error)
    errorMessage.value = error?.data?.error ?? '権限更新に失敗しました。'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await authStore.checkSession()
  await fetchUsers()
})
</script>
