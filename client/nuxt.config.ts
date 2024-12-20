import { resolve } from 'pathe'

import { rollup as unwasm } from 'unwasm/plugin'

export default defineNuxtConfig({

  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-shiki',
  ],
  ssr: false,

  devtools: {
    enabled: false,
  },

  app: {
    baseURL: '/_stripe',
  },

  experimental: {
    componentIslands: true,
  },

  compatibilityDate: '2024-09-02',

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

  shiki: {
    defaultLang: 'json',
    bundledLangs: ['json'],

    defaultTheme: { light: 'catppuccin-latte', dark: 'catppuccin-frappe' },
    bundledThemes: ['catppuccin-frappe', 'catppuccin-latte'],
  },
})
