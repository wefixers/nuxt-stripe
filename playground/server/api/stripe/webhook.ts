/// <reference types="../../../.nuxt/types/stripe.d.ts" />

import { defineStripeWebhook } from '#stripe'

export default defineStripeWebhook(({ stripeEvent }) => {
  switch (stripeEvent.type) {
    case 'payment_intent.succeeded': {
      //
    }
  }
})
