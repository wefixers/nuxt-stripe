export default defineNuxtConfig({
  compatibilityDate: '2024-09-02',

  modules: [
    '../src/module',
    '@nuxtjs/tailwindcss',
  ],

  app: {
    head: {
      script: [
        { src: 'https://js.stripe.com/v3/' },
      ],
    },
  },

  devtools: {
    enabled: true,
  },
})
