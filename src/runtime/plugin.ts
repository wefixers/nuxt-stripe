import type { Stripe, StripeConstructorOptions } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js/pure'

import type { ModulePublicRuntimeConfig } from '../module'

import type { Plugin } from '#app'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

async function createClient(options?: StripeConstructorOptions, publishableKey?: string): Promise<Stripe> {
  const stripeRuntimeConfig: ModulePublicRuntimeConfig | undefined = useRuntimeConfig().public.stripe

  const stripe = await loadStripe(publishableKey || stripeRuntimeConfig?.publishableKey || '', {
    ...stripeRuntimeConfig?.client,
    ...options,
  })

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
  createClient: (options?: StripeConstructorOptions, overridePublishableKey?: string) => Promise<Stripe>
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
