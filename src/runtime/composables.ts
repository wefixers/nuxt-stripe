import type { Stripe, StripeConstructorOptions } from '@stripe/stripe-js'
import { loadScript } from '@fixers/stripe-js'

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

      const stripeConstructor = await loadScript({
        advancedFraudSignals: advancedFraudSignals ?? true,
      })

      if (stripeConstructor) {
        return stripeConstructor(publishableKey ?? stripeRuntimeConfig?.publishableKey ?? '', {
          ...stripeRuntimeConfig?.client,
          ...stripeOptions,
        })
      }

      // Stripe is null in SSR
      return null!
    },
  }
}
