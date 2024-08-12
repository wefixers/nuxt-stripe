import type { Ref } from 'vue'
import { isReactive, isRef, shallowRef, toRaw, unref, watch } from 'vue'
import type { MaybeRef } from '@vueuse/core'

import type { StripeElements, StripeElementsOptions } from '@stripe/stripe-js'
import { injectHere } from '../../utils/inject'
import { useStripe } from './useStripe'

type Optional<T> = MaybeRef<T | null | undefined>

export function useElements(options?: Optional<StripeElementsOptions>): Ref<StripeElements | null> {
  // Try to get the current provided Stripe instance, or useStripe() to create a new one
  const stripeInstance = injectHere('nuxt-stripe', () => useStripe(), true)

  const elements = shallowRef<StripeElements | null>(null)

  const stop = watch(() => stripeInstance, (maybeStripeRef) => {
    if (elements.value) {
      return
    }

    const stripe = unref(maybeStripeRef)
    if (!stripe) {
      return
    }

    const opts = unref(options)
    if (!opts) {
      return
    }

    if (opts.clientSecret) {
      elements.value = stripe.elements(opts)
      stop()
    }
    else if (opts.mode) {
      elements.value = stripe.elements(opts)
      stop()
    }
  }, {
    immediate: true,
    deep: false,
  })

  // Only watch reactive object
  if (isRef(options) || isReactive(options)) {
    watch(options as Ref<StripeElementsOptions | null | undefined>, (options) => {
      if (options && elements.value) {
        elements.value.update(toRaw(options))
      }
    }, {
      immediate: true,
      deep: true,
    })
  }

  return elements
}
