// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
  },
  dirs: {
    src: [
      './client',
      './docs',
      './playground',
    ],
  },
})
  .append({
    rules: {
      '@typescript-eslint/unified-signatures': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/multi-word-component-names': 'off',
    },
  })
