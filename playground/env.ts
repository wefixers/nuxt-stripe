import { createEnv } from '@t3-oss/env-nuxt'
import { z } from 'zod'

export const env = createEnv({
  server: {
    STRIPE_WEBHOOK_SECRET: z.string().default(''),
    STRIPE_CLIENT_SECRET: z.string().default(''),
  },
  client: {
    NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().default(''),
  },
})
