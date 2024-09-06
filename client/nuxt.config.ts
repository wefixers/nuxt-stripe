import { resolve } from 'pathe'
import DevtoolsUIKit from '@nuxt/devtools-ui-kit'

export default defineNuxtConfig({
  ssr: false,

  compatibilityDate: '2024-09-02',

  experimental: {
    componentIslands: true,
  },

  modules: [
    DevtoolsUIKit,
    'nuxt-shiki',
    'nuxt-icon',
  ],

  shiki: {
    defaultLang: 'json',
    bundledLangs: ['json'],

    defaultTheme: { light: 'min-light', dark: 'aurora-x' },
    bundledThemes: ['aurora-x', 'min-light'],
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
