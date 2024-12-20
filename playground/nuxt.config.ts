export default defineNuxtConfig({

  modules: [
    '../src/module',
    '@nuxtjs/tailwindcss',
  ],

  devtools: {
    enabled: true,
  },

  app: {
    head: {
      script: [
        { src: 'https://js.stripe.com/v3/' },
      ],
    },
  },

  compatibilityDate: '2024-09-02',
})
