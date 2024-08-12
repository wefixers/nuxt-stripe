import type { Ref } from 'vue'
import { isRef, provide, shallowRef, unref, watch } from 'vue'
import type { MaybeRef } from '@vueuse/core'

import type { Stripe, StripeConstructorOptions } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js/pure'

import { injectHere } from '../../utils/inject'
import { useRuntimeConfig } from '#imports'

type Optional<T> = MaybeRef<T | null | undefined>

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
export function useStripe(options?: Optional<UseStripeOptions>): Ref<Stripe | null> {
  // Special case, useStipe() has been call with no options
  // Try to get the already provided Stripe instance
  // This will effectively attempt to retrive a Stripe instance form the current component
  // Failing to do so, will iterate upwards in the component tree
  if (!options) {
    const currentStripe = injectHere<Ref<Stripe | null>>('nuxt-stripe')

    if (isRef(currentStripe)) {
      return currentStripe
    }
  }

  const runtimeConfig = useRuntimeConfig()

  /**
   * The actual Stripe instance.
   */
  const stripe = shallowRef<Stripe | null>(null)

  const stop = watch(() => options, async (optionsRef) => {
    if (stripe.value) {
      return
    }

    const options = unref(optionsRef)
    const publishableKey = options?.publishableKey || runtimeConfig.public.stripe?.publishableKey

    // No publishable key
    if (!publishableKey) {
      return
    }

    try {
      stripe.value = await loadStripe(publishableKey, {
        // Merge runtime config options with the provided options
        ...runtimeConfig.public.stripe?.options,
        ...options,
      })

      stop()
    }
    catch {
      //
    }
  }, {
    immediate: true,
    deep: true,
  })

  // Provide the Stripe instance to children components and composables
  provide('nuxt-stripe', stripe)

  return stripe
}
