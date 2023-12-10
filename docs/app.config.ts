export default defineAppConfig({
  ui: {
    primary: 'green',
    gray: 'slate',
    footer: {
      bottom: {
        left: 'text-sm text-gray-500 dark:text-gray-400',
        wrapper: 'border-t border-gray-200 dark:border-gray-800',
      },
    },
  },
  seo: {
    siteName: 'Nuxt Stripe',
  },
  header: {
    logo: {
      alt: '',
      light: '',
      dark: '',
    },
    search: true,
    colorMode: true,
    links: [{
      'icon': 'i-simple-icons-nuxtdotjs',
      'to': 'https://nuxt.com',
      'target': '_blank',
      'aria-label': 'Nuxt Website',
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/wefixers/nuxt-stripe',
      'target': '_blank',
      'aria-label': 'Nuxt Stripe on GitHub',
    }],
  },
  footer: {
    credits: '',
    colorMode: false,
    links: [{
      'icon': 'i-simple-icons-nuxtdotjs',
      'to': 'https://nuxt.com',
      'target': '_blank',
      'aria-label': 'Nuxt Website',
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/wefixers/nuxt-stripe',
      'target': '_blank',
      'aria-label': 'Nuxt Stripe on GitHub',
    }],
  },
  toc: {
    title: 'Table of Contents',
    bottom: {
      title: 'Community',
      edit: 'https://github.com/wefixers/nuxt-stripe/docs/edit/main/content',
      links: [{
        icon: 'i-heroicons-star',
        label: 'Star on GitHub',
        to: 'https://github.com/wefixers/nuxt-stripe',
        target: '_blank',
      }, {
        icon: 'i-simple-icons-nuxtdotjs',
        label: 'Nuxt docs',
        to: 'https://nuxt.com',
        target: '_blank',
      }],
    },
  },
})
