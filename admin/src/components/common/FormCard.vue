<template>
  <v-card class="elevation-0">
    <v-card-text>
      <v-form @submit.prevent="$emit('submit')">
        <v-row>
          <slot />
        </v-row>

        <v-row class="mt-6">
          <v-col cols="12" class="d-flex gap-2 justify-end">
            <v-btn
              color="gray"
              variant="outlined"
              @click="$emit('cancel')"
            >
              キャンセル
            </v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="submitting"
            >
              保存
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  submitting?: boolean
}

withDefaults(defineProps<Props>(), {
  submitting: false
})

defineEmits<{
  'submit': []
  'cancel': []
}>()
</script>
