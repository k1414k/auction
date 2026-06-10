<template>
  <v-card class="h-100" :class="cardClass">
    <v-card-text class="pa-6">
      <div class="d-flex align-center justify-space-between">
        <div>
          <p class="text-subtitle2 text-gray-600 mb-2">{{ title }}</p>
          <p class="text-h4 font-bold">{{ formattedValue }}</p>
          <p v-if="change" :class="changeClass" class="text-sm mt-2">
            <v-icon :icon="changeIcon" size="small" /> {{ change }}%
          </p>
        </div>
        <v-avatar :color="color" size="64" class="opacity-20">
          <v-icon :icon="icon" size="40" />
        </v-avatar>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number | string
  icon: string
  color?: string
  change?: number
  format?: 'number' | 'currency' | 'percent'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  format: 'number'
})

const formattedValue = computed(() => {
  const val = typeof props.value === 'string' ? parseFloat(props.value) : props.value

  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0
      }).format(val)
    case 'percent':
      return `${val.toFixed(1)}%`
    default:
      return new Intl.NumberFormat('ja-JP').format(val)
  }
})

const changeIcon = computed(() => {
  return props.change && props.change > 0 ? 'mdi-trending-up' : 'mdi-trending-down'
})

const changeClass = computed(() => {
  return props.change && props.change > 0 ? 'text-green-600' : 'text-red-600'
})

const cardClass = computed(() => {
  const colors: Record<string, string> = {
    primary: 'bg-blue-50 border-l-4 border-blue-500',
    success: 'bg-green-50 border-l-4 border-green-500',
    warning: 'bg-amber-50 border-l-4 border-amber-500',
    error: 'bg-red-50 border-l-4 border-red-500'
  }
  return colors[props.color] || colors.primary
})
</script>
