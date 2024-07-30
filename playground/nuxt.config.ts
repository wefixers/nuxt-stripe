export default defineNuxtConfig({
  compatibilityDate: '2024-07-16',
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
