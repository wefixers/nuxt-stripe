import type { Stripe, StripeConstructorOptions } from '@stripe/stripe-js'
import { loadScript } from '@fixers/stripe-js'

import type { ModulePublicRuntimeConfig } from '../module'

import type { Plugin } from '#app'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export interface CreateStripeOptions extends StripeConstructorOptions {
  /**
   * Override the runtime configured publishable key.
   */
  publishableKey?: string

  /**
   * Set it to `false` to [disable advanced fraud detection](https://stripe.com/docs/disputes/prevention/advanced-fraud-detection#disabling-advanced-fraud-detection)
   *
   * @default true
   */
  advancedFraudSignals?: boolean
}

async function createClient(options?: CreateStripeOptions): Promise<Stripe> {
  const stripeRuntimeConfig: ModulePublicRuntimeConfig | undefined = useRuntimeConfig().public.stripe

  const { publishableKey, advancedFraudSignals, ...stripeOptions } = options || {}

  const stripeConstructor = await loadScript({
    advancedFraudSignals: advancedFraudSignals || true,
  })

  let stripe: Stripe

  if (stripeConstructor) {
    stripe = stripeConstructor(publishableKey || stripeRuntimeConfig?.publishableKey, {
      ...stripeRuntimeConfig?.client,
      ...stripeOptions,
    })
  }

  // Stripe is null in SSR
  return stripe!
}

/**
 * Represents a Nuxt Stripe plugin.
 */
export interface StripePlugin {
  /**
   * Create a new {@link Stripe} Client instance.
   *
   * ### Note:
   * In SSR this method return null, as the client library cannot be loaded.
   */
  createClient: (options?: CreateStripeOptions) => Promise<Stripe>
}

/**
 * The Nuxt Stripe plugin.
 *
 * ### Example:
 * ```ts
 * const { $stripe } = useNuxtApp()
 *
 * const stripe = await $stripe.createClient()
 *
 * await stripe.redirectToCheckout({
 *   sessionId: session.id,
 * })
 * ```
 */
const plugin: Plugin<{ stripe: StripePlugin }> = defineNuxtPlugin(() => {
  return {
    provide: {
      stripe: {
        createClient,
      },
    },
  }
})

export default plugin
