// @ts-check
import antfu from '@antfu/eslint-config'
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
    standalone: false,
  },
  dirs: {
    src: [
      './client',
      './docs',
      './playground',
    ],
  },
})
  .append(
    antfu({
      rules: {
        'no-alert': 'off',
        'no-cond-assign': 'off',
      },
    }),
  )
