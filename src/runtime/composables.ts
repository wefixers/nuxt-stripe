import type { Stripe, StripeConstructorOptions } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js/pure'

import type { ModulePublicRuntimeConfig } from '../module'
import { useRuntimeConfig } from '#imports'

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

/**
 * Use Stripe.
 *
 * ### Example:
 * ```ts
 * const { createClient: createStripeClient } = useStripe()
 *
 * const stripe = await createStripeClient()
 *
 * await stripe.redirectToCheckout({
 *   sessionId: session.id,
 * })
 * ```
 */
export function useStripe() {
  return {
    createClient: async (options?: CreateStripeOptions): Promise<Stripe> => {
      const stripeRuntimeConfig = useRuntimeConfig().public.stripe as ModulePublicRuntimeConfig | undefined

      const { publishableKey, advancedFraudSignals, ...stripeOptions } = options || {}

      loadStripe.setLoadParameters({
        advancedFraudSignals: advancedFraudSignals ?? true,
      })

      const stripe = await loadStripe(publishableKey ?? stripeRuntimeConfig?.publishableKey ?? '', {
        ...stripeRuntimeConfig?.client,
        ...stripeOptions,
      })

      // Stripe is null in SSR
      return stripe ?? null!
    },
  }
}
