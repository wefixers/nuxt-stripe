import type { Stripe } from 'stripe'

export interface ServerFunctions {
  getStripeEvents: () => Stripe.Event[]
}

export interface ClientFunctions {
  stripeEvent: (event: Stripe.Event) => void
}
