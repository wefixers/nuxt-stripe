import type { Stripe, StripeConstructorOptions } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js/pure'

import type { ModulePublicRuntimeConfig } from '../module'

import { defineNuxtPlugin, useRuntimeConfig } from '#app'

/**
 * Create a {@link Stripe} Client instance.
 *
 * ### Note:
 * In SSR this method return null, as the client library cannot be loaded.
 */
async function createClient(options?: StripeConstructorOptions, overridePublishableKey?: string): Promise<Stripe> {
  const { publishableKey, client }: ModulePublicRuntimeConfig = useRuntimeConfig().public.stripe

  const stripe = await loadStripe(overridePublishableKey || publishableKey, {
    ...client,
    ...options,
  })

  // Stripe is null in SSR
  return stripe!
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      stripe: {
        createClient,
      },
    },
  }
})
