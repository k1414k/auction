<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="!drawerOpen"
      :permanent="!isMobile"
      :temporary="isMobile"
      width="280"
      class="bg-white"
    >
      <!-- ロゴ / ブランド -->
      <v-list-item
        class="px-6 py-4 border-b"
        @click="goToHome"
      >
        <template #prepend>
          <v-icon icon="mdi-store-outline" size="32" color="primary" />
        </template>
        <v-list-item-title v-if="drawerOpen" class="font-bold text-lg">
          Admin Panel
        </v-list-item-title>
      </v-list-item>

      <!-- ナビゲーションメニュー -->
      <v-list class="px-2">
        <template v-for="item in navItems" :key="item.title">
          <template v-if="!item.children">
            <v-list-item :to="item.to" :prepend-icon="item.icon" class="mb-2">
              <v-list-item-title v-show="drawerOpen">{{ item.title }}</v-list-item-title>
            </v-list-item>
          </template>
          <template v-else>
            <v-list-group>
              <template #activator="{ props }">
                <v-list-item v-bind="props" :prepend-icon="item.icon">
                  <v-list-item-title v-show="drawerOpen">{{ item.title }}</v-list-item-title>
                </v-list-item>
              </template>
              <v-list-item
                v-for="child in item.children"
                :key="child.title"
                :to="child.to"
                :prepend-icon="child.icon"
                class="ml-4"
              >
                <v-list-item-title v-show="drawerOpen">{{ child.title }}</v-list-item-title>
              </v-list-item>
            </v-list-group>
          </template>
        </template>
      </v-list>

      <!-- スペーサー -->
      <v-spacer />

      <!-- ユーザーメニュー -->
      <v-divider />
      <v-list class="px-2">
        <v-list-item @click="showUserMenu = !showUserMenu">
          <template #prepend>
            <v-avatar color="primary" size="small" />
          </template>
          <template v-if="drawerOpen">
            <v-list-item-title class="text-sm">
              {{ authStore.currentUser?.name || 'Admin' }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-xs">
              {{ authStore.currentUser?.role }}
            </v-list-item-subtitle>
          </template>
        </v-list-item>

        <v-collapse-transition>
          <div v-show="showUserMenu && drawerOpen" class="ml-8 mb-2">
            <v-list-item density="compact" @click="goToSettings">
              <template #prepend>
                <v-icon icon="mdi-cog-outline" size="small" />
              </template>
              <v-list-item-title class="text-sm">設定</v-list-item-title>
            </v-list-item>
            <v-list-item density="compact" @click="handleLogout">
              <template #prepend>
                <v-icon icon="mdi-logout" size="small" />
              </template>
              <v-list-item-title class="text-sm">ログアウト</v-list-item-title>
            </v-list-item>
          </div>
        </v-collapse-transition>
      </v-list>
    </v-navigation-drawer>

    <!-- トップバー -->
    <v-app-bar density="compact" class="bg-white border-b">
      <v-app-bar-nav-icon
        v-show="isMobile"
        @click="drawer = !drawer"
      />
      <v-app-bar-nav-icon
        v-show="!isMobile"
        @click="toggleDrawerRail"
        icon="mdi-menu"
      />

      <v-toolbar-title class="text-h6 ml-4">
        {{ pageTitle }}
      </v-toolbar-title>

      <v-spacer />

      <!-- 通知アイコン -->
      <v-btn icon="mdi-bell-outline" variant="text" />

      <!-- 検索アイコン -->
      <v-btn icon="mdi-magnify" variant="text" />

      <!-- ダークモード切り替え -->
      <v-btn
        :icon="isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"
        variant="text"
        @click="toggleTheme"
      />
    </v-app-bar>

    <!-- メインコンテンツ -->
    <v-main class="bg-gray-50">
      <v-container fluid class="pa-6">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { ADMIN_NAV_ITEMS } from '@/types/navigation'

const router = useRouter()
const theme = useTheme()
const authStore = useAuthStore()

const drawer = ref(true)
const drawerRail = ref(false)
const showUserMenu = ref(false)

const drawerOpen = computed(() => !drawerRail.value)
const isDark = computed(() => theme.global.name.value === 'dark')
const isMobile = ref(false)

const pageTitle = ref('ダッシュボード')
const navItems = ADMIN_NAV_ITEMS

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    drawer.value = false
  }
}

const toggleDrawerRail = () => {
  drawerRail.value = !drawerRail.value
}

const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark'
}

const goToHome = () => {
  router.push('/dashboard')
}

const goToSettings = () => {
  router.push('/settings')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// ページ名更新（ルート変更時）
watch(
  () => router.currentRoute.value.name,
  (name) => {
    // ルート名に基づいてページタイトルを更新
    const titleMap: Record<string, string> = {
      'dashboard': 'ダッシュボード',
        'users': 'ユーザー管理',
        'items': '商品管理',
        'orders': '注文管理',
      'reports-sales': '売上分析',
      'reports-users': 'ユーザー分析',
      'settings': '設定'
    }
    pageTitle.value = titleMap[name as string] || 'Admin Panel'
  },
  { immediate: true }
)
</script>

<style scoped>
:deep(.v-navigation-drawer) {
  transition: all 0.3s ease;
}

:deep(.v-app-bar) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}
</style>
