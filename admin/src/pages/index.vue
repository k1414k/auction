<template>
  <AdminLayout>
    <v-row>
      <v-col cols="12">
        <v-skeleton-loader
          type="article"
          class="mb-4"
          v-if="isRedirecting"
        />
        <div v-else class="text-center py-16">
          <v-progress-circular indeterminate color="primary" />
        </div>
      </v-col>
    </v-row>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/components/layouts/AdminLayout.vue'

const router = useRouter()
const isRedirecting = ref(true)

onMounted(() => {
  router.replace('/login')
})
</script>

