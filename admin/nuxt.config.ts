import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  srcDir: 'src',
  compatibilityDate: '2026-03-02',

  modules: [
    'vuetify-nuxt-module',
    '@pinia/nuxt'
  ],

  // @ts-ignore vuetify-nuxt-module の拡張プロパティ
  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light'
      }
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
    }
  },

  css: [
    '~/styles/globals.css'
  ]
})
