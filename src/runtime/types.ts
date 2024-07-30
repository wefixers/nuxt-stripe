import type { Stripe, StripeElements } from '@stripe/stripe-js'
import type { Ref } from 'vue'

export interface StripeContext {
  stripe: Ref<Stripe | null>
  elements: Ref<StripeElements | undefined>
}
