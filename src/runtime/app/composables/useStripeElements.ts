import type { StripeElements } from '@stripe/stripe-js'
import type { Ref } from 'vue'
import { provide, shallowRef } from 'vue'

/**
 * Use Stripe Elements.
 */
export function useStripeElements(): Ref<StripeElements | null> {
  const elements = shallowRef<StripeElements | null>(null)

  provide('nuxt-stripe-elements', {
    elements,
  })

  return elements
}
