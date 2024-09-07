import { resolve } from 'pathe'

export default defineNuxtConfig({
  ssr: false,

  compatibilityDate: '2024-09-02',

  experimental: {
    componentIslands: true,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-shiki',
    'nuxt-icon',
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
  },

  app: {
    baseURL: '/_stripe',
  },

  devtools: {
    enabled: false,
  },
})
