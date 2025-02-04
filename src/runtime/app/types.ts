import type { StripeConnectInstance } from '@stripe/connect-js'
import type { Stripe, StripeElements } from '@stripe/stripe-js'
import type { Ref } from 'vue'

export interface StripeContext {
  stripe: Ref<Stripe | null>
}

export interface StripeConnectContext {
  stripeConnect: Ref<StripeConnectInstance | null>
}

export interface StripeElementsContext {
  stripe: Ref<Stripe | null>
  elements: Ref<StripeElements | null>
}
