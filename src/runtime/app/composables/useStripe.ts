import type { Ref } from 'vue'
import { unref } from 'vue'
import { computedAsync } from '@vueuse/core'

import type { Stripe, StripeConstructorOptions } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js/pure'

import { useRuntimeConfig } from '#imports'

type MaybeRef<T> = T | Ref<T>

export interface UseStripeOptions extends StripeConstructorOptions {
  /**
   * Override the runtime configured publishable key.
   */
  publishableKey?: string
}

/**
 * Use Stripe.
 *
 * ### Example:
 * ```ts
 * const stripe = useStripe()
 *
 * await stripe!.redirectToCheckout({
 *   sessionId: session.id,
 * })
 * ```
 */
export function useStripe(options?: MaybeRef<UseStripeOptions>): Ref<Stripe | null> {
  const runtimeConfig = useRuntimeConfig()

  // I really do not like computedAsync but it does the job
  return computedAsync(() => {
    const opts = unref(options)
    const pk = opts?.publishableKey || runtimeConfig.public.stripe?.publishableKey

    if (!pk) {
      return null
    }

    return loadStripe(pk, {
      ...runtimeConfig.public.stripe?.options,
      stripeAccount: opts?.stripeAccount || runtimeConfig.public.stripe?.options?.stripeAccount || undefined,
    })
  })
}
