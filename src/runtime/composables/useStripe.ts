import type { StripeConstructorOptions, StripeElements } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js/pure'

import { computedAsync } from '@vueuse/core'

import type { Ref } from 'vue'
import { provide, shallowRef, unref } from 'vue'

import type { StripeContext } from '../types'
import { useRuntimeConfig } from '#imports'

type MaybeRef<T> = T | Ref<T>

interface StripeOptions extends StripeConstructorOptions {
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
 * const { stripe } = useStripe()
 *
 * await stripe!.redirectToCheckout({
 *   sessionId: session.id,
 * })
 * ```
 */
export function useStripe(options?: MaybeRef<StripeOptions>) {
  const runtimeConfig = useRuntimeConfig()

  /**
   * Keep track of the Stripe Elements instance.
   * We need this here so we can return a ref as part of this composable.
   */
  const stripeElements = shallowRef<StripeElements>()

  // I really do not like computedAsync, it might get
  // re-evaluated when useFetch() is re-fetched even tho the value is the same
  const stripeInstance = computedAsync(() => {
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

  // Provide a mutable context Ref<> for child components
  provide<StripeContext>('nuxt-stripe-context', {
    stripe: stripeInstance,
    elements: stripeElements,
  })

  return {
    // TODO: consider using readonly() here as we have a computed
    stripe: stripeInstance,
    elements: stripeElements,
  }
}
