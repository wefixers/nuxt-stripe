import { resolve } from 'pathe'

import { rollup as unwasm } from 'unwasm/plugin'

export default defineNuxtConfig({
  ssr: false,

  compatibilityDate: '2024-09-02',

  experimental: {
    componentIslands: true,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-shiki',
  ],

  shiki: {
    defaultLang: 'json',
    bundledLangs: ['json'],

    defaultTheme: { light: 'catppuccin-latte', dark: 'catppuccin-frappe' },
    bundledThemes: ['catppuccin-frappe', 'catppuccin-latte'],
  },

  nitro: {
    prerender: {
      routes: [
        '/',
      ],
    },

    output: {
      publicDir: resolve(__dirname, '../dist/client'),
    },

    experimental: {
      wasm: true,
    },
    externals: {
      traceInclude: ['shiki/dist/core.mjs'],
    },
  },

  vite: {
    plugins: import.meta.env.NODE_ENV === 'production' ? [unwasm({})] : undefined,
  },

  app: {
    baseURL: '/_stripe',
  },

  devtools: {
    enabled: false,
  },
})
